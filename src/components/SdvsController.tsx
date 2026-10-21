import React from 'react';
import {
  Sliders,
  TrendingUp,
  MapPin,
  Compass,
  Cpu,
  Volume2,
  Wind,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { SdvsConfig, Language, SdvsCurveType } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { calculateSdvsBoostDb, dbToGain, calculateCabinNoiseDb } from '../utils/sdvs';

interface SdvsControllerProps {
  config: SdvsConfig;
  onChangeConfig: (config: SdvsConfig) => void;
  currentSpeedKmH: number;
  sdvsBoostDb: number;
  sdvsGainMultiplier: number;
  isGpsActive: boolean;
  onToggleGps: () => void;
  gpsAccuracy: number | null;
  lang: Language;
}

export const SdvsController: React.FC<SdvsControllerProps> = ({
  config,
  onChangeConfig,
  currentSpeedKmH,
  sdvsBoostDb,
  sdvsGainMultiplier,
  isGpsActive,
  onToggleGps,
  gpsAccuracy,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  // Generate SVG curve points for speed 0 to 180 km/h
  const curvePoints: { speed: number; boost: number }[] = [];
  for (let s = 0; s <= 180; s += 5) {
    const boost = calculateSdvsBoostDb(s, config);
    curvePoints.push({ speed: s, boost });
  }

  // Map to SVG coordinates [0..300, 0..120]
  const svgWidth = 300;
  const svgHeight = 120;
  const maxPlotSpeed = 180;
  const maxPlotBoost = Math.max(12, config.maxBoostDb + 2);

  const pointsString = curvePoints
    .map((p) => {
      const x = (p.speed / maxPlotSpeed) * svgWidth;
      const y = svgHeight - (p.boost / maxPlotBoost) * svgHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Current vehicle speed marker point on SVG
  const cursorX = (Math.min(maxPlotSpeed, currentSpeedKmH) / maxPlotSpeed) * svgWidth;
  const cursorY = svgHeight - (sdvsBoostDb / maxPlotBoost) * svgHeight;

  return (
    <div className="space-y-4 p-3 md:p-5 text-slate-100">
      {/* Header card */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sliders className="h-5 w-5" />
              </div>
              <h2 className="text-lg md:text-xl font-bold font-['Rajdhani'] text-white">
                {t.sdvsTitle}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">
              {t.sdvsSubtitle}
            </p>
          </div>

          {/* Master Enable Toggle */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 px-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-300">
              {t.sdvsEnable}
            </span>
            <button
              onClick={() => onChangeConfig({ ...config, enabled: !config.enabled })}
              aria-label={t.sdvsEnable}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                config.enabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                  config.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Mathematical Curve Visualization & Realtime Cursor (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani']">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              <span>{t.curveType}</span>
            </div>
            <span className="text-[11px] font-mono text-amber-400 font-bold">
              {config.curveType.toUpperCase()} MODEL
            </span>
          </div>

          {/* Curve Selector Pills */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(
              [
                { type: 'exponential', label: t.curveExponential },
                { type: 'linear', label: t.curveLinear },
                { type: 's_curve', label: t.curveSCurve },
              ] as { type: SdvsCurveType; label: string }[]
            ).map((item) => (
              <button
                key={item.type}
                onClick={() => onChangeConfig({ ...config, curveType: item.type })}
                className={`rounded-xl p-2.5 text-xs font-semibold text-left transition border ${
                  config.curveType === item.type
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-md'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">{item.type.replace('_', ' ').toUpperCase()}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1">{item.label}</div>
              </button>
            ))}
          </div>

          {/* SVG Acoustic Curve Plot */}
          <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-3 pt-6 overflow-hidden">
            <svg
              className="w-full h-36 overflow-visible"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              {/* Background grid lines */}
              <line x1="0" y1={svgHeight * 0.25} x2={svgWidth} y2={svgHeight * 0.25} stroke="#334155" strokeDasharray="3,3" strokeWidth="0.8" />
              <line x1="0" y1={svgHeight * 0.5} x2={svgWidth} y2={svgHeight * 0.5} stroke="#334155" strokeDasharray="3,3" strokeWidth="0.8" />
              <line x1="0" y1={svgHeight * 0.75} x2={svgWidth} y2={svgHeight * 0.75} stroke="#334155" strokeDasharray="3,3" strokeWidth="0.8" />

              {/* Threshold indicator line for minSpeed */}
              <line
                x1={(config.minSpeedKmH / maxPlotSpeed) * svgWidth}
                y1="0"
                x2={(config.minSpeedKmH / maxPlotSpeed) * svgWidth}
                y2={svgHeight}
                stroke="#64748b"
                strokeDasharray="2,2"
                strokeWidth="1"
              />

              {/* Threshold indicator line for maxSpeed */}
              <line
                x1={(config.maxSpeedKmH / maxPlotSpeed) * svgWidth}
                y1="0"
                x2={(config.maxSpeedKmH / maxPlotSpeed) * svgWidth}
                y2={svgHeight}
                stroke="#f59e0b"
                strokeDasharray="2,2"
                strokeWidth="1"
              />

              {/* The Mathematical Curve Polyline */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                points={pointsString}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Shaded Area Under Curve */}
              <polygon
                fill="url(#amberGradient)"
                opacity="0.25"
                points={`0,${svgHeight} ${pointsString} ${svgWidth},${svgHeight}`}
              />

              <defs>
                <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* Live Vehicle Speed Cursor on the Curve */}
              {config.enabled && (
                <g transform={`translate(${cursorX}, ${cursorY})`}>
                  <circle r="6" fill="#f59e0b" className="animate-ping opacity-75" />
                  <circle r="4" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
                </g>
              )}
            </svg>

            {/* Plot X and Y axis labels */}
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
              <span>0 km/h</span>
              <span>Min: {config.minSpeedKmH} km/h</span>
              <span>Max: {config.maxSpeedKmH} km/h</span>
              <span>180 km/h</span>
            </div>
            <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-400">
              Boost: +{config.maxBoostDb} dB (Max)
            </div>
          </div>

          {/* Current Real-time Calculation Readout */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-2.5">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                {t.sdvsBoost}
              </span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                +{sdvsBoostDb.toFixed(2)} dB
              </div>
            </div>
            <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-2.5">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                Gain Multiplier
              </span>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                {sdvsGainMultiplier.toFixed(2)}x
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Parameters & GPS Tracking Engine (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Parameter Tuning Sliders */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani']">
              <Cpu className="h-4 w-4 text-amber-400" />
              <span>Acoustic Calibration Parameters</span>
            </div>

            {/* Min Speed Threshold */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">{t.minSpeed}</span>
                <span className="font-mono text-amber-400">{config.minSpeedKmH} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={config.minSpeedKmH}
                onChange={(e) => onChangeConfig({ ...config, minSpeedKmH: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-0.5">
                Audio volume remains untouched below this speed (e.g. traffic stops & parking).
              </p>
            </div>

            {/* Max Speed Target */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">{t.maxSpeed}</span>
                <span className="font-mono text-amber-400">{config.maxSpeedKmH} km/h</span>
              </div>
              <input
                type="range"
                min="80"
                max="160"
                step="5"
                value={config.maxSpeedKmH}
                onChange={(e) => onChangeConfig({ ...config, maxSpeedKmH: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-0.5">
                Speed at which maximum acoustic boost ceiling is achieved.
              </p>
            </div>

            {/* Max Boost dB */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">{t.maxBoost}</span>
                <span className="font-mono text-amber-400">+{config.maxBoostDb} dB ({dbToGain(config.maxBoostDb).toFixed(1)}x)</span>
              </div>
              <input
                type="range"
                min="2"
                max="14"
                step="0.5"
                value={config.maxBoostDb}
                onChange={(e) => onChangeConfig({ ...config, maxBoostDb: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-0.5">
                Peak sound pressure compensation ceiling to prevent speaker clipping or distortion.
              </p>
            </div>

            {/* Anti-Shock Smoothing Filter */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">{t.smoothing}</span>
                <span className="font-mono text-amber-400">{config.smoothingFactor.toFixed(2)} α</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.05"
                value={config.smoothingFactor}
                onChange={(e) => onChangeConfig({ ...config, smoothingFactor: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-0.5">
                Low-pass filter rate preventing abrupt volume jumps during emergency braking or gear shifts.
              </p>
            </div>
          </div>

          {/* GPS Hardware vs Simulator Selection */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani']">
                <MapPin className="h-4 w-4 text-sky-400" />
                <span>{t.gpsStatus}</span>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                isGpsActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {isGpsActive ? t.gpsActive : t.gpsSimulated}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onToggleGps}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-bold border transition ${
                  isGpsActive
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-md'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Compass className="h-4 w-4 text-emerald-400" />
                <span>{isGpsActive ? t.useSimulator : t.useLiveGps}</span>
              </button>
            </div>

            {isGpsActive && (
              <div className="mt-3 text-xs text-slate-400 bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span>{t.gpsAccuracy}:</span>
                  <span className="font-mono text-emerald-400">
                    {gpsAccuracy !== null ? `±${gpsAccuracy.toFixed(1)} m` : 'Acquiring satellites...'}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
