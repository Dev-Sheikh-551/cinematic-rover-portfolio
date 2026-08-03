/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Async Route Handler Wrapper
 * Catches rejected promises in Express controllers and passes them to global error middleware.
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
