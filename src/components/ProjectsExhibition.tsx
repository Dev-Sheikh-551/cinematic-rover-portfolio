/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ProjectsExhibition — Editorial Selected Work Section
 * Integrated with the official React Bits OptionWheel component.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Github, Maximize2, Code2, Layers } from 'lucide-react';
import { sound } from './SoundManager';
import { Project } from '../types';
import { LiquidGlass } from './LiquidGlass';
import OptionWheel from './OptionWheel';

const PROJECT_THEATER: (Project & {
  category: string;
  architecture: {
    challenge: string;
    solution: string;
    impact: string;
  };
})[] = [
  {
    id: 'p1',
    title: 'Coffee Business Web Platform',
    category: 'E-COMMERCE & BRANDING',
    description: 'A modern, responsive e-commerce experience featuring smooth animations, product showcases, and intuitive ordering workflows.',
    architecture: {
      challenge: 'Capturing artisanal brand warmth while maintaining fast load times and fluid cart state transitions.',
      solution: 'Asset-optimized React architecture with modular UI components, glassmorphic styling, and client state management.',
      impact: 'Achieved near-perfect Lighthouse performance metrics and an engaging digital storefront.',
    },
    role: 'Lead Frontend Engineer',
    period: '2025',
    tech: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript'],
    demoUrl: 'https://github.com/Dev-Sheikh-551/coffee-business-app',
    githubUrl: 'https://github.com/Dev-Sheikh-551/coffee-business-app',
    modelType: 'lander',
    developerNotes: {
      architectureReason: 'I chose Next.js App Router for server-rendered page shells combined with React client components for dynamic product filtering. This gave us sub-second initial paint times without sacrificing snappy interactive cart updates.',
      technicalChallenges: 'Matching glassmorphic backdrops with heavy product imagery caused GPU composite layer lag on low-power mobile chips. I ended up creating isolated CSS layout containment layers (contain: paint layout) to isolate filter recalculations.',
      optimizations: 'Pre-decoded product images using WebP formats with responsive srcset and implemented zero-dependency custom state hooks for cart mutations to avoid bundling heavy state libraries for a lightweight storefront.',
      lessonsLearned: 'Don\'t reach for global state stores (like Redux) when local React context + useReducer with strict TypeScript action unions fits the exact domain complexity with 1/10th the bundle overhead.',
      futureImprovements: 'I would integrate Server Actions for direct database checkout submissions and add optimistic UI updates on order creation.',
    },
  },
  {
    id: 'p2',
    title: 'Amana Poultry Farm Portal',
    category: 'ENTERPRISE & AGRICULTURE',
    description: 'A clean business platform built for an agricultural enterprise to showcase livestock, operational metrics, and client ordering.',
    architecture: {
      challenge: 'Communicating agricultural services cleanly to non-technical users while enabling quick order inquiries.',
      solution: 'Structured clear visual hierarchy with accessible typography, contact integrations, and responsive grids.',
      impact: 'Streamlined client inquiry response times and established a strong web presence.',
    },
    role: 'Frontend Developer',
    period: '2025',
    tech: ['React', 'Tailwind CSS', 'JavaScript'],
    demoUrl: 'https://github.com/Dev-Sheikh-551/amana-poultry-farm',
    githubUrl: 'https://github.com/Dev-Sheikh-551/amana-poultry-farm',
    modelType: 'satellite',
    developerNotes: {
      architectureReason: 'Selected React with Tailwind CSS for rapid prototyping and clean visual hierarchy. Since the primary audience includes non-technical farm managers and bulk buyers, clarity and loading speed were prioritized over heavy animation framework dependencies.',
      technicalChallenges: 'Designing high-contrast visual grids that look crisp on outdoor mobile devices in sunlight while keeping asset sizes under 200KB for rural connection speeds.',
      optimizations: 'Used SVG vector graphics for all operational icons and agricultural metrics, reducing HTTP payload by 65% compared to raster PNG assets.',
      lessonsLearned: 'User accessibility is paramount when building for agricultural stakeholders. Simple navigation and clear call-to-action buttons convert far better than complex multi-level menus.',
      futureImprovements: 'Add an offline-first PWA service worker so livestock catalog metrics remain viewable even with intermittent rural internet connectivity.',
    },
  },
  {
    id: 'p3',
    title: 'Product List & Interactive Cart',
    category: 'WEB APP & UTILITY',
    description: 'An interactive e-commerce cart application with dynamic price calculation, item quantity adjustments, and checkout confirmation.',
    architecture: {
      challenge: 'Managing complex client-side state transitions without triggering unnecessary DOM re-renders.',
      solution: 'Atomic React state management with memoized cart utility functions and smooth Motion transitions.',
      impact: 'Zero-latency cart edits and seamless user checkout flows across mobile and desktop.',
    },
    role: 'Frontend Developer',
    period: '2024',
    tech: ['React', 'TypeScript', 'Tailwind CSS'],
    demoUrl: 'https://github.com/Dev-Sheikh-551/product-list-with-cart',
    githubUrl: 'https://github.com/Dev-Sheikh-551/product-list-with-cart',
    modelType: 'drone',
    developerNotes: {
      architectureReason: 'Built as an atomic React state demo using TypeScript interfaces to enforce strict cart item mutations (add, remove, increment, decrement, total calculations).',
      technicalChallenges: 'Preventing full component tree re-renders whenever a single item quantity changed in a large product list.',
      optimizations: 'Memoized individual item components using React.memo and passed stable dispatch callbacks, ensuring only the target item row re-rendered during quantity tweaks.',
      lessonsLearned: 'Structuring state immutably at the top component level makes checkout calculations deterministic and easy to unit test.',
      futureImprovements: 'Persist cart state to localStorage with a custom sync hook and add smooth swipe-to-delete gestures on touch screens.',
    },
  },
  {
    id: 'p4',
    title: 'GitHub User Finder Engine',
    category: 'API & DEVELOPER TOOLS',
    description: 'A developer search application using the GitHub REST API to display real-time user profiles, repositories, stats, and theme options.',
    architecture: {
      challenge: 'Gracefully handling external API rate limits, non-existent username queries, and asynchronous loading states.',
      solution: 'Built robust error boundary handling, optimistic UI skeletons, and local caching for recent searches.',
      impact: 'Reliable developer lookup utility with responsive dark/light theme switching.',
    },
    role: 'Frontend Developer',
    period: '2024',
    tech: ['React', 'REST API', 'Tailwind CSS'],
    demoUrl: 'https://github.com/Dev-Sheikh-551/github-user-finder-app',
    githubUrl: 'https://github.com/Dev-Sheikh-551/github-user-finder-app',
    modelType: 'radar',
    developerNotes: {
      architectureReason: 'Designed as an asynchronous API consumer app utilizing Octokit REST concepts with React custom hooks for data fetching, caching, and state machine management (idle | loading | success | error).',
      technicalChallenges: 'Handling GitHub API rate limits (60 req/hr unauthenticated) gracefully without leaving the visitor stuck on a blank screen.',
      optimizations: 'Implemented in-memory search caching using a simple JavaScript Map ref to prevent redundant API calls when re-querying the same developer handle.',
      lessonsLearned: 'Always design skeleton loading states and clear error feedback (e.g. "User not found" vs "Rate limit exceeded") before writing the successful data render view.',
      futureImprovements: 'Add GitHub OAuth integration so users can authenticate and unlock 5,000 requests per hour.',
    },
  },
  {
    id: 'p5',
    title: 'Text Analysis & Character Counter',
    category: 'ANALYTICS & TEXT ENGINE',
    description: 'A high-performance text analysis tool providing real-time word counting, character limits, reading time estimation, and letter density.',
    architecture: {
      challenge: 'Processing long text inputs instantaneously on input events without delaying the main UI thread.',
      solution: 'Regex-optimized text parsing with debounced statistics calculations.',
      impact: 'Instantaneous feedback for content creators and writers.',
    },
    role: 'Frontend Developer',
    period: '2024',
    tech: ['React', 'JavaScript', 'CSS Modules'],
    demoUrl: 'https://github.com/Dev-Sheikh-551/character-counter',
    githubUrl: 'https://github.com/Dev-Sheikh-551/character-counter',
    modelType: 'lander',
    developerNotes: {
      architectureReason: 'Built for real-time text telemetry. I chose a pure client-side processing architecture with zero external libraries to keep the bundle footprint under 15KB.',
      technicalChallenges: 'Calculating letter frequency density and word counts in real-time as the user typed 10,000+ words without dropping 60fps frame rates.',
      optimizations: 'Debounced heavy letter density regex calculations while keeping character and word counters instant on input events.',
      lessonsLearned: 'Regular expressions in tight loops can cause layout thrashing if not scoped carefully. Using character code iteration (charCodeAt) for basic counts is 3x faster than regex matching.',
      futureImprovements: 'Add Web Worker offloading for massive text analysis (100,000+ words) and export analysis reports as markdown/JSON.',
    },
  },
];

