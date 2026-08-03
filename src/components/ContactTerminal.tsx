/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Terminal, Send, Cpu, CheckCircle, RefreshCw } from 'lucide-react';
import { sound } from './SoundManager';
import { PacketTransmission } from './PacketTransmission';

interface TerminalLine {
  text: string;
  type: 'system' | 'prompt' | 'input' | 'success' | 'warning' | 'info';
  timestamp: string;
}

export const ContactTerminal: React.FC = () => {
  const [history, setHistory] = useState<TerminalLine[]>([
    { text: 'HELIOS COMMAND TERMINAL v4.2.0', type: 'system', timestamp: '00:00:00' },
    { text: 'ESTABLISHING SECURE PROTOCOLS...', type: 'info', timestamp: '00:00:01' },
    { text: 'SYS_ALERT: CORRIDOR ACCESS GRANTED.', type: 'success', timestamp: '00:00:02' },
    { text: 'TO SUBMIT MESSAGE, RESPOND TO THE COGNITIVE PROMPTS BELOW.', type: 'info', timestamp: '00:00:03' },
    { text: '---------------------------------------------------------', type: 'system', timestamp: '00:00:04' },
  ]);

  const [inputVal, setInputVal] = useState<string>('');
  const [stage, setStage] = useState<'name' | 'email' | 'message' | 'processing' | 'done'>('name');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [processingLines, setProcessingLines] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const printedStepsRef = useRef<Set<string>>(new Set());

  const getTimestamp = () => {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  };

  // Auto scroll terminal to bottom on change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, processingLines, stage]);

  // Initial prompt trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setHistory(prev => [
        ...prev,
        { text: 'COGNITIVE_IDENTIFIER (Enter your Name):', type: 'prompt', timestamp: getTimestamp() }
      ]);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const currentVal = inputVal;
    setInputVal('');

    // Add user response to history
    setHistory(prev => [
      ...prev,
      { text: `> ${currentVal}`, type: 'input', timestamp: getTimestamp() }
    ]);

    if (stage === 'name') {
      const trimmedName = currentVal.trim();
      if (trimmedName.length < 2) {
        sound.playError();
        setHistory(prev => [
          ...prev,
          { text: 'WARNING: IDENTITY IDENTIFIER TOO SHORT. COGNITIVE RECONNAISSANCE EXPECTS AT LEAST 2 CHARACTERS.', type: 'warning', timestamp: getTimestamp() },
          { text: 'COGNITIVE_IDENTIFIER (Enter your Name):', type: 'prompt', timestamp: getTimestamp() }
        ]);
        return;
      }
      sound.playConfirm();
      setFormData(prev => ({ ...prev, name: trimmedName }));
      setStage('email');
      setTimeout(() => {
        setHistory(prev => [
          ...prev,
          { text: `GREETINGS PILOT: "${trimmedName.toUpperCase()}"`, type: 'info', timestamp: getTimestamp() },
          { text: 'COMMS_LINK (Enter your Email):', type: 'prompt', timestamp: getTimestamp() }
        ]);
      }, 500);
    } 
    else if (stage === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmedEmail = currentVal.trim();
      
      if (!emailRegex.test(trimmedEmail)) {
        sound.playError();
        setHistory(prev => [
          ...prev,
          { text: 'WARNING: COMMS_LINK SCHEMA INVALID. ATTEMPT RE-ENTRY (e.g., pilot@domain.com).', type: 'warning', timestamp: getTimestamp() },
          { text: 'COMMS_LINK (Enter your Email):', type: 'prompt', timestamp: getTimestamp() }
        ]);
        return;
      }
      sound.playConfirm();
      setFormData(prev => ({ ...prev, email: trimmedEmail }));
      setStage('message');
      setTimeout(() => {
        setHistory(prev => [
          ...prev,
          { text: 'LINK VERIFIED. SECURE HANDSHAKE SUCCESS.', type: 'info', timestamp: getTimestamp() },
          { text: 'TRANSMISSION_LOG (Enter your Message):', type: 'prompt', timestamp: getTimestamp() }
        ]);
      }, 500);
    } 
    else if (stage === 'message') {
      const trimmedMsg = currentVal.trim();
      if (trimmedMsg.length < 10) {
        sound.playError();
        setHistory(prev => [
          ...prev,
          { text: 'WARNING: TRANSMISSION LOG IS TOO SHORT (MIN 10 CHARACTERS). INSUFFICIENT PAYLOAD SIZE.', type: 'warning', timestamp: getTimestamp() },
          { text: 'TRANSMISSION_LOG (Enter your Message):', type: 'prompt', timestamp: getTimestamp() }
        ]);
        return;
      }
      const payload = {
        name: formData.name,
        email: formData.email,
        message: trimmedMsg,
      };
      setFormData(prev => ({ ...prev, message: trimmedMsg }));
      printedStepsRef.current.clear();
      setProcessingLines([]);
      setStage('processing');

      // Dispatch async payload transmission to backend API endpoint
      fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errorMsg = errData?.error?.message || 'BACKEND API UNREACHABLE';
          setProcessingLines(prev => [...prev, `SYS_ERR: ${errorMsg.toUpperCase()}`]);
        }
      }).catch((err) => {
        console.warn('Contact API dispatch warning:', err);
      });
    }
  };

  // Synchronized progress controller listening to GSAP PacketTransmission percentages
  const handleProgressUpdate = (percent: number) => {
    setUploadProgress(percent);
    
    const maybeAddLine = (stepId: string, text: string) => {
      if (!printedStepsRef.current.has(stepId)) {
        printedStepsRef.current.add(stepId);
        sound.playKeypress();
        setProcessingLines(prev => [...prev, text]);
      }
    };

    if (percent >= 0 && percent < 18) {
      maybeAddLine('init', 'INITIATING UPLOAD ROUTE TO HELIOS CORE ENGINE...');
    }
    if (percent >= 18 && percent < 38) {
      maybeAddLine('proxies', 'ESTABLISHING SECURE MULTI-NODE PROXY RELAYS...');
    }
    if (percent >= 38 && percent < 58) {
      maybeAddLine('encrypt', 'ENCRYPTING PACKET LOAD WITH SYMMETRIC AES-GCM-256...');
    }
    if (percent >= 58 && percent < 82) {
      const progressDots = Math.floor((percent - 58) / 2.4);
      const bar = '='.repeat(progressDots) + ' '.repeat(10 - progressDots);
      maybeAddLine(`upload-${progressDots}`, `TRANSMITTING STREAM DATA CORRIDOR [${bar}] ${percent}%`);
    }
    if (percent >= 82 && percent < 98) {
      maybeAddLine('sync', 'SYNCHRONIZING INTEGRITY METADATA STACKS WITH REMOTE RECON...');
    }
    if (percent === 100) {
      maybeAddLine('success', 'TRANSMISSION SUCCESSFUL! HELIOS PILOT NOTIFIED.');
      setTimeout(() => {
        sound.playConfirm();
        setStage('done');
      }, 700);
    }
  };

  const resetTerminal = () => {
    sound.playConfirm();
    setFormData({ name: '', email: '', message: '' });
    setProcessingLines([]);
    setUploadProgress(0);
    printedStepsRef.current.clear();
    setStage('name');
    setHistory([
      { text: 'HELIOS COMMAND TERMINAL v4.2.0', type: 'system', timestamp: getTimestamp() },
      { text: 'ESTABLISHING SECURE PROTOCOLS...', type: 'info', timestamp: getTimestamp() },
      { text: 'SYS_ALERT: CORRIDOR ACCESS GRANTED.', type: 'success', timestamp: getTimestamp() },
      { text: '---------------------------------------------------------', type: 'system', timestamp: getTimestamp() },
      { text: 'COGNITIVE_IDENTIFIER (Enter your Name):', type: 'prompt', timestamp: getTimestamp() }
    ]);
  };

  const handleKeyPress = () => {
    sound.playKeypress();
  };

  return (
    <div id="contact-container" className="relative w-full max-w-4xl mx-auto px-4 py-24 min-h-[90vh] flex flex-col justify-center">
      {/* Visual background scanning grid */}
      <div className="absolute inset-0 bg-radial-gradient from-white/3 to-transparent pointer-events-none opacity-4 transition-all" />

      {/* Terminal Title / Header */}
      <div className="mb-8 text-center">
        <div className="text-xs font-mono text-white/35 tracking-widest mb-2">// Contact</div>
        <h2 className="text-3xl md:text-5xl font-sans tracking-tight text-white font-bold">Contact Terminal</h2>
        <p className="text-white/50 text-xs font-mono mt-2">
          Direct link. Type your details below to transmit a message.
        </p>
      </div>

      {/* Terminal Box */}
      <div 
        className={`w-full min-h-[420px] md:min-h-[480px] border rounded-2xl bg-black/85 backdrop-blur-md overflow-hidden flex flex-col shadow-3xl transition-all duration-300 ${isFocused ? 'border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.08)]' : 'border-white/10'}`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Terminal Header Bar */}
        <div className="h-10 border-b border-white/5 bg-white/2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-white/50" />
            <span className="text-[10px] font-mono text-white/45 uppercase tracking-widest">COGNITIVE_COMM_STREAM</span>
          </div>

          {/* Simulated OS control buttons */}
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/10" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse" />
          </div>
        </div>

        {/* Console split body panel */}
        <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
          {/* Left panel: Log stream */}
          <div 
            ref={scrollRef}
            className={`flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2.5 custom-scrollbar text-white/80 p-1 min-h-[160px] max-h-[360px] ${
              (stage === 'processing' || stage === 'done') ? 'lg:max-w-[45%]' : 'w-full'
            }`}
          >
            {/* Historical text lines */}
            {history.map((line, idx) => {
              const colorClass = 
                line.type === 'prompt' ? 'text-white font-semibold' :
                line.type === 'input' ? 'text-sky-400 font-medium' :
                line.type === 'success' ? 'text-emerald-400' :
                line.type === 'warning' ? 'text-rose-400 font-bold' :
                line.type === 'info' ? 'text-white/50' : 'text-white/30';

              return (
                <div key={idx} className="flex gap-3 items-start select-text">
                  <span className="text-white/15 select-none">{line.timestamp}</span>
                  <span className={colorClass}>{line.text}</span>
                </div>
              );
            })}

            {/* Processing stream lines */}
            {processingLines.map((line, idx) => {
              const isLast = idx === processingLines.length - 1;
              const colorClass = isLast && stage === 'processing' ? 'text-white animate-pulse' : 'text-emerald-400';
              return (
                <div key={`proc-${idx}`} className="flex gap-3 items-start">
                  <span className="text-emerald-500/20 select-none">PROC_RUN</span>
                  <span className={`${colorClass} flex items-center gap-2`}>
                    {!isLast ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> : <Cpu size={10} className="animate-spin text-white" />}
                    {line}
                  </span>
                </div>
              );
            })}

            {/* Done stage summary */}
            {stage === 'done' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 border border-emerald-500/30 bg-emerald-500/5 p-4 rounded-xl text-[10px] space-y-1.5 max-w-md select-text"
              >
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5 uppercase mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>COGNITIVE HANDSHAKE SUCCESSFUL</span>
                </div>
                <div className="text-white/60">SENDER: {formData.name}</div>
                <div className="text-white/60">LINK_MAIL: {formData.email}</div>
                <div className="text-white/60">ENCRYPT_KEY: AES_GCM_SHA256_V2</div>
                <button 
                  onClick={resetTerminal}
                  className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white text-white hover:text-black hover:font-bold rounded text-[9px] font-sans font-medium tracking-wider transition-all duration-200"
                >
                  <RefreshCw size={10} />
                  NEW TRANSMISSION
                </button>
              </motion.div>
            )}

            {/* Inline Active Interactive Prompt Input */}
            {(stage === 'name' || stage === 'email' || stage === 'message') && (
              <form onSubmit={handleInputSubmit} className="flex items-center gap-2 mt-4">
                <span className="text-sky-400 animate-pulse font-bold">&gt;&nbsp;</span>
                <input
                  ref={inputRef}
                  type={stage === 'email' ? 'email' : 'text'}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="flex-1 bg-transparent border-none outline-none text-sky-400 caret-white select-all text-[11px] font-mono py-0.5"
                  placeholder={
                    stage === 'name' ? 'Enter identity name...' :
                    stage === 'email' ? 'Enter verification email...' :
                    'Type transmission log...'
                  }
                  autoFocus
                />
                <button type="submit" className="text-sky-400 hover:text-white p-1 rounded transition-colors">
                  <Send size={10} />
                </button>
              </form>
            )}
          </div>

          {/* Right panel: Data Packet Transmission Animation */}
          {(stage === 'processing' || stage === 'done') && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex-1 min-h-[220px] flex items-center justify-center"
            >
              <PacketTransmission 
                name={formData.name} 
                email={formData.email} 
                onProgressUpdate={handleProgressUpdate}
              />
            </motion.div>
          )}
        </div>

        {/* Interactive Keyboard Info Banner for Mobile UX */}
        <div className="h-8 border-t border-white/5 bg-white/1 px-4 flex items-center justify-between font-mono text-[8px] text-white/25">
          <span>PORT: 3000 // INPUT_ACTIVE</span>
          <span className="flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>TERMINAL_LISTENER_ONLINE</span>
          </span>
        </div>
      </div>
    </div>
  );
};
