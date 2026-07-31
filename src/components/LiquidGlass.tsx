/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * LiquidGlass — Kokonut UI liquid glass effect
 * Implements Apple-style refractive glass using SVG feDisplacementMap + backdrop-filter.
 * Drop this around any card to give it liquid-glass refraction.
 */

import React, { useId, useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
  /** Strength of the displacement/refraction (default 8) */
  distortion?: number;
  /** Blur behind the glass in px (default 6 for high optical transparency) */
  blur?: number;
  /** Border radius token, e.g. '1.25rem' or '20px' */
  radius?: string;
  /** Tint opacity 0-1 (default 0.03 for optical clarity) */
  tint?: number;
  /** Extra inline styles for the wrapper */
  style?: React.CSSProperties;
  /** Enable interactive dynamic tilt & glare tracking (default true) */
  interactive?: boolean;
}

/**
 * LiquidGlass — Optical Apple-style Liquid Glass Material
 * 
 * Features:
 *  - High optical transparency (minimal dark tint, subtle blur)
 *  - SVG feDisplacementMap light refraction
 *  - Dynamic cursor-tracked reflection sweep & edge specular highlights
 *  - Physical spring breathing hover response
 */
export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  className = '',
  contentClassName = '',
  contentStyle = {},
  distortion = 8,
  blur = 6,
  radius = '1.25rem',
  tint = 0.03,
  style = {},
  interactive = true,
}) => {
  const uid = useId().replace(/:/g, '');
  const filterId = `lg-filter-${uid}`;
  const clipId = `lg-clip-${uid}`;

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !interactive) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y, opacity: 1 });
  };

  const handleMouseEnter = () => {
    if (interactive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setIsHovered(false);
      setMousePos(prev => ({ ...prev, opacity: 0 }));
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        y: isHovered ? -4 : 0,
        scale: isHovered ? 1.01 : 1,
      }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      className={`relative overflow-hidden ${className}`}
      style={{ borderRadius: radius, ...style }}
    >
      {/* ── SVG Refraction Filter (Displacement Map) ── */}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      >
        <defs>
          <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015 0.018"
              numOctaves="2"
              seed="3"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                values="0.015 0.018; 0.019 0.015; 0.015 0.018"
                dur="14s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={distortion}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="0.4" />
          </filter>
          <clipPath id={clipId}>
            <rect width="100%" height="100%" rx={radius} />
          </clipPath>
        </defs>
      </svg>

      {/* ── Refractive background displacement ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          filter: `url(#${filterId})`,
          backdropFilter: `blur(${blur}px) saturate(1.4)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(1.4)`,
          clipPath: `url(#${clipId})`,
          zIndex: 0,
        }}
      />

      {/* ── Crystal optical glass tint (High transparency) ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: `rgba(255, 255, 255, ${isHovered ? tint * 0.7 : tint})`,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          zIndex: 1,
          transition: 'background 0.4s ease',
        }}
      />

      {/* ── Ambient Specular Rim Light ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.02) 40%, transparent 60%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* ── Cursor-driven Highlight Sweep ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: `radial-gradient(circle 180px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.16), transparent 70%)`,
          opacity: mousePos.opacity,
          transition: 'opacity 0.3s ease',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* ── Polished Thin Edges & Light Wrapping ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          border: isHovered ? '1px solid rgba(255, 255, 255, 0.28)' : '1px solid rgba(255, 255, 255, 0.12)',
          zIndex: 4,
          pointerEvents: 'none',
          boxShadow: isHovered
            ? 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(255,255,255,0.08), 0 12px 40px rgba(0,0,0,0.35)'
            : 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.25)',
          transition: 'border 0.4s ease, box-shadow 0.4s ease',
        }}
      />

      {/* ── Card Content ── */}
      <div className={contentClassName || ''} style={{ position: 'relative', zIndex: 5, ...(contentStyle || {}) }}>
        {children}
      </div>
    </motion.div>
  );
};
