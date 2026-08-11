/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Testimonial Feature — Express Router
 *
 * Layer 5: Mounts public endpoints and protected admin moderation routes.
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { testimonialController } from './testimonial.controller.js';
import { asyncHandler } from '../../server/middleware/asyncHandler.js';
import { requireAuth } from '../../server/middleware/authMiddleware.js';

export const testimonialRouter = Router();

// Rate limiter for public review submission: max 5 requests per 15 minutes per IP
const testimonialSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many testimonial submissions from this IP. Please try again after 15 minutes.',
      code: 'TOO_MANY_REQUESTS',
    },
  },
});

// ── Public Routes ─────────────────────────────────────────────────────────────

// GET /api/v1/testimonials — Fetch approved testimonials for public display
testimonialRouter.get('/', asyncHandler(testimonialController.getPublic));

// POST /api/v1/testimonials — Submit a review (Rate limited, starts as PENDING)
testimonialRouter.post('/', testimonialSubmissionLimiter, asyncHandler(testimonialController.submit));

// ── Protected Admin Routes (Requires Active Admin Session) ────────────────────

// GET /api/v1/testimonials/stats — Metrics overview
testimonialRouter.get('/stats', requireAuth, asyncHandler(testimonialController.stats));

// GET /api/v1/testimonials/admin — Admin moderation queue list
testimonialRouter.get('/admin', requireAuth, asyncHandler(testimonialController.listAdmin));

// PATCH /api/v1/testimonials/:id/status — Moderate (Approve/Reject/Feature)
testimonialRouter.patch('/:id/status', requireAuth, asyncHandler(testimonialController.moderate));

// DELETE /api/v1/testimonials/:id — Delete review
testimonialRouter.delete('/:id', requireAuth, asyncHandler(testimonialController.remove));

export default testimonialRouter;
