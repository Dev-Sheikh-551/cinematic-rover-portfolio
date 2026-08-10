/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { sound } from './SoundManager';
import { LiquidGlass } from './LiquidGlass';
import { FileText } from 'lucide-react';
import { personalData, experienceData } from '../data';
import { SpecularButton } from './SpecularButton';

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

  const currentRole = experienceData[0]?.position ?? 'Frontend Developer Intern';

  return (
    <div id="about-container" className="relative w-full max-w-6xl mx-auto px-4 md:px-8 py-20 min-h-[85vh] flex flex-col gap-12 justify-center">

      {/* SECTION TITLE HEADER */}
      <div className="text-center lg:text-left">
        <div className="text-xs font-mono text-white/35 tracking-widest mb-2">// Who I Am</div>
        <h2 className="text-4xl md:text-5xl font-sans tracking-tight text-white font-bold leading-[1.1] text-balance">
          {personalData.title} &amp; Creator
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
              <div className="space-y-3 max-w-2xl">
                <h3 className="text-2xl font-sans font-medium text-white leading-snug">
                  Hi, I'm <span className="font-semibold text-white underline underline-offset-8 decoration-white/20">{personalData.name}</span>
                </h3>
                <p className="text-white/85 text-[14px] leading-[1.75] font-light">
                  {personalData.storyNarrative.paragraph1}
                </p>
                <p className="text-white/75 text-[13.5px] leading-[1.75] font-light">
                  {personalData.storyNarrative.paragraph2}
                </p>
              </div>

              {onOpenResume && (
                <SpecularButton
                  size="sm"
                  radius={12}
                  baseColor="#064e3b"
                  lineColor="#10b98160"
                  textColor="#a7f3d0"
                  onClick={() => { onOpenResume(); sound.playConfirm(); }}
                >
                  <FileText size={14} className="text-emerald-400" />
                  <span>View Resume</span>
                </SpecularButton>
              )}
            </div>

            {/* Key Philosophy Editorial Quote */}
            <div className="p-4 rounded-xl bg-white/4 border-l-2 border-emerald-400 space-y-1">
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">KEY PHILOSOPHY</div>
              <p className="text-white/90 text-xs md:text-sm leading-relaxed italic font-sans">
                "{personalData.keyPhilosophy}"
              </p>
            </div>

            {/* Sub-panel stats footer — Real Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <LiquidGlass radius="0.75rem" distortion={5} blur={0} tint={0.05} className="text-center p-3">
                <div className="text-sm md:text-base font-mono text-emerald-300 font-semibold">Growing</div>
                <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-0.5">Projects Built</div>
              </LiquidGlass>
              <LiquidGlass radius="0.75rem" distortion={5} blur={0} tint={0.05} className="text-center p-3">
                <div className="text-sm md:text-base font-mono text-white font-semibold">2024</div>
                <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-0.5">Learning Since</div>
              </LiquidGlass>
              <LiquidGlass radius="0.75rem" distortion={5} blur={0} tint={0.05} className="text-center p-3">
                <div className="text-xs md:text-sm font-mono text-sky-300 font-semibold truncate" title={currentRole}>{currentRole}</div>
                <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-0.5">Current Role</div>
              </LiquidGlass>
              <LiquidGlass radius="0.75rem" distortion={5} blur={0} tint={0.05} className="text-center p-3">
                <div className="text-xs md:text-sm font-mono text-purple-300 font-semibold truncate" title="Full-Stack">Full-Stack</div>
                <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-0.5">Primary Focus</div>
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
                <div className="font-medium text-white">1. OceanNet Technologies</div>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  Frontend Developer Intern contributing to production web applications and modern user interfaces.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-1">
                <div className="font-medium text-white">2. Full-Stack Growth</div>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  Self-studying backend fundamentals: Express, PostgreSQL, Prisma ORM, and API security.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-1">
                <div className="font-medium text-white">3. Practical Products</div>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  Learning by building ambitious tools, interactive experiences, and production-grade software.
                </p>
              </div>
            </div>
          </LiquidGlass>
        </motion.div>

      </div>
    </div>
  );
};
