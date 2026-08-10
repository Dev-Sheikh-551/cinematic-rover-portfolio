/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * TestimonialsWall — Phase 4.4 (viewport-fit revision)
 *
 * The entire section is constrained to 100dvh minus the fixed 64px header so
 * it always fits on screen. Layout:
 *
 *   Outer wrapper  — flex col, h-[calc(100dvh-4rem)], overflow hidden
 *   Header row     — compact, single line, ~40px
 *   Cards area     — flex-1, overflow hidden, masonry-style grid
 *
 * Card text is clamped to 3 lines so no card grows unbounded.
 * Editorial asymmetry is preserved via alternating col-span on desktop.
 */

import React, { useEffect, useState, useCallback, memo } from 'react';
import { motion } from 'motion/react';
import { Star, Linkedin, MessageSquareQuote, PenLine } from 'lucide-react';
import { LiquidGlass } from './LiquidGlass';
import { TestimonialSubmitModal } from './TestimonialSubmitModal';
import { SpecularButton } from './SpecularButton';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  text: string;
  avatarUrl?: string | null;
  linkedinUrl?: string | null;
  isFeatured?: boolean;
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const getInitials = (name: string): string =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

const nameToHue = (name: string): number => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
};

// ── StarRow ────────────────────────────────────────────────────────────────────

const StarRow: React.FC<{ rating: number; isHovered: boolean }> = memo(({ rating, isHovered }) => (
  <div className="flex gap-px">
    {[1, 2, 3, 4, 5].map(s => (
      <Star
        key={s}
        size={11}
        style={{
          fill: s <= rating ? '#f59e0b' : 'transparent',
          stroke: s <= rating ? '#f59e0b' : 'rgba(255,255,255,0.15)',
          filter: isHovered && s <= rating ? 'drop-shadow(0 0 3px rgba(245,158,11,0.65))' : 'none',
          transition: 'filter 0.25s ease',
          flexShrink: 0,
        }}
      />
    ))}
  </div>
));

