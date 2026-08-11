/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Testimonial Feature — Repository Layer
 *
 * Layer 2: Prisma database operations for Testimonial entities.
 */

import { prisma } from '../../lib/prisma/db.js';
import { TestimonialStatus, Prisma } from '@prisma/client';
import { CreateTestimonialInput, GetTestimonialsQuery } from './testimonial.validators.js';

export class TestimonialRepository {
  /**
   * Create a new pending testimonial submission in PostgreSQL
   */
  async create(data: CreateTestimonialInput) {
    return prisma.testimonial.create({
      data: {
        name: data.name,
        role: data.role,
        company: data.company,
        rating: data.rating,
        text: data.text,
        avatarUrl: data.avatarUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        portfolioUrl: data.portfolioUrl || null,
        status: TestimonialStatus.PENDING,
        isFeatured: false,
      },
    });
  }

  /**
   * Find approved testimonials for public display on the portfolio
   */
  async findApproved(featuredOnly = false) {
    const where: Prisma.TestimonialWhereInput = {
      status: TestimonialStatus.APPROVED,
    };

    if (featuredOnly) {
      where.isFeatured = true;
    }

    return prisma.testimonial.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Find a single testimonial by ID
   */
  async findById(id: string) {
    return prisma.testimonial.findUnique({
      where: { id },
    });
  }

  /**
   * Update moderation status and optional featured flag
   */
  async updateStatus(id: string, status: TestimonialStatus, isFeatured?: boolean) {
    const data: Prisma.TestimonialUpdateInput = { status };
    if (typeof isFeatured === 'boolean') {
      data.isFeatured = isFeatured;
    }

    return prisma.testimonial.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a testimonial permanently
   */
  async delete(id: string) {
    return prisma.testimonial.delete({
      where: { id },
    });
  }

  /**
   * Paginated list for admin moderation queue
   */
  async findAll(query: GetTestimonialsQuery) {
    const { status, featuredOnly, page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TestimonialWhereInput = {};

    if (status) {
      where.status = status as TestimonialStatus;
    }

    if (typeof featuredOnly === 'boolean') {
      where.isFeatured = featuredOnly;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { text: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.testimonial.count({ where }),
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
   * Get metrics overview for admin dashboard
   */
  async getStats() {
    const [pending, approved, rejected, total, avgRatingResult] = await Promise.all([
      prisma.testimonial.count({ where: { status: 'PENDING' } }),
      prisma.testimonial.count({ where: { status: 'APPROVED' } }),
      prisma.testimonial.count({ where: { status: 'REJECTED' } }),
      prisma.testimonial.count(),
      prisma.testimonial.aggregate({
        _avg: { rating: true },
        where: { status: 'APPROVED' },
      }),
    ]);

    return {
      pending,
      approved,
      rejected,
      total,
      averageRating: avgRatingResult._avg.rating ? Number(avgRatingResult._avg.rating.toFixed(1)) : 5.0,
    };
  }
}

export const testimonialRepository = new TestimonialRepository();
