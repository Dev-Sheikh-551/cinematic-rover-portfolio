/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SecretDeveloperPanel — Phase 3 Advanced Apple-Inspired Developer Overlay
 *
 * Displays clean live technical telemetry using Liquid Glass design language:
 *  - Application (React, Next.js, Engine versions)
 *  - Rendering (Live FPS, Frame Time, Active Camera, Checkpoint, Scroll Progress)
 *  - Portfolio Customs (Theme, Rover Finish, Road Accent, Motion Mode)
 *  - Architecture (GSAP, Motion, TypeScript, Prisma, PostgreSQL)
 *  - Performance (Texture count, Active animations)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Cpu,
  Layers,
  Terminal,
  X,
  Play,
  Camera,
  Palette,
  ShieldCheck,
  Zap,
  Box,
  HardDrive
} from 'lucide-react';
import { sound } from './SoundManager';
import {
  themeStore,
  ENVIRONMENT_CONFIGS,
  ROVER_FINISH_CONFIGS,
  ROAD_ACCENT_CONFIGS,
} from '../themeStore';
import { LiquidGlass } from './LiquidGlass';

interface SecretDeveloperPanelProps {
  isOpen: boolean;
  onClose: () => void;
  scrollProgress: number;
}

export const SecretDeveloperPanel: React.FC<SecretDeveloperPanelProps> = ({
  isOpen,
  onClose,
  scrollProgress,
}) => {
  const [fps, setFps] = useState<number>(60);
  const [frameTime, setFrameTime] = useState<number>(16.6);
  const [themeState, setThemeState] = useState(themeStore.getState());

  useEffect(() => {
    const unsubscribe = themeStore.subscribe(() => {
      setThemeState({ ...themeStore.getState() });
    });
    return unsubscribe;
  }, []);

  // Live FPS & Render Telemetry Loop
  useEffect(() => {
    if (!isOpen) return;

    let lastTime = performance.now();
    let frameCount = 0;
    let animId: number;

    const tick = () => {
      const now = performance.now();
      frameCount++;
      const delta = now - lastTime;

      if (delta >= 500) {
        const computedFps = Math.round((frameCount * 1000) / delta);
        setFps(computedFps);
        setFrameTime(Number((delta / frameCount).toFixed(1)));

        frameCount = 0;
        lastTime = now;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  // Determine active checkpoint section based on scroll progress
  const getCheckpointName = (p: number) => {
    if (p < 0.16) return 'Hero Section';
    if (p < 0.32) return 'About Hologram';
    if (p < 0.50) return 'Toolkit & Tech';
    if (p < 0.68) return 'Selected Work';
    if (p < 0.85) return 'Engineering Journey';
    return 'Contact Terminal';
  };

  const testAudio = (type: 'tick' | 'confirm' | 'holo' | 'error') => {
    if (type === 'tick') sound.playTick();
    if (type === 'confirm') sound.playConfirm();
    if (type === 'holo') sound.playHoloOn();
    if (type === 'error') sound.playError();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 pointer-events-auto">
          {/* Backdrop Dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
          />

          {/* Main Liquid Glass Drawer / Modal Overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 240 }}
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col z-10"
          >
            <LiquidGlass
              radius="1.75rem"
              distortion={10}
              blur={24}
              tint={0.1}
              interactive={false}
              contentClassName="h-full flex flex-col min-h-0 overflow-hidden"
              className="p-5 md:p-6 shadow-2xl overflow-hidden flex flex-col h-full border border-white/20"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400">
                    <Terminal size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-400 tracking-wider uppercase font-bold">
                      <span>DEVELOPER MODE // OVERLAY</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <h3 className="text-base font-sans font-bold text-white tracking-tight">
                      Technical System Telemetry
                    </h3>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close Developer Overlay"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content Grid */}
              <div className="overflow-y-auto space-y-4 pr-1 flex-1 min-h-0 custom-scrollbar text-xs font-mono">
                
                {/* CATEGORY 1: RENDERING TELEMETRY & CHECKPOINT */}
                <div className="space-y-2">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <Activity size={12} className="text-emerald-400" />
                    <span>01 // Rendering &amp; Checkpoint Telemetry</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* FPS */}
                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-1">
                      <div className="text-[9px] text-white/40 uppercase">Frame Rate</div>
                      <div className="text-base font-bold text-white flex items-baseline justify-between">
                        <span>{fps} <span className="text-[10px] font-normal text-white/50">FPS</span></span>
                        <span className={`text-[9px] font-normal ${fps >= 55 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {frameTime}ms
                        </span>
                      </div>
                    </div>

                    {/* Camera Mode */}
                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-1">
                      <div className="text-[9px] text-white/40 uppercase">Active Camera</div>
                      <div className="text-sm font-bold text-white capitalize flex items-center gap-1.5">
                        <Camera size={12} className="text-sky-400" />
                        <span>{themeState.cameraMode}</span>
                      </div>
                    </div>

                    {/* Current Checkpoint */}
                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-1 col-span-2">
                      <div className="text-[9px] text-white/40 uppercase">Current Checkpoint</div>
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span className="text-emerald-400">{getCheckpointName(scrollProgress)}</span>
                        <span className="text-white/40 text-[10px]">{(scrollProgress * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-emerald-400 rounded-full transition-all duration-200"
                          style={{ width: `${scrollProgress * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CATEGORY 2: APPLICATION & VERSIONS */}
                <div className="space-y-2">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <Box size={12} className="text-sky-400" />
                    <span>02 // Application &amp; Engine Stack</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-0.5">
                      <div className="text-[9px] text-white/40 uppercase">React Engine</div>
                      <div className="text-xs font-bold text-white">v19.0.0</div>
                      <div className="text-[9px] text-emerald-400">Concurrent Render</div>
                    </div>

                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-0.5">
                      <div className="text-[9px] text-white/40 uppercase">Next.js Framework</div>
                      <div className="text-xs font-bold text-white">v15.1.0</div>
                      <div className="text-[9px] text-sky-400">App Router SSR</div>
                    </div>

                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-0.5">
                      <div className="text-[9px] text-white/40 uppercase">3D / Canvas Engine</div>
                      <div className="text-xs font-bold text-white">Three.js / 2D</div>
                      <div className="text-[9px] text-purple-400">WebGL Acceleration</div>
                    </div>
                  </div>
                </div>

                {/* CATEGORY 3: PORTFOLIO CUSTOMIZATIONS */}
                <div className="space-y-2">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <Palette size={12} className="text-amber-400" />
                    <span>03 // Visitor Preferences &amp; Theme</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-xl border border-white/10 bg-white/5 space-y-0.5">
                      <div className="text-[9px] text-white/40 uppercase">Environment</div>
                      <div className="text-xs font-bold text-white truncate">
                        {ENVIRONMENT_CONFIGS[themeState.environment]?.name || themeState.environment}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl border border-white/10 bg-white/5 space-y-0.5">
                      <div className="text-[9px] text-white/40 uppercase">Rover Finish</div>
                      <div className="text-xs font-bold text-white truncate">
                        {ROVER_FINISH_CONFIGS[themeState.roverFinish]?.name || themeState.roverFinish}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl border border-white/10 bg-white/5 space-y-0.5">
                      <div className="text-[9px] text-white/40 uppercase">Road Accent</div>
                      <div className="text-xs font-bold text-white truncate">
                        {ROAD_ACCENT_CONFIGS[themeState.roadAccent]?.name || themeState.roadAccent}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl border border-white/10 bg-white/5 space-y-0.5">
                      <div className="text-[9px] text-white/40 uppercase">Motion Preset</div>
                      <div className="text-xs font-bold text-emerald-400 uppercase">
                        {themeState.motionPreset || 'full'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CATEGORY 4: ARCHITECTURE & BACKEND */}
                <div className="space-y-2">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <Layers size={12} className="text-purple-400" />
                    <span>04 // Architecture &amp; Data Pipeline</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-xl border border-white/10 bg-white/5 space-y-0.5">
                      <div className="text-[9px] text-white/40 uppercase">Animation</div>
                      <div className="text-[11px] font-bold text-white">GSAP v3.12</div>
                      <div className="text-[9px] text-white/40">ScrollTrigger Scrub</div>
                    </div>

                    <div className="p-2.5 rounded-xl border border-white/10 bg-white/5 space-y-0.5">
                      <div className="text-[9px] text-white/40 uppercase">Motion System</div>
                      <div className="text-[11px] font-bold text-white">Motion v11.11</div>
                      <div className="text-[9px] text-white/40">Spring Physics</div>
                    </div>

                    <div className="p-2.5 rounded-xl border border-white/10 bg-white/5 space-y-0.5">
                      <div className="text-[9px] text-white/40 uppercase">Type Safety</div>
                      <div className="text-[11px] font-bold text-white">TypeScript v5.6</div>
                      <div className="text-[9px] text-white/40">Strict Mode</div>
                    </div>

                    <div className="p-2.5 rounded-xl border border-white/10 bg-white/5 space-y-0.5">
                      <div className="text-[9px] text-white/40 uppercase">Database / ORM</div>
                      <div className="text-[11px] font-bold text-white">Prisma / Postgres</div>
                      <div className="text-[9px] text-white/40">v5.21 / v16.4</div>
                    </div>
                  </div>
                </div>

                {/* CATEGORY 5: PERFORMANCE & TEXTURES */}
                <div className="space-y-2">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <Cpu size={12} className="text-orange-400" />
                    <span>05 // Performance &amp; Shaders</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-[9px] text-white/40 uppercase">Texture Count</div>
                        <div className="text-xs font-bold text-white">14 Procedural Shaders</div>
                      </div>
                      <Zap size={14} className="text-amber-400" />
                    </div>

                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-[9px] text-white/40 uppercase">Active Animations</div>
                        <div className="text-xs font-bold text-white">rAF Kinematics + GSAP</div>
                      </div>
                      <ShieldCheck size={14} className="text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* AUDIO SYNTHESIS DIAGNOSTICS */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">// Audio Synthesis Diagnostics</div>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => testAudio('tick')}
                      className="border border-white/10 hover:border-white/40 bg-white/5 hover:bg-white/10 p-2 rounded-xl flex flex-col items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Play size={10} className="text-emerald-400" />
                      <span className="text-[9px] text-white">TICK</span>
                    </button>

                    <button
                      onClick={() => testAudio('confirm')}
                      className="border border-white/10 hover:border-white/40 bg-white/5 hover:bg-white/10 p-2 rounded-xl flex flex-col items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Play size={10} className="text-sky-400" />
                      <span className="text-[9px] text-white">CONFIRM</span>
                    </button>

                    <button
                      onClick={() => testAudio('holo')}
                      className="border border-white/10 hover:border-white/40 bg-white/5 hover:bg-white/10 p-2 rounded-xl flex flex-col items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Play size={10} className="text-purple-400" />
                      <span className="text-[9px] text-white">HOLO</span>
                    </button>

                    <button
                      onClick={() => testAudio('error')}
                      className="border border-white/10 hover:border-white/40 bg-white/5 hover:bg-white/10 p-2 rounded-xl flex flex-col items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Play size={10} className="text-red-400" />
                      <span className="text-[9px] text-white">ERROR</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Indicator */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-white/40 flex-shrink-0">
                <span>SHORTCUT: CTRL + SHIFT + D</span>
                <span>PRESS ESC TO CLOSE</span>
              </div>
            </LiquidGlass>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
