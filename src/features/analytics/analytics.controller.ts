/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Analytics Feature — Controller Layer
 *
 * Layer 4: Translates HTTP requests to AnalyticsService methods.
 */

import { Request, Response } from 'express';
import { analyticsService, AnalyticsService } from './analytics.service';
import { trackEventSchema, analyticsQuerySchema } from './analytics.validators';
import { sendSuccess } from '../../server/response';

export class AnalyticsController {
  constructor(private service: AnalyticsService = analyticsService) {}

  /**
   * POST /api/v1/analytics/track — Ingest an event (Public)
   */
  track = async (req: Request, res: Response) => {
    const validatedData = trackEventSchema.parse(req.body);
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip;
    const result = await this.service.trackEvent(validatedData, clientIp);
    return sendSuccess(res, result, 201);
  };

  /**
   * GET /api/v1/analytics/overview — Overview metrics (Admin only)
   */
  overview = async (req: Request, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const result = await this.service.getOverview(query);
    return sendSuccess(res, result);
  };
}

export const analyticsController = new AnalyticsController();
