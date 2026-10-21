import { Track } from '../types';

/**
 * Built-in default tracks that work without any internet connection
 */
export const DEFAULT_TRACKS: Track[] = [
  {
    id: 'track_synthwave',
    title: 'Neon Autobahn (120 BPM)',
    artist: 'AMP Sonic Lab',
    album: 'Automotive Horizons',
    duration: 184,
    isProcedural: true,
    proceduralTheme: 'synthwave',
    bpm: 120,
    coverColor: 'from-amber-500 via-rose-600 to-indigo-900',
    fileSize: 'High-Res Audio DSP (FLAC-Grade)',
  },
  {
    id: 'track_night_cruiser',
    title: 'Midnight Expressway',
    artist: 'Night Drive Audio',
    album: 'Zero Distraction',
    duration: 215,
    isProcedural: true,
    proceduralTheme: 'ambient_night',
    bpm: 98,
    coverColor: 'from-cyan-500 via-blue-700 to-slate-950',
    fileSize: 'Procedural PCM Stream',
  },
  {
    id: 'track_desert_run',
    title: 'Desert Mirage Cruise',
    artist: 'Dune Velocity',
    album: 'Trans-Arabia Highway',
    duration: 196,
    isProcedural: true,
    proceduralTheme: 'desert_run',
    bpm: 110,
    coverColor: 'from-emerald-500 via-teal-700 to-slate-900',
    fileSize: 'Procedural PCM Stream',
  },
  {
    id: 'track_drift',
    title: 'Cyberpunk Downhill Drift',
    artist: 'Apex Horizon',
    album: 'Tokyo Expressway',
    duration: 165,
    isProcedural: true,
    proceduralTheme: 'highway_drift',
    bpm: 128,
    coverColor: 'from-fuchsia-500 via-purple-700 to-slate-950',
    fileSize: 'Procedural PCM Stream',
  },
];

/**
 * Automotive Audio Engine utilizing Web Audio API
 * - Main Master Gain
 * - SDVS Dynamic Gain Node (adjusts automatically based on vehicle speed)
 * - Cabin EQ Filter (low/mid/high shaping)
 * - AnalyserNode for audio visualization
 * - Cabin Road Noise Simulation Node (pink/brown noise generator scaling with vehicle speed)
 */
class AutomotiveAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sdvsGain: GainNode | null = null;
  private cabinEq: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private currentSource: AudioNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private timerInterval: any = null;
  private synthInterval: any = null;

  public isPlaying: boolean = false;
  public currentTime: number = 0;
  public currentTrack: Track = DEFAULT_TRACKS[0];
  public onTimeUpdate?: (time: number, duration: number) => void;
  public onTrackEnd?: () => void;
  public onStateChange?: (playing: boolean) => void;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Analyser for real-time automotive spectrum
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      // Cabin EQ
      this.cabinEq = this.ctx.createBiquadFilter();
      this.cabinEq.type = 'peaking';
      this.cabinEq.frequency.value = 1200; // Enhance vocal clarity over cabin rumble
      this.cabinEq.Q.value = 1.0;
      this.cabinEq.gain.value = 2.0;

      // SDVS Dynamic Gain Node
      this.sdvsGain = this.ctx.createGain();
      this.sdvsGain.gain.value = 1.0; // 0 dB baseline

      // Master User Volume Gain Node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;

      // Graph: Source -> Analyser -> Cabin EQ -> SDVS Gain -> Master Gain -> Destination
      this.analyser.connect(this.cabinEq);
      this.cabinEq.connect(this.sdvsGain);
      this.sdvsGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Cabin road noise simulator chain
      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.value = 0.0;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 350; // Low frequency tire rumble
      this.noiseGain.connect(noiseFilter);
      noiseFilter.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Set user base volume [0.0, 1.0]
   */
  public setBaseVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1.0, vol));
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  /**
   * Apply SDVS multiplier gain (dynamically computed from speed)
   */
  public setSdvsGainMultiplier(gainMultiplier: number) {
    if (this.sdvsGain && this.ctx) {
      const clamped = Math.max(0.1, Math.min(3.5, gainMultiplier));
      // Smooth audio parameter ramp to avoid clicks
      this.sdvsGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Update road noise simulation intensity based on speed
   */
  public setRoadNoiseSimulation(speedKmH: number, enabled: boolean) {
    if (!this.ctx || !this.noiseGain) return;
    if (!enabled || speedKmH < 10) {
      this.noiseGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      return;
    }
    // Noise level scales from 0.02 at 40 km/h to 0.12 at 130 km/h
    const noiseLevel = Math.min(0.15, (speedKmH / 140) * 0.1);
    this.noiseGain.gain.setTargetAtTime(noiseLevel, this.ctx.currentTime, 0.1);
    this.ensureNoiseSource();
  }

  private ensureNoiseSource() {
    if (!this.ctx || !this.noiseGain || this.noiseNode) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      // Generate pink/brown automotive rumble noise
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;
      this.noiseNode.connect(this.noiseGain);
      this.noiseNode.start();
    } catch {}
  }

  /**
   * Play current or specified track
   */
  public async play(track?: Track) {
    this.initContext();
    if (track) {
      if (this.currentTrack.id !== track.id) {
        this.currentTrack = track;
        this.currentTime = 0;
      }
    }

    if (this.isPlaying) return;

    if (this.currentTrack.url && !this.currentTrack.isProcedural) {
      // User uploaded or external audio URL
      this.playHtmlAudio(this.currentTrack.url);
    } else {
      // Procedural automotive synth track
      this.startProceduralSynth();
    }

    this.isPlaying = true;
    this.startTimer();
    this.onStateChange?.(true);
    this.updateMediaSession();
  }

  /**
   * Pause playback
   */
  public pause() {
    this.isPlaying = false;
    this.stopProceduralSynth();
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.onStateChange?.(false);
    this.updateMediaSession();
  }

  public togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number) {
    this.currentTime = Math.max(0, Math.min(this.currentTrack.duration, seconds));
    if (this.audioElement) {
      this.audioElement.currentTime = this.currentTime;
    }
    this.onTimeUpdate?.(this.currentTime, this.currentTrack.duration);
  }

  private startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isPlaying) return;
      this.currentTime += 0.5;
      if (this.currentTime >= this.currentTrack.duration) {
        this.currentTime = 0;
        this.onTrackEnd?.();
      }
      this.onTimeUpdate?.(this.currentTime, this.currentTrack.duration);
    }, 500);
  }

  private playHtmlAudio(url: string) {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      const source = this.ctx!.createMediaElementSource(this.audioElement);
      source.connect(this.analyser!);
    }
    this.audioElement.src = url;
    this.audioElement.currentTime = this.currentTime;
    this.audioElement.play().catch(() => {});
  }

  /**
   * Procedural Automotive Synthesizer
   * Produces rhythmic synth bass, chords, and percussion rhythms
   */
  private startProceduralSynth() {
    if (!this.ctx || !this.analyser) return;

    // Musical scale notes (Pentatonic / Dorian for sleek highway driving)
    const baseFreqs = [110, 130.81, 146.83, 164.81, 196.0, 220.0, 261.63]; // A minor pentatonic
    let step = 0;
    const bpm = this.currentTrack.bpm || 120;
    const intervalMs = (60 / bpm / 2) * 1000; // Eighth notes

    if (this.synthInterval) clearInterval(this.synthInterval);

    this.synthInterval = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;

      const now = this.ctx.currentTime;

      // Kick & Bass groove every 4 steps
      if (step % 4 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.15);
        gain.gain.setValueAtTime(0.55, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.analyser!);
        osc.start(now);
        osc.stop(now + 0.35);
      }

      // Snare / Hi-hat on offbeats
      if (step % 4 === 2) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.analyser!);
        osc.start(now);
        osc.stop(now + 0.15);
      }

      // Synth Arpeggio / Lead Melody
      if (step % 2 === 0) {
        const noteIndex = (step * 3) % baseFreqs.length;
        const noteFreq = baseFreqs[noteIndex];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = step % 8 === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(noteFreq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.analyser!);

        osc.start(now);
        osc.stop(now + 0.25);
      }

      step = (step + 1) % 32;
    }, intervalMs);
  }

  private stopProceduralSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  /**
   * Get real-time audio visualization frequency data [0..255]
   */
  public getFrequencyData(array: any): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(array);
    } else {
      array.fill(0);
    }
  }

  /**
   * Native MediaSession integration with vehicle bluetooth & system drawer
   */
  public updateMediaSession() {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.currentTrack.title,
        artist: this.currentTrack.artist,
        album: this.currentTrack.album,
        artwork: [
          { src: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=512&q=80', sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';

      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', () => this.seek(this.currentTime - 10));
      navigator.mediaSession.setActionHandler('seekforward', () => this.seek(this.currentTime + 10));
    }
  }
}

export const audioEngine = new AutomotiveAudioEngine();
