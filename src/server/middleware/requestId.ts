/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Request ID Middleware
 * Assigns a unique UUID to every incoming HTTP request and attaches it to response headers.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const existingId = req.headers['x-request-id'] as string;
  const requestId = existingId || crypto.randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}
