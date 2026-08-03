/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { sound } from './SoundManager';
import { TimelineEvent } from '../types';
import {
  themeStore,
  ENVIRONMENT_CONFIGS,
  ROVER_FINISH_CONFIGS,
  ROAD_ACCENT_CONFIGS,
} from '../themeStore';

interface CinematicCanvasProps {
  scrollProgress: number; // 0 to 1
  activeSection: string;
  isKonamiActive: boolean;
  isAlternateTheme: boolean;
  timelineEvents: TimelineEvent[];
  isGlitching?: boolean;
  isDroneView?: boolean;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  size: number;
  speedY: number;
  alpha: number;
}

export const CinematicCanvas: React.FC<CinematicCanvasProps> = ({
  scrollProgress,
  activeSection,
  isKonamiActive,
  isAlternateTheme,
  timelineEvents,
  isGlitching = false,
  isDroneView = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 }); // Current and target mouse positions (normalized -1 to 1)
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Refs for props to prevent canvas recreation on every update
  const scrollProgressRef = useRef(scrollProgress);
  const isKonamiActiveRef = useRef(isKonamiActive);
  const isAlternateThemeRef = useRef(isAlternateTheme);
  const isGlitchingRef = useRef(isGlitching);
  const isDroneViewRef = useRef(isDroneView);

  // Keep refs in sync
  useEffect(() => { scrollProgressRef.current = scrollProgress; }, [scrollProgress]);
  useEffect(() => { isKonamiActiveRef.current = isKonamiActive; }, [isKonamiActive]);
  useEffect(() => { isAlternateThemeRef.current = isAlternateTheme; }, [isAlternateTheme]);
  useEffect(() => { isGlitchingRef.current = isGlitching; }, [isGlitching]);
  useEffect(() => { isDroneViewRef.current = isDroneView; }, [isDroneView]);

  // Dimension ref and ResizeObserver
  const dimsRef = useRef({ width: 0, height: 0, needsResize: false });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      dimsRef.current = {
        width: Math.floor(width),
        height: Math.floor(height),
        needsResize: true,
      };
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Animation states that we interpolate smoothly with physical autonomous vehicle kinematics & cinematic camera rig dynamics
  const stateRef = useRef({
    lerpScroll: 0,
    scrollVelocity: 0,
    cameraYaw: -0.4,
    cameraPitch: 0.25,
    cameraDist: 150,
    camX: 0,
    camY: -50,
    camZ: -100,
    camVelX: 0,
    camVelY: 0,
    camVelZ: 0,
    camFocal: 450,
    roverWheelRotation: 0,
    leftWheelRot: 0,
    rightWheelRot: 0,
    steerAngle: 0,
    pitch: 0,
    roll: 0,
    vibrationX: 0,
    vibrationY: 0,
    suspensionFL: 0,
    suspensionFR: 0,
    suspensionML: 0,
    suspensionMR: 0,
    suspensionRL: 0,
    suspensionRR: 0,
    roverX: 0,
    roverY: 0,
    roverZ: 0,
    lightIntensity: 1.0,
    time: 0,
    droneProgress: 1, // 1 = overhead drone orthographic cam (drone view only)
  });

  // Smoothly toggle drone view transition using GSAP
  useEffect(() => {
    gsap.to(stateRef.current, {
      droneProgress: isDroneView ? 1 : 0,
      duration: 1.5,
      ease: "power2.inOut",
    });
  }, [isDroneView]);

  // Track cursor movement for camera orbit offset and sensor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      // Normalize coordinate: center is (0, 0), bounds are -1 to 1
      mouseRef.current.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.ty = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Generate floating dust particles
    const particles: Particle[] = [];
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 600,
        y: (Math.random() - 0.7) * 400,
        z: Math.random() * 1200,
        size: Math.random() * 1.5 + 0.5,
        speedY: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    // Glowing tire trails left by the Rover wheels
    const wheelTrails: { left: Point3D; right: Point3D; age: number }[] = [];

    // Parametric winding road path logic
    // Path center coordinate (X, Y) at any depth Z
    const getPathPoint = (z: number): Point3D => {
      // Create interesting rolling hills and curves
      const x = Math.sin(z * 0.006) * 70 + Math.cos(z * 0.002) * 40;
      const y = Math.sin(z * 0.003) * 20 - 15; // Raised slightly above ground plane
      return { x, y, z };
    };

    // Calculate tangent vector along the path for facing direction
    const getPathTangent = (z: number): Point3D => {
      const step = 2;
      const p1 = getPathPoint(z - step);
      const p2 = getPathPoint(z + step);
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dz = p2.z - p1.z;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      return { x: dx / len, y: dy / len, z: dz / len };
    };

    // Procedural terrain elevation map for micro-suspension calculations
    const getTerrainHeight = (x: number, z: number): number => {
      return Math.sin(z * 0.12) * 0.45 + Math.cos(z * 0.28 + x * 0.1) * 0.3 + Math.sin(z * 0.52) * 0.15;
    };

    // Main Draw & Update Loop
    const render = () => {
      stateRef.current.time += 0.01;
      const time = stateRef.current.time;

      // Smoothly lerp mouse position for organic physics feel
      const mouse = mouseRef.current;
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      // Checkpoint milestone locations (progress 0 to 1) for gentle autonomous deceleration
      const checkpoints = [0.0, 0.16, 0.32, 0.50, 0.68, 0.85, 1.0];
      const targetProgress = scrollProgressRef.current;
      const currentProgress = stateRef.current.lerpScroll;
      const error = targetProgress - currentProgress;
      const currentVel = stateRef.current.scrollVelocity || 0;

      // Find proximity to closest checkpoint
      let minCheckpointDist = 1.0;
      for (let i = 0; i < checkpoints.length; i++) {
        const dist = Math.abs(currentProgress - checkpoints[i]);
        if (dist < minCheckpointDist) minCheckpointDist = dist;
      }

      // Dynamic checkpoint deceleration: apply extra autonomous dampener near section milestones when slowing down
      const isApproachingStop = Math.abs(error) < 0.04;
      const isNearCheckpoint = minCheckpointDist < 0.035;
      const checkpointDamp = (isApproachingStop && isNearCheckpoint) ? 0.46 : 0.28;

      // Progressive torque spooling curve: smooth acceleration from rest
      const velMag = Math.abs(currentVel);
      const tractionBoost = velMag < 0.001 ? Math.min(1.0, Math.abs(error) * 15.0) : 1.0;

      const springK = 0.095 * tractionBoost;
      const mass = 4.8;        // Substantial kinematic mass representing heavy autonomous vehicle
      const dampingB = checkpointDamp;

      const pullForce = error * springK;
      const dampingForce = currentVel * dampingB;
      const netForce = pullForce - dampingForce;

      const acceleration = netForce / mass;
      const newVel = currentVel + acceleration;
      let newProgress = currentProgress + newVel;

      // Handle terminal boundaries with soft kinetic spring compression bounce
      if (newProgress <= 0) {
        newProgress = 0;
        stateRef.current.scrollVelocity = -newVel * 0.12; // Elastic wall bump
      } else if (newProgress >= 1) {
        newProgress = 1;
        stateRef.current.scrollVelocity = -newVel * 0.12; // Elastic wall bump
      } else {
        stateRef.current.scrollVelocity = newVel;
      }

      stateRef.current.lerpScroll = newProgress;
      const p = newProgress;

      // Update spatialized mechanical motor hum parameters synchronized with kinematics
      sound.updateMotorHum(newVel, acceleration, p);

      // Check dimensions from the ResizeObserver ref instead of layout properties (prevents layout thrashing)
      const dims = dimsRef.current;
      if (dims.needsResize) {
        canvas.width = dims.width;
        canvas.height = dims.height;
        dims.needsResize = false;
      }

      const width = canvas.width;
      const height = canvas.height;

      const activeTheme = themeStore.getState();
      const envConfig = ENVIRONMENT_CONFIGS[activeTheme.environment];
      const roadConfig = ROAD_ACCENT_CONFIGS[activeTheme.roadAccent];
      const roverFinishConfig = ROVER_FINISH_CONFIGS[activeTheme.roverFinish];

      // Motion Preference Multipliers
      const motionPreset = activeTheme.motionPreset || (activeTheme.reducedMotion ? 'reduced' : 'full');
      const motionMult = motionPreset === 'minimal' ? 0.05 : motionPreset === 'reduced' ? 0.3 : 1.0;
      const idleMult   = motionPreset === 'minimal' ? 0.0  : motionPreset === 'reduced' ? 0.2 : 1.0;
      const mouseMult  = motionPreset === 'minimal' ? 0.05 : motionPreset === 'reduced' ? 0.3 : 1.0;

      // Base Background Clear according to active environment
      ctx.fillStyle = envConfig.canvasClear;
      ctx.fillRect(0, 0, width, height);

      // Core World Metrics
      const Z_MAX = 1000;
      const roverZ = p * Z_MAX;
      const roverPos = getPathPoint(roverZ);
      const roverTangent = getPathTangent(roverZ);

      // Autonomous Steering Adjustments & Path-Hunting Wobble
      const nextTangent = getPathTangent(roverZ + 4);
      const currentYaw = Math.atan2(roverTangent.x, roverTangent.z);
      const nextYaw = Math.atan2(nextTangent.x, nextTangent.z);
      const curvatureAngle = nextYaw - currentYaw;

      // Autonomous micro-steering adjustments (subtle path tracking corrections)
      const speedFactor = Math.min(1.0, Math.abs(newVel) * 220.0);
      const microSteerWobble = Math.sin(time * 3.2 + roverZ * 0.05) * 0.035 * speedFactor * motionMult;
      const targetSteerAngle = curvatureAngle * 1.5 + microSteerWobble;

      stateRef.current.steerAngle += (targetSteerAngle - stateRef.current.steerAngle) * 0.1;
      const steerAngle = stateRef.current.steerAngle;

      // Wheel rotation matching true metric distance traveled + differential turn speed
      const wheelRadius = 2.4;
      const distDelta = newVel * Z_MAX;
      const rotDelta = distDelta / wheelRadius;

      const leftRotDelta = rotDelta * (1 - steerAngle * 0.35);
      const rightRotDelta = rotDelta * (1 + steerAngle * 0.35);

      stateRef.current.leftWheelRot += leftRotDelta;
      stateRef.current.rightWheelRot += rightRotDelta;
      stateRef.current.roverWheelRotation += rotDelta;

      // Procedural Micro-Terrain Elevation & Suspension Bogie Compressions
      const wheelTrackX = 5.5;
      const wheelBaseZ = 6;

      const hFL = getTerrainHeight(roverPos.x - wheelTrackX, roverZ + wheelBaseZ);
      const hFR = getTerrainHeight(roverPos.x + wheelTrackX, roverZ + wheelBaseZ);
      const hML = getTerrainHeight(roverPos.x - wheelTrackX, roverZ);
      const hMR = getTerrainHeight(roverPos.x + wheelTrackX, roverZ);
      const hRL = getTerrainHeight(roverPos.x - wheelTrackX, roverZ - wheelBaseZ);
      const hRR = getTerrainHeight(roverPos.x + wheelTrackX, roverZ - wheelBaseZ);

      stateRef.current.suspensionFL += (hFL - stateRef.current.suspensionFL) * 0.14;
      stateRef.current.suspensionFR += (hFR - stateRef.current.suspensionFR) * 0.14;
      stateRef.current.suspensionML += (hML - stateRef.current.suspensionML) * 0.14;
      stateRef.current.suspensionMR += (hMR - stateRef.current.suspensionMR) * 0.14;
      stateRef.current.suspensionRL += (hRL - stateRef.current.suspensionRL) * 0.14;
      stateRef.current.suspensionRR += (hRR - stateRef.current.suspensionRR) * 0.14;

      const frontAvgH = (stateRef.current.suspensionFL + stateRef.current.suspensionFR) / 2;
      const rearAvgH = (stateRef.current.suspensionRL + stateRef.current.suspensionRR) / 2;
      const leftAvgH = (stateRef.current.suspensionFL + stateRef.current.suspensionML + stateRef.current.suspensionRL) / 3;
      const rightAvgH = (stateRef.current.suspensionFR + stateRef.current.suspensionMR + stateRef.current.suspensionRR) / 3;

      const terrainPitch = (frontAvgH - rearAvgH) * 0.04;
      const terrainRoll = (leftAvgH - rightAvgH) * 0.06;
      const groundYOffset = (frontAvgH + rearAvgH) / 2;

      // Kinematic Body Tilt: Pitch (Accel/Brake Dive) & Roll (Turning Centrifugal Lean)
      const inertialPitch = -acceleration * 16.0 * motionMult; // Nose dives during braking, squats on accel
      const targetBodyPitch = terrainPitch + inertialPitch;
      stateRef.current.pitch += (targetBodyPitch - stateRef.current.pitch) * 0.09;

      const inertialRoll = -newVel * steerAngle * 24.0 * motionMult; // Leans outward in turns
      const targetBodyRoll = terrainRoll + inertialRoll;
      stateRef.current.roll += (targetBodyRoll - stateRef.current.roll) * 0.09;

      // High-Frequency Powertrain Vibration (Only present when moving, disappears when stopped)
      const isMoving = Math.abs(newVel) > 0.00001;
      const vibFactor = isMoving ? Math.min(1.0, Math.abs(newVel) * 450.0) : 0.0;
      stateRef.current.vibrationX = (Math.sin(time * 68.0) * 0.12 + Math.cos(time * 95.0) * 0.06) * vibFactor * motionMult;
      stateRef.current.vibrationY = (Math.cos(time * 82.0) * 0.14 + Math.sin(time * 115.0) * 0.07) * vibFactor * motionMult;

      // Adjust rover elevation for terrain suspension height & micro-vibration
      roverPos.y += groundYOffset + stateRef.current.vibrationY;
      roverPos.x += stateRef.current.vibrationX;

      // Add wheel trail points behind the Rover
      if (Math.abs(scrollProgressRef.current - p) > 0.0001 && p > 0.02 && p < 0.98) {
        // Find left and right wheel offsets from tangent
        const normX = -roverTangent.z;
        const normZ = roverTangent.x;
        const wheelOffset = 10; // offset from center path

        wheelTrails.push({
          left: {
            x: roverPos.x + normX * wheelOffset,
            y: roverPos.y,
            z: roverPos.z,
          },
          right: {
            x: roverPos.x - normX * wheelOffset,
            y: roverPos.y,
            z: roverPos.z,
          },
          age: 1.0,
        });

        // Cap trail length
        if (wheelTrails.length > 300) {
          wheelTrails.shift();
        }
      }

      // Decay trails
      for (let i = 0; i < wheelTrails.length; i++) {
        wheelTrails[i].age -= 0.002;
      }

      // --- CINEMATIC CAMERA SYSTEM ---
      // Anticipates movement, applies spring-dampener rig dynamics, orbital drift during straight sections,
      // focal length zoom before checkpoints & reveal pullbacks after sections.

      // 1. Motion anticipation (lookahead tracking point ahead of rover along path trajectory)
      const lookaheadDist = newVel * 950.0 + acceleration * 2200.0;
      const lookaheadPos = getPathPoint(roverZ + lookaheadDist);

      // 2. Slow orbital drift during long straight sections & stationary browsing
      const speedMag = Math.abs(newVel);
      const idleWeight = 1.0 - Math.min(1.0, speedMag * 200.0);
      const idleOrbitX = Math.sin(time * 0.18) * 14.0 * idleWeight * idleMult;
      const idleOrbitY = Math.cos(time * 0.14) * 5.0 * idleWeight * idleMult;

      // 3. Section Checkpoint Dynamic Focal Zoom & Reveal Pullback
      const sectionGates = [0.16, 0.32, 0.50, 0.68, 0.85];
      let focalOffset = 0;
      let distScaleOffset = 1.0;

      for (let idx = 0; idx < sectionGates.length; idx++) {
        const gateProgress = sectionGates[idx];
        const distToGate = p - gateProgress;

        // Zoom IN before checkpoint arrival (p in [gate - 0.035, gate])
        if (distToGate >= -0.035 && distToGate <= 0) {
          const zoomFactor = (0.035 + distToGate) / 0.035; // 0 to 1
          focalOffset += Math.sin(zoomFactor * Math.PI) * 75.0; // Tighten focal lens
          distScaleOffset -= Math.sin(zoomFactor * Math.PI) * 0.12; // Bring camera slightly closer
        }
        // Pull BACK after section is revealed (p in [gate, gate + 0.045])
        else if (distToGate > 0 && distToGate <= 0.045) {
          const revealFactor = 1 - (distToGate / 0.045); // 1 to 0
          focalOffset -= Math.sin(revealFactor * Math.PI) * 35.0; // Expand focal field
          distScaleOffset += Math.sin(revealFactor * Math.PI) * 0.18; // Pull camera back for wide reveal
        }
      }

      let targetCamX = 0;
      let targetCamY = -50;
      let targetCamZ = -100;
      let targetYaw = 0;
      let targetPitch = 0.2;
      let targetFocal = 450 + focalOffset;

      // Rule-of-thirds cinematic framing targets
      if (p < 0.16) {
        // Hero Section: Slow sweeping orbits around the Rover
        const orbitAngle = time * 0.15 + mouse.x * 0.3;
        const orbitHeight = -35 + mouse.y * 15;
        targetCamX = lookaheadPos.x + Math.sin(orbitAngle) * 90 * distScaleOffset + idleOrbitX;
        targetCamY = lookaheadPos.y + orbitHeight + idleOrbitY;
        targetCamZ = lookaheadPos.z + Math.cos(orbitAngle) * 90 * distScaleOffset;

        const dx = lookaheadPos.x - targetCamX;
        const dz = lookaheadPos.z - targetCamZ;
        targetYaw = Math.atan2(dx, dz);
        targetPitch = 0.25 + mouse.y * 0.1;
      }
      else if (p >= 0.16 && p < 0.32) {
        // About Section: Clean profile orbit. Rover framed to the right side (rule of thirds)
        const profileYaw = -Math.PI / 2.3 + mouse.x * 0.2;
        targetCamX = lookaheadPos.x + Math.sin(profileYaw) * 110 * distScaleOffset + idleOrbitX;
        targetCamY = lookaheadPos.y - 12 + idleOrbitY;
        targetCamZ = lookaheadPos.z + Math.cos(profileYaw) * 110 * distScaleOffset;

        targetYaw = profileYaw + Math.PI; // Look back at rover
        targetPitch = 0.1 + mouse.y * 0.05;
      }
      else if (p >= 0.32 && p < 0.50) {
        // Skills Section: High crane shot looking down on constellation
        const blend = (p - 0.32) / 0.18;
        targetCamX = lookaheadPos.x - 20 * distScaleOffset + mouse.x * 30 + idleOrbitX;
        targetCamY = (-120 - (1 - blend) * 20) * distScaleOffset + idleOrbitY;
        targetCamZ = lookaheadPos.z - 60 * distScaleOffset;

        targetYaw = 0.25;
        targetPitch = 0.75 + mouse.y * 0.1;
      }
      else if (p >= 0.50 && p < 0.68) {
        // Projects Exhibition: Low dramatic wide-angle looking up
        targetCamX = lookaheadPos.x - 65 * distScaleOffset + mouse.x * 20 + idleOrbitX;
        targetCamY = (-15 + mouse.y * 10) * distScaleOffset + idleOrbitY;
        targetCamZ = lookaheadPos.z - 75 * distScaleOffset;

        const dx = (lookaheadPos.x + 10) - targetCamX;
        const dz = (lookaheadPos.z + 30) - targetCamZ;
        targetYaw = Math.atan2(dx, dz);
        targetPitch = -0.15;
      }
      else if (p >= 0.68 && p < 0.85) {
        // Timeline: Over-the-shoulder chase camera
        targetCamX = lookaheadPos.x - roverTangent.x * 75 * distScaleOffset + roverTangent.z * 15 + mouse.x * 15 + idleOrbitX;
        targetCamY = (lookaheadPos.y - 28 + mouse.y * 10) * distScaleOffset + idleOrbitY;
        targetCamZ = lookaheadPos.z - roverTangent.z * 75 * distScaleOffset - roverTangent.x * 15;

        const dx = (lookaheadPos.x + roverTangent.x * 20) - targetCamX;
        const dz = (lookaheadPos.z + roverTangent.z * 20) - targetCamZ;
        targetYaw = Math.atan2(dx, dz);
        targetPitch = 0.18;
      }
      else {
        // Contact Command Terminal: Directly in front of cockpit / turret
        targetCamX = lookaheadPos.x + roverTangent.x * 65 * distScaleOffset + mouse.x * 10 + idleOrbitX;
        targetCamY = (lookaheadPos.y - 15) * distScaleOffset + idleOrbitY;
        targetCamZ = lookaheadPos.z + roverTangent.z * 65 * distScaleOffset;

        const dx = lookaheadPos.x - targetCamX;
        const dz = lookaheadPos.z - targetCamZ;
        targetYaw = Math.atan2(dx, dz);
        targetPitch = 0.1;
      }

      // CAMERA MODE OVERRIDES (Drone / Follow / Isometric) & Ending Sequence
      if (activeTheme.cameraMode === 'follow') {
        targetCamX = roverPos.x - Math.sin(currentYaw) * 110;
        targetCamY = roverPos.y - 30;
        targetCamZ = roverPos.z - Math.cos(currentYaw) * 110;
        targetYaw = currentYaw;
        targetPitch = 0.08 + mouse.y * 0.05;
      } else if (activeTheme.cameraMode === 'isometric') {
        targetCamX = roverPos.x + 90;
        targetCamY = -120;
        targetCamZ = roverPos.z - 90;
        targetPitch = 0.5;
        targetYaw = -0.75;
      } else {
        // Drone Mode (default)
        targetCamX = roverPos.x;
        targetCamY = -350;
        targetCamZ = roverPos.z;
        targetYaw = 0;
        targetPitch = Math.PI / 2 - 0.03;
      }

      // Ending Sequence Smooth Camera Ascension (p >= 0.96)
      if (p >= 0.96) {
        const endBlend = (p - 0.96) / 0.04;
        targetCamY = targetCamY * (1 - endBlend) - 450 * endBlend;
        targetPitch = targetPitch * (1 - endBlend) + (Math.PI / 2) * endBlend;
      }

      // 4. Organic Handheld Motion (Ultra-subtle, non-shaky gimbal/shoulder drift)
      const handheldX = Math.sin(time * 0.65) * 0.75 + Math.cos(time * 1.25) * 0.35;
      const handheldY = Math.cos(time * 0.85) * 0.55 + Math.sin(time * 1.55) * 0.25;
      const handheldYaw = Math.sin(time * 0.45) * 0.0022;
      const handheldPitch = Math.cos(time * 0.55) * 0.0016;

      // 5. Heavy Camera Rig Spring-Damper Inertia & Damping
      const camMass = 3.6;
      const camSpringK = 0.065;
      const camDamping = 0.24;

      const destCamX = targetCamX + handheldX;
      const destCamY = targetCamY + handheldY;
      const destCamZ = targetCamZ;

      // Initialize camera position on first frame
      if (stateRef.current.camX === 0 && stateRef.current.camY === -50 && stateRef.current.camZ === -100) {
        stateRef.current.camX = destCamX;
        stateRef.current.camY = destCamY;
        stateRef.current.camZ = destCamZ;
        stateRef.current.cameraYaw = targetYaw;
        stateRef.current.cameraPitch = targetPitch;
      }

      const forceCamX = (destCamX - stateRef.current.camX) * camSpringK - stateRef.current.camVelX * camDamping;
      const forceCamY = (destCamY - stateRef.current.camY) * camSpringK - stateRef.current.camVelY * camDamping;
      const forceCamZ = (destCamZ - stateRef.current.camZ) * camSpringK - stateRef.current.camVelZ * camDamping;

      stateRef.current.camVelX += forceCamX / camMass;
      stateRef.current.camVelY += forceCamY / camMass;
      stateRef.current.camVelZ += forceCamZ / camMass;

      stateRef.current.camX += stateRef.current.camVelX;
      stateRef.current.camY += stateRef.current.camVelY;
      stateRef.current.camZ += stateRef.current.camVelZ;

      // 6. Angle Wrapping & Max Angular Velocity Clamping (Prevents sudden snaps/harsh rotations)
      let yawDiff = targetYaw - stateRef.current.cameraYaw;
      while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
      while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;

      const maxRotSpeed = 0.032; // max radians per frame
      const stepYaw = Math.max(-maxRotSpeed, Math.min(maxRotSpeed, yawDiff * 0.065));
      stateRef.current.cameraYaw += stepYaw + handheldYaw;

      let pitchDiff = targetPitch - stateRef.current.cameraPitch;
      const stepPitch = Math.max(-maxRotSpeed, Math.min(maxRotSpeed, pitchDiff * 0.065));
      stateRef.current.cameraPitch += stepPitch + handheldPitch;

      stateRef.current.camFocal += (targetFocal - stateRef.current.camFocal) * 0.05;

      const camera = {
        x: stateRef.current.camX,
        y: stateRef.current.camY,
        z: stateRef.current.camZ,
        yaw: stateRef.current.cameraYaw,
        pitch: stateRef.current.cameraPitch,
        focal: stateRef.current.camFocal,
      };

      // Camera coordinates shake on environmental interference
      let camShakeX = 0;
      let camShakeY = 0;
      let camShakeZ = 0;
      if (isGlitchingRef.current) {
        camShakeX = (Math.random() - 0.5) * 10;
        camShakeY = (Math.random() - 0.5) * 6;
        camShakeZ = (Math.random() - 0.5) * 10;
      }

      // Extract drone transition progress for use in project() below
      const droneProg = stateRef.current.droneProgress;

      // 3D Projection Utility (Perspective blending smoothly into Orthographic Blueprint view)
      const project = (pt: Point3D) => {
        // Relative translation with camera shake offset
        let dx = pt.x - (camera.x + camShakeX);
        let dy = pt.y - (camera.y + camShakeY);
        let dz = pt.z - (camera.z + camShakeZ);

        // Yaw rotation (Y-axis)
        let cosY = Math.cos(camera.yaw);
        let sinY = Math.sin(camera.yaw);
        let rx = dx * cosY - dz * sinY;
        let rz = dx * sinY + dz * cosY;

        // Pitch rotation (X-axis)
        let cosX = Math.cos(camera.pitch);
        let sinX = Math.sin(camera.pitch);
        let ry = dy * cosX - rz * sinX;
        let finalZ = dy * sinX + rz * cosX;

        // Clip things behind the lens only in perspective mode to avoid clipping standard scenes during blend
        if (finalZ <= 1 && droneProg < 0.9) return null;

        // Orthographic scale doesn't divide by finalZ, giving a perfect isometric/orthographic technical blueprint look
        const scalePerspective = camera.focal / Math.max(1, finalZ);
        const scaleOrthographic = 1.95; // Hand-tuned scale that frames the entire track and environment perfectly in Drone view
        const scale = scalePerspective * (1 - droneProg) + scaleOrthographic * droneProg;

        return {
          x: width / 2 + rx * scale,
          y: height / 2 + ry * scale,
          scale: scale,
          depth: finalZ,
        };
      };

      // --- ENVIRONMENT RENDERING ---
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const responsiveFocalScale = isMobile ? 0.78 : isTablet ? 0.88 : 1.0;

      // 1. Cinematic Ambient Occlusion Ground Grid
      // Draws an elegant infinite-feeling horizon or grid below the road
      const gridY = 0; // Ground height
      ctx.lineWidth = 0.5;

      // Select theme color accent (uses roadConfig for dynamic road accent colors)
      const getRgba = (colorStr: string, alpha: number) => {
        return colorStr.replace(/[\d\.]+\)$/, `${alpha})`);
      };

      const accentColor = (alpha: number) => {
        if (isKonamiActiveRef.current) return `rgba(168, 85, 247, ${alpha})`;
        if (isAlternateThemeRef.current) return `rgba(14, 165, 233, ${alpha})`;
        return getRgba(roadConfig.lineColor, alpha);
      };

      // Render structural ground lines (Z grid)
      const startGridZ = Math.max(0, Math.floor(camera.z / 40) * 40 - 200);
      const endGridZ = startGridZ + 750;
      for (let zG = startGridZ; zG < endGridZ; zG += 40) {
        ctx.beginPath();
        let first = true;
        for (let xG = -300; xG <= 300; xG += 60) {
          const pt = project({ x: xG, y: gridY, z: zG });
          if (pt) {
            if (first) {
              ctx.moveTo(pt.x, pt.y);
              first = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
        }
        // Fade lines based on depth and distance from camera
        const distToCam = Math.abs(zG - camera.z);
        const gridAlpha = Math.max(0, (1 - distToCam / 580) * 0.05);
        ctx.strokeStyle = accentColor(gridAlpha);
        ctx.stroke();
      }

      // Render radial volumetric lighting overlay at center ground
      const gradCenter = project({ x: roverPos.x, y: gridY, z: roverPos.z });
      if (gradCenter) {
        const radGrad = ctx.createRadialGradient(
          gradCenter.x, gradCenter.y, 0,
          gradCenter.x, gradCenter.y, Math.max(50, 40000 / gradCenter.depth)
        );
        radGrad.addColorStop(0, accentColor(0.14));
        radGrad.addColorStop(1, 'rgba(3, 3, 3, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(gradCenter.x, gradCenter.y, Math.max(50, 40000 / gradCenter.depth), 0, Math.PI * 2);
        ctx.fill();
      }

      // Soft Contact Ambient Shadow underneath Rover chassis & wheels
      if (gradCenter) {
        const shadGrad = ctx.createRadialGradient(
          gradCenter.x, gradCenter.y, 2,
          gradCenter.x, gradCenter.y, Math.max(20, 32000 / gradCenter.depth)
        );
        shadGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
        shadGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.35)');
        shadGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadGrad;
        ctx.beginPath();
        ctx.ellipse(
          gradCenter.x, gradCenter.y,
          Math.max(25, 36000 / gradCenter.depth) * responsiveFocalScale,
          Math.max(12, 16000 / gradCenter.depth) * responsiveFocalScale,
          0, 0, Math.PI * 2
        );
        ctx.fill();
      }

      // 2. Intelligent Self-Assembling Winding Road Ribbon
      // Keeps previously built sections visible behind, builds smoothly ahead with no geometry popping
      const maxDrawZ = Math.min(Z_MAX, roverZ + 380);
      const startDrawZ = Math.max(0, roverZ - 450);

      // Draw Glowing Wheel Trails first (lies flat on road)
      ctx.lineWidth = 1.5;
      for (let i = 1; i < wheelTrails.length; i++) {
        const t1 = wheelTrails[i - 1];
        const t2 = wheelTrails[i];
        if (t1.age <= 0 || t2.age <= 0) continue;

        const left1 = project(t1.left);
        const left2 = project(t2.left);
        const right1 = project(t1.right);
        const right2 = project(t2.right);

        const trailAlpha = Math.max(0, t1.age * 0.4);

        if (left1 && left2) {
          ctx.beginPath();
          ctx.moveTo(left1.x, left1.y);
          ctx.lineTo(left2.x, left2.y);
          ctx.strokeStyle = accentColor(trailAlpha);
          ctx.stroke();
        }
        if (right1 && right2) {
          ctx.beginPath();
          ctx.moveTo(right1.x, right1.y);
          ctx.lineTo(right2.x, right2.y);
          ctx.strokeStyle = accentColor(trailAlpha);
          ctx.stroke();
        }
      }

      // Draw the road surface and borders with real-time assembly animation
      ctx.lineWidth = 2;
      const roadSegments: { left: { x: number, y: number, scale: number }, right: { x: number, y: number, scale: number }, z: number, alpha: number }[] = [];

      for (let rZ = startDrawZ; rZ <= maxDrawZ; rZ += 10) {
        const center = getPathPoint(rZ);
        const tangent = getPathTangent(rZ);

        // Compute 3D normal vector (orthogonal to path direction)
        const normX = -tangent.z;
        const normZ = tangent.x;
        const roadWidth = 24;

        // Intelligent Assembly Front Emergence Physics
        let yOffset = 0;
        let segmentAlpha = 1.0;
        const buildStart = roverZ + 110;

        if (rZ > buildStart) {
          // Dynamic emergence physics: segment slides up smoothly with natural cosine curve
          const buildRatio = Math.min(1, (rZ - buildStart) / 270); // 0 to 1
          yOffset = Math.sin(buildRatio * Math.PI * 0.5) * 42; // smooth drop
          segmentAlpha = Math.max(0, 1 - Math.pow(buildRatio, 1.8)); // zero geometry popping
        }

        const leftPt = project({
          x: center.x + normX * roadWidth,
          y: center.y + yOffset,
          z: center.z,
        });

        const rightPt = project({
          x: center.x - normX * roadWidth,
          y: center.y + yOffset,
          z: center.z,
        });

        if (leftPt && rightPt) {
          roadSegments.push({ left: leftPt, right: rightPt, z: rZ, alpha: segmentAlpha });
        }
      }

      // Draw fill panels for road ribbon with digital tech scanning patterns
      if (roadSegments.length > 1) {
        for (let i = 1; i < roadSegments.length; i++) {
          const s1 = roadSegments[i - 1];
          const s2 = roadSegments[i];

          // Compute opacity based on scroll, depth, and assembly front alpha
          const depthFade = Math.max(0, 1 - Math.abs(s1.z - roverZ) / 420) * s1.alpha;
          if (depthFade <= 0.001) continue;

          // Draw translucent dark road bed
          ctx.fillStyle = `rgba(15, 15, 15, ${depthFade * 0.78})`;
          ctx.beginPath();
          ctx.moveTo(s1.left.x, s1.left.y);
          ctx.lineTo(s2.left.x, s2.left.y);
          ctx.lineTo(s2.right.x, s2.right.y);
          ctx.lineTo(s1.right.x, s1.right.y);
          ctx.closePath();
          ctx.fill();

          // Elegant neon cyber dashes in the center of the road
          if (i % 4 === 0) {
            const c1x = (s1.left.x + s1.right.x) / 2;
            const c1y = (s1.left.y + s1.right.y) / 2;
            const c2x = (s2.left.x + s2.right.x) / 2;
            const c2y = (s2.left.y + s2.right.y) / 2;

            ctx.beginPath();
            ctx.moveTo(c1x, c1y);
            ctx.lineTo(c2x, c2y);
            ctx.strokeStyle = accentColor(depthFade * 0.65);
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // Illuminated road borders & construction laser lines
          ctx.beginPath();
          ctx.moveTo(s1.left.x, s1.left.y);
          ctx.lineTo(s2.left.x, s2.left.y);
          ctx.strokeStyle = accentColor(depthFade * 0.45);
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(s1.right.x, s1.right.y);
          ctx.lineTo(s2.right.x, s2.right.y);
          ctx.strokeStyle = accentColor(depthFade * 0.45);
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Active construction laser beam across the assembly front line
          if (s1.z > roverZ + 120 && s1.z < roverZ + 180 && i % 3 === 0) {
            ctx.beginPath();
            ctx.moveTo(s1.left.x, s1.left.y);
            ctx.lineTo(s1.right.x, s1.right.y);
            ctx.strokeStyle = accentColor(depthFade * 0.85);
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        }
      }

      // 3. Floating Holographic Architectural Elements (Emerging from Ground)
      // At specific milestone depths, we render architectural beacon gates
      const milestones = [
        { z: 200, label: 'ABOUT', color: 'rgba(255,255,255,0.7)' },
        { z: 450, label: 'SKILLS', color: 'rgba(255,255,255,0.7)' },
        { z: 700, label: 'PROJECTS', color: 'rgba(255,255,255,0.7)' },
        { z: 900, label: 'TIMELINE', color: 'rgba(255,255,255,0.7)' },
      ];

      const numMilestones = milestones.length;
      for (let idx = 0; idx < numMilestones; idx++) {
        const stone = milestones[idx];
        const msZ = stone.z;
        const center = getPathPoint(msZ);

        // Emerge animation: as rover gets closer, they rise. If ahead of build, stay down.
        const dist = msZ - roverZ;
        let emergeRatio = 0; // 0 is flat on ground, 1 is fully standing

        if (dist < 300) {
          // Rises as rover approaches
          emergeRatio = Math.min(1, Math.max(0, (300 - dist) / 150));
        }

        if (emergeRatio > 0.01) {
          const heightMax = 45;
          const currentHeight = emergeRatio * heightMax;
          const tangent = getPathTangent(msZ);
          const normX = -tangent.z;
          const normZ = tangent.x;
          const gateWidth = 35;

          // Compute left and right beacon base points
          const baseL = { x: center.x + normX * gateWidth, y: center.y, z: center.z };
          const baseR = { x: center.x - normX * gateWidth, y: center.y, z: center.z };

          const topL = { ...baseL, y: baseL.y - currentHeight };
          const topR = { ...baseR, y: baseR.y - currentHeight };

          const pBaseL = project(baseL);
          const pBaseR = project(baseR);
          const pTopL = project(topL);
          const pTopR = project(topR);

          const msAlpha = emergeRatio * 0.45;

          if (pBaseL && pBaseR && pTopL && pTopR) {
            // Draw left pillar
            ctx.beginPath();
            ctx.moveTo(pBaseL.x, pBaseL.y);
            ctx.lineTo(pTopL.x, pTopL.y);
            ctx.strokeStyle = accentColor(msAlpha);
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw right pillar
            ctx.beginPath();
            ctx.moveTo(pBaseR.x, pBaseR.y);
            ctx.lineTo(pTopR.x, pTopR.y);
            ctx.strokeStyle = accentColor(msAlpha);
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw top crossbar connecting pillars
            ctx.beginPath();
            ctx.moveTo(pTopL.x, pTopL.y);
            ctx.lineTo(pTopR.x, pTopR.y);
            ctx.strokeStyle = accentColor(msAlpha * 0.5);
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw holographic glowing data stream inside the gate
            ctx.fillStyle = accentColor(msAlpha * 0.05);
            ctx.beginPath();
            ctx.moveTo(pBaseL.x, pBaseL.y);
            ctx.lineTo(pTopL.x, pTopL.y);
            ctx.lineTo(pTopR.x, pTopR.y);
            ctx.lineTo(pBaseR.x, pBaseR.y);
            ctx.closePath();
            ctx.fill();

            // Holographic floating text/label centered over the archway
            const textPt = project({
              x: center.x,
              y: center.y - currentHeight - 8,
              z: center.z,
            });

            if (textPt && emergeRatio > 0.8) {
              ctx.font = '500 8px "JetBrains Mono", monospace';
              ctx.fillStyle = accentColor(msAlpha * 1.5);
              ctx.textAlign = 'center';
              ctx.letterSpacing = '2px';
              ctx.fillText(stone.label, textPt.x, textPt.y);

              // Small holographic ring floating above
              ctx.beginPath();
              ctx.ellipse(textPt.x, textPt.y + 12, 16 * textPt.scale / 10, 4 * textPt.scale / 10, 0, 0, Math.PI * 2);
              ctx.strokeStyle = accentColor(msAlpha * 0.4);
              ctx.stroke();
            }
          }
        }
      }

      // --- THE ROVER (3D VECTOR WIREFRAME MODEL) ---
      // We draw the Rover centered precisely at (roverPos.x, roverPos.y, roverPos.z)
      // facing the direction of roverTangent, modified by physical pitch and roll.
      const roverYaw = Math.atan2(roverTangent.x, roverTangent.z);
      const roverPitch = Math.atan2(roverTangent.y, Math.sqrt(roverTangent.x * roverTangent.x + roverTangent.z * roverTangent.z)) + stateRef.current.pitch;
      const roverRoll = stateRef.current.roll;

      // Coordinate transformation utility to position rover body parts with 3-axis rotation (Yaw, Pitch, Roll)
      const transformRoverPt = (localPt: Point3D): Point3D => {
        // Rotate Roll (Z-axis)
        const cosR = Math.cos(roverRoll);
        const sinR = Math.sin(roverRoll);
        const rx0 = localPt.x * cosR - localPt.y * sinR;
        const ry0 = localPt.x * sinR + localPt.y * cosR;

        // Rotate Pitch (X-axis)
        const cosP = Math.cos(roverPitch);
        const sinP = Math.sin(roverPitch);
        const ry1 = ry0 * cosP - localPt.z * sinP;
        const rz1 = ry0 * sinP + localPt.z * cosP;

        // Rotate Yaw (Y-axis)
        const cosY = Math.cos(roverYaw);
        const sinY = Math.sin(roverYaw);
        const rx = rx0 * cosY + rz1 * sinY;
        const rz = -rx0 * sinY + rz1 * cosY;

        return {
          x: roverPos.x + rx,
          y: roverPos.y + ry1,
          z: roverPos.z + rz,
        };
      };

      // Helper to draw a projected wireframe face
      const drawFace = (localPts: Point3D[], strokeColor: string, fillColor?: string, lineWidth = 1) => {
        const transPts = localPts.map(transformRoverPt);
        const projPts = transPts.map(project);

        if (projPts.some(pt => pt === null)) return; // Clip if any vertex behind lens

        ctx.beginPath();
        ctx.moveTo(projPts[0]!.x, projPts[0]!.y);
        for (let i = 1; i < projPts.length; i++) {
          ctx.lineTo(projPts[i]!.x, projPts[i]!.y);
        }
        ctx.closePath();

        if (fillColor) {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      };

      // Helper to convert hex color to rgba
      const hexToRgba = (hex: string, alpha: number) => {
        let c = hex.replace('#', '');
        if (c.length === 3) c = c.split('').map(x => x + x).join('');
        const num = parseInt(c, 16);
        return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
      };

      // 1. CHASSIS (Faceted metallic body using active Rover Finish)
      const chassisColor = isKonamiActiveRef.current
        ? 'rgba(168, 85, 247, 0.9)'
        : isAlternateThemeRef.current
          ? 'rgba(14, 165, 233, 0.9)'
          : roverFinishConfig.specular;
      const chassisFill = hexToRgba(roverFinishConfig.bodyColor, 0.95);
      const chassisTopFill = hexToRgba(roverFinishConfig.specular, 0.85);
      const chassisWidth = 8;
      const chassisLength = 12;
      const chassisHeight = 4;
      const bottomY = -3; // raised above road

      // Body Cube vertices in local space
      const cBottomFL = { x: -chassisWidth / 2, y: bottomY, z: chassisLength / 2 };
      const cBottomFR = { x: chassisWidth / 2, y: bottomY, z: chassisLength / 2 };
      const cBottomBL = { x: -chassisWidth / 2, y: bottomY, z: -chassisLength / 2 };
      const cBottomBR = { x: chassisWidth / 2, y: bottomY, z: -chassisLength / 2 };

      const cTopFL = { x: -chassisWidth / 2, y: bottomY - chassisHeight, z: chassisLength / 2 - 2 };
      const cTopFR = { x: chassisWidth / 2, y: bottomY - chassisHeight, z: chassisLength / 2 - 2 };
      const cTopBL = { x: -chassisWidth / 2 - 1, y: bottomY - chassisHeight + 1, z: -chassisLength / 2 };
      const cTopBR = { x: chassisWidth / 2 + 1, y: bottomY - chassisHeight + 1, z: -chassisLength / 2 };

      // Draw Chassis panels
      drawFace([cBottomBL, cBottomBR, cBottomFR, cBottomFL], chassisColor, chassisFill); // Bottom
      drawFace([cTopBL, cTopBR, cTopFR, cTopFL], chassisColor, chassisTopFill); // Top plate
      drawFace([cBottomFL, cBottomFR, cTopFR, cTopFL], chassisColor, chassisFill, 1.5); // Front nose
      drawFace([cBottomBL, cBottomBR, cTopBR, cTopBL], chassisColor, chassisFill); // Rear
      drawFace([cBottomFL, cTopFL, cTopBL, cBottomBL], chassisColor, chassisFill); // Left Side
      drawFace([cBottomFR, cTopFR, cTopBR, cBottomBR], chassisColor, chassisFill); // Right Side

      // 2. SOLAR PANELS (Winglets tilted on top)
      const panelTilt = Math.sin(time) * 0.15; // rhythmic slow flutter
      const wingL1 = { x: -chassisWidth / 2, y: bottomY - chassisHeight, z: 2 };
      const wingL2 = { x: -chassisWidth / 2 - 5, y: bottomY - chassisHeight - 1 - panelTilt * 10, z: 3 };
      const wingL3 = { x: -chassisWidth / 2 - 5, y: bottomY - chassisHeight - 1 - panelTilt * 10, z: -4 };
      const wingL4 = { x: -chassisWidth / 2, y: bottomY - chassisHeight, z: -3 };

      const wingR1 = { x: chassisWidth / 2, y: bottomY - chassisHeight, z: 2 };
      const wingR2 = { x: chassisWidth / 2 + 5, y: bottomY - chassisHeight - 1 + panelTilt * 10, z: 3 };
      const wingR3 = { x: chassisWidth / 2 + 5, y: bottomY - chassisHeight - 1 + panelTilt * 10, z: -4 };
      const wingR4 = { x: chassisWidth / 2, y: bottomY - chassisHeight, z: -3 };

      const panelColor = isKonamiActiveRef.current
        ? 'rgba(168, 85, 247, 0.9)'
        : isAlternateThemeRef.current
          ? 'rgba(14, 165, 233, 0.9)'
          : roverFinishConfig.accent;
      const panelGridFill = hexToRgba(roverFinishConfig.bodyColor, 0.9);

      drawFace([wingL1, wingL2, wingL3, wingL4], panelColor, panelGridFill);
      drawFace([wingR1, wingR2, wingR3, wingR4], panelColor, panelGridFill);

      // Draw custom grids on solar panels
      const drawPanelGrid = (p1: Point3D, p2: Point3D, p3: Point3D, p4: Point3D) => {
        const trans = [p1, p2, p3, p4].map(transformRoverPt);
        const proj = trans.map(project);
        if (proj.some(pt => pt === null)) return;

        ctx.beginPath();
        // vertical division
        ctx.moveTo((proj[0]!.x + proj[3]!.x) / 2, (proj[0]!.y + proj[3]!.y) / 2);
        ctx.lineTo((proj[1]!.x + proj[2]!.x) / 2, (proj[1]!.y + proj[2]!.y) / 2);
        ctx.strokeStyle = panelColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      };
      drawPanelGrid(wingL1, wingL2, wingL3, wingL4);
      drawPanelGrid(wingR1, wingR2, wingR3, wingR4);

      // 3. SENSOR MAST (Camera head tracking the cursor)
      const mastBase = { x: 0, y: bottomY - chassisHeight, z: chassisLength / 2 - 3 };
      const mastTop = { x: 0, y: bottomY - chassisHeight - 5, z: chassisLength / 2 - 3 };

      // Compute turret rotation yaw to track cursor elegantly
      const turretYaw = mouse.x * 0.9;
      const turretPitch = mouse.y * 0.4;

      const turretCosY = Math.cos(turretYaw);
      const turretSinY = Math.sin(turretYaw);

      // Front facing turret eye offsetted by cursor yaw/pitch
      const eyeOffset = {
        x: turretSinY * 2,
        y: -1 + turretPitch * 2,
        z: turretCosY * 2
      };

      const turretCenter = { ...mastTop, y: mastTop.y - 1 };
      const turretEye = {
        x: turretCenter.x + eyeOffset.x,
        y: turretCenter.y + eyeOffset.y,
        z: turretCenter.z + eyeOffset.z
      };

      const pMastBase = project(transformRoverPt(mastBase));
      const pMastTop = project(transformRoverPt(mastTop));
      const pTurretCenter = project(transformRoverPt(turretCenter));
      const pTurretEye = project(transformRoverPt(turretEye));

      if (pMastBase && pMastTop) {
        ctx.beginPath();
        ctx.moveTo(pMastBase.x, pMastBase.y);
        ctx.lineTo(pMastTop.x, pMastTop.y);
        ctx.strokeStyle = chassisColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (pTurretCenter && pTurretEye) {
        // Draw circular sensor head
        ctx.beginPath();
        ctx.arc(pTurretCenter.x, pTurretCenter.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#111';
        ctx.fill();
        ctx.strokeStyle = chassisColor;
        ctx.stroke();

        // Draw glowing scanner lens (camera eye)
        ctx.beginPath();
        ctx.arc(pTurretEye.x, pTurretEye.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = isKonamiActiveRef.current ? '#a855f7' : isAlternateThemeRef.current ? '#0ea5e9' : '#fff'; // glowing eye
        ctx.fill();
      }

      // 4. SUSPENSION BOGIES & WHEELS (6 wheels spinning with differential steering & suspension compression)
      const wheelWidth = 1.2;

      // Local offsets & suspension heights for 6 wheels
      const wheelOffsets = [
        { x: -chassisWidth / 2 - 1.5, y: -0.5 + stateRef.current.suspensionFL * 0.6, z: chassisLength / 2 - 1.5, id: 0, isLeft: true, isFront: true },   // Front Left
        { x: chassisWidth / 2 + 1.5, y: -0.5 + stateRef.current.suspensionFR * 0.6, z: chassisLength / 2 - 1.5, id: 1, isLeft: false, isFront: true },    // Front Right
        { x: -chassisWidth / 2 - 1.5, y: -0.5 + stateRef.current.suspensionML * 0.6, z: 0, id: 2, isLeft: true, isFront: false },                         // Mid Left
        { x: chassisWidth / 2 + 1.5, y: -0.5 + stateRef.current.suspensionMR * 0.6, z: 0, id: 3, isLeft: false, isFront: false },                          // Mid Right
        { x: -chassisWidth / 2 - 1.5, y: -0.5 + stateRef.current.suspensionRL * 0.6, z: -chassisLength / 2 + 1.5, id: 4, isLeft: true, isRear: true },  // Rear Left
        { x: chassisWidth / 2 + 1.5, y: -0.5 + stateRef.current.suspensionRR * 0.6, z: -chassisLength / 2 + 1.5, id: 5, isLeft: false, isRear: true },   // Rear Right
      ];

      const numWheels = wheelOffsets.length;
      for (let wIdx = 0; wIdx < numWheels; wIdx++) {
        const w = wheelOffsets[wIdx];
        const axleBase = { x: w.x > 0 ? chassisWidth / 2 : -chassisWidth / 2, y: bottomY + 1, z: w.z };
        const axleEnd = { x: w.x, y: w.y, z: w.z };

        const pAxleBase = project(transformRoverPt(axleBase));
        const pAxleEnd = project(transformRoverPt(axleEnd));

        // Draw suspension linkage arms
        if (pAxleBase && pAxleEnd) {
          ctx.beginPath();
          ctx.moveTo(pAxleBase.x, pAxleBase.y);
          ctx.lineTo(pAxleEnd.x, pAxleEnd.y);
          ctx.strokeStyle = chassisColor;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Determine specific wheel rotation & steering angle for this bogie
        const wheelRotAngle = w.isLeft ? stateRef.current.leftWheelRot : stateRef.current.rightWheelRot;
        const wheelSteerAngle = w.isFront ? stateRef.current.steerAngle * 1.2 : (w as any).isRear ? -stateRef.current.steerAngle * 0.4 : 0;

        const cosSteer = Math.cos(wheelSteerAngle);
        const sinSteer = Math.sin(wheelSteerAngle);

        // Draw cylindrical wheels (rendered as faceted wireframe disks with steering angle)
        const numFacets = 8;
        const ptsWheelL: Point3D[] = [];
        const ptsWheelR: Point3D[] = [];

        for (let i = 0; i < numFacets; i++) {
          const angle = (i / numFacets) * Math.PI * 2 + wheelRotAngle;
          const dy = Math.sin(angle) * wheelRadius;
          const dz0 = Math.cos(angle) * wheelRadius;

          const lx0 = -wheelWidth / 2;
          const rx0 = wheelWidth / 2;

          // Rotate around wheel local Y-axis by steering angle
          const lx = lx0 * cosSteer + dz0 * sinSteer;
          const lz = -lx0 * sinSteer + dz0 * cosSteer;

          const rx = rx0 * cosSteer + dz0 * sinSteer;
          const rz = -rx0 * sinSteer + dz0 * cosSteer;

          ptsWheelL.push({ x: w.x + lx, y: w.y + dy, z: w.z + lz });
          ptsWheelR.push({ x: w.x + rx, y: w.y + dy, z: w.z + rz });
        }

        // Project wheel vertices
        const projL = ptsWheelL.map(transformRoverPt).map(project);
        const projR = ptsWheelR.map(transformRoverPt).map(project);

        if (!projL.some(pt => pt === null) && !projR.some(pt => pt === null)) {
          // Fill inside disk dark
          ctx.beginPath();
          ctx.moveTo(projL[0]!.x, projL[0]!.y);
          for (let i = 1; i < numFacets; i++) {
            ctx.lineTo(projL[i]!.x, projL[i]!.y);
          }
          ctx.closePath();
          ctx.fillStyle = '#0a0a0a';
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(projR[0]!.x, projR[0]!.y);
          for (let i = 1; i < numFacets; i++) {
            ctx.lineTo(projR[i]!.x, projR[i]!.y);
          }
          ctx.closePath();
          ctx.fillStyle = '#0a0a0a';
          ctx.fill();

          // Connect sides of wheel (cylinder bands)
          for (let i = 0; i < numFacets; i++) {
            const nextIdx = (i + 1) % numFacets;
            ctx.beginPath();
            ctx.moveTo(projL[i]!.x, projL[i]!.y);
            ctx.lineTo(projR[i]!.x, projR[i]!.y);
            ctx.lineTo(projR[nextIdx]!.x, projR[nextIdx]!.y);
            ctx.lineTo(projL[nextIdx]!.x, projL[nextIdx]!.y);
            ctx.closePath();
            ctx.strokeStyle = accentColor(0.25);
            ctx.stroke();

            // Wheel spokes wireframe
            ctx.beginPath();
            ctx.moveTo((projL[i]!.x + projR[i]!.x) / 2, (projL[i]!.y + projR[i]!.y) / 2);
            ctx.lineTo(pAxleEnd!.x, pAxleEnd!.y);
            ctx.strokeStyle = accentColor(0.18);
            ctx.stroke();
          }

          // Outer rims
          ctx.beginPath();
          ctx.moveTo(projL[0]!.x, projL[0]!.y);
          for (let i = 1; i < numFacets; i++) ctx.lineTo(projL[i]!.x, projL[i]!.y);
          ctx.closePath();
          ctx.strokeStyle = chassisColor;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(projR[0]!.x, projR[0]!.y);
          for (let i = 1; i < numFacets; i++) ctx.lineTo(projR[i]!.x, projR[i]!.y);
          ctx.closePath();
          ctx.strokeStyle = chassisColor;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 5. VOLUMETRIC GLOWING HEADLIGHT CONE
      // Front headlight projection
      const lightSource = { x: 0, y: bottomY - 1.2, z: chassisLength / 2 + 1 };
      const lightTarget1 = { x: -14, y: bottomY + 3, z: chassisLength / 2 + 35 };
      const lightTarget2 = { x: 14, y: bottomY + 3, z: chassisLength / 2 + 35 };

      const pLightSource = project(transformRoverPt(lightSource));
      const pLightTarget1 = project(transformRoverPt(lightTarget1));
      const pLightTarget2 = project(transformRoverPt(lightTarget2));

      if (pLightSource && pLightTarget1 && pLightTarget2) {
        // Draw custom volumetric cone gradient
        const lightGrad = ctx.createLinearGradient(
          pLightSource.x, pLightSource.y,
          (pLightTarget1.x + pLightTarget2.x) / 2, (pLightTarget1.y + pLightTarget2.y) / 2
        );
        lightGrad.addColorStop(0, accentColor(0.25));
        lightGrad.addColorStop(0.3, accentColor(0.12));
        lightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(pLightSource.x, pLightSource.y);
        ctx.lineTo(pLightTarget1.x, pLightTarget1.y);
        ctx.lineTo(pLightTarget2.x, pLightTarget2.y);
        ctx.closePath();
        ctx.fillStyle = lightGrad;
        ctx.fill();
      }

      // --- PARTICLES & VOLUMETRIC FOG ---
      // Update and Draw floating dust particles
      const numParticles = particles.length;
      for (let i = 0; i < numParticles; i++) {
        const pPart = particles[i];
        pPart.y += pPart.speedY;

        // Let them follow camera motion: if behind camera wrap them ahead
        if (pPart.z < camera.z - 30) {
          pPart.z = camera.z + 500 + Math.random() * 100;
        }

        const pt = project(pPart);
        if (pt) {
          // Render only within depth range
          const partAlpha = (1 - (pPart.z - camera.z) / 450) * pPart.alpha;
          if (partAlpha > 0) {
            ctx.fillStyle = accentColor(partAlpha);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pPart.size * pt.scale * 0.12, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Subtle volumetric fog overlay at bottom screen
      const fogGrad = ctx.createLinearGradient(0, height * 0.6, 0, height);
      fogGrad.addColorStop(0, 'rgba(3, 3, 3, 0)');
      fogGrad.addColorStop(1, 'rgba(3, 3, 3, 0.88)');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, height * 0.5, width, height * 0.5);

      // Render custom radar noise/static vectors when glitching
      if (isGlitchingRef.current) {
        const numLines = Math.floor(Math.random() * 4) + 2;
        ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(34, 211, 238, 0.35)';
        for (let i = 0; i < numLines; i++) {
          const yNoise = Math.random() * height;
          ctx.beginPath();
          ctx.moveTo(0, yNoise);
          ctx.lineTo(width, yNoise);
          ctx.lineWidth = Math.random() * 2 + 0.5;
          ctx.stroke();
        }

        // Random glitch horizontal bands
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.fillRect(0, Math.random() * height, width, Math.random() * 30 + 10);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
