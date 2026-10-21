import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
  Zap,
  Wind,
  ShieldCheck,
  Disc3,
  Sliders,
} from 'lucide-react';
import { Track, Language, SdvsConfig } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { kmhToMph, dbToGain } from '../utils/sdvs';

interface CockpitDashboardProps {
  currentTrack: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  baseVolume: number;
  onVolumeChange: (vol: number) => void;
  currentSpeedKmH: number;
  onSpeedChange: (speed: number) => void;
  sdvsBoostDb: number;
  sdvsGainMultiplier: number;
  cabinNoiseDb: number;
  sdvsConfig: SdvsConfig;
  lang: Language;
  stealthMode: boolean;
  carMode: boolean;
  setCarMode: (val: boolean) => void;
  getFrequencyData: (arr: Uint8Array) => void;
  onOpenSdvsConfig: () => void;
}

export const CockpitDashboard: React.FC<CockpitDashboardProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  currentTime,
  duration,
  onSeek,
  baseVolume,
  onVolumeChange,
  currentSpeedKmH,
  onSpeedChange,
  sdvsBoostDb,
  sdvsGainMultiplier,
  cabinNoiseDb,
  sdvsConfig,
  lang,
  stealthMode,
  carMode,
  setCarMode,
  getFrequencyData,
  onOpenSdvsConfig,
}) => {
  const t = TRANSLATIONS[lang];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Real-time Audio Spectrum Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const buffer = new Uint8Array(32);

    const render = () => {
      animId = requestAnimationFrame(render);
      getFrequencyData(buffer);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numBars = 24;
      const barWidth = canvas.width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        const val = buffer[i] || 0;
        const percent = val / 255;
        const barHeight = Math.max(4, percent * canvas.height * 0.9);

        // Color shifts with vehicle speed and SDVS active boost
        const hue = 38 + (currentSpeedKmH / 180) * 160; // Shifts from amber (idle) to cyan/purple (highway)
        ctx.fillStyle = isPlaying
          ? `hsla(${hue}, 90%, 55%, ${0.3 + percent * 0.7})`
          : 'rgba(71, 85, 105, 0.4)';

        const x = i * (barWidth + 2);
        const y = canvas.height - barHeight;

        // Rounded top bar
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentSpeedKmH, getFrequencyData]);

  const speedRatio = Math.min(1.0, currentSpeedKmH / 180);
  const effectiveGainPercent = Math.min(100, Math.round(baseVolume * sdvsGainMultiplier * 100));

  return (
    <div className={`space-y-4 p-3 md:p-5 transition-all ${
      stealthMode ? 'bg-black text-slate-300' : 'text-slate-100'
    }`}>
      {/* Top Banner: Car Mode HUD Switch */}
      <div className="flex items-center justify-between rounded-xl bg-slate-900/60 border border-slate-800 p-2.5 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>{t.appSubtitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCarMode(!carMode)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              carMode
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.carMode}</span>
          </button>
        </div>
      </div>

      {/* Primary Automotive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Speedometer & SDVS Gauge (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

          {/* Speedometer Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase font-['Rajdhani']">
                {t.speedometer}
              </span>
            </div>
            <button
              onClick={onOpenSdvsConfig}
              className="flex items-center gap-1 rounded bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20"
            >
              <Sliders className="h-3 w-3" />
              <span>{t.sdvsTab}</span>
            </button>
          </div>

          {/* Speed Dial Arc Presentation */}
          <div className="flex flex-col items-center justify-center my-3 relative">
            {/* SVG Circular Gauge */}
            <div className="relative w-52 h-52 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-800"
                  strokeWidth="7"
                  fill="transparent"
                  strokeDasharray="264"
                  strokeDashoffset="66" // 3/4 circle
                  strokeLinecap="round"
                />
                {/* Dynamic Speed Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`transition-all duration-300 ${
                    currentSpeedKmH > 120
                      ? 'stroke-rose-500'
                      : currentSpeedKmH > 80
                      ? 'stroke-amber-400'
                      : 'stroke-cyan-400'
                  }`}
                  strokeWidth="7"
                  fill="transparent"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (speedRatio * 198)}
                  strokeLinecap="round"
                />
              </svg>

              {/* Digital Speed Core */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-extrabold tracking-tight font-['Rajdhani'] text-white">
                  {Math.round(currentSpeedKmH)}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-mono">
                  {t.speedKmH}
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                  ({Math.round(kmhToMph(currentSpeedKmH))} {t.speedMph})
                </span>
              </div>
            </div>

            {/* SDVS Boost Banner */}
            <div className={`mt-2 flex items-center justify-between w-full rounded-xl border p-2.5 px-3 transition-colors ${
              sdvsBoostDb > 0
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                <Zap className={`h-4 w-4 ${sdvsBoostDb > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
                <div>
                  <div className="text-[10px] font-bold tracking-wider uppercase">{t.sdvsBoost}</div>
                  <div className="text-xs font-semibold">
                    {sdvsConfig.enabled
                      ? `${sdvsConfig.curveType.toUpperCase()} CURVE`
                      : 'BYPASS'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold font-mono text-white">
                  +{sdvsBoostDb.toFixed(1)} <span className="text-xs text-amber-400">{t.decibels}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {sdvsGainMultiplier.toFixed(2)}x Dynamic Gain
                </div>
              </div>
            </div>

            {/* Cabin Noise Estimation */}
            <div className="mt-2 flex items-center justify-between w-full rounded-xl border border-slate-800 bg-slate-900/40 p-2 px-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Wind className="h-3.5 w-3.5 text-sky-400" />
                <span>{t.cabinNoise}</span>
              </div>
              <div className="font-mono font-semibold text-slate-200">
                ~{Math.round(cabinNoiseDb)} dBA
              </div>
            </div>
          </div>

          {/* Interactive Speed Cruise Simulator */}
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5">
              <span>{t.throttle}</span>
              <span className="font-mono text-amber-400">{Math.round(currentSpeedKmH)} {t.speedKmH}</span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="1"
              value={currentSpeedKmH}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              aria-label={t.throttle}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />

            {/* Quick Cruise Speed Presets */}
            <div className="grid grid-cols-4 gap-1.5 mt-3">
              <button
                onClick={() => onSpeedChange(0)}
                className={`rounded py-1 text-[11px] font-bold border transition ${
                  currentSpeedKmH === 0
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                0
              </button>
              <button
                onClick={() => onSpeedChange(45)}
                className={`rounded py-1 text-[11px] font-bold border transition ${
                  currentSpeedKmH === 45
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                45
              </button>
              <button
                onClick={() => onSpeedChange(105)}
                className={`rounded py-1 text-[11px] font-bold border transition ${
                  currentSpeedKmH === 105
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                105
              </button>
              <button
                onClick={() => onSpeedChange(155)}
                className={`rounded py-1 text-[11px] font-bold border transition ${
                  currentSpeedKmH === 155
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                155
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Audio Head-Unit & Transport Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5 shadow-xl">
          
          {/* Now Playing Metadata Card */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-3">
              <span className="uppercase tracking-wider font-['Rajdhani'] flex items-center gap-1.5">
                <Disc3 className={`h-4 w-4 text-amber-400 ${isPlaying ? 'animate-spin' : ''}`} />
                {t.nowPlaying}
              </span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                {currentTrack.fileSize || 'PCM FLAC 24-bit'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Album Art disc / gradient */}
              <div className={`relative flex h-20 w-20 md:h-24 md:w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${currentTrack.coverColor} shadow-lg shadow-black/40`}>
                <Disc3 className="h-10 w-10 text-white/90" />
                {isPlaying && (
                  <span className="absolute inset-0 rounded-2xl border-2 border-amber-400/60 animate-pulse pointer-events-none" />
                )}
              </div>

              {/* Title & Artist */}
              <div className="min-w-0 flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-white truncate font-['Rajdhani']">
                  {currentTrack.title}
                </h3>
                <p className="text-sm font-medium text-amber-400/90 truncate mt-0.5">
                  {currentTrack.artist}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {currentTrack.album} {currentTrack.bpm ? `• ${currentTrack.bpm} BPM` : ''}
                </p>
              </div>
            </div>

            {/* Audio Spectrum Visualizer */}
            <div className="mt-4 rounded-xl bg-slate-950/80 border border-slate-800/60 p-2.5">
              <canvas
                ref={canvasRef}
                width={360}
                height={48}
                className="w-full h-12 block"
              />
            </div>

            {/* Track Time & Scrubber */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.5"
                value={currentTime}
                onChange={(e) => onSeek(Number(e.target.value))}
                aria-label="Track progress"
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Automotive Safe Transport Controls (Giant touch targets for in-car ergonomics) */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-center gap-4 md:gap-6">
              {/* Previous Track */}
              <button
                onClick={onPrevTrack}
                aria-label="Previous Track"
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-200 hover:bg-slate-700 active:scale-95 transition border border-slate-700 shadow-md"
              >
                <SkipBack className="h-6 w-6" />
              </button>

              {/* Main Play / Pause Button - Giant Touch Surface */}
              <button
                onClick={onTogglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="flex h-20 w-24 md:h-20 md:w-28 items-center justify-center rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 active:scale-95 transition shadow-xl shadow-amber-500/25 border border-amber-400/40"
              >
                {isPlaying ? (
                  <Pause className="h-9 w-9 fill-current" />
                ) : (
                  <Play className="h-9 w-9 fill-current ml-1" />
                )}
              </button>

              {/* Next Track */}
              <button
                onClick={onNextTrack}
                aria-label="Next Track"
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-200 hover:bg-slate-700 active:scale-95 transition border border-slate-700 shadow-md"
              >
                <SkipForward className="h-6 w-6" />
              </button>
            </div>

            {/* Volume Control Bar with SDVS Boost Overlay */}
            <div className="mt-5 rounded-xl bg-slate-900/60 border border-slate-800 p-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Volume2 className="h-4 w-4 text-amber-400" />
                  <span>{t.baseVolume}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400">Base: {Math.round(baseVolume * 100)}%</span>
                  {sdvsBoostDb > 0 && (
                    <span className="text-amber-400 font-bold">
                      → Cabin Gain: {effectiveGainPercent}% (+{sdvsBoostDb.toFixed(1)} dB)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onVolumeChange(baseVolume > 0 ? 0 : 0.7)}
                  aria-label="Toggle mute"
                  className="text-slate-400 hover:text-white"
                >
                  {baseVolume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={baseVolume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  aria-label={t.baseVolume}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