const WHEEL_ITEMS = PROJECT_THEATER.map(p => p.title);

interface ProjectsExhibitionProps {
  scrollProgress: number;
  onInspectProject?: (project: Project) => void;
}

export const ProjectsExhibition: React.FC<ProjectsExhibitionProps> = ({ onInspectProject }) => {
  const [activeProjectIdx, setActiveProjectIdx] = useState<number>(0);

  const activeProject = PROJECT_THEATER[activeProjectIdx];

  const handleWheelChange = (index: number) => {
    if (index === activeProjectIdx) return;
    setActiveProjectIdx(index);
  };

  const handleOpenCaseStudy = () => {
    sound.playConfirm();
    if (onInspectProject) {
      onInspectProject(activeProject);
    }
  };

  return (
    <div id="projects-container" className="relative w-full max-w-5xl mx-auto px-4 py-8 min-h-[100vh] flex flex-col justify-center select-none">

      {/* SECTION HEADER */}
      <div className="mb-6 text-center flex flex-col items-center">
        <div className="text-[10px] font-mono text-emerald-400 tracking-[0.25em] uppercase mb-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>SELECTED WORK // 0{activeProjectIdx + 1} OF 0{PROJECT_THEATER.length}</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-sans font-bold text-white tracking-tight">
          Curated Projects
        </h2>
        <p className="text-white/45 text-[11px] font-mono mt-1 max-w-md">
          Use the Option Wheel to select a showcase.
        </p>
      </div>

      {/* ── DESKTOP EDITORIAL LAYOUT (≥1024px) — 2 Columns ── */}
      <div className="hidden lg:grid grid-cols-12 gap-8 items-center">

        {/* LEFT COLUMN: REACT BITS OPTION WHEEL (5 cols) */}
        <div className="col-span-5 flex flex-col items-center justify-center h-[340px] border border-white/10 bg-black/40 backdrop-blur-md rounded-2xl p-4 relative">
          <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Layers size={10} className="text-emerald-400" />
            <span>Select Project</span>
          </div>

          <div className="w-full h-[280px] relative overflow-hidden flex items-center justify-center">
            <OptionWheel
              items={WHEEL_ITEMS}
              defaultSelected={0}
              selected={activeProjectIdx}
              onChange={(idx) => handleWheelChange(idx)}
              textColor="#737373"
              activeColor="#10b981"
              side="left"
              fontSize={1.1}
              spacing={1.8}
              curve={1.2}
              tilt={8}
              blur={1.5}
              fade={0.3}
              smoothing={180}
              inset={16}
              loop={false}
              draggable
            />
          </div>
        </div>

        {/* RIGHT COLUMN: APPLE-STYLE LIQUID GLASS PROJECT PANEL (7 cols) */}
        <div className="col-span-7">
          <LiquidGlass
            radius="1.5rem"
            distortion={10}
            blur={0}
            tint={0.06}
            className="p-8 shadow-2xl relative overflow-hidden border border-white/15"
          >
            {/* Top glare line */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-emerald-400 font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {activeProject.category}
                  </span>
                  <span className="text-white/40 flex items-center gap-1">
                    <Code2 size={11} className="text-emerald-400" />
                    <span>{activeProject.role}</span>
                  </span>
                </div>

                {/* Title & Short Description */}
                <div>
                  <h3 className="text-2xl font-sans font-bold text-white tracking-tight leading-tight">
                    {activeProject.title}
                  </h3>
                  <p className="text-white/75 text-xs mt-2.5 leading-relaxed font-sans">
                    {activeProject.description}
                  </p>
                </div>

                {/* Technology Stack Tags */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
                    Tech Stack
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProject.tech.map((t) => (
                      <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full font-mono text-[10px] text-white/80">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                  <motion.button
                    onClick={handleOpenCaseStudy}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full font-mono text-xs transition-all shadow-lg cursor-pointer"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Maximize2 size={13} />
                    <span>View Case Study</span>
                  </motion.button>

                  {activeProject.demoUrl && (
                    <motion.a
                      href={activeProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2.5 border border-white/25 hover:border-white/90 rounded-full font-mono text-xs text-white bg-white/5 hover:bg-white/15 transition-all shadow-lg cursor-pointer"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <ExternalLink size={12} />
                      <span>Live Demo</span>
                    </motion.a>
                  )}

                  {activeProject.githubUrl && (
                    <motion.a
                      href={activeProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2.5 text-white/40 hover:text-white rounded-full font-mono text-xs transition-all cursor-pointer"
                    >
                      <Github size={12} />
                      <span>GitHub</span>
                    </motion.a>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </LiquidGlass>
        </div>

      </div>

      {/* ── TABLET LAYOUT (768px - 1023px) — Vertical Stack (Heading -> Wheel -> Panel) ── */}
      <div className="hidden md:flex lg:hidden flex-col gap-6 items-center">

        {/* TABLET OPTION WHEEL */}
        <div className="w-full max-w-lg h-[240px] border border-white/10 bg-black/40 backdrop-blur-md rounded-2xl p-3 relative overflow-hidden flex items-center justify-center">
          <OptionWheel
            items={WHEEL_ITEMS}
            defaultSelected={0}
            selected={activeProjectIdx}
            onChange={(idx) => handleWheelChange(idx)}
            textColor="#737373"
            activeColor="#10b981"
            side="left"
            fontSize={1.0}
            spacing={1.6}
            curve={1.2}
            tilt={8}
            blur={1.5}
            fade={0.3}
            smoothing={180}
            inset={16}
            loop={false}
            draggable
          />
        </div>

        {/* TABLET PROJECT PANEL */}
        <div className="w-full">
          <LiquidGlass
            radius="1.5rem"
            distortion={10}
            blur={0}
            tint={0.06}
            className="p-6 md:p-8 shadow-2xl relative overflow-hidden border border-white/15"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-emerald-400 font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {activeProject.category}
                  </span>
                  <span className="text-white/40">{activeProject.role}</span>
                </div>

                <div>
                  <h3 className="text-2xl font-sans font-bold text-white tracking-tight">
                    {activeProject.title}
                  </h3>
                  <p className="text-white/75 text-xs mt-2 leading-relaxed">
                    {activeProject.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeProject.tech.map((t) => (
                    <span key={t} className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full font-mono text-[10px] text-white/80">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
                  <button
                    onClick={handleOpenCaseStudy}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full font-mono text-xs cursor-pointer shadow-lg"
                  >
                    <Maximize2 size={12} />
                    <span>View Case Study</span>
                  </button>

                  {activeProject.demoUrl && (
                    <a
                      href={activeProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 border border-white/25 hover:border-white/90 rounded-full font-mono text-xs text-white bg-white/5 cursor-pointer"
                    >
                      <ExternalLink size={12} />
                      <span>Live Demo</span>
                    </a>
                  )}

                  {activeProject.githubUrl && (
                    <a
                      href={activeProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 text-white/40 hover:text-white rounded-full font-mono text-xs cursor-pointer"
                    >
                      <Github size={12} />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </LiquidGlass>
        </div>

      </div>

      {/* ── MOBILE LAYOUT (<768px) — Panel First, Option Wheel Beneath ── */}
      <div className="flex md:hidden flex-col gap-5 items-center">

        {/* MOBILE PROJECT PANEL FIRST */}
        <div className="w-full">
          <LiquidGlass
            radius="1.25rem"
            distortion={8}
            blur={0}
            tint={0.06}
            className="p-5 shadow-2xl relative overflow-hidden border border-white/15"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between font-mono text-[9px]">
                  <span className="text-emerald-400 font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {activeProject.category}
                  </span>
                  <span className="text-white/40">{activeProject.period}</span>
                </div>

                <div>
                  <h3 className="text-xl font-sans font-bold text-white tracking-tight leading-tight">
                    {activeProject.title}
                  </h3>
                  <p className="text-white/75 text-xs mt-1.5 leading-relaxed font-sans">
                    {activeProject.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {activeProject.tech.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full font-mono text-[9px] text-white/75">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={handleOpenCaseStudy}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-black font-bold rounded-full font-mono text-xs cursor-pointer shadow-lg"
                  >
                    <Maximize2 size={11} />
                    <span>View Case Study</span>
                  </button>

                  {activeProject.demoUrl && (
                    <a
                      href={activeProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 border border-white/20 rounded-full font-mono text-xs text-white bg-white/5 cursor-pointer"
                    >
                      <ExternalLink size={11} />
                      <span>Demo</span>
                    </a>
                  )}

                  {activeProject.githubUrl && (
                    <a
                      href={activeProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-2 text-white/40 hover:text-white font-mono text-xs cursor-pointer"
                    >
                      <Github size={11} />
                    </a>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </LiquidGlass>
        </div>

        {/* MOBILE OPTION WHEEL BENEATH THE PANEL */}
        <div className="w-full h-[200px] border border-white/10 bg-black/40 backdrop-blur-md rounded-xl p-2 relative overflow-hidden flex items-center justify-center">
          <OptionWheel
            items={WHEEL_ITEMS}
            defaultSelected={0}
            selected={activeProjectIdx}
            onChange={(idx) => handleWheelChange(idx)}
            textColor="#737373"
            activeColor="#10b981"
            side="left"
            fontSize={0.95}
            spacing={1.5}
            curve={1.1}
            tilt={7}
            blur={1.2}
            fade={0.3}
            smoothing={180}
            inset={12}
            loop={false}
            draggable
          />
        </div>

      </div>

    </div>
  );
};
