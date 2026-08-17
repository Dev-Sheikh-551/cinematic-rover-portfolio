/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useLayoutEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Custom high-performance GSAP InertiaPlugin definition for cinematic physics simulation support
const InertiaPlugin = {
  name: "inertia",
  register(core: any, GSAP: any) {
    // Registered successfully for core physical momentum callbacks
  },
  init(target: any, values: any) {
    return true;
  }
};

gsap.registerPlugin(ScrollTrigger, InertiaPlugin);
import {
  Sparkles,
  ArrowDown,
  Volume2,
  VolumeX,
  Compass,
  Command,
  Info,
  Cpu,
  ShieldAlert,
  Maximize2,
  FileText,
  Activity
} from 'lucide-react';

import { sound } from './components/SoundManager';
import { CinematicCanvas } from './components/CinematicCanvas';
import { AboutHologram } from './components/AboutHologram';
import { Skills3D } from './components/Skills3D';
import { ProjectsExhibition } from './components/ProjectsExhibition';
import { TimelinePath } from './components/TimelinePath';
import { ContactTerminal } from './components/ContactTerminal';
import { CommandPalette } from './components/CommandPalette';
import { AchievementToasts } from './components/AchievementToasts';
import { TestimonialsWall } from './components/TestimonialsWall';
import { EndingSequence } from './components/EndingSequence';
import { LoadingScreen } from './components/LoadingScreen';
import { DepthText } from './components/DepthText';
import { themeStore } from './themeStore';
import { personalData } from './data';
import { TimelineEvent, Project } from './types';
import { TIMELINE_OFFSETS } from './constants';

