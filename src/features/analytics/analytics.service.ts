/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Analytics Feature — Service Layer
 *
 * Layer 3: Encapsulates privacy-friendly IP hashing, timeframe calculations, and repository delegation.
 */

import crypto from 'crypto';
import { analyticsRepository, AnalyticsRepository } from './analytics.repository.js';
import { TrackEventInput, AnalyticsQuery } from './analytics.validators.js';

const ANONYMIZATION_SALT = process.env.JWT_SECRET || 'analytics-salt-key';

export class AnalyticsService {
  constructor(private repo: AnalyticsRepository = analyticsRepository) {}

  /**
   * Track an analytics event with an anonymized SHA-256 hashed IP for privacy
   */
  async trackEvent(input: TrackEventInput, rawIp?: string) {
    const ipHash = rawIp ? this.hashIp(rawIp) : undefined;
    await this.repo.logEvent(input, ipHash);
    return { recorded: true };
  }

  /**
   * Get overview statistics aggregated over requested timeframe
   */
  async getOverview(query: AnalyticsQuery) {
    const sinceDate = this.getSinceDate(query.timeframe);
    return this.repo.getOverviewMetrics(sinceDate);
  }

  /**
   * Anonymize IP address via SHA-256 hash + salt (GDPR compliant — raw IP never stored)
   */
  private hashIp(ip: string): string {
    return crypto
      .createHmac('sha256', ANONYMIZATION_SALT)
      .update(ip)
      .digest('hex')
      .slice(0, 16);
  }

  /**
   * Calculate starting date for requested timeframe
   */
  private getSinceDate(timeframe: '24h' | '7d' | '30d' | 'all'): Date | undefined {
    const now = new Date();
    switch (timeframe) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'all':
      default:
        return undefined;
    }
  }
}

export const analyticsService = new AnalyticsService();
