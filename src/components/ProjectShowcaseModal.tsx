/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ProjectShowcaseModal — Detailed Case Study & Responsive Screenshot Gallery
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ExternalLink,
  Github,
  Monitor,
  Tablet,
  Smartphone,
  Cpu,
  Layers,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  Code,
  Terminal
} from 'lucide-react';
import { LiquidGlass } from './LiquidGlass';
import { SpecularButton } from './SpecularButton';
import { Project } from '../types';
import { sound } from './SoundManager';

interface ProjectShowcaseModalProps {
  project: Project | null;
  onClose: () => void;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export const ProjectShowcaseModal: React.FC<ProjectShowcaseModalProps> = ({ project, onClose }) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'features'>('overview');
  const [isDevNotesOpen, setIsDevNotesOpen] = useState(false);

  if (!project) return null;

  const handleClose = () => {
    sound.playTick();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        {/* Backdrop Dismiss */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="relative w-full max-w-4xl max-h-[90vh] z-10 overflow-hidden flex flex-col my-auto"
        >
          <LiquidGlass
            radius="1.75rem"
            distortion={10}
            blur={24}
            tint={0.1}
            interactive={false}
            className="p-6 md:p-8 shadow-2xl flex flex-col h-full border border-white/20 overflow-y-auto"
          >
            {/* Header Meta */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
                  <Sparkles size={13} />
                  <span className="uppercase tracking-widest">{project.role}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/50">{project.period}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight mt-1">
                  {project.title}
                </h2>
              </div>
              
              <button
                onClick={handleClose}
                className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* RESPONSIVE DEVICE SCREENSHOT GALLERY SWITCHER */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-white/50 uppercase tracking-widest text-[10px]">
                  Responsive Viewport Simulation
                </span>
                
                {/* Device Switcher Pills */}
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => { setDeviceMode('desktop'); sound.playTick(); }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer active:scale-[0.96] ${
                      deviceMode === 'desktop'
                        ? 'bg-white/20 text-white font-medium shadow'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Monitor size={12} />
                    <span>Desktop</span>
                  </button>

                  <button
                    onClick={() => { setDeviceMode('tablet'); sound.playTick(); }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer active:scale-[0.96] ${
                      deviceMode === 'tablet'
                        ? 'bg-white/20 text-white font-medium shadow'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Tablet size={12} />
                    <span>Tablet</span>
                  </button>

                  <button
                    onClick={() => { setDeviceMode('mobile'); sound.playTick(); }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      deviceMode === 'mobile'
                        ? 'bg-white/20 text-white font-medium shadow'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Smartphone size={12} />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* Viewport Frame */}
              <div className="relative w-full h-[260px] md:h-[340px] bg-black/60 rounded-2xl border border-white/10 flex items-center justify-center p-4 overflow-hidden">
                <motion.div
                  key={deviceMode}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`relative overflow-hidden rounded-xl border border-white/20 bg-slate-900 shadow-2xl flex flex-col transition-all duration-500 ${
                    deviceMode === 'desktop'
                      ? 'w-full h-full'
                      : deviceMode === 'tablet'
                      ? 'w-[70%] h-[90%]'
                      : 'w-[40%] max-w-[220px] h-[95%]'
                  }`}
                >
                  {/* Window Bar */}
                  <div className="h-6 bg-white/10 border-b border-white/10 flex items-center px-3 gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-red-500/80" />
                    <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                    <span className="w-2 h-2 rounded-full bg-green-500/80" />
                    <span className="text-[9px] font-mono text-white/40 ml-2 truncate">
                      {project.demoUrl || 'https://demo.app'}
                    </span>
                  </div>

                  {/* Screenshot Content or Wireframe Simulator */}
                  <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-center">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="space-y-2 font-mono text-xs text-white/70">
                        <Cpu className="mx-auto text-emerald-400 animate-pulse" size={28} />
                        <div className="font-bold text-white text-sm">{project.title}</div>
                        <div className="text-[10px] text-white/40 max-w-xs mx-auto">
                          Live application wireframe simulator ({deviceMode.toUpperCase()} VIEWPORT)
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* CASE STUDY SECTION TABS */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-5 font-mono text-xs">
              <button
                onClick={() => { setActiveTab('overview'); sound.playTick(); }}
                className={`px-3.5 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer active:scale-[0.96] ${
                  activeTab === 'overview'
                    ? 'bg-white/15 border-white/30 text-white font-medium shadow'
                    : 'border-transparent text-white/40 hover:text-white/70'
                }`}
              >
                01 // Case Study
              </button>

              <button
                onClick={() => { setActiveTab('architecture'); sound.playTick(); }}
                className={`px-3.5 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer active:scale-[0.96] ${
                  activeTab === 'architecture'
                    ? 'bg-white/15 border-white/30 text-white font-medium shadow'
                    : 'border-transparent text-white/40 hover:text-white/70'
                }`}
              >
                02 // Architecture
              </button>
            </div>

            {/* TAB 1: OVERVIEW & CHALLENGE / SOLUTION */}
            {activeTab === 'overview' && (
              <div className="space-y-5 text-sm font-sans text-white/80">
                <div>
                  <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1.5">Overview</h4>
                  <p className="leading-relaxed">{project.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {project.challenge && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                      <div className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1.5">
                        <ShieldAlert size={14} />
                        <span>The Challenge</span>
                      </div>
                      <p className="text-xs leading-relaxed text-white/70">{project.challenge}</p>
                    </div>
                  )}

                  {project.solution && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                      <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        <span>The Solution</span>
                      </div>
                      <p className="text-xs leading-relaxed text-white/70">{project.solution}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ARCHITECTURE & TECH STACK */}
            {activeTab === 'architecture' && (
              <div className="space-y-5 text-sm font-sans text-white/80">
                <div>
                  <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-white/10 border border-white/15 font-mono text-xs text-white"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {project.result && (
                  <div>
                    <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1.5">
                      Impact & Results
                    </h4>
                    <p className="text-xs leading-relaxed text-white/70 p-4 rounded-xl bg-white/5 border border-white/10">
                      {project.result}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* DEVELOPER NOTES — collapsible, positioned before footer, only if notes exist */}
            {project.developerNotes && (
              <div className="mt-6 border-t border-white/8 pt-5">
                {/* Collapse toggle trigger */}
                <button
                  onClick={() => { setIsDevNotesOpen(v => !v); sound.playTick(); }}
                  className="w-full flex items-center justify-between group cursor-pointer py-1 select-none"
                  aria-expanded={isDevNotesOpen}
                >
                  <div className="flex items-center gap-2 font-mono text-[11px] text-white/45 group-hover:text-white/70 transition-colors">
                    <Terminal size={13} className="text-white/30 group-hover:text-emerald-400 transition-colors" />
                    <span className="uppercase tracking-widest font-bold">Developer Notes</span>
                    <span className="text-white/20">—</span>
                    <span className="font-normal text-white/30 group-hover:text-white/50">
                      {isDevNotesOpen ? 'collapse' : 'expand behind-the-scenes'}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-white/30 group-hover:text-white/60 transition-all duration-300 ${isDevNotesOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Collapsible body with Motion */}
                <AnimatePresence initial={false}>
                  {isDevNotesOpen && (
                    <motion.div
                      key="dev-notes-body"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="mt-4 space-y-0 font-sans text-sm text-white/75">
                        {[
                          { key: 'architectureReason',   label: 'Architecture Decision',     icon: <Code size={12} className="text-sky-400/70" /> },
                          { key: 'technicalChallenges',  label: 'Technical Challenges',      icon: <Terminal size={12} className="text-amber-400/70" /> },
                          { key: 'optimizations',        label: 'Performance Optimizations', icon: <Terminal size={12} className="text-emerald-400/70" /> },
                          { key: 'lessonsLearned',       label: 'Lessons Learned',           icon: <BookOpen size={12} className="text-purple-400/70" /> },
                          { key: 'futureImprovements',   label: 'Future Improvements',       icon: <Code size={12} className="text-rose-400/70" /> },
                          { key: 'implementationDetail', label: 'Implementation Detail',     icon: <Code size={12} className="text-white/40" /> },
                        ]
                          .filter(item => project.developerNotes![item.key as keyof typeof project.developerNotes])
                          .map((item, i, arr) => (
                            <div
                              key={item.key}
                              className={`py-4 ${i < arr.length - 1 ? 'border-b border-white/6' : ''} flex gap-4`}
                            >
                              {/* Left gutter label */}
                              <div className="w-40 shrink-0 hidden md:flex flex-col justify-start pt-0.5">
                                <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/35 uppercase tracking-widest">
                                  {item.icon}
                                  <span>{item.label}</span>
                                </div>
                              </div>

                              {/* Note content */}
                              <div className="flex-1">
                                {/* Mobile label */}
                                <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2 md:hidden">
                                  {item.icon}
                                  <span>{item.label}</span>
                                </div>
                                <p className="text-[13px] leading-relaxed text-white/68 font-light">
                                  {project.developerNotes![item.key as keyof typeof project.developerNotes]}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* FOOTER ACTIONS */}
            <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                {(project.liveUrl || project.demoUrl) && (
                  <SpecularButton
                    size="sm"
                    radius={12}
                    baseColor="#10b981"
                    lineColor="#34d399"
                    textColor="#000000"
                    intensity={1.2}
                    href={(project.liveUrl || project.demoUrl)!}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>View Live Site</span>
                    <ExternalLink size={14} />
                  </SpecularButton>
                )}

                {project.githubUrl && (
                  <SpecularButton
                    size="sm"
                    radius={12}
                    baseColor="#262626"
                    lineColor="#ffffff33"
                    textColor="#ffffff"
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Github size={14} />
                    <span>Repository</span>
                  </SpecularButton>
                )}
              </div>

              <button
                onClick={handleClose}
                className="text-white/40 hover:text-white active:scale-[0.96] text-xs transition-all duration-150 cursor-pointer"
              >
                Close Presentation
              </button>
            </div>
          </LiquidGlass>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
