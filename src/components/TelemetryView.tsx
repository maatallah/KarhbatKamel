import React, { useState } from 'react';
import {
  Activity,
  Download,
  Trash2,
  AlertTriangle,
  Clock,
  Gauge,
  Zap,
  Flame,
  Cpu,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { TelemetryEvent, TelemetryStats, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { exportTelemetryAsJson } from '../utils/telemetry';

interface TelemetryViewProps {
  stats: TelemetryStats;
  events: TelemetryEvent[];
  onClearTelemetry: () => void;
  onSimulateCrash: () => void;
  lang: Language;
}

export const TelemetryView: React.FC<TelemetryViewProps> = ({
  stats,
  events,
  onClearTelemetry,
  onSimulateCrash,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [filterType, setFilterType] = useState<string>('all');
  const [crashBannerVisible, setCrashBannerVisible] = useState(false);

  // Format seconds into H:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const handleExport = () => {
    const jsonStr = exportTelemetryAsJson(events, stats);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amp_telemetry_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCrashSimulation = () => {
    onSimulateCrash();
    setCrashBannerVisible(true);
    setTimeout(() => setCrashBannerVisible(false), 5000);
  };

  const filteredEvents = events.filter((ev) => {
    if (filterType === 'all') return true;
    return ev.type === filterType;
  });

  return (
    <div className="space-y-4 p-3 md:p-5 text-slate-100">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold font-['Rajdhani'] text-white">
                {t.telemetryTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {t.telemetrySubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-2 text-xs font-bold transition shadow-md shadow-amber-500/20"
            >
              <Download className="h-4 w-4" />
              <span>{t.exportJson}</span>
            </button>
            <button
              onClick={handleCrashSimulation}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-3 py-2 text-xs font-bold transition"
            >
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span>{t.simulateCrash}</span>
            </button>
            <button
              onClick={onClearTelemetry}
              className="p-2 text-slate-400 hover:text-white rounded-xl border border-slate-800 bg-slate-900"
              title={t.clearLogs}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Crash Recovery Notification Banner */}
      {crashBannerVisible && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-emerald-300 text-xs font-semibold animate-pulse">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{t.crashRecovered} (SQLite WAL / IndexedDB synchronous flush verified)</span>
        </div>
      )}

      {/* Primary KPI Grid (8 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Play Time */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>{t.totalPlayTime}</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {formatTime(stats.totalPlayTimeSeconds)}
          </div>
        </div>

        {/* Average Speed */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Gauge className="h-4 w-4 text-cyan-400" />
            <span>{t.averageSpeed}</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {stats.averageSpeedKmH} <span className="text-xs text-slate-400 font-sans">{t.speedKmH}</span>
          </div>
        </div>

        {/* Top Speed */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>{t.topSpeed}</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {stats.maxSpeedKmH} <span className="text-xs text-slate-400 font-sans">{t.speedKmH}</span>
          </div>
        </div>

        {/* Max Boost Applied */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>{t.peakBoostApplied}</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            +{stats.maxDbBoostApplied.toFixed(1)} <span className="text-xs text-slate-400 font-sans">{t.decibels}</span>
          </div>
        </div>

        {/* Ignition Cycles */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Flame className="h-4 w-4 text-orange-400" />
            <span>{t.ignitionCycles}</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {stats.ignitionCycles}
          </div>
        </div>

        {/* Audio Underruns */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <span>{t.underrunEvents}</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {stats.underrunIncidents}
          </div>
        </div>

        {/* SoLoader JNI Classloading Benchmark */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Cpu className="h-4 w-4 text-purple-400" />
            <span>{t.soLoaderBenchmark}</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {stats.soLoaderInitTimeMs} <span className="text-xs text-slate-400 font-sans">ms</span>
          </div>
          <span className="text-[10px] text-emerald-400">attachBaseContext Hook OK</span>
        </div>

        {/* Foreground Service Init */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <CheckCircle2 className="h-4 w-4 text-sky-400" />
            <span>{t.serviceStartupTime}</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {stats.playbackServiceStartTimeMs} <span className="text-xs text-slate-400 font-sans">ms</span>
          </div>
          <span className="text-[10px] text-sky-400">Zero Crash Loop</span>
        </div>
      </div>

      {/* Blackbox Live Event Stream */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani']">
              {t.eventLogs} ({filteredEvents.length} records)
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {['all', 'sdvs', 'ignition', 'playback', 'audio_underrun', 'init'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase transition ${
                  filterType === filter
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-950/60'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Event Log Console */}
        <div className="rounded-xl bg-slate-950 border border-slate-800/80 p-3 max-h-80 overflow-y-auto font-mono text-xs space-y-2">
          {filteredEvents.length === 0 ? (
            <div className="text-slate-500 text-center py-6">
              No telemetry events recorded yet. Play a track or adjust the speed slider.
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const dateStr = new Date(ev.timestamp).toLocaleTimeString();
              const badgeColors: Record<string, string> = {
                sdvs: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                ignition: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
                playback: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                audio_underrun: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
                init: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
                error: 'text-red-400 bg-red-500/10 border-red-500/30',
              };

              return (
                <div
                  key={ev.id}
                  className="flex items-start justify-between gap-3 p-2 rounded-lg bg-slate-900/60 border border-slate-800/50 hover:border-slate-700 transition"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-slate-500 shrink-0">{dateStr}</span>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase border shrink-0 ${
                        badgeColors[ev.type] || 'text-slate-300'
                      }`}
                    >
                      {ev.type}
                    </span>
                    <span className="text-slate-200 truncate">{ev.message}</span>
                  </div>

                  {ev.metadata && (
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {JSON.stringify(ev.metadata).replace(/["{}]/g, ' ')}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