// Lazy-load heavy modals — split into deferred async chunks, fetched only on first open
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — named re-export via .then() is valid at runtime; tsc cannot resolve through the wrapper
const ThemeStudio = lazy(() => import('./components/ThemeStudio').then(m => ({ default: m.ThemeStudio })));
// @ts-ignore
const SecretDeveloperPanel = lazy(() => import('./components/SecretDeveloperPanel').then(m => ({ default: m.SecretDeveloperPanel })));
// @ts-ignore
const ProjectShowcaseModal = lazy(() => import('./components/ProjectShowcaseModal').then(m => ({ default: m.ProjectShowcaseModal })));
// @ts-ignore
const ResumeModal = lazy(() => import('./components/ResumeModal').then(m => ({ default: m.ResumeModal })));

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'm1',
    chapterTitle: 'Chapter 01 — The Beginning',
    year: 'OCT 2024',
    title: 'First Steps at Jasseh Code Camp',
    company: 'Jasseh Code Camp (JCC)',
    description: 'Started learning frontend development at JCC, focusing on fundamentals: HTML, CSS, JavaScript, React, TypeScript, and Tailwind CSS.',
    coordinates: { x: -30, y: -15, z: 723 }
  },
  {
    id: 'm2',
    chapterTitle: 'Chapter 02 — Learning Beyond the Classroom',
    year: 'DURING JCC',
    title: 'Self-Directed Mastery & Projects',
    company: 'freeCodeCamp & Scrimba',
    description: 'Expanded knowledge through freeCodeCamp JavaScript and Scrimba React courses, building personal projects to apply skills practically.',
    coordinates: { x: 20, y: -15, z: 770 }
  },
  {
    id: 'm3',
    chapterTitle: 'Chapter 03 — From Student to Builder',
    year: 'JAN 2026',
    title: 'JCC Completion & Ambitious Exploration',
    company: 'JCC & Independent Exploration',
    description: 'Completed the JCC Frontend Program and shifted to building ambitious projects while exploring technologies outside traditional frontend.',
    coordinates: { x: 5, y: -15, z: 836 }
  },
  {
    id: 'm4',
    chapterTitle: 'Chapter 04 — Professional Growth',
    year: 'PRESENT',
    title: 'Frontend Developer Intern',
    company: 'OceanNet Technologies',
    description: 'Working as a Frontend Developer Intern at OceanNet Technologies while continuing self-directed full-stack learning.',
    coordinates: { x: 10, y: -15, z: 880 }
  }
];

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isMuted, setIsMuted] = useState(true);
  const [isAlternateTheme, setIsAlternateTheme] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [isKonamiActive, setIsKonamiActive] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSecretPanelOpen, setIsSecretPanelOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isDroneView, setIsDroneView] = useState(true);
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchMilestoneIndex, setGlitchMilestoneIndex] = useState<number | null>(null);
  const [inspectedProject, setInspectedProject] = useState<Project | null>(null);

  // Active section ref and main GSAP timeline ref
  const activeSectionRef = useRef('hero');
  const hasScrolledRef = useRef(false);
  const lastProgressRef = useRef(0);
  const mainTlRef = useRef<gsap.core.Timeline | null>(null);
  // Direct ref for CinematicCanvas scroll progress — bypasses React setState per-frame overhead.
  // Written synchronously on every ScrollTrigger tick; the canvas render loop reads it directly.
  const canvasScrollRef = useRef(0);

  // Sync developerMode state from themeStore
  useEffect(() => {
    const unsubscribe = themeStore.subscribe(() => {
      setIsSecretPanelOpen(themeStore.getState().developerMode);
    });
    return unsubscribe;
  }, []);

  // Always start at the very top — prevents browser restoring previous scroll position
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Buffer references for typing easter eggs
  const konamiBufferRef = useRef<string[]>([]);
  const inputBufferRef = useRef<string[]>([]);

  // 1. Developer console greeting
  useEffect(() => {
    console.log(
      "%c Sheikh Tijan Touray — Portfolio ",
      "color: #ffffff; background: #111111; padding: 10px 14px; border-radius: 6px; font-weight: bold; font-family: monospace; font-size: 13px;"
    );
    console.log(
      "%c👋 Welcome, fellow developer. Thanks for taking the time to explore the code and experience.\n" +
      "  ⌘K  — Open command palette\n" +
      "  Ctrl+Shift+D — Toggle developer overlay & telemetry\n" +
      "  Type 'about' — Toggle developer overlay",
      "color: rgba(255,255,255,0.7); font-family: monospace; font-size: 11px; line-height: 1.7;"
    );

    const notificationTimer = setTimeout(() => {
      sound.playConfirm();
    }, 2000);

    return () => clearTimeout(notificationTimer);
  }, []);

  // 2. Track Window Scroll Progression with GSAP ScrollTrigger, Pinned Backdrop and central timeline
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        pin: "#canvas-fixed-container",
        pinSpacing: false,
        preventOverlaps: true,
        id: 'main-timeline',
      }
    });

    mainTlRef.current = tl;

    tl.eventCallback("onUpdate", () => {
      const progress = tl.progress();

      // Write immediately to shared ref — CinematicCanvas reads this directly without
      // going through React reconciliation, eliminating the 1-3 frame lag that caused
      // the rover's stop/start stepping while scrolling.
      canvasScrollRef.current = progress;

      // Immediate intro overlay dismissal on scroll start
      if (progress > 0.003) {
        if (!hasScrolledRef.current) {
          hasScrolledRef.current = true;
          setHasScrolled(true);
        }
      } else if (progress <= 0.001) {
        if (hasScrolledRef.current) {
          hasScrolledRef.current = false;
          setHasScrolled(false);
        }
      }

      // Section boundary detection — fires only ~6 times across the entire scroll,
      // not on every frame. This is all React state needs to drive the UI.
      let currentSec = 'hero';
      if (progress < TIMELINE_OFFSETS.about.start) {
        currentSec = 'hero';
      } else if (progress >= TIMELINE_OFFSETS.about.start && progress < TIMELINE_OFFSETS.skills.start) {
        currentSec = 'about';
      } else if (progress >= TIMELINE_OFFSETS.skills.start && progress < TIMELINE_OFFSETS.projects.start) {
        currentSec = 'skills';
      } else if (progress >= TIMELINE_OFFSETS.projects.start && progress < TIMELINE_OFFSETS.timeline.start) {
        currentSec = 'projects';
      } else if (progress >= TIMELINE_OFFSETS.timeline.start && progress < TIMELINE_OFFSETS.testimonials.start) {
        currentSec = 'timeline';
      } else if (progress >= TIMELINE_OFFSETS.testimonials.start && progress < TIMELINE_OFFSETS.contact.start) {
        currentSec = 'testimonials';
      } else {
        currentSec = 'contact';
      }

      if (currentSec !== activeSectionRef.current) {
        activeSectionRef.current = currentSec;
        setActiveSection(currentSec);
        setScrollProgress(progress); // state update only on section change
        themeStore.trackVisitedSection(currentSec);
      }
    });

    // Set initial states for all content wrappers to avoid layout flashes
    gsap.set("#about-content", { autoAlpha: 0, y: 60, scale: 0.97, force3D: true });
    gsap.set("#skills-content", { autoAlpha: 0, y: 60, scale: 0.97, force3D: true });
    gsap.set("#projects-content", { autoAlpha: 0, y: 60, scale: 0.97, force3D: true });
    gsap.set("#testimonials-content", { autoAlpha: 0, y: 60, scale: 0.97, force3D: true });
    gsap.set("#timeline-content", { autoAlpha: 0, y: 60, scale: 0.97, force3D: true });
    gsap.set("#contact-content", { autoAlpha: 0, y: 60, scale: 0.97, force3D: true });
    gsap.set(".scanner-line", { top: "0%", opacity: 0 });

    // Anchor the timeline total duration to exactly 1.0
    tl.to({}, { duration: 1.0 }, 0);

    return () => {
      tl.kill();
    };
  }, []);

  // 2b. Responsive section entrance / exit animations via gsap.matchMedia()
  //     Each breakpoint gets its own scrub speed and exit-start timing so sections
  //     stay fully visible for most of their scroll budget on every device.
  useEffect(() => {
    const mm = gsap.matchMedia();

    // Helper: entrance + scanner-line + exit for one section
    const addSection = (
      tl: gsap.core.Timeline,
      id: string,
      sectionStart: number,
      sectionEnd: number | null,
      inDur: number,
      outDur: number,
      exitDelay: number = 1.0,
    ) => {
      tl.fromTo(id,
        { autoAlpha: 0, y: 60, scale: 0.97, force3D: true },
        { autoAlpha: 1, y: 0, scale: 1, duration: inDur, ease: "power2.out" },
        sectionStart - inDur
      );
      tl.fromTo(`${id} .scanner-line`,
        { top: "0%", opacity: 0 },
        {
          keyframes: [
            { top: "20%", opacity: 0.8, duration: 0.25 },
            { top: "80%", opacity: 0.8, duration: 0.5 },
            { top: "100%", opacity: 0, duration: 0.25 }
          ],
          duration: inDur,
          ease: "power1.inOut"
        },
        sectionStart - inDur
      );
      if (sectionEnd !== null) {
        const exitStart = sectionStart + (sectionEnd - sectionStart) * exitDelay;
        tl.to(id,
          { autoAlpha: 0, y: -60, scale: 0.97, duration: outDur, ease: "power2.in" },
          exitStart
        );
      }
    };

    // ── ALL VIEWPORTS (Desktop, Tablet, Mobile) ──
    mm.add("(min-width: 0px)", () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: true, id: "section-timeline" } });
      tl.to({}, { duration: 1.0 }, 0);
      tl.fromTo("#hero-content",
        { autoAlpha: 1, y: 0, scale: 1, force3D: true },
        { autoAlpha: 0, y: -60, scale: 0.97, duration: 0.05, ease: "power2.in" },
        TIMELINE_OFFSETS.hero.end - 0.05
      );
      addSection(tl, "#about-content", TIMELINE_OFFSETS.about.start, TIMELINE_OFFSETS.about.end, 0.04, 0.04, 1.0);
      addSection(tl, "#skills-content", TIMELINE_OFFSETS.skills.start, TIMELINE_OFFSETS.skills.end, 0.04, 0.04, 1.0);
      addSection(tl, "#projects-content", TIMELINE_OFFSETS.projects.start, TIMELINE_OFFSETS.projects.end, 0.04, 0.04, 1.0);
      addSection(tl, "#timeline-content", TIMELINE_OFFSETS.timeline.start, TIMELINE_OFFSETS.timeline.end, 0.04, 0.04, 1.0);
      addSection(tl, "#testimonials-content", TIMELINE_OFFSETS.testimonials.start, TIMELINE_OFFSETS.testimonials.end, 0.04, 0.04, 1.0);

      // Contact content entrance
      tl.fromTo("#contact-content",
        { autoAlpha: 0, y: 60, scale: 0.97, force3D: true },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.04, ease: "power2.out" },
        TIMELINE_OFFSETS.contact.start - 0.04
      );
      return () => tl.kill();
    });

    return () => mm.revert();
  }, []);

  // Track activeSection in ref for event listener closures
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  // Mobile Hidden Touch Swipe Gesture Listener
  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'input' ||
        target.tagName.toLowerCase() === 'textarea' ||
        target.closest('#contact-container')
      ) {
        return;
      }
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY === 0 || touchStartX === 0) return;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const timeDiff = Date.now() - touchStartTime;
      const deltaY = touchEndY - touchStartY;
      const deltaX = touchEndX - touchStartX;
      if (timeDiff < 400 && Math.abs(deltaY) > 55 && Math.abs(deltaY) > Math.abs(deltaX)) {
        const sections = ['hero', 'about', 'skills', 'projects', 'timeline', 'testimonials', 'contact'];
        const currentIndex = sections.indexOf(activeSectionRef.current);
        if (deltaY > 55 && currentIndex > 0) {
          navigateToSection(sections[currentIndex - 1]);
          sound.playTick();
        } else if (deltaY < -55 && currentIndex < sections.length - 1) {
          navigateToSection(sections[currentIndex + 1]);
          sound.playTick();
        }
      }
      touchStartY = 0; touchStartX = 0;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // 3. Capturing Keyboard Easter Eggs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = e.target ? (e.target as HTMLElement).tagName.toLowerCase() : '';
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target as HTMLElement).isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        themeStore.toggleDeveloperMode();
        sound.playConfirm();
        return;
      }
      if (isInput) return;

      // --- KONAMI CODE BUFFER ---
      const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
      konamiBufferRef.current.push(e.key);
      if (konamiBufferRef.current.length > konami.length) konamiBufferRef.current.shift();
      const isKonamiMatch = konami.every((val, index) => val.toLowerCase() === konamiBufferRef.current[index]?.toLowerCase());
      if (isKonamiMatch) {
        setIsKonamiActive(prev => !prev);
        sound.playConfirm();
        konamiBufferRef.current = [];
      }
      // --- "ABOUT" TYPING DETECTION ---
      inputBufferRef.current.push(e.key.toLowerCase());
      if (inputBufferRef.current.length > 5) inputBufferRef.current.shift();
      if (inputBufferRef.current.join('') === 'about') {
        themeStore.toggleDeveloperMode();
        setIsSecretPanelOpen(prev => !prev);
        sound.playConfirm();
        inputBufferRef.current = [];
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogoClick = () => {
    const nextClicks = logoClicks + 1;
    setLogoClicks(nextClicks);
    sound.playTick();
    if (nextClicks >= 3) {
      sound.playConfirm();
      themeStore.unlockAchievement('Curious Mind');
      themeStore.setEnvironment(themeStore.getState().environment === 'aurora' ? 'midnight' : 'aurora');
      setLogoClicks(0);
    }
  };

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sound.setMuted(nextState);
    sound.playConfirm();
  };

  const navigateToSection = (sectionId: string) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const el = document.getElementById(`${sectionId}-anchor`);
    let targetScroll = 0;

    if (el) {
      // getBoundingClientRect accounts for any active 3D transforms applied by the scrub timeline
      targetScroll = el.getBoundingClientRect().top + window.scrollY;
    } else {
      // Fallback: percentage offset from TIMELINE_OFFSETS
      const offset = TIMELINE_OFFSETS[sectionId as keyof typeof TIMELINE_OFFSETS];
      if (offset) targetScroll = offset.start * maxScroll;
    }

    targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
    window.scrollTo({ top: targetScroll, behavior: 'auto' });
  };

  const handleMilestoneReached = (index: number) => {
    sound.playConfirm();
    setGlitchMilestoneIndex(index);
    setIsGlitching(true);
    setTimeout(() => {
      setIsGlitching(false);
      setGlitchMilestoneIndex(null);
    }, 400);
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-white selection:bg-white selection:text-black overflow-x-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only px-4 py-2.5 bg-emerald-500 text-black font-mono text-xs font-bold rounded-xl shadow-2xl border border-white/40 focus:outline-none"
      >
        Skip to main content
      </a>

      <LoadingScreen />

      {/* 3D FIXED CINEMATIC CANVAS BACKDROP */}
      <div id="canvas-fixed-container" className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden" style={{ willChange: 'transform' }}>
        <CinematicCanvas
          scrollProgress={scrollProgress}
          liveScrollRef={canvasScrollRef}
          activeSection={activeSection}
          isKonamiActive={isKonamiActive}
          isAlternateTheme={isAlternateTheme}
          timelineEvents={TIMELINE_EVENTS}
          isGlitching={isGlitching}
          isDroneView={isDroneView}
        />
      </div>

      {/* FIXED HEADER (Glass bar) */}
      <header
        className="fixed top-0 left-0 right-0 h-16 border-b border-white/8 bg-black/50 backdrop-blur-2xl z-40 px-6 flex items-center justify-between"
        style={{ boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.06), 0 1px 0 rgba(0,0,0,0.4)' }}
      >

        {/* LOGO — STT monogram (3 clicks alternate theme) */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Minimal monogram mark */}
          <div className={`relative w-8 h-8 flex items-center justify-center rounded-xl border transition-all duration-300 shadow-sm ${isKonamiActive ? 'border-purple-500/60 bg-purple-500/10 shadow-purple-500/20' :
            isAlternateTheme ? 'border-sky-400/60 bg-sky-400/10 shadow-sky-400/20' :
              'border-white/20 bg-white/6 group-hover:border-white/50 group-hover:bg-white/12 group-hover:shadow-white/10'
            }`}>
            <span className={`font-sans text-[11px] font-bold tracking-tight leading-none ${isKonamiActive ? 'text-purple-400' : isAlternateTheme ? 'text-sky-400' : 'text-white'
              }`}>ST</span>
          </div>
          {/* Name wordmark */}
          <div className="flex flex-col leading-none">
            <span className={`font-sans text-[12px] font-semibold tracking-wide transition-all duration-300 ${isKonamiActive ? 'text-purple-300' : isAlternateTheme ? 'text-sky-300' : 'text-white/90 group-hover:text-white'
              }`}>Sheikh Tijan</span>
            {logoClicks > 0 && logoClicks < 3 && (
              <span className="font-mono text-[8px] text-white/25 mt-0.5">{logoClicks} / 3</span>
            )}
          </div>
        </div>

        {/* CONTROLS AREA (Mute / HUD trigger) */}
        <div className="flex items-center gap-3">

          {/* Resume Viewer Trigger */}
          <button
            onClick={() => { setIsResumeOpen(true); sound.playConfirm(); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 border border-emerald-500/30 hover:border-emerald-400/60 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-[0.96] rounded-full font-mono text-[11px] text-emerald-300 transition-all duration-200 cursor-pointer"
            title="View Curriculum Vitae"
          >
            <FileText size={12} className="text-emerald-400" />
            <span>Resume</span>
          </button>

          {/* Command palette trigger */}
          <button
            onClick={() => setIsPaletteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:border-white/35 bg-white/3 hover:bg-white/8 active:scale-[0.96] rounded-full font-sans text-[11px] text-white/60 hover:text-white transition-all duration-200 cursor-pointer"
          >
            <span className="hidden sm:inline text-white/35 text-[10px] font-mono">⌘K</span>
            <span className="sm:hidden font-mono text-[10px]">Menu</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleMute}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-[0.96] ${isMuted ? 'border-white/10 text-white/35 hover:border-white/35 hover:text-white/70' : 'border-white/35 text-white/80 hover:bg-white/8'
              }`}
            title={isMuted ? "Enable audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        </div>
      </header>

      {/* FLOATING VERTICAL SECTIONS TRACKER INDICATOR */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4 z-40 font-sans text-[10px] select-none">
        {[
          { id: 'hero', label: '01 — Home' },
          { id: 'about', label: '02 — Who I Am' },
          { id: 'skills', label: '03 — Toolkit' },
          { id: 'projects', label: '04 — Selected Work' },
          { id: 'timeline', label: '05 — Journey' },
          { id: 'testimonials', label: '06 — Reviews' },
          { id: 'contact', label: '07 — Contact' }
        ].map((item) => {
          const isActive = activeSection === item.id;

          // Theme-aware dynamic colors synchronized with active visual overrides
          const themeAccentColor = isKonamiActive
            ? 'rgba(168, 85, 247, 1)'
            : isAlternateTheme
              ? 'rgba(14, 165, 233, 1)'
              : 'rgba(255, 255, 255, 1)';

          const themeAccentShadow = isKonamiActive
            ? '0 0 10px rgba(168, 85, 247, 0.8)'
            : isAlternateTheme
              ? '0 0 10px rgba(14, 165, 233, 0.8)'
              : '0 0 10px rgba(255, 255, 255, 0.8)';

          const themeDimColor = isKonamiActive
            ? 'rgba(168, 85, 247, 0.25)'
            : isAlternateTheme
              ? 'rgba(14, 165, 233, 0.25)'
              : 'rgba(255, 255, 255, 0.2)';

          return (
            <button
              key={item.id}
              onClick={() => navigateToSection(item.id)}
              className="group flex items-center justify-end cursor-pointer relative py-1 focus:outline-none"
              style={{ height: '24px' }}
            >
              <div className="flex items-center gap-3 relative">

                {/* Subtle horizontal sliding telemetry dash indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeHorizontalTelemetryDash"
                    className="h-[1px] rounded"
                    style={{
                      backgroundColor: themeAccentColor,
                      boxShadow: themeAccentShadow,
                      width: '12px'
                    }}
                    initial={{ x: 10, opacity: 0, scaleX: 0 }}
                    animate={{ x: 0, opacity: 0.85, scaleX: 1 }}
                    exit={{ x: -10, opacity: 0, scaleX: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 24,
                      layout: { type: "spring", stiffness: 220, damping: 28 }
                    }}
                  />
                )}

                {/* Animated Section Label with horizontal spring slide */}
                <motion.span
                  animate={{
                    x: isActive ? -4 : 0,
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.30)',
                  }}
                  transition={{ type: "spring", stiffness: 320, damping: 25 }}
                  className={`font-sans text-[9px] tracking-normal transition-colors duration-200 ${isActive ? 'font-medium text-white' : 'group-hover:text-white/60'
                    }`}
                >
                  {item.label}
                </motion.span>

                {/* Dot indicator container with horizontal sliding reticle ring */}
                <div className="relative w-4 h-4 flex items-center justify-center">

                  {/* Sliding outer reticle ring with spring interpolation */}
                  {isActive && (
                    <motion.div
                      layoutId="activeReticleRing"
                      className="absolute rounded-full border"
                      style={{
                        borderColor: themeAccentColor,
                        boxShadow: themeAccentShadow,
                        width: '14px',
                        height: '14px'
                      }}
                      initial={{ scale: 0.4, x: 8, opacity: 0 }}
                      animate={{ scale: 1, x: 0, opacity: 1 }}
                      exit={{ scale: 0.4, x: -8, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 22,
                        layout: { type: "spring", stiffness: 220, damping: 28 }
                      }}
                    />
                  )}

                  {/* High-contrast telemetry dot */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.25 : 1,
                      x: isActive ? -1 : 0,
                      backgroundColor: isActive ? themeAccentColor : 'transparent',
                      borderColor: isActive ? themeAccentColor : themeDimColor
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 24 }}
                    className="w-1.5 h-1.5 rounded-full border"
                    style={{
                      boxShadow: isActive ? themeAccentShadow : 'none'
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* INTRO OVERLAY — fades out immediately as soon as the user begins scrolling */}
      <AnimatePresence>
        {!hasScrolled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-end pb-16 pointer-events-none select-none"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-3"
            >
              <span className="font-sans text-[12px] font-light tracking-[0.25em] text-white/50 uppercase">
                Scroll to explore
              </span>
              <ArrowDown size={12} className="text-white/30" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN COGNITIVE FLOW - VERTICALLY STACKED CONTENT WINDOWS */}
      <main id="main-content" tabIndex={-1} role="main" className="relative z-10 focus:outline-none">

        {/* SECTION 1: HERO */}
        <section id="hero-anchor" className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative">
          <div id="hero-content" className="w-full flex flex-col items-center justify-center text-center relative h-full">
            <div className="space-y-6 max-w-4xl">
              <h1 className="select-none leading-none font-sans">
                <DepthText
                  text={personalData.name}
                  layers={34}
                  depth={2.4}
                  faceColor="#ffffff"
                  depthColor="#10b981"
                  tilt={7.5}
                  pointerTracking={true}
                  smoothing={0.14}
                  perspective={900}
                  autoOrbit={true}
                  orbitSpeed={0.35}
                  fontSize="clamp(1.75rem, 7vw, 5rem)"
                  fontWeight={900}
                  shadow={true}
                />
              </h1>
              <p className="text-white/70 text-sm sm:text-base font-sans max-w-2xl mx-auto leading-[1.8] font-light">
                {personalData.title}. Crafting polished digital experiences that combine thoughtful design, smooth interactions, and scalable engineering.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: ABOUT */}
        <section id="about-anchor" className="relative min-h-screen flex flex-col justify-center py-12 overflow-hidden">
          <div id="about-content" className="w-full relative">
            <div className="scanner-line absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 pointer-events-none z-30" />
            <AboutHologram
              scrollProgress={scrollProgress}
              liveScrollRef={canvasScrollRef}
              onOpenResume={() => setIsResumeOpen(true)}
            />
          </div>
        </section>

        {/* SECTION 3: SKILLS */}
        <section id="skills-anchor" className="relative min-h-screen flex flex-col justify-center py-12 overflow-hidden">
          <div id="skills-content" className="w-full relative">
            <div className="scanner-line absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 pointer-events-none z-30" />
            <Skills3D />
          </div>
        </section>

        {/* SECTION 4: PROJECTS */}
        <section id="projects-anchor" className="relative min-h-screen flex flex-col justify-center py-12 overflow-hidden">
          <div id="projects-content" className="w-full relative">
            <div className="scanner-line absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 pointer-events-none z-30" />
            <ProjectsExhibition
              scrollProgress={scrollProgress}
              onInspectProject={(proj) => {
                setInspectedProject(proj);
                themeStore.trackInspectedProject(proj.id, 4);
              }}
            />
          </div>
        </section>

        {/* SECTION 5: EXPERIENCE */}
        <section id="timeline-anchor" className="relative min-h-screen flex flex-col justify-center py-12 overflow-hidden">
          <div id="timeline-content" className="w-full relative">
            <div className="scanner-line absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 pointer-events-none z-30" />
            <TimelinePath scrollProgress={scrollProgress} onMilestoneReached={handleMilestoneReached} />
          </div>
        </section>

        {/* SECTION 6: TESTIMONIALS */}
        <section id="testimonials-anchor" className="relative min-h-screen flex flex-col justify-center py-12 overflow-hidden">
          <div id="testimonials-content" className="w-full relative">
            <div className="scanner-line absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 pointer-events-none z-30" />
            <TestimonialsWall />
          </div>
        </section>

        {/* SECTION 7: CONTACT */}
        <section id="contact-anchor" className="relative min-h-screen flex flex-col justify-center py-12 overflow-hidden">
          <div id="contact-content" className="w-full relative">
            <div className="scanner-line absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 pointer-events-none z-30" />
            <ContactTerminal />
          </div>
        </section>

        {/* SECTION 7: END OF JOURNEY CLOSURE */}
        <section className="relative py-20 px-4 flex justify-center">
          <div className="w-full max-w-2xl text-center space-y-6">
            {/* ST Monogram Glow */}
            <div className="w-12 h-12 rounded-2xl border border-white/30 bg-white/5 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.15)] mx-auto">
              <span className="font-sans text-base font-bold text-white tracking-tight">ST</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-sans font-bold text-white">
                Thanks for visiting.
              </h3>
              <p className="text-white/60 text-sm font-sans max-w-md mx-auto">
                Let's build something meaningful together.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => navigateToSection('contact')}
                className="px-5 py-2.5 rounded-full border border-white/20 bg-white/10 hover:bg-white hover:text-black text-white text-xs font-mono transition-all cursor-pointer"
              >
                Send Message
              </button>

              <button
                onClick={() => navigateToSection('hero')}
                className="px-4 py-2.5 rounded-full border border-white/10 text-white/40 hover:text-white text-xs font-mono transition-all cursor-pointer"
              >
                Return to Top ↑
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* PHASE 2 COMPONENTS & HUD POPUPS */}
      <Suspense fallback={null}><ThemeStudio /></Suspense>

      <AchievementToasts />

      <EndingSequence scrollProgress={scrollProgress} />

      <Suspense fallback={null}>
        <ProjectShowcaseModal
          project={inspectedProject}
          onClose={() => setInspectedProject(null)}
        />
      </Suspense>

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onNavigate={navigateToSection}
      />

      <Suspense fallback={null}>
        <SecretDeveloperPanel
          isOpen={isSecretPanelOpen}
          onClose={() => {
            setIsSecretPanelOpen(false);
            if (themeStore.getState().developerMode) {
              themeStore.toggleDeveloperMode();
            }
          }}
          scrollProgress={scrollProgress}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ResumeModal
          isOpen={isResumeOpen}
          onClose={() => setIsResumeOpen(false)}
        />
      </Suspense>
    </div>
  );
}

