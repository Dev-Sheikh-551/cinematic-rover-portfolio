/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { sound } from './SoundManager';
import { LiquidGlass } from './LiquidGlass';


import { FileText, ExternalLink } from 'lucide-react';

interface AboutHologramProps {
  scrollProgress: number; // For scroll-tied assembly offsets
  onOpenResume?: () => void;
}

export const AboutHologram: React.FC<AboutHologramProps> = ({ scrollProgress, onOpenResume }) => {
  const focusStart = 0.15;
  const focusEnd = 0.33;

  let segmentProgress = 0;
  if (scrollProgress >= focusStart && scrollProgress <= focusEnd) {
    segmentProgress = (scrollProgress - focusStart) / (focusEnd - focusStart);
  } else if (scrollProgress > focusEnd) {
    segmentProgress = 1;
  }

  const isAssembled = scrollProgress >= focusStart && scrollProgress <= focusEnd;
  const assembleFactor = isAssembled ? Math.sin(segmentProgress * Math.PI) : 0;

  const offsetX = (1 - assembleFactor) * 80;
  const offsetY = (1 - assembleFactor) * -50;
  const rotationZ = (1 - assembleFactor) * 8;

  const handlePanelHover = () => {
    sound.playTick();
  };

  return (
    <div id="about-container" className="relative w-full max-w-6xl mx-auto px-4 md:px-8 py-20 min-h-[85vh] flex flex-col gap-12 justify-center">

      {/* SECTION TITLE HEADER */}
      <div className="text-center lg:text-left">
        <div className="text-xs font-mono text-white/35 tracking-widest mb-2">// Who I Am</div>
        <h2 className="text-3xl md:text-5xl font-sans tracking-tight text-white font-bold">
          Developer, Craftsman &amp; Creator
        </h2>
      </div>

      {/* MONOLITHIC MASTER GLASS PANEL & CURRENT FOCUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">

        {/* MAIN EDITORIAL GLASS CONTAINER (8 cols) */}
        <motion.div
          className="lg:col-span-8"
          style={{
            x: offsetX,
            y: offsetY * 0.5,
            rotate: rotationZ * 0.2,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 16 }}
          onMouseEnter={handlePanelHover}
        >
          <LiquidGlass radius="1.5rem" distortion={12} blur={0} tint={0.08} className="p-8 cursor-default group space-y-6">

            {/* Bio Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <h3 className="text-2xl font-sans font-medium text-white">
                  Hi, I'm <span className="font-semibold text-white underline underline-offset-8 decoration-white/20">Sheikh Tijan Touray</span>
                </h3>
                <p className="text-white/75 text-sm leading-relaxed">
                  I'm a frontend engineer from The Gambia driven by a passion for building clean, fast, and memorable web experiences. I specialize in modern React ecosystems, Next.js, TypeScript, and fine-tuned animations.
                </p>
              </div>

              {onOpenResume && (
                <button
                  onClick={() => { onOpenResume(); sound.playConfirm(); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-mono text-xs font-medium transition-all duration-300 shrink-0 cursor-pointer shadow-lg hover:shadow-emerald-500/10"
                >
                  <FileText size={14} className="text-emerald-400" />
                  <span>View Resume</span>
                </button>
              )}
            </div>

            {/* Design Philosophy & Motivation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
              <div>
                <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">DESIGN PHILOSOPHY</div>
                <p className="text-white/80 text-xs leading-relaxed italic">
                  "Building with intention, craftsmanship, and clarity. Code should perform as beautifully as it looks."
                </p>
              </div>

              <div>
                <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">WHAT MOTIVATES ME</div>
                <p className="text-white/75 text-xs leading-relaxed">
                  Creating interfaces that react effortlessly to human input, bridging high design with rock-solid engineering.
                </p>
              </div>
            </div>

            {/* Sub-panel stats footer */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
              <LiquidGlass radius="0.75rem" distortion={5} blur={0} tint={0.05} className="text-center p-3">
                <div className="text-xl font-mono text-white font-medium">5+</div>
                <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Years Code</div>
              </LiquidGlass>
              <LiquidGlass radius="0.75rem" distortion={5} blur={0} tint={0.05} className="text-center p-3">
                <div className="text-xl font-mono text-white font-medium">24+</div>
                <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Deployments</div>
              </LiquidGlass>
              <LiquidGlass radius="0.75rem" distortion={5} blur={0} tint={0.05} className="text-center p-3">
                <div className="text-xl font-mono text-white font-medium">100%</div>
                <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Crafted</div>
              </LiquidGlass>
            </div>

          </LiquidGlass>
        </motion.div>

        {/* CURRENT FOCUS CARD (4 cols) */}
        <motion.div
          className="lg:col-span-4 flex flex-col gap-4"
          style={{
            x: offsetX * -0.6,
            y: offsetY * 0.8,
            rotate: rotationZ * -0.3,
          }}
          transition={{ type: 'spring', stiffness: 45, damping: 14 }}
          onMouseEnter={handlePanelHover}
        >
          <LiquidGlass radius="1.5rem" distortion={10} blur={0} tint={0.07} className="p-6 cursor-default">
            <div className="text-xs font-mono text-white/40 mb-4 tracking-widest flex items-center justify-between">
              <span>// CURRENT FOCUS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-1">
                <div className="font-medium text-white">1. Modern Web &amp; 3D</div>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  Building immersive web applications with React, Next.js, and Three.js.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-1">
                <div className="font-medium text-white">2. Cinematic UX</div>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  Exploring high-end motion, micro-interactions, and fluid state management.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-1">
                <div className="font-medium text-white">3. Impactful Products</div>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  Seeking opportunities to collaborate on production-ready digital tools.
                </p>
              </div>
            </div>
          </LiquidGlass>
        </motion.div>

      </div>
    </div>
  );
};