// ── TestimonialCard (compact) ──────────────────────────────────────────────────

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = memo(({ testimonial }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hue = nameToHue(testimonial.name);

  return (
    <LiquidGlass
      radius="1rem"
      distortion={5}
      blur={12}
      tint={0.04}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-3.5 flex flex-col gap-2">
        {/* Top row: stars + featured badge */}
        <div className="flex items-center justify-between gap-2">
          <StarRow rating={testimonial.rating} isHovered={isHovered} />
          {testimonial.isFeatured && (
            <span
              className="text-[9px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.28)',
                color: 'rgba(245,158,11,0.85)',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Featured
            </span>
          )}
        </div>

        {/* Review text — clamped to 3 lines */}
        <p
          className="text-white/70 text-[12px] leading-[1.6]"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {testimonial.text}
        </p>

        {/* Author row */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/8">
          {/* Avatar */}
          {testimonial.avatarUrl ? (
            <img
              src={testimonial.avatarUrl}
              alt={testimonial.name}
              className="w-7 h-7 rounded-full object-cover border border-white/12 flex-shrink-0"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border border-white/10 text-[10px] font-bold"
              style={{
                background: `hsl(${hue}, 42%, 26%)`,
                color: `hsl(${hue}, 65%, 78%)`,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {getInitials(testimonial.name)}
            </div>
          )}

          {/* Name + role */}
          <div className="flex-1 min-w-0">
            <div
              className="text-white text-[11.5px] font-semibold leading-none truncate"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {testimonial.name}
            </div>
            <div
              className="text-white/38 text-[10.5px] leading-none truncate mt-0.5"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {testimonial.role}
              {testimonial.company && (
                <span className="text-white/24"> · {testimonial.company}</span>
              )}
            </div>
          </div>

          {/* LinkedIn */}
          {testimonial.linkedinUrl && (
            <a
              href={testimonial.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border border-white/10 bg-white/5 hover:bg-[#0a66c2]/25 hover:border-[#0a66c2]/40 transition-all duration-200"
              title={`${testimonial.name} on LinkedIn`}
            >
              <Linkedin size={10} className="text-white/40" style={{ transition: 'color 0.2s ease' }} />
            </a>
          )}
        </div>
      </div>
    </LiquidGlass>
  );
});

// ── EmptyState (compact) ───────────────────────────────────────────────────────

const EmptyState: React.FC<{ onLeaveReview: () => void }> = ({ onLeaveReview }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="flex-1 flex items-center justify-center"
  >
    <LiquidGlass radius="1.25rem" distortion={7} blur={16} tint={0.05} interactive={false} className="max-w-xs w-full">
      <div className="px-6 py-8 flex flex-col items-center gap-4 text-center">
        <div
          className="w-11 h-11 rounded-xl border border-white/12 bg-white/6 flex items-center justify-center"
          style={{ boxShadow: '0 0 24px rgba(255,255,255,0.05)' }}
        >
          <MessageSquareQuote size={18} className="text-white/45" />
        </div>
        <div>
          <p className="text-white text-[0.95rem] font-semibold mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Be the first to review
          </p>
          <p className="text-white/38 text-[12px] leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Worked together? Share your experience.
          </p>
        </div>
        <button
          id="testimonials-leave-review-btn"
          onClick={onLeaveReview}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 bg-white/8 hover:bg-white/14 hover:border-white/28 text-white text-[12px] font-medium transition-all duration-200 cursor-pointer active:scale-[0.97]"
          style={{ fontFamily: "'Space Grotesk', sans-serif", boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09)' }}
        >
          <PenLine size={11} />
          Leave a Review
        </button>
      </div>
    </LiquidGlass>
  </motion.div>
);

// ── Motion variants ────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 220, damping: 28 } },
};

// ── Editorial column configs (desktop only, tablet/mobile ignored) ─────────────
// Cards alternate between 1-col and 2-col on a 3-col grid.
// offsetY is subtle (≤20px) to keep the layout within viewport.
const EDITORIAL_CONFIGS = [
  { widthClass: 'lg:col-span-2', offsetY: 0 },
  { widthClass: 'lg:col-span-1', offsetY: 12 },
  { widthClass: 'lg:col-span-1', offsetY: 6 },
  { widthClass: 'lg:col-span-2', offsetY: 18 },
  { widthClass: 'lg:col-span-1', offsetY: 0 },
  { widthClass: 'lg:col-span-1', offsetY: -8 },
];

// ── TestimonialsWall ──────────────────────────────────────────────────────────

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export const TestimonialsWall: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    setFetchStatus('loading');
    try {
      const res = await fetch('/api/v1/testimonials');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setTestimonials(Array.isArray(json?.data) ? json.data : []);
      setFetchStatus('success');
    } catch {
      setFetchStatus('error');
    }
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const isEmpty = fetchStatus === 'success' && testimonials.length === 0;

  // Limit display to 6 cards max so the grid never overflows the viewport
  const visibleTestimonials = testimonials.slice(0, 6);

  return (
    <>
      {/*
        Outer: fill the section viewport window minus the 64px fixed header.
        flex col so header row + cards area stack vertically.
        overflow-hidden ensures nothing bleeds outside.
      */}
      <div
        className="w-full flex flex-col px-5 sm:px-8 lg:px-14 xl:px-20"
        style={{ height: 'calc(100dvh - 4rem)', maxHeight: 'calc(100dvh - 4rem)', overflow: 'hidden' }}
      >

        {/* ── Header row ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Eyebrow */}
            <div className="flex items-center gap-2">
              <div className="h-px w-6 bg-white/20" />
              <span
                className="text-white/32 text-[10px] font-medium tracking-[0.2em] uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                05 — Reviews
              </span>
            </div>
            {/* Title */}
            <h2
              className="text-white text-[1.1rem] sm:text-[1.3rem] font-bold leading-none tracking-[-0.01em] hidden sm:block"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              What People Are Saying
            </h2>
          </div>

          {/* CTA */}
          <SpecularButton
            id="testimonials-wall-leave-review"
            size="sm"
            radius={20}
            baseColor="#262626"
            lineColor="#ffffff20"
            textColor="#ffffff"
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0"
          >
            <PenLine size={11} />
            <span className="hidden sm:inline">Leave a Review</span>
            <span className="sm:hidden">Review</span>
          </SpecularButton>
        </div>

        {/* ── Loading skeletons ───────────────────────────────────────────── */}
        {fetchStatus === 'loading' && (
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 content-start">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-white/8 bg-white/3 animate-pulse"
                style={{ animationDelay: `${i * 0.08}s` }}
              />
            ))}
          </div>
        )}

        {/* ── Error state ─────────────────────────────────────────────────── */}
        {fetchStatus === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-white/32 text-[13px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Couldn't load reviews right now.
            </p>
            <button
              onClick={fetchTestimonials}
              className="text-white/45 hover:text-white text-[12px] underline underline-offset-4 transition-colors cursor-pointer"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {isEmpty && <EmptyState onLeaveReview={() => setIsModalOpen(true)} />}

        {/* ── Cards ───────────────────────────────────────────────────────── */}
        {fetchStatus === 'success' && visibleTestimonials.length > 0 && (
          <motion.div
            className="flex-1 overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {/*
              Desktop: 3-col grid, cards span 1 or 2 cols, subtle Y stagger.
              Tablet:  2-col uniform grid.
              Mobile:  2-col compact grid (still fits most phones).
              align-items: start prevents tall cards from stretching short ones.
            */}
            <div
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 lg:gap-3"
              style={{ alignItems: 'start' }}
            >
              {visibleTestimonials.map((t, i) => {
                const config = EDITORIAL_CONFIGS[i % EDITORIAL_CONFIGS.length];
                return (
                  <motion.div
                    key={t.id}
                    variants={cardVariants}
                    className={config.widthClass}
                    style={{ transform: `translateY(${config.offsetY}px)` }}
                  >
                    <TestimonialCard testimonial={t} />
                  </motion.div>
                );
              })}
            </div>

            {/* "And more" note if there are additional testimonials */}
            {testimonials.length > 6 && (
              <p
                className="text-white/25 text-[10.5px] text-center mt-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                +{testimonials.length - 6} more reviews available
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Submission Modal ───────────────────────────────────────────────── */}
      <TestimonialSubmitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default TestimonialsWall;
