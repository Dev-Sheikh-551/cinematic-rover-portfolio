/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from './SoundManager';
import { SkillNode } from '../types';
import { LiquidGlass } from './LiquidGlass';


const INITIAL_SKILLS: SkillNode[] = [
  // Cluster 1: Frontend Core
  { id: '1', name: 'React / Next.js', category: 'frontend', level: 98, x: 38, y: 35, z: 1.5 },
  { id: '2', name: 'TypeScript', category: 'frontend', level: 95, x: 26, y: 52, z: 1.3 },
  { id: '3', name: 'Tailwind CSS', category: 'frontend', level: 98, x: 22, y: 32, z: 1.1 },
  { id: '4', name: 'Modern JavaScript', category: 'frontend', level: 96, x: 42, y: 55, z: 1.4 },

  // Cluster 2: Animation & 3D
  { id: '5', name: 'Three.js / WebGL', category: 'animation', level: 88, x: 62, y: 32, z: 1.6 },
  { id: '6', name: 'GSAP & Inertia', category: 'animation', level: 94, x: 74, y: 45, z: 1.5 },
  { id: '7', name: 'Framer Motion', category: 'animation', level: 92, x: 58, y: 55, z: 1.2 },

  // Cluster 3: Backend & APIs
  { id: '8', name: 'Node.js & Express', category: 'backend', level: 84, x: 28, y: 72, z: 1.2 },
  { id: '9', name: 'REST & GraphQL', category: 'backend', level: 86, x: 45, y: 76, z: 1.3 },

  // Cluster 4: Tooling & Workflow
  { id: '10', name: 'Git & Workflows', category: 'tooling', level: 94, x: 72, y: 72, z: 1.1 },
  { id: '11', name: 'Vite & Build Tools', category: 'tooling', level: 90, x: 82, y: 58, z: 1.3 },
];

const SKILL_LINKS = [
  // Frontend Cluster connections
  { from: '1', to: '2' },
  { from: '1', to: '3' },
  { from: '1', to: '4' },
  { from: '2', to: '4' },

  // Cross to Animation & 3D
  { from: '1', to: '5' },
  { from: '5', to: '6' },
  { from: '5', to: '7' },
  { from: '6', to: '7' },

  // Cross to Backend
  { from: '2', to: '8' },
  { from: '4', to: '9' },
  { from: '8', to: '9' },

  // Tooling connections
  { from: '10', to: '11' },
  { from: '6', to: '11' },
  { from: '8', to: '10' },
];

const CATEGORY_LABELS = {
  frontend: 'Frontend Core',
  animation: 'Animation & 3D',
  backend: 'Backend & APIs',
  tooling: 'Tooling & Workflow',
  core: 'Core',
};

