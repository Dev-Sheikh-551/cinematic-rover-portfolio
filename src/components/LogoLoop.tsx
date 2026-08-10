/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * LogoLoop — React Bits Component
 * Infinite ticker loop displaying technology logos with smooth hover slowing,
 * edge gradient fade, and responsive scaling.
 * Powered by high-performance delta-time RAF continuous translation & smooth velocity lerping.
 */

import React, { useRef, useEffect, useMemo } from 'react';
import './LogoLoop.css';

export interface LogoItem {
  node: React.ReactNode;
  title: string;
  href?: string;
  category?: string;
}

export interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number; // Base duration in seconds to complete 1 full loop set
  direction?: 'left' | 'right';
  logoHeight?: number;
  gap?: number;
  hoverSpeed?: number; // Duration in seconds when hovered
  fadeOut?: boolean;
  scaleOnHover?: boolean;
  className?: string;
}

export const LogoLoop: React.FC<LogoLoopProps> = ({
  logos,
  speed = 45,
  direction = 'left',
  logoHeight = 36,
  gap = 32,
  hoverSpeed = 120,
  fadeOut = true,
  scaleOnHover = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const isHoveredRef = useRef(false);
  const offsetRef = useRef(0);
  const currentSpeedRef = useRef(0);
  const animFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const setWidthRef = useRef<number>(0);

  // Duplicate logos array 3 times to ensure seamless infinite continuous loop
  const duplicatedLogos = useMemo(() => [...logos, ...logos, ...logos], [logos]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Measure single set width (total track width / 3)
    const updateSetWidth = () => {
      if (track) {
        setWidthRef.current = track.scrollWidth / 3;
      }
    };

    updateSetWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateSetWidth();
    });
    resizeObserver.observe(track);

    let isTabHidden = false;

    const handleVisibilityChange = () => {
      isTabHidden = document.hidden;
      if (isTabHidden) {
        lastTimeRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Delta-time continuous RAF animation loop with smooth velocity lerping
    const animate = (timestamp: number) => {
      if (isTabHidden) {
        animFrameId.current = requestAnimationFrame(animate);
        return;
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1); // Cap dt to 100ms
      lastTimeRef.current = timestamp;

      const setWidth = setWidthRef.current;

      if (setWidth > 0) {
        // Calculate target velocity in pixels per second:
        // 1 set width traversed over `speed` or `hoverSpeed` seconds
        const normalPxPerSec = setWidth / Math.max(speed, 1);
        const hoverPxPerSec = setWidth / Math.max(hoverSpeed, 1);
        const targetPxPerSec = isHoveredRef.current ? hoverPxPerSec : normalPxPerSec;

        // Smooth velocity interpolation (exponential decay / lerp over ~150ms)
        const lerpFactor = 1 - Math.exp(-dt * 6.5);
        if (currentSpeedRef.current === 0) {
          currentSpeedRef.current = targetPxPerSec;
        } else {
          currentSpeedRef.current += (targetPxPerSec - currentSpeedRef.current) * lerpFactor;
        }

        // Direction multiplier
        const dir = direction === 'right' ? -1 : 1;

        // Update continuous position offset
        offsetRef.current += currentSpeedRef.current * dt * dir;

        // Seamless wrap-around modulo setWidth
        offsetRef.current = ((offsetRef.current % setWidth) + setWidth) % setWidth;

        // Apply hardware-accelerated 3D transform directly to DOM ref (0 React re-renders)
        track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      }

      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameId.current !== null) {
        cancelAnimationFrame(animFrameId.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
    };
  }, [speed, hoverSpeed, direction, logos.length]);

  return (
    <div
      ref={containerRef}
      className={`logo-loop-container relative w-full overflow-hidden select-none py-2 ${className}`}
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
      aria-label="Technologies and Toolkit Showcase"
      role="region"
    >
      {/* Edge gradient masks for seamless fade out */}
      {fadeOut && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-28 z-10 pointer-events-none bg-gradient-to-r from-[#05050a] via-[#05050a]/80 to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-28 z-10 pointer-events-none bg-gradient-to-l from-[#05050a] via-[#05050a]/80 to-transparent" />
        </>
      )}

      {/* Scrolling Marquee Track */}
      <div
        ref={trackRef}
        className="logo-loop-track flex items-center w-max py-3.5"
        style={{
          gap: `${gap}px`,
          willChange: 'transform',
        }}
      >
        {duplicatedLogos.map((logo, index) => {
          const content = (
            <div
              key={`${logo.title}-${index}`}
              className={`logo-loop-item flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out group ${
                scaleOnHover ? 'hover:-translate-y-0.5 hover:scale-[1.02] hover:border-emerald-500/40 hover:bg-white/[0.08] hover:shadow-[0_4px_20px_rgba(16,185,129,0.12)]' : ''
              }`}
              style={{
                height: `${logoHeight + 20}px`,
                willChange: 'transform',
                backfaceVisibility: 'hidden',
              }}
            >
              <div
                className="logo-icon text-white/50 group-hover:text-emerald-400 transition-colors duration-200 flex items-center justify-center shrink-0"
                style={{ fontSize: `${logoHeight}px`, width: `${logoHeight}px`, height: `${logoHeight}px` }}
              >
                {logo.node}
              </div>
              <span className="logo-title font-mono text-xs text-white/70 group-hover:text-white font-medium tracking-wide whitespace-nowrap transition-colors duration-200">
                {logo.title}
              </span>
            </div>
          );

          if (logo.href) {
            return (
              <a
                key={`link-${logo.title}-${index}`}
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                title={`${logo.title} (Opens official site)`}
                className="no-underline focus:outline-none focus:ring-1 focus:ring-emerald-400/50 rounded-xl"
              >
                {content}
              </a>
            );
          }

          return content;
        })}
      </div>
    </div>
  );
};

export default LogoLoop;
