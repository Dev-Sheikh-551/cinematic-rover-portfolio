/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Standardized JSON API Response Helpers
 * Guarantees uniform response structures across all endpoints:
 *   Success: { success: true, data: T, meta?: object }
 *   Error:   { success: false, error: { message, code, details? } }
 */

import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>
) {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  details?: unknown
) {
  const payload: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      ...(details ? { details } : {}),
    },
  };
  return res.status(statusCode).json(payload);
}
