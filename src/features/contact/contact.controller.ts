/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Contact Feature — Controller Layer
 *
 * Layer 5: Translates HTTP requests to Service calls and formats API JSON responses.
 * Contains no direct database queries or raw business rules.
 */

import { Request, Response } from 'express';
import { contactService, ContactService } from './contact.service';
import {
  createContactSchema,
  getMessagesQuerySchema,
  updateStatusSchema,
} from './contact.validators';
import { sendSuccess } from '../../server/response';

export class ContactController {
  constructor(private service: ContactService = contactService) {}

  /**
   * POST /api/v1/contact — Submit message (Public)
   */
  submit = async (req: Request, res: Response) => {
    const validatedData = createContactSchema.parse(req.body);
    const result = await this.service.submitMessage(validatedData);
    return sendSuccess(res, result, 201);
  };

  /**
   * GET /api/v1/contact — List messages (Admin only)
   */
  list = async (req: Request, res: Response) => {
    const query = getMessagesQuerySchema.parse(req.query);
    const result = await this.service.listMessages(query);
    return sendSuccess(res, result.items, 200, {
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  };

  /**
   * GET /api/v1/contact/stats — Get inbox stats (Admin only)
   */
  stats = async (req: Request, res: Response) => {
    const stats = await this.service.getInboxStats();
    return sendSuccess(res, stats);
  };

  /**
   * GET /api/v1/contact/:id — Get message details (Admin only)
   */
  getOne = async (req: Request, res: Response) => {
    const { id } = req.params;
    const message = await this.service.getMessageById(id);
    return sendSuccess(res, message);
  };

  /**
   * PATCH /api/v1/contact/:id/status — Update message status (Admin only)
   */
  updateStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateStatusSchema.parse(req.body);
    const updated = await this.service.updateMessageStatus(id, input);
    return sendSuccess(res, updated);
  };

  /**
   * DELETE /api/v1/contact/:id — Delete message (Admin only)
   */
  remove = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.service.deleteMessage(id);
    return sendSuccess(res, result);
  };
}

export const contactController = new ContactController();
