/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Skills3D — Fully Responsive Toolkit & Technologies Section
 *
 * Desktop  (≥1024px): Immersive neural network with floating LiquidGlass nodes,
 *                      animated SVG connection lines, and parallax depth.
 * Tablet   (768–1023px): Category cluster panels with local connection lines.
 * Mobile   (<768px):  Stacked LiquidGlass category panels with chip-style items
 *                      and staggered reveal animations.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from './SoundManager';
import { SkillNode } from '../types';
import { LiquidGlass } from './LiquidGlass';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const SKILL_CATEGORIES = [
  {
    id: 'frontend',
    label: 'Frontend',
    color: 'rgba(56, 189, 248, 0.7)',   // sky-400
    glowColor: 'rgba(56, 189, 248, 0.25)',
    dotColor: 'bg-sky-400',
    skills: [
      { name: 'React / Next.js', level: 98 },
      { name: 'TypeScript', level: 95 },
      { name: 'JavaScript ES6+', level: 96 },
      { name: 'HTML5 / CSS3', level: 97 },
      { name: 'Tailwind CSS', level: 98 },
      { name: 'Framer Motion', level: 92 },
      { name: 'GSAP', level: 94 },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    color: 'rgba(52, 211, 153, 0.7)',   // emerald-400
    glowColor: 'rgba(52, 211, 153, 0.25)',
    dotColor: 'bg-emerald-400',
    skills: [
      { name: 'Node.js / Express', level: 84 },
      { name: 'REST APIs', level: 86 },
      { name: 'PostgreSQL', level: 78 },
      { name: 'Prisma ORM', level: 80 },
      { name: 'Auth.js', level: 76 },
    ],
  },
  {
    id: 'statedata',
    label: 'State & Data',
    color: 'rgba(168, 85, 247, 0.7)',   // purple-500
    glowColor: 'rgba(168, 85, 247, 0.25)',
    dotColor: 'bg-purple-400',
    skills: [
      { name: 'Zustand', level: 90 },
      { name: 'TanStack Query', level: 85 },
      { name: 'React Hook Form', level: 88 },
      { name: 'Zod', level: 84 },
    ],
  },
  {
    id: 'tooling',
    label: 'Tools',
    color: 'rgba(251, 191, 36, 0.7)',   // amber-400
    glowColor: 'rgba(251, 191, 36, 0.25)',
    dotColor: 'bg-amber-400',
    skills: [
      { name: 'Git / GitHub', level: 94 },
      { name: 'Vite / Build Tools', level: 90 },
      { name: 'Docker', level: 72 },
      { name: 'Figma', level: 80 },
      { name: 'VS Code', level: 96 },
    ],
  },
  {
    id: 'learning',
    label: 'Currently Exploring',
    color: 'rgba(249, 115, 22, 0.7)',   // orange-500
    glowColor: 'rgba(249, 115, 22, 0.25)',
    dotColor: 'bg-orange-400',
    skills: [
      { name: 'Python', level: 45 },
      { name: 'Virtualization', level: 38 },
      { name: 'Cloud (AWS / GCP)', level: 40 },
      { name: 'System Design', level: 50 },
    ],
  },
] as const;

// Desktop neural network nodes — positioned by percentage on the canvas
const DESKTOP_NODES: SkillNode[] = [
  // Frontend cluster — left-centre
  { id: '1',  name: 'React / Next.js',   category: 'frontend',  level: 98, x: 22, y: 30, z: 1.5 },
  { id: '2',  name: 'TypeScript',        category: 'frontend',  level: 95, x: 14, y: 50, z: 1.3 },
  { id: '3',  name: 'Tailwind CSS',      category: 'frontend',  level: 98, x: 30, y: 50, z: 1.1 },
  { id: '4',  name: 'JavaScript ES6+',   category: 'frontend',  level: 96, x: 22, y: 68, z: 1.4 },
  { id: '5',  name: 'Framer Motion',     category: 'frontend',  level: 92, x: 38, y: 36, z: 1.2 },
  // Animation cluster — top-centre
  { id: '6',  name: 'GSAP',             category: 'animation', level: 94, x: 52, y: 22, z: 1.6 },
  { id: '7',  name: 'Three.js / WebGL', category: 'animation', level: 88, x: 62, y: 36, z: 1.5 },
  // Backend cluster — bottom-centre
  { id: '8',  name: 'Node.js / Express', category: 'backend',   level: 84, x: 42, y: 72, z: 1.2 },
  { id: '9',  name: 'REST APIs',         category: 'backend',   level: 86, x: 56, y: 76, z: 1.3 },
  { id: '10', name: 'PostgreSQL',        category: 'backend',   level: 78, x: 30, y: 80, z: 1.1 },
  // State & Data — right-centre
  { id: '11', name: 'Zustand',          category: 'statedata', level: 90, x: 72, y: 52, z: 1.3 },
  { id: '12', name: 'TanStack Query',   category: 'statedata', level: 85, x: 80, y: 66, z: 1.2 },
  // Tools — far right
  { id: '13', name: 'Git / GitHub',     category: 'tooling',   level: 94, x: 76, y: 34, z: 1.1 },
  { id: '14', name: 'Vite / Build',     category: 'tooling',   level: 90, x: 86, y: 48, z: 1.3 },
];

const DESKTOP_LINKS = [
  // Frontend cluster
  { from: '1', to: '2' }, { from: '1', to: '3' }, { from: '1', to: '4' }, { from: '2', to: '4' }, { from: '1', to: '5' },
  // Frontend → Animation
  { from: '5', to: '6' }, { from: '5', to: '7' }, { from: '6', to: '7' },
  // Frontend → Backend
  { from: '2', to: '8' }, { from: '4', to: '9' }, { from: '8', to: '9' }, { from: '8', to: '10' },
  // Animation → State
  { from: '7', to: '11' }, { from: '9', to: '11' },
  // State → State
  { from: '11', to: '12' },
  // Tools
  { from: '13', to: '14' }, { from: '7', to: '13' }, { from: '11', to: '13' },
];

const CATEGORY_LABELS: Record<string, string> = {
  frontend: 'Frontend',
  animation: 'Animation & 3D',
  backend: 'Backend',
  statedata: 'State & Data',
  tooling: 'Tools',
};

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP NEURAL NETWORK (≥1024px)
// ─────────────────────────────────────────────────────────────────────────────

const DesktopNetwork: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<SkillNode | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMouseOffset({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 40,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 40,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getPos = (node: SkillNode) => {
    const px = node.x + mouseOffset.x * node.z * 0.12;
    const py = node.y + mouseOffset.y * node.z * 0.12;
    return { x: `${px}%`, y: `${py}%`, rawX: px, rawY: py };
  };

  const isHighlit = (link: { from: string; to: string }) => {
    if (!hoveredNode) return false;
    const fromNode = DESKTOP_NODES.find(n => n.id === link.from)!;
    const toNode   = DESKTOP_NODES.find(n => n.id === link.to)!;
    return (
      hoveredNode.id === fromNode?.id ||
      hoveredNode.id === toNode?.id ||
      (hoveredNode.category === fromNode?.category && hoveredNode.category === toNode?.category)
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] rounded-3xl overflow-hidden pointer-events-auto"
    >
      {/* Soft ambient radial glow — rover stays visible */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.04)_0%,transparent_70%)] pointer-events-none" />

      {/* SVG NEURAL LINES */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <filter id="glow-desktop">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {DESKTOP_LINKS.map((link, idx) => {
          const from = DESKTOP_NODES.find(n => n.id === link.from)!;
          const to   = DESKTOP_NODES.find(n => n.id === link.to)!;
          if (!from || !to) return null;
          const fp = getPos(from);
          const tp = getPos(to);
          const lit = isHighlit(link);
          return (
            <g key={idx}>
              <line
                x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
                stroke={lit ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.06)'}
                strokeWidth={lit ? 1.5 : 0.8}
                className="transition-all duration-300"
              />
              <line
                x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1.1"
                strokeDasharray="4 14"
                style={{ filter: lit ? 'url(#glow-desktop)' : 'none' }}
                className="transition-all duration-300"
              >
                <animate attributeName="stroke-dashoffset" values="50;0" dur={`${3.5 + idx * 0.2}s`} repeatCount="indefinite" />
              </line>
            </g>
          );
        })}
      </svg>

      {/* NODES */}
      <div className="absolute inset-0 w-full h-full z-10">
        {DESKTOP_NODES.map(node => {
          const pos     = getPos(node);
          const scale   = 0.82 + (node.z - 1.0) * 0.25;
          const isHov   = hoveredNode?.id === node.id;
          const catAct  = hoveredNode?.category === node.category;

          return (
            <motion.div
              key={node.id}
              className="absolute origin-center"
              style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
              animate={{ scale: isHov ? scale * 1.12 : scale, zIndex: isHov ? 30 : Math.round(node.z * 10) }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            >
              <LiquidGlass
                radius="0.75rem"
                distortion={isHov ? 14 : 6}
                blur={12}
                tint={isHov ? 0.14 : catAct ? 0.08 : 0.04}
                className={`px-4 py-2.5 cursor-pointer group transition-all duration-300 ${isHov || catAct ? 'ring-1 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.12)]' : ''}`}
                onMouseEnter={() => { setHoveredNode(node); sound.playTick(); }}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isHov ? 'bg-white animate-ping' : 'bg-white/40'} transition-all`} />
                  <span className={`text-[11px] font-mono font-medium tracking-wide whitespace-nowrap ${isHov ? 'text-white font-bold' : 'text-white/80'}`}>
                    {node.name}
                  </span>
                </div>
                {/* Proficiency bar — slides in on hover */}
                <div className="h-0 group-hover:h-1.5 overflow-hidden transition-all duration-300 mt-0 group-hover:mt-1.5 w-24">
                  <div className="w-full h-[2px] bg-white/10 rounded-full">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${node.level}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </LiquidGlass>
            </motion.div>
          );
        })}
      </div>

      {/* CLUSTER LEGEND */}
      <div className="absolute bottom-5 left-5 z-20 flex flex-wrap gap-2 font-mono text-[9px] text-white/40">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <span key={key} className={`px-2.5 py-1 rounded-full border transition-all duration-200 ${hoveredNode?.category === key ? 'border-white/40 bg-white/10 text-white font-medium' : 'border-white/8 bg-black/20'}`}>
            {label}
          </span>
        ))}
      </div>

      {/* TELEMETRY PANEL */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            className="absolute bottom-5 right-5 z-20 w-56 pointer-events-none"
          >
            <LiquidGlass radius="1rem" distortion={16} blur={20} tint={0.1} className="p-4 font-mono text-[10px] text-white/70">
              <div className="text-[9px] text-white/40 uppercase tracking-widest mb-1.5">// Cluster Node</div>
              <div className="text-xs font-medium text-white mb-2">{hoveredNode.name}</div>
              <div className="space-y-1">
                <div className="flex justify-between"><span>Proficiency</span><span className="text-white font-medium">{hoveredNode.level}%</span></div>
                <div className="flex justify-between"><span>Cluster</span><span className="text-white/90 uppercase text-[9px]">{CATEGORY_LABELS[hoveredNode.category]}</span></div>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${hoveredNode.level}%` }} />
              </div>
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLET CLUSTER PANELS (768–1023px)
// ─────────────────────────────────────────────────────────────────────────────

const TabletClusters: React.FC = () => {
  // Show 4 main clusters for tablet; skip "learning" to keep it manageable
  const clusters = SKILL_CATEGORIES.slice(0, 4);

  return (
    <div className="grid grid-cols-2 gap-4">
      {clusters.map((cat, cIdx) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: cIdx * 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <LiquidGlass
            radius="1.25rem"
            distortion={8}
            blur={14}
            tint={0.06}
            className="p-4 h-full"
          >
            {/* Category header */}
            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/10">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="font-mono text-[10px] text-white/60 uppercase tracking-widest font-bold">{cat.label}</span>
            </div>

            {/* Mini neural SVG within each cluster */}
            <div className="relative">
              <div className="flex flex-col gap-2">
                {cat.skills.map((skill, sIdx) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: cIdx * 0.1 + sIdx * 0.06, duration: 0.35 }}
                    className="group flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-white/8 bg-white/4 hover:bg-white/8 hover:border-white/20 transition-all duration-200 cursor-default"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-mono text-[11px] text-white/80 group-hover:text-white truncate transition-colors">{skill.name}</span>
                    </div>
                    {/* Compact proficiency bar */}
                    <div className="shrink-0 w-14 h-[3px] bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 0.8, delay: cIdx * 0.1 + sIdx * 0.08, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </LiquidGlass>
        </motion.div>
      ))}

      {/* "Currently Exploring" spans full width */}
      {(() => {
        const learning = SKILL_CATEGORIES[4];
        return (
          <motion.div
            key={learning.id}
            className="col-span-2"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <LiquidGlass radius="1.25rem" distortion={8} blur={14} tint={0.06} className="p-4">
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/10">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: learning.color }} />
                <span className="font-mono text-[10px] text-white/60 uppercase tracking-widest font-bold">{learning.label}</span>
                <span className="ml-auto font-mono text-[9px] text-white/30 italic">Curiosity never stops</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {learning.skills.map((skill, sIdx) => (
                  <motion.span
                    key={skill.name}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + sIdx * 0.07 }}
                    className="px-3 py-1 rounded-full border font-mono text-[10px]"
                    style={{ borderColor: `${learning.color}40`, color: learning.color, backgroundColor: `${learning.glowColor}` }}
                  >
                    {skill.name}
                  </motion.span>
                ))}
              </div>
            </LiquidGlass>
          </motion.div>
        );
      })()}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE STACKED PANELS (<768px)
// ─────────────────────────────────────────────────────────────────────────────

const MobileStack: React.FC = () => (
  <div className="flex flex-col gap-3">
    {SKILL_CATEGORIES.map((cat, cIdx) => {
      const isLearning = cat.id === 'learning';
      return (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: cIdx * 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <LiquidGlass radius="1.1rem" distortion={6} blur={12} tint={0.05} className="p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className={`w-2 h-2 rounded-full ${isLearning ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-mono text-[10px] text-white/60 uppercase tracking-widest font-bold">{cat.label}</span>
            </div>

            {/* Chip grid */}
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((skill, sIdx) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: cIdx * 0.08 + sIdx * 0.05 }}
                  className="group"
                >
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-mono text-[10px] text-white/75 transition-all duration-200 active:scale-95"
                    style={{
                      borderColor: `${cat.color}30`,
                      backgroundColor: `${cat.glowColor}`,
                    }}
                  >
                    {!isLearning && (
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: cat.color }} />
                    )}
                    {isLearning && (
                      <span className="text-[8px]" style={{ color: cat.color }}>→</span>
                    )}
                    <span>{skill.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </LiquidGlass>
        </motion.div>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ROOT COMPONENT — Responsive Switch
// ─────────────────────────────────────────────────────────────────────────────

export const Skills3D: React.FC = () => {
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setViewport(w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div
      id="skills-container"
      className="relative w-full max-w-6xl mx-auto px-4 py-16 min-h-[90vh] flex flex-col justify-center"
    >
      {/* SECTION HEADER */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-3 text-center lg:text-left">
        <div>
          <div className="text-xs font-mono text-white/35 tracking-widest mb-2">// Toolkit</div>
          <h2 className="text-3xl md:text-5xl font-sans tracking-tight text-white font-bold">
            Toolkit &amp; Technologies
          </h2>
        </div>
        <p className="text-white/45 text-xs font-mono max-w-xs lg:max-w-sm self-center lg:self-auto">
          {viewport === 'desktop'
            ? 'Hover any node to highlight connections across engineering clusters.'
            : viewport === 'tablet'
            ? 'Organized by cluster — each panel groups related technologies.'
            : 'Categorized by discipline — tap any chip to explore.'}
        </p>
      </div>

      {/* RESPONSIVE CONTENT */}
      <AnimatePresence mode="wait">
        {viewport === 'desktop' && (
          <motion.div key="desktop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <DesktopNetwork />
          </motion.div>
        )}
        {viewport === 'tablet' && (
          <motion.div key="tablet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <TabletClusters />
          </motion.div>
        )}
        {viewport === 'mobile' && (
          <motion.div key="mobile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <MobileStack />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
