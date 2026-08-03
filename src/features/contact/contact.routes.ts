/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Contact Feature — Express Router
 *
 * Layer 6: Connects HTTP paths to Controller methods, rate limiting, and auth guards.
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { contactController } from './contact.controller';
import { asyncHandler } from '../../server/middleware/asyncHandler';
import { requireAuth } from '../../server/middleware/authMiddleware';

export const contactRouter = Router();

// Rate limiter for public contact submissions: max 5 requests per 15 minutes per IP
const contactSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many contact requests from this IP. Please try again after 15 minutes.',
      code: 'TOO_MANY_REQUESTS',
    },
  },
});

// ── Public Routes ─────────────────────────────────────────────────────────────

// POST /api/v1/contact — Submit message from ContactTerminal / Form
contactRouter.post('/', contactSubmissionLimiter, asyncHandler(contactController.submit));

// ── Protected Admin Routes (Requires Active Admin Session) ────────────────────

// GET /api/v1/contact/stats — Inbox metrics summary
contactRouter.get('/stats', requireAuth, asyncHandler(contactController.stats));

// GET /api/v1/contact — List all messages (paginated + search + filter)
contactRouter.get('/', requireAuth, asyncHandler(contactController.list));

// GET /api/v1/contact/:id — Get message details
contactRouter.get('/:id', requireAuth, asyncHandler(contactController.getOne));

// PATCH /api/v1/contact/:id/status — Update status (UNREAD, READ, REPLIED, ARCHIVED)
contactRouter.patch('/:id/status', requireAuth, asyncHandler(contactController.updateStatus));

// DELETE /api/v1/contact/:id — Delete message
contactRouter.delete('/:id', requireAuth, asyncHandler(contactController.remove));

export default contactRouter;
