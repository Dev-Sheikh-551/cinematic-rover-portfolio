/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Expanded Health Diagnostic Route
 * Endpoint: /api/v1/health
 * Returns API state, Database ping latency, Node runtime version, Uptime, and Memory metrics.
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess, sendError } from '../response';
import { prisma } from '../../lib/prisma/db';
import { env } from '../config/env';

export const healthRouter = Router();

healthRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    let dbStatus = 'disconnected';
    let dbLatencyMs = -1;

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - startTime;
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
    }

    const memoryUsage = process.memoryUsage();
    const formatMb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

    const healthData = {
      api: {
        status: 'ok',
        version: '1.0.0',
        environment: env.NODE_ENV,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        provider: 'postgresql',
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          rss: formatMb(memoryUsage.rss),
          heapTotal: formatMb(memoryUsage.heapTotal),
          heapUsed: formatMb(memoryUsage.heapUsed),
        },
      },
    };

    if (dbStatus !== 'connected') {
      return sendError(res, 'Database connection check failed', 503, 'SERVICE_UNAVAILABLE', healthData);
    }

    return sendSuccess(res, healthData);
  })
);

export default healthRouter;
