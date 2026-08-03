/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Analytics Feature — Repository Layer
 *
 * Layer 2: Prisma database operations for recording events and aggregating site metrics.
 */

import { prisma } from '../../lib/prisma/db';
import { TrackEventInput } from './analytics.validators';

export class AnalyticsRepository {
  /**
   * Log an analytics event to PostgreSQL
   */
  async logEvent(input: TrackEventInput, ipHash?: string) {
    return prisma.siteAnalytics.create({
      data: {
        eventType: input.eventType,
        path: input.path,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        ipHash: ipHash || null,
        device: input.device,
      },
    });
  }

  /**
   * Get analytics overview metrics aggregated over a given timeframe (24h, 7d, 30d, all)
   */
  async getOverviewMetrics(sinceDate?: Date) {
    const whereClause = sinceDate ? { createdAt: { gte: sinceDate } } : {};

    const [totalViews, uniqueVisitorsRaw, ctaClicks, projectClicks] = await Promise.all([
      // 1. Total page views
      prisma.siteAnalytics.count({
        where: { ...whereClause, eventType: 'PAGE_VIEW' },
      }),

      // 2. Unique visitors (distinct ipHashes)
      prisma.siteAnalytics.findMany({
        where: { ...whereClause, ipHash: { not: null } },
        distinct: ['ipHash'],
        select: { ipHash: true },
      }),

      // 3. CTA clicks total
      prisma.siteAnalytics.count({
        where: { ...whereClause, eventType: 'CTA_CLICK' },
      }),

      // 4. Project clicks total
      prisma.siteAnalytics.count({
        where: { ...whereClause, eventType: 'PROJECT_CLICK' },
      }),
    ]);

    // Breakdown by device type
    const deviceBreakdown = await prisma.siteAnalytics.groupBy({
      by: ['device'],
      where: whereClause,
      _count: { id: true },
    });

    // Breakdown by eventType
    const eventBreakdown = await prisma.siteAnalytics.groupBy({
      by: ['eventType'],
      where: whereClause,
      _count: { id: true },
    });

    return {
      totalViews,
      uniqueVisitors: uniqueVisitorsRaw.length,
      ctaClicks,
      projectClicks,
      deviceBreakdown: deviceBreakdown.map((d) => ({
        device: d.device || 'desktop',
        count: d._count.id,
      })),
      eventBreakdown: eventBreakdown.map((e) => ({
        eventType: e.eventType,
        count: e._count.id,
      })),
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
