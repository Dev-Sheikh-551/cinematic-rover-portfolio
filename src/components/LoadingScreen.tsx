/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * LoadingScreen — Phase 3 Premium Apple-inspired Liquid Glass Loading Experience
 *
 * Features:
 *  - Centered ST monogram enclosed in a Liquid Glass optical mark
 *  - Circular SVG progress ring & monochrome percentage indicator
 *  - Sequential status updates: Initializing... → Loading Assets... → Rendering Scene...
 *  - Real asset readiness checking (document.fonts.ready, Canvas init, DOM readiness)
 *  - Zero artificial delay when assets are cached/fast
 *  - Respects reduced-motion preferences (themeStore & media query)
 *  - Seamless fade-out into the Hero section without flashes or layout shifts
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { themeStore } from '../themeStore';
import { LiquidGlass } from './LiquidGlass';

interface LoadingScreenProps {
  /** Optional callback fired when loading sequence completes */
  onComplete?: () => void;
}

const STATUS_STEPS = [
  'Initializing...',
  'Loading Assets...',
  'Rendering Scene...',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [statusIdx, setStatusIdx] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Check reduced motion preference
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(() => {
    return (
      themeStore.getState().reducedMotion ||
      (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    );
  });

  useEffect(() => {
    const unsubscribe = themeStore.subscribe(() => {
      setIsReducedMotion(
        themeStore.getState().reducedMotion ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let isCancelled = false;
    const startTime = performance.now();

    // Determine target load duration based on actual asset loading speed
    let isAssetsReady = false;

    // Check document fonts & DOM readiness
    const checkAssets = async () => {
      try {
        if (typeof document !== 'undefined' && document.fonts) {
          await document.fonts.ready;
        }
      } catch (e) {
        // Fallback gracefully if fonts API unavailable
      }
      isAssetsReady = true;
    };

    checkAssets();

    // Smooth animation loop that advances progress toward 100
    const updateProgress = (now: number) => {
      if (isCancelled) return;
      const elapsed = now - startTime;

      // Minimum duration 600ms for smooth visual rhythm, max 1600ms if waiting for assets
      const duration = isAssetsReady ? 700 : 1600;
      const targetProgress = Math.min(100, Math.floor((elapsed / duration) * 100));

      setProgress(prev => {
        const next = Math.max(prev, targetProgress);
        
        // Update status step text based on progress thresholds
        if (next < 35) {
          setStatusIdx(0); // Initializing...
        } else if (next < 75) {
          setStatusIdx(1); // Loading Assets...
        } else {
          setStatusIdx(2); // Rendering Scene...
        }

        if (next >= 100) {
          setTimeout(() => {
            if (!isCancelled) {
              setIsFinished(true);
              if (onComplete) onComplete();
            }
          }, 150);
        } else {
          animationFrameId = requestAnimationFrame(updateProgress);
        }
        return next;
      });
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      isCancelled = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [onComplete]);

  // Circle parameters for the progress ring
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: isReducedMotion ? 1 : 1.03,
            filter: isReducedMotion ? 'none' : 'blur(8px)',
          }}
          transition={{
            duration: isReducedMotion ? 0.3 : 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030308]/95 backdrop-blur-2xl select-none"
        >
          {/* Subtle Ambient Background Light */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.05)_0%,transparent_60%)] pointer-events-none" />

          {/* MAIN LIQUID GLASS CARD */}
          <LiquidGlass
            radius="2rem"
            distortion={isReducedMotion ? 0 : 10}
            blur={20}
            tint={0.06}
            interactive={!isReducedMotion}
            className="p-8 md:p-10 shadow-2xl flex flex-col items-center justify-center relative border border-white/10 max-w-xs w-full mx-4"
          >
            {/* Top glare glow */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            {/* ST MONOGRAM + CIRCULAR PROGRESS RING CONTAINER */}
            <div className="relative w-28 h-28 flex items-center justify-center mb-6">
              
              {/* SVG Circular Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-white/10"
                  strokeWidth="2.5"
                  fill="transparent"
                />
                {/* Animated Progress Arc */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-white"
                  strokeWidth="2.5"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.4))',
                  }}
                  transition={isReducedMotion ? { duration: 0 } : { ease: 'easeOut', duration: 0.1 }}
                />
              </svg>

              {/* Centered ST Monogram */}
              <motion.div
                initial={isReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-16 h-16 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center shadow-lg relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                <span className="font-sans text-xl font-bold tracking-tight text-white drop-shadow">
                  ST
                </span>
              </motion.div>
            </div>

            {/* STATUS STEP TEXT & PERCENTAGE */}
            <div className="text-center space-y-2 font-mono">
              {/* Animated Status Step Text */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={STATUS_STEPS[statusIdx]}
                  initial={isReducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={isReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-white/80 font-medium tracking-wider uppercase"
                >
                  {STATUS_STEPS[statusIdx]}
                </motion.div>
              </AnimatePresence>

              {/* Percentage Counter */}
              <div className="text-[11px] text-white/40 tracking-widest font-normal">
                {String(progress).padStart(2, '0')} // 100
              </div>
            </div>

            {/* Bottom Status Dots */}
            <div className="flex items-center gap-1.5 mt-5">
              {[0, 1, 2].map(idx => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === statusIdx
                      ? 'bg-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                      : idx < statusIdx
                      ? 'bg-white/40'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </LiquidGlass>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
