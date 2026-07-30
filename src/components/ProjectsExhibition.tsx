/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ProjectsExhibition — Re-engineered Project Spotlight Theater
 *
 * Replaces old stack/grid logic with a single, high-impact Digital Stage.
 * Users navigate project showcases smoothly via synchronized scroll
 * or interactive stage controls.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Github, Sparkles, ChevronLeft, ChevronRight, Monitor, Code2, Rocket } from 'lucide-react';
import { sound } from './SoundManager';
import { Project } from '../types';
import { TIMELINE_OFFSETS } from '../constants';
import { LiquidGlass } from './LiquidGlass';

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
        solution: 'Asset-optimized React architecture with modular UI components, glassmorphism, and client state management.',
        impact: 'Achieved near-perfect Lighthouse performance metrics and an engaging digital storefront.',
      },
      role: 'Lead Frontend Engineer',
      period: '2025',
      tech: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript'],
      demoUrl: 'https://github.com/Dev-Sheikh-551/coffee-business-app',
      githubUrl: 'https://github.com/Dev-Sheikh-551/coffee-business-app',
      modelType: 'lander',
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
    },
  ];

interface ProjectsExhibitionProps {
  scrollProgress: number;
}

export const ProjectsExhibition: React.FC<ProjectsExhibitionProps> = ({ scrollProgress }) => {
  const [activeProjectIdx, setActiveProjectIdx] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const activeIdxRef = useRef<number>(0);
  const manualLockUntilRef = useRef<number>(0);

  const projectsStart = TIMELINE_OFFSETS.projects.start;
  const projectsEnd = TIMELINE_OFFSETS.projects.end;

  // Sync scroll position to active project index (ignored if user recently clicked a project)
  useEffect(() => {
    if (scrollProgress < projectsStart || scrollProgress > projectsEnd) return;
    if (Date.now() < manualLockUntilRef.current) return;

    const normalizedProgress = (scrollProgress - projectsStart) / (projectsEnd - projectsStart);
    const index = Math.min(
      PROJECT_THEATER.length - 1,
      Math.floor(normalizedProgress * PROJECT_THEATER.length)
    );

    if (index !== activeIdxRef.current) {
      setDirection(index > activeIdxRef.current ? 1 : -1);
      activeIdxRef.current = index;
      setActiveProjectIdx(index);
      sound.playTick();
    }
  }, [scrollProgress, projectsStart, projectsEnd]);

  const activeProject = PROJECT_THEATER[activeProjectIdx];

  const handleSelectProject = (index: number) => {
    if (index === activeProjectIdx) return;
    manualLockUntilRef.current = Date.now() + 6000; // Lock auto-switch for 6s after manual click
    setDirection(index > activeProjectIdx ? 1 : -1);
    setActiveProjectIdx(index);
    activeIdxRef.current = index;
    sound.playTick();
  };

  const handleNext = () => {
    const nextIdx = (activeProjectIdx + 1) % PROJECT_THEATER.length;
    handleSelectProject(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (activeProjectIdx - 1 + PROJECT_THEATER.length) % PROJECT_THEATER.length;
    handleSelectProject(prevIdx);
  };

  // Render project preview visual (image or vector wireframe)
  const renderVisualStage = (project: Project) => {
    if (project.imageUrl) {
      return (
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover rounded-2xl"
        />
      );
    }

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white/50 opacity-90 transition-all duration-500">
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <g className="origin-center animate-[spin_20s_linear_infinite]">
          <polygon points="35,65 65,65 58,45 42,45" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="35" y1="65" x2="25" y2="78" stroke="currentColor" strokeWidth="1" />
          <line x1="65" y1="65" x2="75" y2="78" stroke="currentColor" strokeWidth="1" />
          <line x1="25" y1="78" x2="20" y2="78" stroke="currentColor" strokeWidth="1.5" />
          <line x1="75" y1="78" x2="80" y2="78" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="50" cy="40" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
        </g>
        <text x="50" y="92" textAnchor="middle" fill="currentColor" fontSize="4" fontFamily="monospace" letterSpacing="1.5">
          STAGE_VISUAL // 0{activeProjectIdx + 1}
        </text>
      </svg>
    );
  };

  return (
    <div id="projects-container" className="relative w-full max-w-6xl mx-auto px-4 py-16 min-h-[100vh] flex flex-col justify-center">

      {/* SECTION HEADER */}
      <div className="mb-10 text-center flex flex-col items-center">
        <div className="text-xs font-mono text-emerald-400 tracking-[0.25em] uppercase mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>PROJECT SPOTLIGHT THEATER // 0{activeProjectIdx + 1} OF 0{PROJECT_THEATER.length}</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-sans font-bold text-white tracking-tight">
          Selected Engineering Works
        </h2>
        <p className="text-white/45 text-xs font-mono mt-2 max-w-md">
          Explore full project case studies. Switch between showcases using stage controls or page scroll.
        </p>
      </div>

      {/* STAGE SELECTOR TABS */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap font-mono text-xs">
        {PROJECT_THEATER.map((proj, idx) => {
          const isActive = idx === activeProjectIdx;
          return (
            <button
              key={proj.id}
              onClick={() => handleSelectProject(idx)}
              className={`px-4 py-2 rounded-full border transition-all duration-300 flex items-center gap-2 cursor-pointer ${isActive
                  ? 'bg-white/15 border-white/30 text-white font-medium shadow-lg'
                  : 'bg-white/3 border-white/5 text-white/40 hover:text-white/70 hover:border-white/15'
                }`}
            >
              <span>0{idx + 1}</span>
              <span className="hidden md:inline">{proj.title.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* THEATER MAIN SPOTLIGHT STAGE */}
      <div className="relative w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeProject.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -direction * 40, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <LiquidGlass
              radius="2rem"
              distortion={12}
              blur={0}
              tint={0.06}
              className="p-6 md:p-10 shadow-2xl relative overflow-hidden"
            >
              {/* Top glare line */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                {/* Left: Project Visual Media Stage (5 cols) */}
                <div className="lg:col-span-5 h-64 md:h-80 border border-white/10 bg-black/60 rounded-2xl flex items-center justify-center p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

                  {renderVisualStage(activeProject)}

                  <div className="absolute top-4 left-4 font-mono text-[9px] text-emerald-400 bg-black/70 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                    {activeProject.category}
                  </div>

                  <div className="absolute bottom-4 right-4 font-mono text-[9px] text-white/50 bg-black/70 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                    {activeProject.period}
                  </div>
                </div>

                {/* Right: Architectural Story & Details (7 cols) */}
                <div className="lg:col-span-7 space-y-5">

                  <div className="flex items-center justify-between font-mono text-[10px] text-white/40">
                    <span className="flex items-center gap-1.5">
                      <Code2 size={12} className="text-emerald-400" />
                      <span>{activeProject.role}</span>
                    </span>
                    <span>PERIOD: {activeProject.period}</span>
                  </div>

                  <div>
                    <h3 className="text-2xl md:text-4xl font-sans font-bold text-white tracking-tight leading-tight">
                      {activeProject.title}
                    </h3>
                    <p className="text-white/75 text-xs md:text-sm mt-2 leading-relaxed font-sans">
                      {activeProject.description}
                    </p>
                  </div>

                  {/* Architecture Breakdown (Challenge, Solution, Impact) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-1">
                      <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1">
                        <Monitor size={10} />
                        <span>Challenge</span>
                      </div>
                      <p className="text-white/70 text-[11px] leading-relaxed">{activeProject.architecture.challenge}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-1">
                      <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1">
                        <Sparkles size={10} className="text-emerald-400" />
                        <span>Solution</span>
                      </div>
                      <p className="text-white/70 text-[11px] leading-relaxed">{activeProject.architecture.solution}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-1">
                      <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1">
                        <Rocket size={10} />
                        <span>Impact</span>
                      </div>
                      <p className="text-white/70 text-[11px] leading-relaxed">{activeProject.architecture.impact}</p>
                    </div>
                  </div>

                  {/* Tech Stack Pills & Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                    <div className="flex flex-wrap gap-1.5">
                      {activeProject.tech.map((t) => (
                        <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full font-mono text-[10px] text-white/75">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <motion.a
                        href={activeProject.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 border border-white/25 hover:border-white/90 rounded-full font-mono text-xs text-white bg-white/5 hover:bg-white/15 transition-all shadow-lg cursor-pointer"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <ExternalLink size={11} />
                        <span>Live Demo</span>
                      </motion.a>

                      <motion.a
                        href={activeProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 text-white/40 hover:text-white rounded-full font-mono text-xs transition-all cursor-pointer"
                      >
                        <Github size={11} />
                        <span>Source</span>
                      </motion.a>
                    </div>
                  </div>

                </div>
              </div>
            </LiquidGlass>
          </motion.div>
        </AnimatePresence>

        {/* Stage Navigation Arrow Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-[-20px] md:left-[-24px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/20 bg-black/70 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all z-20 cursor-pointer shadow-xl"
          aria-label="Previous project"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-[-20px] md:right-[-24px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/20 bg-black/70 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all z-20 cursor-pointer shadow-xl"
          aria-label="Next project"
        >
          <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
};
