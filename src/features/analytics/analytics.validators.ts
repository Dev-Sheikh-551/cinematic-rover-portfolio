/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Analytics Feature — Zod Validators
 *
 * Layer 1: Input validation for event tracking payloads and admin query parameters.
 */

import { z } from 'zod';

export const trackEventSchema = z.object({
  eventType: z.enum([
    'PAGE_VIEW',
    'PROJECT_CLICK',
    'CTA_CLICK',
    'RESUME_OPEN',
    'THEME_CHANGE',
    'CONTACT_SUBMIT',
    'TESTIMONIAL_SUBMIT',
  ], {
    message: 'Invalid analytics event type',
  }),

  path: z.string().default('/'),
  metadata: z.record(z.string(), z.unknown()).optional(),
  device: z.enum(['desktop', 'mobile', 'tablet']).default('desktop'),
});

export type TrackEventInput = z.infer<typeof trackEventSchema>;

export const analyticsQuerySchema = z.object({
  timeframe: z.enum(['24h', '7d', '30d', 'all']).default('7d'),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
