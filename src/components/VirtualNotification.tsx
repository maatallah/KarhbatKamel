import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Radio,
  X,
  Volume2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Track } from '../types';

interface VirtualNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  currentSpeedKmH: number;
  sdvsBoostDb: number;
}

export const VirtualNotification: React.FC<VirtualNotificationProps> = ({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  currentSpeedKmH,
  sdvsBoostDb,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden text-slate-100">
        {/* Android Notification Header */}
        <div className="flex items-center justify-between bg-slate-950/90 px-4 py-2 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Radio className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold text-slate-300">Auto Music Player (AMP)</span>
            <span className="text-[10px] text-slate-500">• Foreground Service</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close notification drawer"
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Media Notification Card */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>CHANNEL: amp_playback_channel</span>
            </span>
            <span>PRIORITY_LOW (STICKY)</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Album artwork */}
            <div className={`h-14 w-14 shrink-0 rounded-xl bg-gradient-to-tr ${currentTrack.coverColor} flex items-center justify-center text-white shadow-md`}>
              <Radio className="h-7 w-7 text-white/90" />
            </div>

            {/* Track metadata */}
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm text-white truncate">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-amber-400 truncate">
                {currentTrack.artist}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-mono text-slate-300">
                  {Math.round(currentSpeedKmH)} km/h
                </span>
                {sdvsBoostDb > 0 && (
                  <span className="rounded bg-amber-500/20 text-amber-300 px-1.5 py-0.2 text-[9px] font-mono font-bold border border-amber-500/30">
                    SDVS +{sdvsBoostDb.toFixed(1)} dB
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Media Controls inside Notification */}
          <div className="flex items-center justify-center gap-5 pt-2 border-t border-slate-800">
            <button
              onClick={onPrevTrack}
              aria-label="Notification previous track"
              className="p-2 text-slate-300 hover:text-white active:scale-95 transition"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Notification Pause' : 'Notification Play'}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 transition shadow-lg shadow-amber-500/30"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </button>
            <button
              onClick={onNextTrack}
              aria-label="Notification next track"
              className="p-2 text-slate-300 hover:text-white active:scale-95 transition"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center">
          <span>startForeground(1, notification) at onCreate()</span>
          <span className="text-slate-400">Android 11+ Compliant</span>
        </div>
      </div>
    </div>
  );
};
