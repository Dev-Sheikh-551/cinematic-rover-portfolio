/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * TestimonialSubmitModal — Apple Liquid Glass review submission overlay.
 * POSTs to /api/v1/testimonials. Submissions start as PENDING and only appear
 * publicly after admin approval.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Send, CheckCircle, Loader2, Linkedin } from 'lucide-react';
import { LiquidGlass } from './LiquidGlass';
import { SpecularButton } from './SpecularButton';

interface TestimonialSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  role: string;
  company: string;
  rating: number;
  text: string;
  linkedinUrl: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  role: '',
  company: '',
  rating: 5,
  text: '',
  linkedinUrl: '',
};

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export const TestimonialSubmitModal: React.FC<TestimonialSubmitModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim() || form.name.trim().length < 2) next.name = 'Name must be at least 2 characters.';
    if (!form.role.trim() || form.role.trim().length < 2) next.role = 'Role is required.';
    if (!form.company.trim() || form.company.trim().length < 2) next.company = 'Company is required.';
    if (!form.text.trim() || form.text.trim().length < 10) next.text = 'Review must be at least 10 characters.';
    if (form.linkedinUrl && !/^https?:\/\//.test(form.linkedinUrl)) next.linkedinUrl = 'Must be a valid URL starting with https://';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (field: keyof FormState, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    setErrorMsg('');

    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        role: form.role.trim(),
        company: form.company.trim(),
        rating: form.rating,
        text: form.text.trim(),
      };
      if (form.linkedinUrl.trim()) payload.linkedinUrl = form.linkedinUrl.trim();

      const res = await fetch('/api/v1/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || 'Submission failed. Please try again.');
      }

      setStatus('success');
      setForm(INITIAL_FORM);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }, [form, errors]);

  const handleClose = () => {
    if (status === 'submitting') return;
    setStatus('idle');
    setErrors({});
    setErrorMsg('');
    setForm(INITIAL_FORM);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="testimonial-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          style={{ background: 'rgba(3, 3, 8, 0.82)', backdropFilter: 'blur(20px)' }}
        >
          <motion.div
            key="testimonial-modal-card"
            initial={{ opacity: 0, scale: 0.93, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 28 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="w-full max-w-lg"
          >
            <LiquidGlass
              radius="1.5rem"
              distortion={10}
              blur={20}
              tint={0.07}
              interactive={false}
              className="border border-white/12 shadow-2xl"
            >
              <div className="p-7 sm:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-7">
                  <div>
                    <h2
                      className="text-white font-semibold text-[1.15rem] tracking-[-0.01em] mb-1"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Leave a Review
                    </h2>
                    <p
                      className="text-white/40 text-[12.5px] leading-relaxed"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Your review will appear after moderation.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={status === 'submitting'}
                    className="w-8 h-8 rounded-full border border-white/12 bg-white/5 hover:bg-white/12 hover:border-white/25 flex items-center justify-center text-white/50 hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-40"
                  >
                    <X size={13} />
                  </button>
                </div>

                {/* Success State */}
                <AnimatePresence mode="wait">
                  {status === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center text-center py-8 gap-4"
                    >
                      <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                        <CheckCircle size={24} className="text-emerald-400" />
                      </div>
                      <div>
                        <p
                          className="text-white font-medium text-base mb-1"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          Review Submitted!
                        </p>
                        <p
                          className="text-white/45 text-[12.5px] leading-relaxed max-w-xs mx-auto"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          Thank you — your review is under review and will appear publicly once approved.
                        </p>
                      </div>
                      <button
                        onClick={handleClose}
                        className="mt-2 px-5 py-2 rounded-full border border-white/15 bg-white/8 hover:bg-white/15 text-white text-[13px] font-medium transition-all duration-200 cursor-pointer"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        Close
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      {/* Star Rating */}
                      <div>
                        <label
                          className="block text-white/55 text-[11px] font-medium tracking-wider uppercase mb-2"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          Rating
                        </label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleChange('rating', star)}
                              onMouseEnter={() => setHoveredStar(star)}
                              onMouseLeave={() => setHoveredStar(0)}
                              className="cursor-pointer transition-transform duration-100 hover:scale-110 active:scale-95"
                              aria-label={`Rate ${star} out of 5`}
                            >
                              <Star
                                size={22}
                                className="transition-colors duration-150"
                                fill={(hoveredStar || form.rating) >= star ? '#f59e0b' : 'transparent'}
                                stroke={(hoveredStar || form.rating) >= star ? '#f59e0b' : 'rgba(255,255,255,0.25)'}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Text */}
                      <div>
                        <label
                          htmlFor="tsm-text"
                          className="block text-white/55 text-[11px] font-medium tracking-wider uppercase mb-2"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          Your Review *
                        </label>
                        <textarea
                          id="tsm-text"
                          rows={4}
                          value={form.text}
                          onChange={(e) => handleChange('text', e.target.value)}
                          placeholder="Share your experience working with Sheikh..."
                          className="w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-[13.5px] placeholder-white/25 resize-none outline-none transition-all duration-200 focus:border-white/30 focus:bg-white/8"
                          style={{
                            borderColor: errors.text ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)',
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                          maxLength={1000}
                        />
                        {errors.text && (
                          <p className="text-red-400/80 text-[11px] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{errors.text}</p>
                        )}
                        <p className="text-white/20 text-[10.5px] mt-1 text-right">{form.text.length}/1000</p>
                      </div>

                      {/* Name + Role row */}
                      <div className="grid grid-cols-2 gap-3">
                        {(['name', 'role'] as const).map((field) => (
                          <div key={field}>
                            <label
                              htmlFor={`tsm-${field}`}
                              className="block text-white/55 text-[11px] font-medium tracking-wider uppercase mb-2 capitalize"
                              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                              {field} *
                            </label>
                            <input
                              id={`tsm-${field}`}
                              type="text"
                              value={form[field]}
                              onChange={(e) => handleChange(field, e.target.value)}
                              placeholder={field === 'name' ? 'Jane Smith' : 'Product Lead'}
                              className="w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white text-[13px] placeholder-white/25 outline-none transition-all duration-200 focus:border-white/30 focus:bg-white/8"
                              style={{
                                borderColor: errors[field] ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)',
                                fontFamily: "'Space Grotesk', sans-serif",
                              }}
                            />
                            {errors[field] && (
                              <p className="text-red-400/80 text-[11px] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{errors[field]}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Company */}
                      <div>
                        <label
                          htmlFor="tsm-company"
                          className="block text-white/55 text-[11px] font-medium tracking-wider uppercase mb-2"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          Company *
                        </label>
                        <input
                          id="tsm-company"
                          type="text"
                          value={form.company}
                          onChange={(e) => handleChange('company', e.target.value)}
                          placeholder="Acme Corp"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[13px] placeholder-white/25 outline-none transition-all duration-200 focus:border-white/30 focus:bg-white/8"
                          style={{
                            borderColor: errors.company ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)',
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        />
                        {errors.company && (
                          <p className="text-red-400/80 text-[11px] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{errors.company}</p>
                        )}
                      </div>

                      {/* LinkedIn (optional) */}
                      <div>
                        <label
                          htmlFor="tsm-linkedin"
                          className="flex items-center gap-1.5 text-white/55 text-[11px] font-medium tracking-wider uppercase mb-2"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          <Linkedin size={11} />
                          LinkedIn URL
                          <span className="normal-case tracking-normal text-white/25 font-normal">(optional)</span>
                        </label>
                        <input
                          id="tsm-linkedin"
                          type="url"
                          value={form.linkedinUrl}
                          onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[13px] placeholder-white/25 outline-none transition-all duration-200 focus:border-white/30 focus:bg-white/8"
                          style={{
                            borderColor: errors.linkedinUrl ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)',
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        />
                        {errors.linkedinUrl && (
                          <p className="text-red-400/80 text-[11px] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{errors.linkedinUrl}</p>
                        )}
                      </div>

                      {/* Error Banner */}
                      <AnimatePresence>
                        {status === 'error' && errorMsg && (
                          <motion.p
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-red-300/80 text-[12px] px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                          >
                            {errorMsg}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* Submit */}
                      <SpecularButton
                        id="tsm-submit"
                        type="submit"
                        disabled={status === 'submitting'}
                        size="md"
                        radius={14}
                        baseColor="#10b981"
                        lineColor="#34d399"
                        textColor="#000000"
                        intensity={1.2}
                        className="w-full"
                      >
                        {status === 'submitting' ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Submitting…</span>
                          </>
                        ) : (
                          <>
                            <Send size={14} />
                            <span>Submit Review</span>
                          </>
                        )}
                      </SpecularButton>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </LiquidGlass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TestimonialSubmitModal;
