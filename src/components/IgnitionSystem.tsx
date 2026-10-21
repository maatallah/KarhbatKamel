import React from 'react';
import {
  KeyRound,
  BatteryCharging,
  Battery,
  Flame,
  Power,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { IgnitionState, IgnitionConfig, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface IgnitionSystemProps {
  ignitionState: IgnitionState;
  onSetIgnitionState: (state: IgnitionState) => void;
  config: IgnitionConfig;
  onChangeConfig: (config: IgnitionConfig) => void;
  isBatteryCharging: boolean;
  batteryLevel: number | null;
  cutoffCountdownRemaining: number | null;
  crankDelayRemaining: number | null;
  lang: Language;
}

export const IgnitionSystem: React.FC<IgnitionSystemProps> = ({
  ignitionState,
  onSetIgnitionState,
  config,
  onChangeConfig,
  isBatteryCharging,
  batteryLevel,
  cutoffCountdownRemaining,
  crankDelayRemaining,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  const states: { id: IgnitionState; label: string; desc: string; color: string }[] = [
    {
      id: 'OFF',
      label: t.engineOff,
      desc: 'Vehicle parked, engine killed, 12V rail inactive',
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
    },
    {
      id: 'ACC',
      label: t.accPower,
      desc: 'Accessories powered (radio, dashcam), starter uncranked',
      color: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    },
    {
      id: 'ON',
      label: t.ignitionOn,
      desc: 'Ignition contacts engaged, fuel pump primed',
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    },
    {
      id: 'RUN',
      label: t.engineRunning,
      desc: 'Engine running, alternator generating 14.4V charging current',
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    },
  ];

  return (
    <div className="space-y-4 p-3 md:p-5 text-slate-100">
      {/* Title Card */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold font-['Rajdhani'] text-white">
              {t.ignitionTitle}
            </h2>
            <p className="text-xs text-slate-400">
              {t.ignitionSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main Ignition Cylinder & Rotary Switch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Automotive Key Cylinder (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani'] flex items-center gap-2">
              <Power className="h-4 w-4 text-amber-400" />
              {t.keyState}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              BroadcastReceiver: Intent.ACTION_POWER_*
            </span>
          </div>

          {/* Interactive 4-Position Cylinder Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {states.map((st) => (
              <button
                key={st.id}
                onClick={() => onSetIgnitionState(st.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition text-center ${
                  ignitionState === st.id
                    ? `${st.color} shadow-lg ring-1 ring-amber-400/50 scale-[1.02]`
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/80 mb-2">
                  {st.id === 'RUN' && <Flame className="h-5 w-5 text-emerald-400" />}
                  {st.id === 'ON' && <Power className="h-5 w-5 text-amber-400" />}
                  {st.id === 'ACC' && <BatteryCharging className="h-5 w-5 text-blue-400" />}
                  {st.id === 'OFF' && <KeyRound className="h-5 w-5 text-rose-400" />}
                </div>
                <span className="font-bold text-xs uppercase tracking-wider font-['Rajdhani']">
                  {st.label}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                  {st.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Active Grace Countdown Banners */}
          {crankDelayRemaining !== null && crankDelayRemaining > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-amber-300 animate-pulse">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                <span className="text-xs font-semibold">
                  {t.crankDelay}: Engine starter motor cranking...
                </span>
              </div>
              <span className="font-mono text-base font-bold">
                {crankDelayRemaining.toFixed(1)}s
              </span>
            </div>
          )}

          {cutoffCountdownRemaining !== null && cutoffCountdownRemaining > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-rose-300 animate-pulse">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <span className="text-xs font-semibold">
                  {t.cutoffCountdown}: Auto-pausing background service...
                </span>
              </div>
              <span className="font-mono text-base font-bold">
                {cutoffCountdownRemaining.toFixed(1)}s
              </span>
            </div>
          )}

          {/* Quick Simulation Trigger Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onSetIgnitionState('RUN')}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-3 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 active:scale-98 transition"
            >
              <Flame className="h-4 w-4" />
              <span>{t.simulateStart}</span>
            </button>
            <button
              onClick={() => onSetIgnitionState('OFF')}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-700 to-red-800 p-3 text-xs font-bold text-white shadow-md hover:from-rose-600 hover:to-red-700 active:scale-98 transition"
            >
              <KeyRound className="h-4 w-4" />
              <span>{t.simulateCutoff}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Hardware Broadcast Settings (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani']">
            <BatteryCharging className="h-4 w-4 text-amber-400" />
            <span>Automotive Broadcast Triggers</span>
          </div>

          {/* Toggle: Auto-play on ignition start */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">{t.autoPlayOnIgnition}</div>
              <div className="text-[11px] text-slate-400">
                Resumes playback automatically when vehicle power is restored
              </div>
            </div>
            <button
              onClick={() => onChangeConfig({ ...config, autoPlayOnIgnition: !config.autoPlayOnIgnition })}
              aria-label={t.autoPlayOnIgnition}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                config.autoPlayOnIgnition ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                  config.autoPlayOnIgnition ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle: Auto-pause on engine cutoff */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">{t.autoPauseOnCutoff}</div>
              <div className="text-[11px] text-slate-400">
                Pauses playback when key is turned off or charger disconnected
              </div>
            </div>
            <button
              onClick={() => onChangeConfig({ ...config, autoPauseOnCutoff: !config.autoPauseOnCutoff })}
              aria-label={t.autoPauseOnCutoff}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                config.autoPauseOnCutoff ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                  config.autoPauseOnCutoff ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Starter Motor Crank Delay Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">{t.crankDelay}</span>
              <span className="font-mono text-amber-400">{config.crankDelaySeconds} {t.seconds}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={config.crankDelaySeconds}
              onChange={(e) => onChangeConfig({ ...config, crankDelaySeconds: Number(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-[11px] text-slate-500 mt-0.5">
              Prevents audio pop/glitch while starter motor pulls peak electrical amps.
            </p>
          </div>

          {/* Cutoff Pause Countdown Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">{t.cutoffCountdown}</span>
              <span className="font-mono text-amber-400">{config.cutoffCountdownSeconds} {t.seconds}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={config.cutoffCountdownSeconds}
              onChange={(e) => onChangeConfig({ ...config, cutoffCountdownSeconds: Number(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-[11px] text-slate-500 mt-0.5">
              Grace period allowing brief engine stalls or accessory key switching.
            </p>
          </div>

          {/* Web Battery Status Bridge */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-400">{t.batteryStatus}:</span>
              <span className={`font-mono font-bold ${isBatteryCharging ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isBatteryCharging ? t.charging : t.discharging}
              </span>
            </div>
            {batteryLevel !== null && (
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>Charge Capacity:</span>
                <span className="font-mono">{Math.round(batteryLevel * 100)}%</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
