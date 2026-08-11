/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Testimonial Feature — Controller Layer
 *
 * Layer 4: Translates HTTP requests into Service calls and formats API responses.
 */

import { Request, Response } from 'express';
import { testimonialService, TestimonialService } from './testimonial.service.js';
import {
  createTestimonialSchema,
  getTestimonialsQuerySchema,
  updateTestimonialStatusSchema,
} from './testimonial.validators.js';
import { sendSuccess } from '../../server/response.js';

export class TestimonialController {
  constructor(private service: TestimonialService = testimonialService) {}

  /**
   * POST /api/v1/testimonials — Submit review (Public)
   */
  submit = async (req: Request, res: Response) => {
    const validatedData = createTestimonialSchema.parse(req.body);
    const result = await this.service.submitTestimonial(validatedData);
    return sendSuccess(res, result, 201);
  };

  /**
   * GET /api/v1/testimonials — Get approved testimonials (Public)
   */
  getPublic = async (req: Request, res: Response) => {
    const featuredOnly = req.query.featured === 'true';
    const items = await this.service.getPublicTestimonials(featuredOnly);
    return sendSuccess(res, items);
  };

  /**
   * GET /api/v1/testimonials/admin — Moderation queue (Admin only)
   */
  listAdmin = async (req: Request, res: Response) => {
    const query = getTestimonialsQuerySchema.parse(req.query);
    const result = await this.service.listAllForAdmin(query);
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
   * GET /api/v1/testimonials/stats — Stats overview (Admin only)
   */
  stats = async (req: Request, res: Response) => {
    const stats = await this.service.getTestimonialStats();
    return sendSuccess(res, stats);
  };

  /**
   * PATCH /api/v1/testimonials/:id/status — Approve/reject/feature (Admin only)
   */
  moderate = async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateTestimonialStatusSchema.parse(req.body);
    const updated = await this.service.moderateTestimonial(id, input);
    return sendSuccess(res, updated);
  };

  /**
   * DELETE /api/v1/testimonials/:id — Delete entry (Admin only)
   */
  remove = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.service.deleteTestimonial(id);
    return sendSuccess(res, result);
  };
}

export const testimonialController = new TestimonialController();
