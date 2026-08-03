/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Analytics Feature — Express Router
 *
 * Layer 5: Express paths for analytics ingestion and dashboard metrics.
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { analyticsController } from './analytics.controller';
import { asyncHandler } from '../../server/middleware/asyncHandler';
import { requireAuth } from '../../server/middleware/authMiddleware';

export const analyticsRouter = Router();

// Rate limiter for event tracking: max 120 events per minute per IP
const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Rate limit exceeded for analytics tracking.',
      code: 'TOO_MANY_EVENTS',
    },
  },
});

// ── Public Ingestion Route ───────────────────────────────────────────────────

// POST /api/v1/analytics/track — Ingest an analytics event
analyticsRouter.post('/track', trackLimiter, asyncHandler(analyticsController.track));

// ── Protected Admin Route ────────────────────────────────────────────────────

// GET /api/v1/analytics/overview — Aggregated metrics overview
analyticsRouter.get('/overview', requireAuth, asyncHandler(analyticsController.overview));

export default analyticsRouter;
