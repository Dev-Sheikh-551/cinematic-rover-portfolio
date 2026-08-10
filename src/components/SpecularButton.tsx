/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SpecularButton — React Bits Component
 * Premium button component with interactive mouse-following specular shine reflections,
 * glassmorphic metallic bevels, and tactile feedback.
 */

import React, { useRef, useState, useEffect } from 'react';
import './SpecularButton.css';

export interface SpecularButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
}

export const SpecularButton: React.FC<SpecularButtonProps> = ({
  children,
  size = 'md',
  radius = 18,
  tint = '#ffffff',
  tintOpacity = 0,
  blur = 0,
  textColor = '#f5f5f5',
  lineColor = '#ffffff',
  baseColor = '#3a3a3a',
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  href,
  target,
  rel,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...restProps
}) => {
  const btnRef = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number; active: boolean }>({
    x: 50,
    y: 50,
    active: false,
  });

  useEffect(() => {
    if (!followMouse) return;

    // Skip expensive proximity calculations when tab is hidden or user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleMouseMove = (e: MouseEvent) => {
      if (!btnRef.current || disabled) return;
      if (document.hidden || prefersReducedMotion) return;
      const rect = btnRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

      if (dist <= proximity) {
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPos({ x, y, active: true });
      } else {
        setPos((prev) => (prev.active ? { ...prev, active: false } : prev));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [followMouse, proximity, disabled]);

  const sizeClasses =
    size === 'sm'
      ? 'px-3.5 py-1.5 text-xs gap-1.5'
      : size === 'lg'
      ? 'px-6 py-3 text-sm gap-2.5'
      : 'px-5 py-2.5 text-xs md:text-sm gap-2';

  const styleObj: React.CSSProperties = {
    borderRadius: `${radius}px`,
    color: textColor,
    backgroundColor: baseColor,
    borderWidth: `${thickness}px`,
    borderColor: lineColor,
    backdropFilter: blur ? `blur(${blur}px)` : undefined,
    WebkitBackdropFilter: blur ? `blur(${blur}px)` : undefined,
    // CSS custom properties for specular shine gradient overlay
    '--specular-x': `${pos.active ? pos.x : 50}%`,
    '--specular-y': `${pos.active ? pos.y : 50}%`,
    '--specular-opacity': pos.active ? intensity : autoAnimate ? 0.6 : 0.2,
    '--specular-size': `${shineSize}%`,
    '--specular-tint': tint,
    '--specular-tint-opacity': tintOpacity,
    '--specular-speed': `${speed}s`,
  } as React.CSSProperties;

  const combinedClasses = `specular-button relative inline-flex items-center justify-center font-mono font-medium tracking-wide shadow-lg select-none cursor-pointer transition-all duration-200 active:scale-[0.97] overflow-hidden ${sizeClasses} ${
    disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
  } ${className}`;

  if (href) {
    return (
      <a
        ref={btnRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        className={combinedClasses}
        style={styleObj}
        onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
      >
        {/* Specular Light Layer */}
        <span className="specular-shine-layer" aria-hidden="true" />
        <span className="specular-content relative z-10 flex items-center gap-2">{children}</span>
      </a>
    );
  }

  return (
    <button
      ref={btnRef as React.RefObject<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      className={combinedClasses}
      style={styleObj}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      {...restProps}
    >
      {/* Specular Light Layer */}
      <span className="specular-shine-layer" aria-hidden="true" />
      <span className="specular-content relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};

export default SpecularButton;
