/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Contact Feature — Zod Validators
 *
 * Layer 1: Pure validation schemas. No database, no business logic.
 * All input coming from the network must pass through these before being processed.
 */

import { z } from 'zod';

// ── Contact Submission ────────────────────────────────────────────────────────

export const createContactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .trim(),

  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),

  subject: z
    .string()
    .max(200, 'Subject too long')
    .trim()
    .optional(),

  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long (max 2000 characters)')
    .trim(),

  /**
   * Honeypot field — rendered as a hidden field in the frontend.
   * Humans never fill it. Bots almost always do.
   */
  website: z.string().optional().default(''),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;

// ── Admin Status Update ───────────────────────────────────────────────────────

export const updateStatusSchema = z.object({
  status: z.enum(['UNREAD', 'READ', 'REPLIED', 'ARCHIVED'], {
    message: 'Status must be UNREAD, READ, REPLIED, or ARCHIVED',
  }),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

// ── Admin List Query ──────────────────────────────────────────────────────────

export const getMessagesQuerySchema = z.object({
  status: z.enum(['UNREAD', 'READ', 'REPLIED', 'ARCHIVED']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  search: z.string().trim().optional(),
});

export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>;
