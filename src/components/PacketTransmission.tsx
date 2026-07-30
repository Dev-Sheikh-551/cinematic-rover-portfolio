/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Shield, Server, Cpu, Database, Network, ArrowRight } from 'lucide-react';

interface PacketTransmissionProps {
  name: string;
  email: string;
  onProgressUpdate?: (percent: number) => void;
}

interface TelemetryRow {
  id: string;
  size: string;
  status: 'ROUTING' | 'ENCRYPTED' | 'DISPATCHED' | 'ACK_RECEIVED';
  channel: string;
}

export const PacketTransmission: React.FC<PacketTransmissionProps> = ({ name, email, onProgressUpdate }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const senderNodeRef = useRef<HTMLDivElement | null>(null);
  const receiverNodeRef = useRef<HTMLDivElement | null>(null);
  const [percent, setPercent] = useState(0);
  const [telemetry, setTelemetry] = useState<TelemetryRow[]>([]);
  
  // Decouple onProgressUpdate callback using a ref to prevent infinite render cycles
  const onProgressUpdateRef = useRef(onProgressUpdate);
  useEffect(() => {
    onProgressUpdateRef.current = onProgressUpdate;
  }, [onProgressUpdate]);

  // Channels coordinates for particle lines
  const paths = [
    "M 40 50 Q 150 20, 260 50",   // Upper channel
    "M 40 50 L 260 50",           // Center channel
    "M 40 50 Q 150 80, 260 50",   // Lower channel
  ];

  useEffect(() => {
    // Generate a sequence of telemetry packet entries
    const channels = ['CH-ALPHA', 'CH-BETA', 'CH-GAMMA'];
    const packetSizes = ['48 KB', '96 KB', '128 KB', '256 KB'];
    const initialTelemetry: TelemetryRow[] = Array.from({ length: 4 }).map((_, i) => ({
      id: `PKT-0${Math.floor(Math.random() * 800 + 100)}`,
      size: packetSizes[i % packetSizes.length],
      status: 'ROUTING',
      channel: channels[i % channels.length]
    }));
    setTelemetry(initialTelemetry);

    const ctx = gsap.context(() => {
      // 1. Initial Pulse of Nodes
      gsap.to('.sender-glow', {
        scale: 1.3,
        opacity: 0.8,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });

      gsap.to('.receiver-glow', {
        scale: 1.4,
        opacity: 0.9,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });

      // Rotating inner core
      gsap.to('.receiver-core', {
        rotation: 360,
        duration: 8,
        repeat: -1,
        ease: "none"
      });

      // 2. Timeline for entire upload sequence (approx 5s)
      const tl = gsap.timeline({
        onUpdate: () => {
          const progress = Math.round(tl.progress() * 100);
          setPercent(progress);
          if (onProgressUpdateRef.current) {
            onProgressUpdateRef.current(progress);
          }
        }
      });

      // Animating connection setup
      tl.to('.connection-line', {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: "power1.in"
      });

      // Spawn packets along channels
      const packetElements = containerRef.current?.querySelectorAll('.data-packet');
      if (packetElements) {
        packetElements.forEach((pkt, index) => {
          // Dynamic offset delays
          const delay = index * 0.4;
          const duration = 1.4 + Math.random() * 0.6;
          
          tl.to(pkt, {
            opacity: 1,
            duration: 0.1
          }, delay);

          // Animate position along the pseudo SVG path using high-performance GSAP core keyframes
          if (index === 0) {
            // Upper Q-curve path approximation
            tl.to(pkt, {
              keyframes: [
                { x: 0, y: 0, ease: "power1.out" },
                { x: 110, y: -24, ease: "sine.inOut" },
                { x: 220, y: 0, ease: "power1.in" }
              ],
              duration: duration,
              repeat: 2
            }, delay);
          } else if (index === 1) {
            // Straight center channel path
            tl.to(pkt, {
              x: 220,
              ease: "sine.inOut",
              duration: duration,
              repeat: 2
            }, delay);
          } else {
            // Lower Q-curve path approximation
            tl.to(pkt, {
              keyframes: [
                { x: 0, y: 0, ease: "power1.out" },
                { x: 110, y: 24, ease: "sine.inOut" },
                { x: 220, y: 0, ease: "power1.in" }
              ],
              duration: duration,
              repeat: 2
            }, delay);
          }

          tl.to(pkt, {
            opacity: 0,
            scale: 1.5,
            duration: 0.2,
            ease: "power2.out"
          });
        });
      }

      // Animate telemetry rows status change during timeline
      tl.call(() => {
        setTelemetry(prev => prev.map((p, idx) => idx === 0 ? { ...p, status: 'ENCRYPTED' } : p));
      }, [], 1.0);

      tl.call(() => {
        setTelemetry(prev => prev.map((p, idx) => idx === 1 ? { ...p, status: 'ENCRYPTED' } : p));
      }, [], 1.8);

      tl.call(() => {
        setTelemetry(prev => prev.map(p => ({ ...p, status: p.status === 'ENCRYPTED' ? 'DISPATCHED' : p.status })));
      }, [], 2.8);

      tl.call(() => {
        setTelemetry(prev => prev.map(p => ({ ...p, status: 'ACK_RECEIVED' })));
      }, [], 4.2);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex flex-col md:flex-row gap-6 p-4 rounded-xl border border-white/5 bg-black/60 backdrop-blur-sm select-none">
      {/* Schematic animation canvas panel */}
      <div className="flex-1 flex flex-col justify-between border border-white/5 bg-white/2 rounded-lg p-5 relative overflow-hidden min-h-[220px]">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 pointer-events-none">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-white" />
          ))}
        </div>

        {/* Header telemetry details */}
        <div className="flex justify-between items-center text-[9px] font-mono text-white/35 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>LINK MODE: SECURE_COMMS_TUNNEL</span>
          </div>
          <div>BANDWIDTH: 1.2 MB/S</div>
        </div>

        {/* Visual pipeline map */}
        <div className="my-auto py-6 flex items-center justify-between relative z-10 h-28">
          {/* Sender Node */}
          <div ref={senderNodeRef} className="relative flex flex-col items-center">
            <div className="sender-glow absolute inset-0 bg-sky-500/10 rounded-full scale-110 pointer-events-none blur-sm" />
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Shield size={20} className="animate-pulse" />
            </div>
            <div className="text-[8px] font-mono text-sky-400 mt-2 font-medium tracking-wider uppercase">
              {name ? name.substring(0, 10) : 'PILOT'}
            </div>
            <div className="text-[7px] font-mono text-white/25">SECURE_CLIENT</div>
          </div>

          {/* Connection Cables & Floating particles (Packets) */}
          <div className="flex-1 relative mx-4 h-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
              {/* Channel conduits */}
              <path d={paths[0]} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <path d={paths[1]} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <path d={paths[2]} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

              {/* Animated conduit stream flow line */}
              <path 
                className="connection-line"
                d={paths[1]} 
                fill="none" 
                stroke="rgba(14,165,233,0.12)" 
                strokeWidth="1.5" 
                strokeDasharray="4,8"
                strokeDashoffset="100"
              />
            </svg>

            {/* Glowing packet objects animated by GSAP */}
            <div className="data-packet absolute left-0 top-[22px] w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)] opacity-0 pointer-events-none" />
            <div className="data-packet absolute left-0 top-[46px] w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] opacity-0 pointer-events-none" />
            <div className="data-packet absolute left-0 top-[70px] w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] opacity-0 pointer-events-none" />
          </div>

          {/* Receiver Node */}
          <div ref={receiverNodeRef} className="relative flex flex-col items-center">
            <div className="receiver-glow absolute inset-0 bg-emerald-500/10 rounded-full scale-115 pointer-events-none blur-sm" />
            <div className="receiver-core w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Server size={20} className="relative z-10" />
            </div>
            <div className="text-[8px] font-mono text-emerald-400 mt-2 font-medium tracking-wider uppercase">HELIOS_CORE</div>
            <div className="text-[7px] font-mono text-white/25">DB_RECON</div>
          </div>
        </div>

        {/* Interactive Progress Indicator */}
        <div className="relative z-10">
          <div className="flex justify-between items-center text-[8px] font-mono text-white/40 mb-1">
            <span>UPLOADING META STREAM</span>
            <span>{percent}%</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Real-time Transmission Telemetry Logs panel */}
      <div className="w-full md:w-60 border border-white/5 bg-white/2 rounded-lg p-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="text-[8px] font-mono text-white/30 uppercase tracking-wider flex items-center gap-1">
            <Network size={10} />
            <span>Packet Router Matrix</span>
          </div>

          <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
            {telemetry.map((row) => (
              <div 
                key={row.id} 
                className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-white/5 text-[8px] font-mono text-white/60"
              >
                <div className="flex flex-col">
                  <span className="text-white/80 font-medium">{row.id}</span>
                  <span className="text-white/30 text-[7px]">{row.channel}</span>
                </div>
                <div className="text-right">
                  <div className="text-[7px] text-white/40">{row.size}</div>
                  <span className={`text-[7px] font-bold ${
                    row.status === 'ACK_RECEIVED' ? 'text-emerald-400' :
                    row.status === 'DISPATCHED' ? 'text-sky-400' :
                    row.status === 'ENCRYPTED' ? 'text-indigo-400' : 'text-white/40'
                  }`}>
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[7px] font-mono text-white/35">
          <span>PORT: 3000 // CORE</span>
          <span className="text-sky-400 font-semibold uppercase tracking-wider flex items-center gap-0.5">
            SECURE_COMMS <ArrowRight size={8} />
          </span>
        </div>
      </div>
    </div>
  );
};
