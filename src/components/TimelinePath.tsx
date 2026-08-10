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
import { Calendar, Shield, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { sound } from './SoundManager';
import { TimelineEvent } from '../types';
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
      tabName: '01 // Beginning',
      chapterTitle: 'Chapter 01 — The Beginning',
      year: 'OCTOBER 2024',
      title: 'First Steps at Jasseh Code Camp',
      company: 'Jasseh Code Camp (JCC)',
      contentType: 'story',
      description:
        'Started learning frontend development at Jasseh Code Camp (JCC). This period was focused on understanding the fundamentals of modern web development and building my first interactive applications with HTML, CSS, JavaScript, React, TypeScript, and Tailwind CSS.',
      techStack: ['HTML5', 'CSS3', 'JavaScript', 'React', 'TypeScript', 'Tailwind CSS'],
      coordinates: { x: -30, y: -15, z: 723 },
    },
    {
      id: 'ch-2',
      tabName: '02 // Self-Study',
      chapterTitle: 'Chapter 02 — Learning Beyond the Classroom',
      year: 'DURING JCC',
      title: 'Self-Directed Mastery & Projects',
      company: 'FreeCodeCamp & Scrimba',
      contentType: 'breakthroughs',
      description:
        'Alongside the bootcamp, I expanded my understanding through self-study using FreeCodeCamp\'s JavaScript Curriculum and Scrimba\'s React Course. Rather than only following tutorials, I created personal projects to apply everything in practical scenarios.',
      milestones: [
        'FreeCodeCamp JavaScript Curriculum & Algorithm Practice',
        'Scrimba Interactive React Course & State Concepts',
        'Building Practical Projects to Apply New Technologies',
      ],
      techStack: ['JavaScript ES6+', 'React', 'Scrimba', 'FreeCodeCamp', 'Git'],
      coordinates: { x: 20, y: -15, z: 770 },
    },
    {
      id: 'ch-3',
      tabName: '03 // Graduation',
      chapterTitle: 'Chapter 03 — From Student to Builder',
      year: 'JANUARY 2026',
      title: 'JCC Completion & Ambitious Projects',
      company: 'JCC & Independent Exploration',
      contentType: 'story',
      description:
        'Completed the Jasseh Code Camp Frontend Program. Instead of stopping there, I shifted my focus toward building increasingly ambitious projects using modern frontend technologies and learning by experimentation, while beginning to explore technologies outside traditional frontend.',
      techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
      coordinates: { x: 5, y: -15, z: 836 },
    },
    {
      id: 'ch-4',
      tabName: '04 // Present',
      chapterTitle: 'Chapter 04 — Professional Growth',
      year: 'PRESENT',
      title: 'Frontend Developer Intern',
      company: 'OceanNet Technologies',
      contentType: 'philosophy',
      description:
        'Currently working as a Frontend Developer Intern at OceanNet Technologies. Over the past several months, I\'ve continued growing by teaching myself full-stack architecture, backend fundamentals, API design, database design, authentication, PostgreSQL, Prisma ORM, Express, and modern application architecture.',
      quote: 'My goal is to become a highly capable full-stack software engineer while maintaining a strong passion for building exceptional frontend experiences.',
      techStack: ['Full-Stack', 'PostgreSQL', 'Prisma ORM', 'Express', 'API Design'],
      coordinates: { x: 10, y: -15, z: 880 },
    },
  ];

interface TimelinePathProps {
  scrollProgress?: number;
  onMilestoneReached?: (index: number) => void;
}

export const TimelinePath: React.FC<TimelinePathProps> = ({ onMilestoneReached }) => {
  const [chapterIdx, setChapterIdx] = useState<number>(0);
  const callbackRef = useRef(onMilestoneReached);

  useEffect(() => {
    callbackRef.current = onMilestoneReached;
  }, [onMilestoneReached]);

  const activeChapter = CHRONO_CHAPTERS[chapterIdx];

  const handleSelectChapter = (index: number) => {
    setChapterIdx(index);
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
              <span>USE CONTROLS TO NAVIGATE</span>
              <ArrowRight size={9} />
            </div>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
};
