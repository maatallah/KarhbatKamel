import React from 'react';
import {
  Activity,
  BatteryCharging,
  Battery,
  Flame,
  Globe,
  Bell,
  Moon,
  Sun,
  Radio,
  FileCode2,
  Sliders,
  Gauge,
  KeyRound,
  Library,
} from 'lucide-react';
import { Language, IgnitionState } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface HeaderProps {
  currentTab: 'cockpit' | 'sdvs' | 'ignition' | 'telemetry' | 'library' | 'blueprint';
  setCurrentTab: (tab: 'cockpit' | 'sdvs' | 'ignition' | 'telemetry' | 'library' | 'blueprint') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  ignitionState: IgnitionState;
  isBatteryCharging: boolean;
  isGpsActive: boolean;
  currentSpeedKmH: number;
  sdvsBoostDb: number;
  nightMode: boolean;
  setNightMode: (val: boolean) => void;
  stealthMode: boolean;
  setStealthMode: (val: boolean) => void;
  showNotificationDrawer: boolean;
  setShowNotificationDrawer: (val: boolean) => void;
  isPlaying: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  ignitionState,
  isBatteryCharging,
  isGpsActive,
  currentSpeedKmH,
  sdvsBoostDb,
  nightMode,
  setNightMode,
  stealthMode,
  setStealthMode,
  showNotificationDrawer,
  setShowNotificationDrawer,
  isPlaying,
}) => {
  const t = TRANSLATIONS[lang];

  const getIgnitionBadge = () => {
    switch (ignitionState) {
      case 'RUN':
        return { label: t.engineRunning, bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', icon: Flame };
      case 'ON':
        return { label: t.ignitionOn, bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40', icon: KeyRound };
      case 'ACC':
        return { label: t.accPower, bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40', icon: BatteryCharging };
      case 'OFF':
      default:
        return { label: t.engineOff, bg: 'bg-rose-500/20 text-rose-400 border-rose-500/40', icon: KeyRound };
    }
  };

  const ignBadge = getIgnitionBadge();
  const IgnIcon = ignBadge.icon;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 py-2.5 transition-colors">
      {/* Top row: Brand & Hardware Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 shadow-lg shadow-amber-500/20">
            <Radio className="h-5 w-5 text-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-base text-white font-['Rajdhani']">
                {t.appName}
              </span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 uppercase tracking-widest border border-amber-500/30">
                PROD APK • API 34
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Live Hardware Telemetry Pills */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Ignition Status */}
          <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold ${ignBadge.bg}`}>
            <IgnIcon className="h-3.5 w-3.5" />
            <span>{ignBadge.label}</span>
          </div>

          {/* Battery / Alternator Status */}
          <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] ${
            isBatteryCharging
              ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
              : 'border-slate-800 bg-slate-900 text-slate-400'
          }`}>
            {isBatteryCharging ? (
              <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Battery className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">12V RAIL:</span>
            <span>{isBatteryCharging ? 'CHARGING' : 'BATTERY'}</span>
          </div>

          {/* GPS Tracking Pill */}
          <div className="flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-950/40 px-2.5 py-1 font-mono text-[11px] text-sky-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span>{isGpsActive ? 'GPS FIX' : 'SIM BUS'}</span>
            <span className="font-bold text-sky-200">{Math.round(currentSpeedKmH)} {t.speedKmH}</span>
          </div>

          {/* SDVS Boost Active Indicator */}
          {sdvsBoostDb > 0 && (
            <div className="flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/20 px-2.5 py-1 font-mono text-[11px] font-bold text-amber-300 animate-pulse">
              <Activity className="h-3.5 w-3.5" />
              <span>+{sdvsBoostDb.toFixed(1)} dB</span>
            </div>
          )}

          {/* Android Notification Bar Toggle */}
          <button
            onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
            aria-label={t.notificationDrawer}
            className={`relative flex items-center justify-center rounded-lg border p-1.5 transition ${
              showNotificationDrawer
                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Bell className="h-4 w-4" />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900 p-0.5">
            <Globe className="h-3.5 w-3.5 text-slate-400 ml-1.5 mr-1" />
            {(['en', 'ar', 'fr', 'de', 'es'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-label={`Switch language to ${l}`}
                className={`rounded px-1.5 py-0.5 text-[11px] font-semibold transition uppercase ${
                  lang === l
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Stealth Mode */}
          <button
            onClick={() => setStealthMode(!stealthMode)}
            aria-label={t.stealthMode}
            title={t.stealthMode}
            className={`rounded-lg border p-1.5 transition ${
              stealthMode
                ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="mt-2.5 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none" aria-label="Main Navigation">
        <button
          onClick={() => setCurrentTab('cockpit')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
            currentTab === 'cockpit'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Gauge className="h-4 w-4" />
          <span>{t.cockpit}</span>
        </button>

        <button
          onClick={() => setCurrentTab('sdvs')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
            currentTab === 'sdvs'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>{t.sdvsTab}</span>
        </button>

        <button
          onClick={() => setCurrentTab('ignition')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
            currentTab === 'ignition'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>{t.ignitionTab}</span>
        </button>

        <button
          onClick={() => setCurrentTab('library')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
            currentTab === 'library'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Library className="h-4 w-4" />
          <span>{t.libraryTab}</span>
        </button>

        <button
          onClick={() => setCurrentTab('telemetry')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
            currentTab === 'telemetry'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>{t.telemetryTab}</span>
        </button>

        <button
          onClick={() => setCurrentTab('blueprint')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
            currentTab === 'blueprint'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <FileCode2 className="h-4 w-4" />
          <span>{t.blueprintTab}</span>
        </button>
      </nav>
    </header>
  );
};
