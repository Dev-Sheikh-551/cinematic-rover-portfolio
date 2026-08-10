/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Skills3D — Toolkit & Technologies Section
 * Powered by React Bits LogoLoop component for a responsive, cinematic technology showcase.
 */

import React, { useState, useEffect } from 'react';
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiPostgresql,
  SiPrisma,
  SiGit,
  SiGithub,
  SiVite,
  SiFramer,
  SiThreedotjs,
  SiHtml5,
  SiCss,
  SiZod,
} from 'react-icons/si';
import { LogoLoop, LogoItem } from './LogoLoop';

// ── TECH LOGO DEFINITIONS ───────────────────────────────────────────────────

const FRONTEND_LOGOS: LogoItem[] = [
  { node: <SiReact />, title: 'React', href: 'https://react.dev' },
  { node: <SiNextdotjs />, title: 'Next.js', href: 'https://nextjs.org' },
  { node: <SiTypescript />, title: 'TypeScript', href: 'https://www.typescriptlang.org' },
  { node: <SiJavascript />, title: 'JavaScript', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  { node: <SiTailwindcss />, title: 'Tailwind CSS', href: 'https://tailwindcss.com' },
  { node: <SiFramer />, title: 'Framer Motion', href: 'https://www.framer.com/motion' },
  { node: <SiThreedotjs />, title: 'Three.js', href: 'https://threejs.org' },
  { node: <SiHtml5 />, title: 'HTML5', href: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
  { node: <SiCss />, title: 'CSS3', href: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
];

const BACKEND_LOGOS: LogoItem[] = [
  { node: <SiNodedotjs />, title: 'Node.js', href: 'https://nodejs.org' },
  { node: <SiExpress />, title: 'Express', href: 'https://expressjs.com' },
  { node: <SiPostgresql />, title: 'PostgreSQL', href: 'https://www.postgresql.org' },
  { node: <SiPrisma />, title: 'Prisma', href: 'https://www.prisma.io' },
  { node: <SiZod />, title: 'Zod', href: 'https://zod.dev' },
  { node: <SiVite />, title: 'Vite', href: 'https://vite.dev' },
  { node: <SiGit />, title: 'Git', href: 'https://git-scm.com' },
  { node: <SiGithub />, title: 'GitHub', href: 'https://github.com' },
];

// ─────────────────────────────────────────────────────────────────────────────

export const Skills3D: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      id="skills-container"
      className="relative w-full max-w-6xl mx-auto px-4 py-12 md:py-20 min-h-[60vh] flex flex-col justify-center overflow-x-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 via-transparent to-transparent pointer-events-none opacity-50" />

      {/* SECTION HEADER */}
      <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-3 text-center lg:text-left">
        <div>
          <div className="text-xs font-mono text-emerald-400/80 uppercase tracking-widest mb-2 flex items-center justify-center lg:justify-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>TOOLKIT &amp; TECHNOLOGIES</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-sans tracking-tight text-white font-bold">
            Core Technology Stack
          </h2>
        </div>
        <p className="text-white/60 text-xs md:text-sm font-sans max-w-sm leading-relaxed self-center lg:self-auto">
          Technologies I've learned through curiosity and real project work.
        </p>
      </div>

      {/* LOGO LOOP SHOWCASE */}
      <div className="w-full space-y-4 md:space-y-6 relative py-4">
        {/* Row 1: Frontend & UI Core (Left Scroll) */}
        <LogoLoop
          logos={FRONTEND_LOGOS}
          speed={isMobile ? 30 : 45}
          direction="left"
          logoHeight={isMobile ? 26 : 34}
          gap={isMobile ? 20 : 32}
          hoverSpeed={110}
          fadeOut
        />

        {/* Row 2: Full-Stack, Backend & Tools (Right Scroll) */}
        <LogoLoop
          logos={BACKEND_LOGOS}
          speed={isMobile ? 28 : 42}
          direction="right"
          logoHeight={isMobile ? 26 : 34}
          gap={isMobile ? 20 : 32}
          hoverSpeed={110}
          fadeOut
        />
      </div>

      {/* FOOTER METADATA BADGE */}
      <div className="mt-8 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-sm text-[10px] font-mono text-white/40 uppercase tracking-wider">
          <span className="w-1 h-1 rounded-full bg-emerald-400" />
          <span>Interactive Stack Stream // Tap any icon to view docs</span>
        </span>
      </div>
    </div>
  );
};

export default Skills3D;
