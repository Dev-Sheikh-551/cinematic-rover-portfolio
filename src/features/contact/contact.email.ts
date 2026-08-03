/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Contact Feature — Transactional Email Service (Resend)
 *
 * Layer 3: Formats and dispatches email notifications to the admin when a message is received.
 * Gracefully logs to Pino console if RESEND_API_KEY is not configured.
 */

import { Resend } from 'resend';
import { env } from '../../server/config/env';
import { logger } from '../../server/logger';

export interface EmailNotificationPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  messageId: string;
  createdAt: Date;
}

export class ContactEmailService {
  private resend: Resend | null = null;

  constructor() {
    if (env.RESEND_API_KEY) {
      this.resend = new Resend(env.RESEND_API_KEY);
    }
  }

  /**
   * Dispatch HTML notification email for a new portfolio contact message
   */
  async sendNewMessageNotification(payload: EmailNotificationPayload) {
    const { name, email, subject, message, messageId, createdAt } = payload;
    const adminEmail = env.ADMIN_EMAIL;
    const formattedDate = createdAt.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #05050a; color: #f3f4f6; margin: 0; padding: 24px; }
    .card { background-color: #0b0c14; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 32px; max-w: 600px; margin: 0 auto; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .header { border-b: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 24px; }
    .title { font-size: 20px; font-weight: 700; color: #10b981; margin: 0 0 6px 0; letter-spacing: -0.01em; }
    .subtitle { font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; font-family: monospace; }
    .meta-row { display: flex; margin-bottom: 12px; font-size: 14px; }
    .meta-label { color: #6b7280; width: 90px; font-weight: 600; flex-shrink: 0; }
    .meta-value { color: #e5e7eb; word-break: break-all; }
    .message-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin: 24px 0; font-size: 15px; line-height: 1.6; color: #f3f4f6; white-space: pre-wrap; }
    .action-btn { display: inline-block; background-color: #10b981; color: #000000; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 10px; margin-top: 16px; }
    .footer { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; margin-top: 32px; font-size: 12px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="subtitle">Helios Command Terminal</div>
      <h1 class="title">New Portfolio Transmission Received</h1>
    </div>
    
    <div class="meta-row">
      <div class="meta-label">Sender:</div>
      <div class="meta-value"><strong>${name}</strong> (&lt;${email}&gt;)</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">Subject:</div>
      <div class="meta-value">${subject || 'Portfolio Inquiry'}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">Time:</div>
      <div class="meta-value">${formattedDate}</div>
    </div>

    <div class="message-box">${message}</div>

    <a href="${env.CORS_ORIGIN}/administrator" class="action-btn">Open Admin Inbox</a>

    <div class="footer">
      Portfolio Platform • Message ID: ${messageId}
    </div>
  </div>
</body>
</html>
    `;

    if (this.resend) {
      try {
        const response = await this.resend.emails.send({
          from: 'Portfolio Platform <onboarding@resend.dev>',
          to: [adminEmail],
          replyTo: email,
          subject: `[Portfolio Inquiry] ${subject || 'New Message'} from ${name}`,
          html: htmlContent,
        });

        logger.info({ messageId, emailId: response.data?.id }, 'Resend email notification dispatched');
        return true;
      } catch (err) {
        logger.error({ err, messageId }, 'Failed to dispatch email via Resend');
        return false;
      }
    } else {
      logger.info(
        { messageId, name, email, subject },
        'RESEND_API_KEY not configured — logged email notification in console'
      );
      return true;
    }
  }
}

export const contactEmailService = new ContactEmailService();
