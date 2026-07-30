/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = true;
  private volume: number = 0.3;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private motorOsc: OscillatorNode | null = null;
  private motorOsc2: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;
  private motorFilter: BiquadFilterNode | null = null;
  private motorPanner: StereoPannerNode | null = null;

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.startAmbientHum();
        this.startMotorHum();
      }
    } catch (e) {
      console.warn('AudioContext not supported in this browser.', e);
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.init();
    
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : this.volume * 0.04, this.ctx?.currentTime || 0);
    }

    if (this.motorGain) {
      this.motorGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.ambientGain && !this.muted && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.volume * 0.04, this.ctx.currentTime);
    }
  }

  isMuted() {
    return this.muted;
  }

  private startAmbientHum() {
    if (!this.ctx) return;
    try {
      // Sub-bass engine hum (ambient)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(110, this.ctx.currentTime); // A2
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, this.ctx.currentTime);
      filter.Q.setValueAtTime(1, this.ctx.currentTime);

      gain.gain.setValueAtTime(this.muted ? 0 : this.volume * 0.04, this.ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();

      this.ambientOsc = osc1; // Hold references
      this.ambientGain = gain;
    } catch (e) {
      console.error('Failed to start ambient hum:', e);
    }
  }

  // Soft high-frequency clock tick
  playTick() {
    if (this.muted || !this.ctx) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);

      gain.gain.setValueAtTime(this.volume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // Keyboard click for terminal
  playKeypress() {
    if (this.muted || !this.ctx) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Bandpass filtered short noise-like pop
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250 + Math.random() * 80, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, now);

      gain.gain.setValueAtTime(this.volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.03);
    } catch (e) {}
  }

  // Dual chime for UI actions
  playConfirm() {
    if (this.muted || !this.ctx) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880, now + 0.08); // A5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now); // D6
      osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain1.gain.setValueAtTime(this.volume * 0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      gain2.gain.setValueAtTime(this.volume * 0.1, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(this.ctx.destination);
      gain2.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch (e) {}
  }

  // Hologram activation sound
  playHoloOn() {
    if (this.muted || !this.ctx) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1500, now + 0.4);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.12, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  // System error hum
  playError() {
    if (this.muted || !this.ctx) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(130, now); // C3

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(135, now); // Detuned C3

      gain.gain.setValueAtTime(this.volume * 0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (e) {}
  }

  // Cybernetic glitch synthesizer noise
  playGlitch() {
    if (this.muted || !this.ctx) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      const now = this.ctx.currentTime;
      
      // We will create two oscillators with distinct wave shapes to generate a noisy, gritty glitch
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(180, now);
      // Rapid frequency modulation to sound unstable
      osc1.frequency.setValueAtTime(80, now + 0.05);
      osc1.frequency.setValueAtTime(950, now + 0.08);
      osc1.frequency.exponentialRampToValueAtTime(120, now + 0.22);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(320, now);
      osc2.frequency.setValueAtTime(45, now + 0.04);
      osc2.frequency.setValueAtTime(1200, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(100, now + 0.25);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.25);
      filter.Q.setValueAtTime(4, now);

      gain.gain.setValueAtTime(this.volume * 0.18, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.22, now + 0.04);
      gain.gain.setValueAtTime(this.volume * 0.08, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch (e) {}
  }

  private startMotorHum() {
    if (!this.ctx) return;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(110, this.ctx.currentTime); // 110Hz base pitch

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(112.5, this.ctx.currentTime); // Chorus detuning

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);

      if (this.ctx.createStereoPanner) {
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(0, this.ctx.currentTime);
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(panner);
        panner.connect(this.ctx.destination);
        this.motorPanner = panner;
      } else {
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
      }

      osc1.start();
      osc2.start();

      this.motorOsc = osc1;
      this.motorOsc2 = osc2;
      this.motorGain = gain;
      this.motorFilter = filter;
    } catch (e) {
      console.error('Failed to start motor hum:', e);
    }
  }

  updateMotorHum(velocity: number, acceleration: number, scrollProgress: number) {
    if (this.muted) return;
    this.init();
    if (!this.ctx || !this.motorGain || !this.motorFilter) return;

    const now = this.ctx.currentTime;

    // Scale raw progress-per-frame velocity — lowered multiplier so gentle scrolling triggers audio
    const speedFactor = Math.min(1.0, Math.abs(velocity) * 18);
    const accelFactor = Math.min(1.0, Math.abs(acceleration) * 60);

    // Subtle volume scaling that ramps up when moving
    let targetVolume = 0;
    if (speedFactor > 0.01) {
      targetVolume = this.volume * 0.28 * (speedFactor * 0.65 + accelFactor * 0.35);
    } else {
      targetVolume = 0; // Absolute silence when completely stationary
    }

    // Revving mechanical pitch: frequency shifts higher (e.g., from 110Hz to 240Hz)
    const baseFreq = 110;
    const targetFreq1 = baseFreq + speedFactor * 120 + accelFactor * 30;
    const targetFreq2 = (baseFreq + 2.5) + speedFactor * 123 + accelFactor * 30;

    // Open up bandpass filter range to let mechanical high-frequency rumble pass as speed increases
    const filterFreq = 140 + speedFactor * 350 + accelFactor * 100;

    // Spatialization: Pan shifts left to right as the rover drives across the screen coordinates
    const targetPan = -0.8 + scrollProgress * 1.6;

    // Apply with robust Web Audio API scheduling
    this.motorGain.gain.setTargetAtTime(targetVolume, now, 0.15);
    
    if (this.motorOsc) {
      this.motorOsc.frequency.setTargetAtTime(targetFreq1, now, 0.15);
    }
    if (this.motorOsc2) {
      this.motorOsc2.frequency.setTargetAtTime(targetFreq2, now, 0.15);
    }
    
    this.motorFilter.frequency.setTargetAtTime(filterFreq, now, 0.2);

    if (this.motorPanner) {
      this.motorPanner.pan.setTargetAtTime(Math.max(-1, Math.min(1, targetPan)), now, 0.2);
    }
  }
}

export const sound = new SoundManager();
