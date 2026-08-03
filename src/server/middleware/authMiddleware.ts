/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Authentication Middleware — Portfolio Platform
 *
 * Protects Express API routes that require an active admin session.
 * Used for Phase 4.3+ protected endpoints (messages, testimonials, settings).
 *
 * Frontend route protection is handled separately in AdminGuard.tsx.
 */

import { Request, Response, NextFunction } from 'express';
import { getSession } from '@auth/express';
import { authConfig } from '../auth';
import { sendError } from '../response';
import { logger } from '../logger';
import { env } from '../config/env';

/**
 * requireAuth — Express middleware that validates an active database session.
 *
 * Returns:
 *  401 UNAUTHORIZED  — No session cookie or invalid/expired session
 *  403 FORBIDDEN     — Session email does not match ADMIN_EMAIL
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await getSession(req, authConfig);

    if (!session || !session.user) {
      return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
    }

    if (!session.user.email || session.user.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
      logger.warn(
        { email: session.user.email, requestId: req.id },
        'Forbidden: session email does not match ADMIN_EMAIL'
      );
      return sendError(res, 'Access denied', 403, 'FORBIDDEN');
    }

    // Attach session to request for use in controllers
    (req as Request & { adminSession: typeof session }).adminSession = session;

    next();
  } catch (err) {
    logger.error({ err, requestId: req.id }, 'Error validating session in requireAuth');
    return sendError(res, 'Internal authentication error', 500, 'AUTH_ERROR');
  }
}
