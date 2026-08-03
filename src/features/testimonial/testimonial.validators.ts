/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Testimonial Feature — Zod Validators
 *
 * Layer 1: Input & query validation schemas for testimonial submission and moderation.
 */

import { z } from 'zod';

// ── Public Submission Schema ──────────────────────────────────────────────────

export const createTestimonialSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .trim(),

  role: z
    .string()
    .min(2, 'Role must be at least 2 characters')
    .max(100, 'Role too long')
    .trim(),

  company: z
    .string()
    .min(2, 'Company must be at least 2 characters')
    .max(100, 'Company too long')
    .trim(),

  rating: z.coerce
    .number()
    .int()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .default(5),

  text: z
    .string()
    .min(10, 'Testimonial text must be at least 10 characters')
    .max(1000, 'Testimonial text cannot exceed 1000 characters')
    .trim(),

  avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;

// ── Admin Moderation Schema ──────────────────────────────────────────────────

export const updateTestimonialStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED'], {
    message: 'Status must be PENDING, APPROVED, or REJECTED',
  }),
  isFeatured: z.boolean().optional(),
});

export type UpdateTestimonialStatusInput = z.infer<typeof updateTestimonialStatusSchema>;

// ── Admin Query Schema ───────────────────────────────────────────────────────

export const getTestimonialsQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  featuredOnly: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  search: z.string().trim().optional(),
});

export type GetTestimonialsQuery = z.infer<typeof getTestimonialsQuerySchema>;
