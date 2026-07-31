/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
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
  FileText
} from 'lucide-react';

import { sound } from './components/SoundManager';
import { CinematicCanvas } from './components/CinematicCanvas';
import { AboutHologram } from './components/AboutHologram';
import { Skills3D } from './components/Skills3D';
import { ProjectsExhibition } from './components/ProjectsExhibition';
import { TimelinePath } from './components/TimelinePath';
import { ContactTerminal } from './components/ContactTerminal';
import { CommandPalette } from './components/CommandPalette';
import { SecretDeveloperPanel } from './components/SecretDeveloperPanel';
import { ThemeStudio } from './components/ThemeStudio';
import { AchievementToasts } from './components/AchievementToasts';
import { ProjectShowcaseModal } from './components/ProjectShowcaseModal';
import { EndingSequence } from './components/EndingSequence';
import { LoadingScreen } from './components/LoadingScreen';
import { ResumeModal } from './components/ResumeModal';
import { themeStore } from './themeStore';
import { TimelineEvent, Project } from './types';
import { TIMELINE_OFFSETS } from './constants';

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'm1',
    chapterTitle: 'Chapter 01 — The Beginning',
    year: '2023 - 2024',
    title: 'Frontend & Web Foundations',
    company: 'FreeCodeCamp & Scrimba',
    description: 'Mastered web standards, HTML5/CSS3 semantics, core JavaScript algorithms, and responsive layout architectures through intensive practice and certification courses.',
    coordinates: { x: -30, y: -15, z: 723 }
  },
  {
    id: 'm2',
    chapterTitle: 'Chapter 02 — Building Momentum',
    year: '2024',
    title: 'Advanced React & TypeScript Ecosystems',
    company: 'Jasseh Code Camp (JCC)',
    description: 'Deepened expertise in production React patterns, Next.js App Router, TypeScript type safety, and team Git workflows during hands-on bootcamps.',
    coordinates: { x: 20, y: -15, z: 770 }
  },
  {
    id: 'm3',
    chapterTitle: 'Chapter 03 — Creating Experiences',
    year: '2024 - PRESENT',
    title: 'Frontend Engineer & Freelance Creator',
    company: 'Independent & Client Projects',
    description: 'Designing and deploying interactive, high-performance web applications featuring 3D physics canvas integration, smooth GSAP animations, and production UI polish.',
    coordinates: { x: 5, y: -15, z: 836 }
  }
];

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [isMuted, setIsMuted] = useState(true);
  const [isAlternateTheme, setIsAlternateTheme] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [isKonamiActive, setIsKonamiActive] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSecretPanelOpen, setIsSecretPanelOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isDroneView, setIsDroneView] = useState(true);
  const [inspectedProject, setInspectedProject] = useState<Project | null>(null);

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
        scrub: 2.5, // Cinematic weighted momentum
        pin: "#canvas-fixed-container",
        pinSpacing: false,
      }
    });

    tl.eventCallback("onUpdate", () => {
      const progress = tl.progress();
      setScrollProgress(progress);

      let currentSec = 'hero';
      // Map progress to active layout section name using centralized TIMELINE_OFFSETS
      if (progress < TIMELINE_OFFSETS.about.start) {
        currentSec = 'hero';
      } else if (progress >= TIMELINE_OFFSETS.about.start && progress < TIMELINE_OFFSETS.skills.start) {
        currentSec = 'about';
      } else if (progress >= TIMELINE_OFFSETS.skills.start && progress < TIMELINE_OFFSETS.projects.start) {
        currentSec = 'skills';
      } else if (progress >= TIMELINE_OFFSETS.projects.start && progress < TIMELINE_OFFSETS.timeline.start) {
        currentSec = 'projects';
      } else if (progress >= TIMELINE_OFFSETS.timeline.start && progress < TIMELINE_OFFSETS.contact.start) {
        currentSec = 'timeline';
      } else {
        currentSec = 'contact';
      }

      setActiveSection(currentSec);
      themeStore.trackVisitedSection(currentSec);
    });

    // Set initial states for all content wrappers to avoid layout flashes
    gsap.set("#about-content", { autoAlpha: 0, y: 120, rotateX: 12, scale: 0.94, transformPerspective: 1200, transformOrigin: "50% 100%" });
    gsap.set("#skills-content", { autoAlpha: 0, y: 120, rotateX: 12, scale: 0.94, transformPerspective: 1200, transformOrigin: "50% 100%" });
    gsap.set("#projects-content", { autoAlpha: 0, y: 120, rotateX: 12, scale: 0.94, transformPerspective: 1200, transformOrigin: "50% 100%" });
    gsap.set("#timeline-content", { autoAlpha: 0, y: 120, rotateX: 12, scale: 0.94, transformPerspective: 1200, transformOrigin: "50% 100%" });
    gsap.set("#contact-content", { autoAlpha: 0, y: 120, rotateX: 12, scale: 0.94, transformPerspective: 1200, transformOrigin: "50% 100%" });
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
        { autoAlpha: 0, y: 120, rotateX: 12, scale: 0.94, transformPerspective: 1200, transformOrigin: "50% 100%" },
        { autoAlpha: 1, y: 0, rotateX: 0, scale: 1, duration: inDur, ease: "power2.out" },
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
          { autoAlpha: 0, y: -120, rotateX: -12, scale: 0.94, duration: outDur, ease: "power2.in", transformOrigin: "50% 0%" },
          exitStart
        );
      }
    };

    // ── DESKTOP ≥1024px ── original cinematic feel, exit at section boundary
    mm.add("(min-width: 1024px)", () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 2.5 } });
      tl.to({}, { duration: 1.0 }, 0);
      tl.fromTo("#hero-content",
        { autoAlpha: 1, y: 0, rotateX: 0, scale: 1, transformPerspective: 1200, transformOrigin: "50% 50%" },
        { autoAlpha: 0, y: -120, rotateX: -12, scale: 0.94, duration: TIMELINE_OFFSETS.hero.end, ease: "power2.inOut" }, 0
      );
      addSection(tl, "#about-content",    TIMELINE_OFFSETS.about.start,    TIMELINE_OFFSETS.about.end,    0.04, 0.04, 1.0);
      addSection(tl, "#skills-content",   TIMELINE_OFFSETS.skills.start,   TIMELINE_OFFSETS.skills.end,   0.04, 0.04, 1.0);
      addSection(tl, "#projects-content", TIMELINE_OFFSETS.projects.start, TIMELINE_OFFSETS.projects.end, 0.04, 0.04, 1.0);
      addSection(tl, "#timeline-content", TIMELINE_OFFSETS.timeline.start, TIMELINE_OFFSETS.timeline.end, 0.04, 0.04, 1.0);
      addSection(tl, "#contact-content",  TIMELINE_OFFSETS.contact.start,  null,                          0.04, 0.04);
      return () => tl.kill();
    });

    // ── TABLET 768–1023px ── scrub 1.8, exit after 82% of section
    mm.add("(min-width: 768px) and (max-width: 1023px)", () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1.8 } });
      tl.to({}, { duration: 1.0 }, 0);
      tl.fromTo("#hero-content",
        { autoAlpha: 1, y: 0, rotateX: 0, scale: 1, transformPerspective: 1200, transformOrigin: "50% 50%" },
        { autoAlpha: 0, y: -80, rotateX: -8, scale: 0.96, duration: TIMELINE_OFFSETS.hero.end, ease: "power2.inOut" }, 0
      );
      addSection(tl, "#about-content",    TIMELINE_OFFSETS.about.start,    TIMELINE_OFFSETS.about.end,    0.035, 0.032, 0.82);
      addSection(tl, "#skills-content",   TIMELINE_OFFSETS.skills.start,   TIMELINE_OFFSETS.skills.end,   0.035, 0.032, 0.82);
      addSection(tl, "#projects-content", TIMELINE_OFFSETS.projects.start, TIMELINE_OFFSETS.projects.end, 0.035, 0.032, 0.82);
      addSection(tl, "#timeline-content", TIMELINE_OFFSETS.timeline.start, TIMELINE_OFFSETS.timeline.end, 0.035, 0.032, 0.82);
      addSection(tl, "#contact-content",  TIMELINE_OFFSETS.contact.start,  null,                          0.035, 0.032);
      return () => tl.kill();
    });

    // ── MOBILE <768px ── scrub 1.2, exit after 80% of section, reduced y/rotation
    mm.add("(max-width: 767px)", () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1.2 } });
      tl.to({}, { duration: 1.0 }, 0);
      tl.fromTo("#hero-content",
        { autoAlpha: 1, y: 0, rotateX: 0, scale: 1, transformPerspective: 800, transformOrigin: "50% 50%" },
        { autoAlpha: 0, y: -60, rotateX: -6, scale: 0.97, duration: TIMELINE_OFFSETS.hero.end, ease: "power2.inOut" }, 0
      );
      addSection(tl, "#about-content",    TIMELINE_OFFSETS.about.start,    TIMELINE_OFFSETS.about.end,    0.03, 0.028, 0.80);
      addSection(tl, "#skills-content",   TIMELINE_OFFSETS.skills.start,   TIMELINE_OFFSETS.skills.end,   0.03, 0.028, 0.80);
      addSection(tl, "#projects-content", TIMELINE_OFFSETS.projects.start, TIMELINE_OFFSETS.projects.end, 0.03, 0.028, 0.80);
      addSection(tl, "#timeline-content", TIMELINE_OFFSETS.timeline.start, TIMELINE_OFFSETS.timeline.end, 0.03, 0.028, 0.80);
      addSection(tl, "#contact-content",  TIMELINE_OFFSETS.contact.start,  null,                          0.03, 0.028);
      return () => tl.kill();
    });

    return () => mm.revert();
  }, []);

  // Track activeSection in ref for event listener closures
  const activeSectionRef = useRef(activeSection);
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  // Mobile Hidden Touch Swipe Gesture Listener to jump between sections
  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // Skip gesture parsing if typing in input, textareas, or inside contact terminal interactive panel
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

      // Filter for fast swipes (under 400ms) with a significant vertical displacement threshold (at least 55px)
      if (timeDiff < 400 && Math.abs(deltaY) > 55 && Math.abs(deltaY) > Math.abs(deltaX)) {
        const sections = ['hero', 'about', 'skills', 'projects', 'timeline', 'contact'];
        const currentIndex = sections.indexOf(activeSectionRef.current);

        if (deltaY > 55) {
          // Swipe Down (finger moves down) -> Go to Previous Section
          if (currentIndex > 0) {
            e.preventDefault();
            const prevSection = sections[currentIndex - 1];
            navigateToSection(prevSection);
            sound.playTick();
          }
        } else if (deltaY < -55) {
          // Swipe Up (finger moves up) -> Go to Next Section
          if (currentIndex < sections.length - 1) {
            e.preventDefault();
            const nextSection = sections[currentIndex + 1];
            navigateToSection(nextSection);
            sound.playTick();
          }
        }
      }

      // Reset coordinates
      touchStartY = 0;
      touchStartX = 0;
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
      // Avoid triggering when user is actively typing in form inputs/textarea/etc.
      const tag = e.target ? (e.target as HTMLElement).tagName.toLowerCase() : '';
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target as HTMLElement).isContentEditable;

      // Handle Cmd+K or Ctrl+K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
        return;
      }

      // Handle Ctrl+Shift+D for Developer Mode telemetry overlay
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
      if (konamiBufferRef.current.length > konami.length) {
        konamiBufferRef.current.shift();
      }
      
      const isKonamiMatch = konami.every((val, index) => val.toLowerCase() === konamiBufferRef.current[index]?.toLowerCase());
      if (isKonamiMatch) {
        setIsKonamiActive(prev => !prev);
        sound.playConfirm();
        konamiBufferRef.current = []; // clear
      }

      // --- "ABOUT" TYPING DETECTION — opens Developer Overlay ---
      inputBufferRef.current.push(e.key.toLowerCase());
      if (inputBufferRef.current.length > 5) {
        inputBufferRef.current.shift();
      }

      const typedWord = inputBufferRef.current.join('');
      if (typedWord === 'about') {
        themeStore.toggleDeveloperMode();
        // Mirror state so the SecretDeveloperPanel opens immediately
        setIsSecretPanelOpen(prev => !prev);
        sound.playConfirm();
        inputBufferRef.current = [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 4. Interactive Theme Toggle (clicking Logo 3 times)
  const handleLogoClick = () => {
    const nextClicks = logoClicks + 1;
    setLogoClicks(nextClicks);
    sound.playTick();

    if (nextClicks >= 3) {
      sound.playConfirm();
      themeStore.unlockAchievement('Curious Mind');
      themeStore.setEnvironment(themeStore.getState().environment === 'aurora' ? 'midnight' : 'aurora');
      setLogoClicks(0); // Reset
    }
  };

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sound.setMuted(nextState);
    sound.playConfirm();
  };

  const navigateToSection = (sectionId: string) => {
    const el = document.getElementById(`${sectionId}-anchor`);
    if (el) {
      const rect = el.getBoundingClientRect();
      const targetScroll = window.scrollY + rect.top;
      
      const scrollObj = { y: window.scrollY };
      gsap.to(scrollObj, {
        y: targetScroll,
        duration: 1.5,
        ease: 'power3.inOut',
        onUpdate: () => {
          window.scrollTo(0, scrollObj.y);
        }
      });
    }
  };

  const handleMilestoneReached = (_index: number) => {
    sound.playConfirm();
  };

  // Section visibilities are now managed directly by a centralized GSAP scroll timeline.

  return (
    <div className="relative min-h-screen bg-[#030303] text-white selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* SKIP TO CONTENT LINK (ACCESSIBILITY) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only px-4 py-2.5 bg-emerald-500 text-black font-mono text-xs font-bold rounded-xl shadow-2xl border border-white/40 focus:outline-none"
      >
        Skip to main content
      </a>

      {/* PHASE 3 — PREMIUM LOADING SCREEN */}
      <LoadingScreen />

      {/* 3D FIXED CINEMATIC CANVAS BACKDROP */}
      <div id="canvas-fixed-container" className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <CinematicCanvas
          scrollProgress={scrollProgress}
          activeSection={activeSection}
          isKonamiActive={isKonamiActive}
          isAlternateTheme={isAlternateTheme}
          timelineEvents={TIMELINE_EVENTS}
          isGlitching={false}
          isDroneView={isDroneView}
        />
      </div>

      {/* FIXED HEADER (Glass bar) */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-black/45 backdrop-blur-md z-40 px-6 flex items-center justify-between">
        
        {/* LOGO — STT monogram (10 clicks alternate theme) */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Minimal monogram mark */}
          <div className={`relative w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-300 ${
            isKonamiActive ? 'border-purple-500/60 bg-purple-500/10' :
            isAlternateTheme ? 'border-sky-400/60 bg-sky-400/10' :
            'border-white/20 bg-white/5 group-hover:border-white/50 group-hover:bg-white/10'
          }`}>
            <span className={`font-sans text-[11px] font-bold tracking-tight leading-none ${
              isKonamiActive ? 'text-purple-400' : isAlternateTheme ? 'text-sky-400' : 'text-white'
            }`}>ST</span>
          </div>
          {/* Name wordmark */}
          <div className="flex flex-col leading-none">
            <span className={`font-sans text-[12px] font-semibold tracking-wide transition-all duration-300 ${
              isKonamiActive ? 'text-purple-300' : isAlternateTheme ? 'text-sky-300' : 'text-white/90 group-hover:text-white'
            }`}>Sheikh Touray</span>
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
            className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-full font-mono text-[11px] text-emerald-300 transition-all cursor-pointer"
            title="View Curriculum Vitae"
          >
            <FileText size={12} className="text-emerald-400" />
            <span>Resume</span>
          </button>

          {/* Command palette trigger */}
          <button 
            onClick={() => setIsPaletteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:border-white/40 bg-white/3 hover:bg-white/8 rounded-full font-sans text-[11px] text-white/60 hover:text-white transition-all"
          >
            <span className="hidden sm:inline text-white/35 text-[10px] font-mono">⌘K</span>
            <span className="sm:hidden font-mono text-[10px]">Menu</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleMute}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${isMuted ? 'border-white/10 text-white/35 hover:border-white/35 hover:text-white/70' : 'border-white/35 text-white/80 hover:bg-white/8'}`}
            title={isMuted ? "Enable audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        </div>
      </header>

      {/* FLOATING VERTICAL SECTIONS TRACKER INDICATOR */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-5 z-40 font-sans text-[9px] select-none">
        {[
          { id: 'hero',     label: '01 — Home' },
          { id: 'about',    label: '02 — Who I Am' },
          { id: 'skills',   label: '03 — Toolkit' },
          { id: 'projects', label: '04 — Selected Work' },
          { id: 'timeline', label: '05 — Journey' },
          { id: 'contact',  label: '06 — Contact' }
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
                  className={`font-sans text-[9px] tracking-normal transition-colors duration-200 ${
                    isActive ? 'font-medium text-white' : 'group-hover:text-white/60'
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

      {/* INTRO OVERLAY — fades as soon as the user scrolls */}
      <AnimatePresence>
        {scrollProgress < 0.015 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
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
            <div className="space-y-5 max-w-4xl">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans tracking-[2px] sm:tracking-[4px] md:tracking-[6px] font-bold text-white select-none leading-tight">
                Sheikh Tijan Touray
              </h1>
              <p className="text-white/55 text-sm sm:text-base font-sans max-w-xl mx-auto leading-relaxed font-light">
                Frontend Engineer crafting refined, interactive web experiences with React, Next.js, and TypeScript.
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

        {/* SECTION 6: CONTACT */}
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
      <ThemeStudio />

      <AchievementToasts />

      <EndingSequence scrollProgress={scrollProgress} />

      <ProjectShowcaseModal
        project={inspectedProject}
        onClose={() => setInspectedProject(null)}
      />

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onNavigate={navigateToSection}
      />

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

      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />

    </div>
  );
}