export const Skills3D: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<SkillNode | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 40;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 40;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getNodePos = (node: SkillNode) => {
    const px = node.x + (mouseOffset.x * node.z * 0.12);
    const py = node.y + (mouseOffset.y * node.z * 0.12);
    return { x: `${px}%`, y: `${py}%`, rawX: px, rawY: py };
  };

  const handleNodeEnter = (node: SkillNode) => {
    setHoveredNode(node);
    sound.playTick();
  };

  const handleNodeLeave = () => {
    setHoveredNode(null);
  };

  return (
    <div id="skills-container" className="relative w-full max-w-6xl mx-auto px-4 py-20 min-h-[90vh] flex flex-col justify-center" ref={containerRef}>

      {/* SECTION HEADER */}
      <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-white/35 tracking-widest mb-2">// Toolkit</div>
          <h2 className="text-3xl md:text-5xl font-sans tracking-tight text-white font-bold">
            Toolkit &amp; Technologies
          </h2>
        </div>
        <p className="text-white/50 text-xs font-mono max-w-md">
          Categorized neural network. Hover any node to highlight connections across engineering clusters.
        </p>
      </div>

      {/* 3D CONSTELLATION CONTAINER — Open & Spacious (No dark background block) */}
      <div className="relative w-full h-[580px] md:h-[640px] rounded-3xl overflow-hidden pointer-events-auto">
        {/* Soft radial glow instead of dark box overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-white/4 via-white/1 to-transparent pointer-events-none opacity-60" />

        {/* SVG NEURAL CONNECTING LINES */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradient line fading gently into environment */}
            <linearGradient id="neuralFade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
          </defs>

          {SKILL_LINKS.map((link, idx) => {
            const fromNode = INITIAL_SKILLS.find(n => n.id === link.from);
            const toNode = INITIAL_SKILLS.find(n => n.id === link.to);
            if (!fromNode || !toNode) return null;

            const fromPos = getNodePos(fromNode);
            const toPos = getNodePos(toNode);

            const isHighlit = hoveredNode?.id === fromNode.id || hoveredNode?.id === toNode.id || (hoveredNode && hoveredNode.category === fromNode.category && hoveredNode.category === toNode.category);

            return (
              <g key={`link-${idx}`}>
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={isHighlit ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.07)'}
                  strokeWidth={isHighlit ? '1.5' : '0.8'}
                  className="transition-all duration-300"
                />

                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.2"
                  strokeDasharray="4, 12"
                  className="transition-all duration-300"
                  style={{ filter: isHighlit ? 'url(#glow)' : 'none' }}
                >
                  <animate attributeName="stroke-dashoffset" values="50;0" dur="4s" repeatCount="indefinite" />
                </line>
              </g>
            );
          })}
        </svg>

        {/* NODES LAYER */}
        <div className="absolute inset-0 w-full h-full z-10">
          {INITIAL_SKILLS.map((node) => {
            const pos = getNodePos(node);
            const scale = 0.82 + (node.z - 1.0) * 0.25;
            const isCategoryActive = hoveredNode?.category === node.category;
            const isHovered = hoveredNode?.id === node.id;

            return (
              <motion.div
                key={node.id}
                className="absolute origin-center"
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  scale: isHovered ? scale * 1.1 : scale,
                  zIndex: isHovered ? 30 : Math.round(node.z * 10),
                }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              >
                <LiquidGlass
                  radius="0.75rem"
                  distortion={isHovered ? 14 : 6}
                  blur={12}
                  tint={isHovered ? 0.14 : isCategoryActive ? 0.08 : 0.04}
                  className={`px-4 py-2.5 cursor-pointer group transition-all duration-300 ${isHovered || isCategoryActive ? 'ring-1 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.12)]' : ''}`}
                  onMouseEnter={() => handleNodeEnter(node)}
                  onMouseLeave={handleNodeLeave}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'bg-white animate-ping' : 'bg-white/40'} transition-all`} />
                    <span className={`text-[11px] md:text-xs font-mono font-medium tracking-wide ${isHovered ? 'text-white font-bold' : 'text-white/80'}`}>
                      {node.name}
                    </span>
                  </div>

                  <div className="h-0 group-hover:h-1.5 overflow-hidden transition-all duration-300 mt-0 group-hover:mt-1.5 w-24">
                    <div className="w-full h-[2px] bg-white/10 rounded-full">
                      <motion.div
                        className="h-full bg-white"
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

        {/* CLUSTER LEGEND BADGES (BOTTOM LEFT) */}
        <div className="absolute bottom-6 left-6 z-20 hidden sm:flex gap-2 font-mono text-[9px] text-white/40">
          {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
            <span
              key={catKey}
              className={`px-2.5 py-1 rounded-full border transition-all ${hoveredNode?.category === catKey ? 'border-white/40 bg-white/10 text-white font-medium' : 'border-white/5 bg-black/30'
                }`}
            >
              {label}
            </span>
          ))}
        </div>

        {/* HOVERED NODE DETAIL TELEMETRY PANEL (BOTTOM RIGHT) */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute bottom-6 right-6 z-20 w-64 pointer-events-none"
            >
              <LiquidGlass radius="1rem" distortion={16} blur={20} tint={0.1} className="p-4 font-mono text-[10px] text-white/70">
                <div className="text-[9px] text-white/40 uppercase tracking-widest mb-1.5">// Cluster Node</div>
                <div className="text-xs font-medium text-white mb-2">{hoveredNode.name}</div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>Proficiency</span>
                    <span className="text-white font-medium">{hoveredNode.level}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cluster</span>
                    <span className="text-white/90 uppercase">{CATEGORY_LABELS[hoveredNode.category]}</span>
                  </div>
                </div>

                <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${hoveredNode.level}%` }} />
                </div>
              </LiquidGlass>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
