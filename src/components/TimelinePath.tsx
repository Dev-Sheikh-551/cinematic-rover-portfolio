/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * TimelinePath — Synchronized Growth Chrono Deck
 *
 * Each tab (01 // Story, 02 // Breakthroughs, 03 // Philosophy) dynamically
 * updates the active stage, its corresponding date, narrative focus, and milestones.
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Shield, ArrowRight, Sparkles, BookOpen, Layers, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { sound } from './SoundManager';
import { TimelineEvent } from '../types';
import { TIMELINE_OFFSETS } from '../constants';
import { LiquidGlass } from './LiquidGlass';

const CHRONO_CHAPTERS: (TimelineEvent & {
  tabName: string;
  contentType: 'story' | 'breakthroughs' | 'philosophy';
  quote?: string;
  milestones?: string[];
  techStack: string[];
})[] = [
    {
      id: 'ch-1',
      tabName: '01 // Story',
      chapterTitle: 'Chapter 01 — The Beginning',
      year: '2023 - 2024',
      title: 'Foundations & Web Standards',
      company: 'FreeCodeCamp & Scrimba',
      contentType: 'story',
      description:
        'Mastered core web standards, HTML5 semantic layout structures, CSS grid & flexbox systems, and foundational JavaScript algorithms through daily deliberate practice.',
      techStack: ['HTML5', 'CSS3', 'JavaScript ES6+', 'Git'],
      coordinates: { x: -30, y: -15, z: 723 },
    },
    {
      id: 'ch-2',
      tabName: '02 // Breakthroughs',
      chapterTitle: 'Chapter 02 — Building Momentum',
      year: '2024',
      title: 'React Ecosystems & Type Safety',
      company: 'Jasseh Code Camp (JCC)',
      contentType: 'breakthroughs',
      description:
        'Engineered production React applications with state architecture, Next.js App Router, TypeScript type safety, and collaborative team Git workflows during intensive bootcamps.',
      milestones: [
        'React Custom Hooks & Component State Architecture',
        'TypeScript Static Type Systems & Strict Interfaces',
        'Next.js App Router, SSR & API Integration',
      ],
      techStack: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      coordinates: { x: 20, y: -15, z: 770 },
    },
    {
      id: 'ch-3',
      tabName: '03 // Philosophy',
      chapterTitle: 'Chapter 03 — Creating Experiences',
      year: '2024 - PRESENT',
      title: 'Interactive Web & Production Applications',
      company: 'Independent & Client Storefronts',
      contentType: 'philosophy',
      description:
        'Crafting high-performance web applications featuring 3D WebGL/Canvas physics, glassmorphic UI material design, smooth GSAP motion systems, and tailored client solutions.',
      quote: 'Combining high engineering standards with refined motion creates digital experiences visitors never forget.',
      techStack: ['WebGL / Canvas', 'Framer Motion', 'GSAP', 'Liquid Glass UI'],
      coordinates: { x: 5, y: -15, z: 836 },
    },
  ];

interface TimelinePathProps {
  scrollProgress: number;
  onMilestoneReached?: (index: number) => void;
}

export const TimelinePath: React.FC<TimelinePathProps> = ({ scrollProgress, onMilestoneReached }) => {
  const [chapterIdx, setChapterIdx] = useState<number>(0);
  const activeChapterRef = useRef<number>(0);
  const manualLockUntilRef = useRef<number>(0);
  const callbackRef = useRef(onMilestoneReached);

  useEffect(() => {
    callbackRef.current = onMilestoneReached;
  }, [onMilestoneReached]);

  const timelineStart = TIMELINE_OFFSETS.timeline.start;
  const timelineEnd = TIMELINE_OFFSETS.timeline.end;

  // Normalized scroll progress (0 to 1)
  const lineProgress = Math.max(0, Math.min(1, (scrollProgress - timelineStart) / (timelineEnd - timelineStart)));

  // Calculate active stage from scroll progress (ignored if user recently clicked a card manually)
  useEffect(() => {
    if (scrollProgress < timelineStart || scrollProgress > timelineEnd) return;
    if (Date.now() < manualLockUntilRef.current) return;

    const total = CHRONO_CHAPTERS.length;
    const rawIndex = lineProgress * total;
    const index = Math.min(total - 1, Math.floor(rawIndex));

    if (index !== activeChapterRef.current) {
      activeChapterRef.current = index;
      setChapterIdx(index);
      sound.playConfirm();
      if (callbackRef.current) {
        callbackRef.current(index);
      }
    }
  }, [scrollProgress, lineProgress, timelineStart, timelineEnd]);

  const activeChapter = CHRONO_CHAPTERS[chapterIdx];

  const handleSelectChapter = (index: number) => {
    manualLockUntilRef.current = Date.now() + 6000; // Lock auto-switch for 6s after manual click
    setChapterIdx(index);
    activeChapterRef.current = index;
    sound.playConfirm();
    if (callbackRef.current) {
      callbackRef.current(index);
    }
  };

  const handleNextChapter = () => {
    const next = Math.min(CHRONO_CHAPTERS.length - 1, chapterIdx + 1);
    handleSelectChapter(next);
  };

  const handlePrevChapter = () => {
    const prev = Math.max(0, chapterIdx - 1);
    handleSelectChapter(prev);
  };

  return (
    <div
      id="timeline-container"
      className="relative w-full max-w-2xl mx-auto px-4 py-12 min-h-[100vh] flex flex-col justify-center"
    >
      {/* SECTION HEADER */}
      <div className="mb-6 text-center flex flex-col items-center">
        <div className="text-[10px] font-mono text-emerald-400 tracking-[0.2em] uppercase mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>JOURNEY CHRONO DECK // STAGE 0{chapterIdx + 1} OF 0{CHRONO_CHAPTERS.length}</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-sans font-bold text-white tracking-tight">
          Engineering Evolution
        </h2>
        <p className="text-white/45 text-xs font-mono mt-1 max-w-sm">
          A chapter-based journey tracing growth from foundational code to complex web platforms.
        </p>
      </div>

      {/* CHRONO NAVIGATION TABS (Story -> Breakthroughs -> Philosophy) */}
      <div className="flex items-center justify-between mb-4 font-mono text-xs max-w-lg mx-auto w-full">
        {CHRONO_CHAPTERS.map((ch, idx) => {
          const isActive = idx === chapterIdx;
          const isPassed = idx < chapterIdx;

          return (
            <button
              key={ch.id}
              onClick={() => handleSelectChapter(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer ${isActive
                  ? 'bg-white/15 border-white/30 text-white font-medium shadow-lg'
                  : isPassed
                    ? 'bg-white/5 border-white/10 text-white/50'
                    : 'bg-transparent border-transparent text-white/25 hover:text-white/50'
                }`}
            >
              <span className="text-[10px]">{ch.tabName}</span>
            </button>
          );
        })}
      </div>

      {/* CHRONO DECK LIQUID GLASS PANEL */}
      <div className="relative w-full">
        <LiquidGlass
          radius="1.5rem"
          distortion={8}
          blur={5}
          tint={0.05}
          interactive={false}
          className="p-5 md:p-6 shadow-xl relative overflow-hidden"
        >
          {/* Top glare line */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          {/* Chapter Header Meta & Dynamic Date */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Shield size={11} />
              <span className="uppercase tracking-widest text-[10px]">{activeChapter.chapterTitle}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeChapter.year}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 text-white/80 font-bold text-[11px]"
              >
                <Calendar size={11} className="text-emerald-400" />
                <span>{activeChapter.year}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dynamic Content View Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChapter.id}
              initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(2px)' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4 min-h-[140px]"
            >
              {/* Title & Organization */}
              <div>
                <h3 className="text-xl md:text-2xl font-sans font-bold text-white tracking-tight">
                  {activeChapter.title}
                </h3>
                <div className="text-[11px] font-mono text-white/40 mt-0.5">
                  {activeChapter.company}
                </div>
              </div>

              {/* CONTENT VIEW 1: STORY NARRATIVE */}
              {activeChapter.contentType === 'story' && (
                <div className="space-y-3">
                  <p className="text-white/80 text-xs md:text-sm leading-relaxed font-sans">
                    {activeChapter.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeChapter.techStack.map((tech, tIdx) => (
                      <span key={tIdx} className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full font-mono text-[9px] text-white/70">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CONTENT VIEW 2: BREAKTHROUGHS & MILESTONES */}
              {activeChapter.contentType === 'breakthroughs' && (
                <div className="space-y-3">
                  <p className="text-white/80 text-xs md:text-sm leading-relaxed font-sans">
                    {activeChapter.description}
                  </p>

                  <div className="p-3 rounded-lg bg-white/3 border border-white/5 space-y-2">
                    <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles size={10} className="text-emerald-400" />
                      <span>Technical Capabilities Unlocked</span>
                    </div>
                    <ul className="space-y-1.5 text-xs font-sans text-white/80">
                      {activeChapter.milestones?.map((m, mIdx) => (
                        <li key={mIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                          <span className="leading-relaxed text-[11px] md:text-xs">{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* CONTENT VIEW 3: PHILOSOPHY & INSIGHT */}
              {activeChapter.contentType === 'philosophy' && (
                <div className="space-y-3">
                  <p className="text-white/80 text-xs md:text-sm leading-relaxed font-sans">
                    {activeChapter.description}
                  </p>

                  <div className="border-l-2 border-emerald-400/60 pl-4 py-1.5 my-2 text-white/80 italic text-xs md:text-sm font-sans leading-relaxed">
                    "{activeChapter.quote}"
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Controls & Stepper Actions */}
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-[9px] text-white/35">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevChapter}
                disabled={chapterIdx === 0}
                className={`p-1 rounded-full border transition-all cursor-pointer ${chapterIdx === 0
                    ? 'opacity-30 border-transparent cursor-not-allowed'
                    : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                aria-label="Previous stage"
              >
                <ChevronLeft size={12} />
              </button>

              <span>STAGE 0{chapterIdx + 1} / 0{CHRONO_CHAPTERS.length}</span>

              <button
                onClick={handleNextChapter}
                disabled={chapterIdx === CHRONO_CHAPTERS.length - 1}
                className={`p-1 rounded-full border transition-all cursor-pointer ${chapterIdx === CHRONO_CHAPTERS.length - 1
                    ? 'opacity-30 border-transparent cursor-not-allowed'
                    : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                aria-label="Next stage"
              >
                <ChevronRight size={12} />
              </button>
            </div>

            <div className="flex items-center gap-1 text-white/40 text-[9px]">
              <span>SCROLL OR USE CONTROLS</span>
              <ArrowRight size={9} />
            </div>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
};
