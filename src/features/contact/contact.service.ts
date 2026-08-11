/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Contact Feature — Service Layer
 *
 * Layer 4: Encapsulates core business logic, honeypot detection, spam heuristics,
 * repository persistence, and email notification triggering.
 */

import { contactRepository, ContactRepository } from './contact.repository.js';
import { contactEmailService, ContactEmailService } from './contact.email.js';
import { CreateContactInput, GetMessagesQuery, UpdateStatusInput } from './contact.validators.js';
import { ApiError } from '../../server/apiError.js';
import { logger } from '../../server/logger.js';

export class ContactService {
  constructor(
    private repo: ContactRepository = contactRepository,
    private emailService: ContactEmailService = contactEmailService
  ) {}

  /**
   * Process a public contact form submission
   */
  async submitMessage(input: CreateContactInput) {
    // 1. Honeypot check (hidden website field)
    const isHoneypotTriggered = Boolean(input.website && input.website.trim().length > 0);

    if (isHoneypotTriggered) {
      logger.warn({ email: input.email }, 'Honeypot triggered — quiet bot rejection');
      // Silently return success to mislead spambots
      return {
        submitted: true,
        spamDetected: true,
        message: 'TRANSMISSION SUCCESSFUL',
      };
    }

    // 2. Simple spam heuristic check
    const isSpam = this.detectSpamKeywords(input.message, input.subject);

    // 3. Persist to PostgreSQL database via Repository
    const record = await this.repo.create(input, isSpam);

    logger.info({ messageId: record.id, email: record.email, isSpam }, 'Contact message stored');

    // 4. Trigger async transactional email notification if not spam
    if (!isSpam) {
      this.emailService
        .sendNewMessageNotification({
          name: record.name,
          email: record.email,
          subject: record.subject || undefined,
          message: record.message,
          messageId: record.id,
          createdAt: record.createdAt,
        })
        .catch((err) => {
          logger.error({ err, messageId: record.id }, 'Async email dispatch error');
        });
    }

    return {
      submitted: true,
      id: record.id,
      createdAt: record.createdAt,
      message: 'TRANSMISSION SUCCESSFUL',
    };
  }

  /**
   * List contact messages for administrator inbox
   */
  async listMessages(query: GetMessagesQuery) {
    return this.repo.findAll(query);
  }

  /**
   * Get single contact message details
   */
  async getMessageById(id: string) {
    const record = await this.repo.findById(id);

    if (!record) {
      throw ApiError.notFound(`Message with ID ${id} not found`);
    }

    // Automatically mark UNREAD messages as READ when opened by admin
    if (record.status === 'UNREAD') {
      await this.repo.updateStatus(id, 'READ');
      record.status = 'READ';
    }

    return record;
  }

  /**
   * Update status of a message (UNREAD, READ, REPLIED, ARCHIVED)
   */
  async updateMessageStatus(id: string, input: UpdateStatusInput) {
    const record = await this.repo.findById(id);

    if (!record) {
      throw ApiError.notFound(`Message with ID ${id} not found`);
    }

    return this.repo.updateStatus(id, input.status);
  }

  /**
   * Delete a message permanently
   */
  async deleteMessage(id: string) {
    const record = await this.repo.findById(id);

    if (!record) {
      throw ApiError.notFound(`Message with ID ${id} not found`);
    }

    await this.repo.delete(id);
    return { deleted: true, id };
  }

  /**
   * Retrieve inbox statistics for dashboard metrics
   */
  async getInboxStats() {
    return this.repo.getStats();
  }

  /**
   * Spam keyword detection heuristic
   */
  private detectSpamKeywords(message: string, subject?: string): boolean {
    const text = `${subject || ''} ${message}`.toLowerCase();
    const spamKeywords = [
      'viagra',
      'casino',
      'crypto luxury',
      'buy followers',
      'seo service guaranteed',
      'cheap backlinks',
      'make $1000 a day',
      'click here now',
    ];

    return spamKeywords.some((keyword) => text.includes(keyword));
  }
}

export const contactService = new ContactService();
