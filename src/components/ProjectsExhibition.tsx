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
import { projectsData } from '../data/projects';
import { SpecularButton } from './SpecularButton';

const PROJECT_THEATER: Project[] = projectsData;

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
                  <SpecularButton
                    size="sm"
                    radius={20}
                    baseColor="#10b981"
                    lineColor="#34d399"
                    textColor="#000000"
                    intensity={1.2}
                    onClick={handleOpenCaseStudy}
                  >
                    <Maximize2 size={13} />
                    <span>View Case Study</span>
                  </SpecularButton>

                  {(activeProject.liveUrl || activeProject.demoUrl) && (
                    <SpecularButton
                      size="sm"
                      radius={20}
                      baseColor="#262626"
                      lineColor="#ffffff33"
                      textColor="#ffffff"
                      href={(activeProject.liveUrl || activeProject.demoUrl)!}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={12} />
                      <span>View Live Site</span>
                    </SpecularButton>
                  )}

                  {activeProject.githubUrl && (
                    <SpecularButton
                      size="sm"
                      radius={20}
                      baseColor="#171717"
                      lineColor="#ffffff20"
                      textColor="#a3a3a3"
                      href={activeProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github size={12} />
                      <span>GitHub</span>
                    </SpecularButton>
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
                  <SpecularButton
                    size="sm"
                    radius={16}
                    baseColor="#10b981"
                    lineColor="#34d399"
                    textColor="#000000"
                    onClick={handleOpenCaseStudy}
                  >
                    <Maximize2 size={11} />
                    <span>View Case Study</span>
                  </SpecularButton>

                  {(activeProject.liveUrl || activeProject.demoUrl) && (
                    <SpecularButton
                      size="sm"
                      radius={16}
                      baseColor="#262626"
                      lineColor="#ffffff33"
                      textColor="#ffffff"
                      href={(activeProject.liveUrl || activeProject.demoUrl)!}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={11} />
                      <span>Live Site</span>
                    </SpecularButton>
                  )}

                  {activeProject.githubUrl && (
                    <SpecularButton
                      size="sm"
                      radius={16}
                      baseColor="#171717"
                      lineColor="#ffffff20"
                      textColor="#a3a3a3"
                      href={activeProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github size={11} />
                      <span>GitHub</span>
                    </SpecularButton>
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
