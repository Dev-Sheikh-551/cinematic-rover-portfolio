/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

interface EnvironmentalInterferenceProps {
  isActive: boolean;
  milestoneIndex?: number;
}

const INTERFERENCE_LABELS = [
  'COGNITIVE_SYNC_INTERRUPT',
  'ELECTROMAGNETIC_SURGE',
  'TELEMETRY_BEACON_ALIGNMENT',
  'SPATIAL_WARPING_DETECTED',
  'GRID_RE_CONSTRUCTION_BURST',
  'CORE_LOG_COMPRESSION'
];

export const EnvironmentalInterference: React.FC<EnvironmentalInterferenceProps> = ({
  isActive,
  milestoneIndex = 0
}) => {
  const [randomTexts, setRandomTexts] = useState<string[]>([]);
  const [randomOffsets, setRandomOffsets] = useState<number[]>([]);

  useEffect(() => {
    if (isActive) {
      // Generate randomized telemetry alerts and slices
      const texts = Array.from({ length: 2 }, () => {
        const base = INTERFERENCE_LABELS[Math.floor(Math.random() * INTERFERENCE_LABELS.length)];
        const num = Math.floor(Math.random() * 900 + 100);
        return `${base}_${num} // MIL_STN_0${milestoneIndex + 1}`;
      });
      setRandomTexts(texts);

      // Random percentage positions for glitch horizontal bars
      const offsets = Array.from({ length: 4 }, () => Math.floor(Math.random() * 80) + 10);
      setRandomOffsets(offsets);
    }
  }, [isActive, milestoneIndex]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* 1. Dramatic Chroma Aberration Color Split Backdrop Overlay */}
      <div className="absolute inset-0 bg-red-500/10 mix-blend-screen pointer-events-none" />
      <div className="absolute inset-0 bg-cyan-500/5 mix-blend-screen pointer-events-none" />

      {/* 2. Rapid horizontal glitch slices/bars */}
      {randomOffsets.map((top, idx) => {
        const height = Math.random() * 12 + 2; // height in vh
        const skew = Math.random() * 12 - 6; // skew degree
        const shift = Math.random() * 30 - 15; // horizontal shift px
        
        return (
          <div
            key={`glitch-bar-${idx}`}
            className="absolute left-0 w-full bg-white/5 border-y border-white/10 backdrop-blur-[2px]"
            style={{
              top: `${top}%`,
              height: `${height}vh`,
              transform: `skewX(${skew}deg) translateX(${shift}px)`,
              boxShadow: '0 0 15px rgba(255,255,255,0.1)'
            }}
          >
            {/* Glitch bar scanning line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            
            {/* Interactive horizontal shifting line segments */}
            {idx % 2 === 0 && (
              <div 
                className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.25)_2px,rgba(255,255,255,0.25)_4px)]"
              />
            )}
          </div>
        );
      })}

      {/* 3. Floating telemetry terminal alerts on screen during glitch */}
      <div className="absolute bottom-1/4 left-10 md:left-24 space-y-2 select-none font-mono text-[9px] text-white/85 md:text-xs">
        {randomTexts.map((text, i) => (
          <div 
            key={`text-${i}`} 
            className="flex items-center gap-2 bg-black/90 px-3 py-1.5 border border-white/20 rounded shadow-[0_0_12px_rgba(255,255,255,0.25)] environmental-aberration-active"
            style={{
              transform: `translateX(${Math.random() * 20 - 10}px)`
            }}
          >
            <span className="w-2 h-2 bg-red-500 animate-ping rounded-full" />
            <span className="tracking-[2px]">{text}</span>
          </div>
        ))}
      </div>

      {/* 4. Screen-wide skew distortion wrapper */}
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <div className="self-start font-mono text-[8px] text-red-400 bg-black/40 px-2 py-1 border border-red-500/30 tracking-[4px]">
          [ !!! TELEMETRY_MUTATION_WARNING !!! ]
        </div>
        <div className="self-end font-mono text-[8px] text-cyan-400 bg-black/40 px-2 py-1 border border-cyan-500/30 tracking-[4px]">
          [ COORD_LAG: Z_COEFFICIENT_DRIFT ]
        </div>
      </div>
    </div>
  );
};
