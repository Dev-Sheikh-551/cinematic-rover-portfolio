/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Centralized Express Global Error Handler Middleware
 * Handles ApiError, Zod validation errors, and unexpected internal exceptions.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../apiError.js';
import { sendError } from '../response.js';
import { logger } from '../logger.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const requestId = req.id || 'unknown';

  // 1. Handled Custom ApiError
  if (err instanceof ApiError) {
    logger.warn({ requestId, err, statusCode: err.statusCode }, `ApiError: ${err.message}`);
    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  // 2. Zod Request Validation Error
  if (err instanceof ZodError) {
    logger.warn({ requestId, issues: err.issues }, 'Zod Validation Error');
    return sendError(
      res,
      'Invalid request payload structure',
      400,
      'VALIDATION_ERROR',
      err.format()
    );
  }

  // 3. Unhandled Internal System Exception
  logger.error({ requestId, err, stack: err.stack }, `Unhandled Exception: ${err.message}`);

  const isProd = process.env.NODE_ENV === 'production';
  const errorMessage = isProd ? 'Internal server error' : err.message;

  return sendError(
    res,
    errorMessage,
    500,
    'INTERNAL_SERVER_ERROR',
    isProd ? undefined : { stack: err.stack }
  );
}
