/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Contact Feature — Repository Layer
 *
 * Layer 2: Direct Prisma database queries for ContactMessage entities.
 * Decouples database operations from business logic and HTTP interfaces.
 */

import { prisma } from '../../lib/prisma/db';
import { MessageStatus, Prisma } from '@prisma/client';
import { CreateContactInput, GetMessagesQuery } from './contact.validators';

export class ContactRepository {
  /**
   * Insert a new contact message into PostgreSQL
   */
  async create(data: CreateContactInput, isSpam = false) {
    return prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject || 'Portfolio Inquiry',
        message: data.message,
        isSpam,
        status: MessageStatus.UNREAD,
      },
    });
  }

  /**
   * Find a message by unique ID
   */
  async findById(id: string) {
    return prisma.contactMessage.findUnique({
      where: { id },
    });
  }

  /**
   * Update the status of a contact message (UNREAD, READ, REPLIED, ARCHIVED)
   */
  async updateStatus(id: string, status: MessageStatus) {
    return prisma.contactMessage.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Delete a contact message permanently
   */
  async delete(id: string) {
    return prisma.contactMessage.delete({
      where: { id },
    });
  }

  /**
   * Paginated query for admin inbox with optional filtering by status and search query
   */
  async findAll(query: GetMessagesQuery) {
    const { status, page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ContactMessageWhereInput = {};

    if (status) {
      where.status = status as MessageStatus;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get inbox summary statistics (unread count, total count)
   */
  async getStats() {
    const [unread, read, replied, archived, total] = await Promise.all([
      prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
      prisma.contactMessage.count({ where: { status: 'READ' } }),
      prisma.contactMessage.count({ where: { status: 'REPLIED' } }),
      prisma.contactMessage.count({ where: { status: 'ARCHIVED' } }),
      prisma.contactMessage.count(),
    ]);

    return { unread, read, replied, archived, total };
  }
}

export const contactRepository = new ContactRepository();
