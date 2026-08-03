/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Testimonial Feature — Service Layer
 *
 * Layer 3: Encapsulates domain logic for review submission, moderation approval workflow,
 * and public testimonial rendering.
 */

import { testimonialRepository, TestimonialRepository } from './testimonial.repository';
import {
  CreateTestimonialInput,
  GetTestimonialsQuery,
  UpdateTestimonialStatusInput,
} from './testimonial.validators';
import { ApiError } from '../../server/apiError';
import { logger } from '../../server/logger';

export class TestimonialService {
  constructor(private repo: TestimonialRepository = testimonialRepository) {}

  /**
   * Submit a new visitor review (starts in PENDING moderation state)
   */
  async submitTestimonial(input: CreateTestimonialInput) {
    const record = await this.repo.create(input);
    logger.info({ id: record.id, name: record.name, company: record.company }, 'New testimonial submitted for moderation');

    return {
      submitted: true,
      id: record.id,
      status: record.status,
      message: 'Testimonial submitted successfully and is pending administrator review.',
    };
  }

  /**
   * Get approved testimonials for public portfolio display
   */
  async getPublicTestimonials(featuredOnly = false) {
    return this.repo.findApproved(featuredOnly);
  }

  /**
   * List all testimonials for admin moderation queue
   */
  async listAllForAdmin(query: GetTestimonialsQuery) {
    return this.repo.findAll(query);
  }

  /**
   * Update moderation status (APPROVED, REJECTED, PENDING) and optional isFeatured flag
   */
  async moderateTestimonial(id: string, input: UpdateTestimonialStatusInput) {
    const existing = await this.repo.findById(id);

    if (!existing) {
      throw ApiError.notFound(`Testimonial with ID ${id} not found`);
    }

    const updated = await this.repo.updateStatus(id, input.status as any, input.isFeatured);
    logger.info({ id, status: input.status, isFeatured: input.isFeatured }, 'Testimonial status updated by admin');

    return updated;
  }

  /**
   * Delete a testimonial entry
   */
  async deleteTestimonial(id: string) {
    const existing = await this.repo.findById(id);

    if (!existing) {
      throw ApiError.notFound(`Testimonial with ID ${id} not found`);
    }

    await this.repo.delete(id);
    return { deleted: true, id };
  }

  /**
   * Retrieve stats overview for dashboard widgets
   */
  async getTestimonialStats() {
    return this.repo.getStats();
  }
}

export const testimonialService = new TestimonialService();
