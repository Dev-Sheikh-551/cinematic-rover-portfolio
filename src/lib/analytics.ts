/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Client-Side Analytics Tracker
 * Dispatches privacy-respecting analytics events to /api/v1/analytics/track.
 */

export type EventType =
  | 'PAGE_VIEW'
  | 'PROJECT_CLICK'
  | 'CTA_CLICK'
  | 'RESUME_OPEN'
  | 'THEME_CHANGE'
  | 'CONTACT_SUBMIT'
  | 'TESTIMONIAL_SUBMIT';

function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Dispatch an event to the backend analytics ingestion pipeline
 */
export async function trackEvent(eventType: EventType, metadata?: Record<string, unknown>) {
  try {
    const payload = {
      eventType,
      path: window.location.pathname,
      metadata,
      device: getDeviceType(),
    };

    // Use sendBeacon if available for non-blocking payload delivery on unload/click
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/v1/analytics/track', blob);
    } else {
      fetch('/api/v1/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }
  } catch (err) {
    // Non-blocking catch
    console.debug('Analytics track debug:', err);
  }
}

/**
 * Automatically tracks page view on execution
 */
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    trackEvent('PAGE_VIEW');
  });
}
