/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Language,
  Track,
  SdvsConfig,
  IgnitionState,
  IgnitionConfig,
  TelemetryEvent,
  TelemetryStats,
} from './types';
import { TRANSLATIONS } from './utils/translations';
import {
  DEFAULT_SDVS_CONFIG,
  calculateSdvsBoostDb,
  dbToGain,
  smoothValue,
  calculateCabinNoiseDb,
  msToKmh,
} from './utils/sdvs';
import {
  logTelemetryEvent,
  getTelemetryEvents,
  aggregateTelemetry,
  clearTelemetryData,
} from './utils/telemetry';
import { audioEngine, DEFAULT_TRACKS } from './utils/audioSynth';
import { Header } from './components/Header';
import { CockpitDashboard } from './components/CockpitDashboard';
import { SdvsController } from './components/SdvsController';
import { IgnitionSystem } from './components/IgnitionSystem';
import { MediaLibrary } from './components/MediaLibrary';
import { TelemetryView } from './components/TelemetryView';
import { AndroidBlueprintModal } from './components/AndroidBlueprintModal';
import { VirtualNotification } from './components/VirtualNotification';

export default function App() {
  // Navigation & Preferences
  const [currentTab, setCurrentTab] = useState<
    'cockpit' | 'sdvs' | 'ignition' | 'telemetry' | 'library' | 'blueprint'
  >('cockpit');
  const [lang, setLang] = useState<Language>('en');
  const [nightMode, setNightMode] = useState(true);
  const [stealthMode, setStealthMode] = useState(false);
  const [carMode, setCarMode] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  // Playback & Tracks
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<Track>(DEFAULT_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(DEFAULT_TRACKS[0].duration);
  const [baseVolume, setBaseVolume] = useState(0.75);

  // Speed & SDVS
  const [currentSpeedKmH, setCurrentSpeedKmH] = useState(45); // Initial city speed
  const [sdvsConfig, setSdvsConfig] = useState<SdvsConfig>(DEFAULT_SDVS_CONFIG);
  const [sdvsBoostDb, setSdvsBoostDb] = useState(0);
  const [sdvsGainMultiplier, setSdvsGainMultiplier] = useState(1.0);
  const [cabinNoiseDb, setCabinNoiseDb] = useState(calculateCabinNoiseDb(45));

  // Hardware Ignition & Battery
  const [ignitionState, setIgnitionState] = useState<IgnitionState>('RUN');
  const [ignitionConfig, setIgnitionConfig] = useState<IgnitionConfig>({
    autoPlayOnIgnition: true,
    autoPauseOnCutoff: true,
    crankDelaySeconds: 1.5,
    cutoffCountdownSeconds: 3.0,
  });
  const [isBatteryCharging, setIsBatteryCharging] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(0.92);
  const [crankDelayRemaining, setCrankDelayRemaining] = useState<number | null>(null);
  const [cutoffCountdownRemaining, setCutoffCountdownRemaining] = useState<number | null>(null);

  // GPS Hardware Tracking
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const gpsWatchIdRef = useRef<number | null>(null);

  // Telemetry & Blackbox
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);
  const [telemetryStats, setTelemetryStats] = useState<TelemetryStats>(() =>
    aggregateTelemetry([], {
      soLoaderInitTimeMs: 14.2,
      playbackServiceStartTimeMs: 22.8,
    })
  );

  const smoothedBoostRef = useRef(0);
  const crankTimerRef = useRef<any>(null);
  const cutoffTimerRef = useRef<any>(null);

  // Update HTML document direction and language on change
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Initial Telemetry Boot Logging & Autostart query check
  useEffect(() => {
    logTelemetryEvent('init', 'SoLoader.init() loaded Bridgeless JNI bridges', {
      timeMs: 14.2,
      mergedSoMapping: 'openSourceMergedSoMapping',
    }).then(() => {
      logTelemetryEvent('init', 'PlaybackService foreground notification registered', {
        channel: 'amp_playback_channel',
        priority: 'PRIORITY_LOW',
      });
      loadTelemetryHistory();
    });

    // Check for ?autostart=1 query param (ultra-mode testability)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('autostart') === '1') {
        setTimeout(() => {
          handlePlayTrack(DEFAULT_TRACKS[0]);
        }, 300);
      }
    }
  }, []);

  const loadTelemetryHistory = async () => {
    const events = await getTelemetryEvents(150);
    setTelemetryEvents(events);
    setTelemetryStats(aggregateTelemetry(events));
  };

  // Wire Audio Engine Callbacks
  useEffect(() => {
    audioEngine.onTimeUpdate = (time, dur) => {
      setCurrentTime(time);
      setDuration(dur);
    };

    audioEngine.onTrackEnd = () => {
      handleNextTrack();
    };

    audioEngine.onStateChange = (playing) => {
      setIsPlaying(playing);
      logTelemetryEvent('playback', playing ? 'Playback resumed' : 'Playback paused', {
        track: currentTrack.title,
      }).then(loadTelemetryHistory);
    };
  }, [currentTrack]);

  // Real-time SDVS dynamic volume calculations and smoothing
  useEffect(() => {
    const targetBoostDb = calculateSdvsBoostDb(currentSpeedKmH, sdvsConfig);
    const smoothed = smoothValue(
      smoothedBoostRef.current,
      targetBoostDb,
      sdvsConfig.smoothingFactor
    );
    smoothedBoostRef.current = smoothed;

    const gain = dbToGain(smoothed);
    setSdvsBoostDb(smoothed);
    setSdvsGainMultiplier(gain);

    // Apply to Web Audio DSP
    audioEngine.setSdvsGainMultiplier(gain);

    // Cabin noise calculation
    const noise = calculateCabinNoiseDb(currentSpeedKmH);
    setCabinNoiseDb(noise);
    audioEngine.setRoadNoiseSimulation(currentSpeedKmH, sdvsConfig.roadNoiseCompEnabled);

    // Telemetry log for significant speed/volume shifts
    if (Math.abs(smoothed - targetBoostDb) < 0.2 && currentSpeedKmH > 30) {
      logTelemetryEvent('sdvs', 'Speed-dependent gain calibrated', {
        speedKmH: Math.round(currentSpeedKmH),
        boostDb: Math.round(smoothed * 10) / 10,
        gain: Math.round(gain * 100) / 100,
      }).then(loadTelemetryHistory);
    }
  }, [currentSpeedKmH, sdvsConfig]);

  // Base user volume updates
  const handleVolumeChange = (vol: number) => {
    setBaseVolume(vol);
    audioEngine.setBaseVolume(vol);
  };

  // Play / Pause / Seek Handlers
  const handleTogglePlay = () => {
    if (ignitionState === 'OFF') {
      // Igniting vehicle first
      handleSetIgnitionState('RUN');
    }
    audioEngine.togglePlayPause();
  };

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
    setDuration(track.duration);
    setCurrentTime(0);
    audioEngine.play(track);
  };

  const handleNextTrack = () => {
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    handlePlayTrack(tracks[nextIndex]);
  };

  const handlePrevTrack = () => {
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    handlePlayTrack(tracks[prevIndex]);
  };

  const handleSeek = (secs: number) => {
    audioEngine.seek(secs);
  };

  // Ignition State Machine & Broadcast Handling
  const handleSetIgnitionState = (newState: IgnitionState) => {
    setIgnitionState(newState);

    if (crankTimerRef.current) clearInterval(crankTimerRef.current);
    if (cutoffTimerRef.current) clearInterval(cutoffTimerRef.current);
    setCrankDelayRemaining(null);
    setCutoffCountdownRemaining(null);

    logTelemetryEvent('ignition', `Ignition key turned to: ${newState}`, {
      state: newState,
      speedKmH: currentSpeedKmH,
    }).then(loadTelemetryHistory);

    if (newState === 'RUN' || newState === 'ON') {
      setIsBatteryCharging(true);

      if (ignitionConfig.autoPlayOnIgnition && !isPlaying) {
        // Starter motor crank grace countdown
        let remaining = ignitionConfig.crankDelaySeconds;
        setCrankDelayRemaining(remaining);

        crankTimerRef.current = setInterval(() => {
          remaining -= 0.5;
          setCrankDelayRemaining(Math.max(0, remaining));
          if (remaining <= 0) {
            clearInterval(crankTimerRef.current);
            setCrankDelayRemaining(null);
            audioEngine.play(currentTrack);
          }
        }, 500);
      }
    } else if (newState === 'OFF') {
      setIsBatteryCharging(false);

      if (ignitionConfig.autoPauseOnCutoff && isPlaying) {
        // Cutoff pause grace countdown
        let remaining = ignitionConfig.cutoffCountdownSeconds;
        setCutoffCountdownRemaining(remaining);

        cutoffTimerRef.current = setInterval(() => {
          remaining -= 0.5;
          setCutoffCountdownRemaining(Math.max(0, remaining));
          if (remaining <= 0) {
            clearInterval(cutoffTimerRef.current);
            setCutoffCountdownRemaining(null);
            audioEngine.pause();
          }
        }, 500);
      }
    }
  };

  // Hardware Web Battery API listener
  useEffect(() => {
    if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
      (navigator as any).getBattery().then((battery: any) => {
        setIsBatteryCharging(battery.charging);
        setBatteryLevel(battery.level);

        const onChargingChange = () => {
          setIsBatteryCharging(battery.charging);
          if (battery.charging) {
            handleSetIgnitionState('RUN');
          } else {
            handleSetIgnitionState('OFF');
          }
        };

        const onLevelChange = () => setBatteryLevel(battery.level);

        battery.addEventListener('chargingchange', onChargingChange);
        battery.addEventListener('levelchange', onLevelChange);

        return () => {
          battery.removeEventListener('chargingchange', onChargingChange);
          battery.removeEventListener('levelchange', onLevelChange);
        };
      }).catch(() => {});
    }
  }, []);

  // Hardware GPS Geolocation tracking
  const toggleGps = () => {
    if (isGpsActive) {
      // Switch to simulator
      if (gpsWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      setIsGpsActive(false);
      setGpsAccuracy(null);
    } else {
      // Switch to hardware GPS
      if (!navigator.geolocation) {
        alert('Geolocation hardware not available on this device.');
        return;
      }
      setIsGpsActive(true);
      gpsWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsAccuracy(pos.coords.accuracy);
          if (pos.coords.speed !== null && pos.coords.speed >= 0) {
            const kmh = msToKmh(pos.coords.speed);
            setCurrentSpeedKmH(kmh);
          }
        },
        (err) => {
          console.warn('GPS hardware error:', err);
        },
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }
  };

  // Keyboard steering wheel shortcuts for automotive safety
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextTrack();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevTrack();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setCurrentSpeedKmH((prev) => Math.min(180, prev + 5));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setCurrentSpeedKmH((prev) => Math.max(0, prev - 5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTrack, tracks]);

  // Audio frequency data delegate for Cockpit Visualizer
  const getFrequencyData = useCallback((arr: Uint8Array) => {
    audioEngine.getFrequencyData(arr);
  }, []);

  // Add imported tracks
  const handleAddTracks = (newTracks: Track[]) => {
    setTracks((prev) => [...prev, ...newTracks]);
    logTelemetryEvent('playback', `Packaged ${newTracks.length} offline audio assets`, {
      firstTrack: newTracks[0]?.title,
    }).then(loadTelemetryHistory);
  };

  const handleRemoveTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  // Simulate Crash and Recovery
  const handleSimulateCrash = () => {
    logTelemetryEvent('error', 'SIMULATED CRASH: SIGSEGV / Process Killed by LMK', {
      activeTrack: currentTrack.title,
      currentTime,
      volume: baseVolume,
      speedKmH: currentSpeedKmH,
    });
    // Restore state from safe WAL storage
    setTimeout(() => {
      loadTelemetryHistory();
    }, 400);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans ${
        nightMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-100'
      }`}
    >
      {/* Automotive Top Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        ignitionState={ignitionState}
        isBatteryCharging={isBatteryCharging}
        isGpsActive={isGpsActive}
        currentSpeedKmH={currentSpeedKmH}
        sdvsBoostDb={sdvsBoostDb}
        nightMode={nightMode}
        setNightMode={setNightMode}
        stealthMode={stealthMode}
        setStealthMode={setStealthMode}
        showNotificationDrawer={showNotificationDrawer}
        setShowNotificationDrawer={setShowNotificationDrawer}
        isPlaying={isPlaying}
      />

      {/* Main Tab View Routing */}
      <main className="max-w-7xl mx-auto pb-12">
        {currentTab === 'cockpit' && (
          <CockpitDashboard
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onNextTrack={handleNextTrack}
            onPrevTrack={handlePrevTrack}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            baseVolume={baseVolume}
            onVolumeChange={handleVolumeChange}
            currentSpeedKmH={currentSpeedKmH}
            onSpeedChange={setCurrentSpeedKmH}
            sdvsBoostDb={sdvsBoostDb}
            sdvsGainMultiplier={sdvsGainMultiplier}
            cabinNoiseDb={cabinNoiseDb}
            sdvsConfig={sdvsConfig}
            lang={lang}
            stealthMode={stealthMode}
            carMode={carMode}
            setCarMode={setCarMode}
            getFrequencyData={getFrequencyData}
            onOpenSdvsConfig={() => setCurrentTab('sdvs')}
          />
        )}

        {currentTab === 'sdvs' && (
          <SdvsController
            config={sdvsConfig}
            onChangeConfig={setSdvsConfig}
            currentSpeedKmH={currentSpeedKmH}
            sdvsBoostDb={sdvsBoostDb}
            sdvsGainMultiplier={sdvsGainMultiplier}
            isGpsActive={isGpsActive}
            onToggleGps={toggleGps}
            gpsAccuracy={gpsAccuracy}
            lang={lang}
          />
        )}

        {currentTab === 'ignition' && (
          <IgnitionSystem
            ignitionState={ignitionState}
            onSetIgnitionState={handleSetIgnitionState}
            config={ignitionConfig}
            onChangeConfig={setIgnitionConfig}
            isBatteryCharging={isBatteryCharging}
            batteryLevel={batteryLevel}
            cutoffCountdownRemaining={cutoffCountdownRemaining}
            crankDelayRemaining={crankDelayRemaining}
            lang={lang}
          />
        )}

        {currentTab === 'library' && (
          <MediaLibrary
            tracks={tracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onSelectTrack={handlePlayTrack}
            onAddTracks={handleAddTracks}
            onRemoveTrack={handleRemoveTrack}
            lang={lang}
          />
        )}

        {currentTab === 'telemetry' && (
          <TelemetryView
            stats={telemetryStats}
            events={telemetryEvents}
            onClearTelemetry={async () => {
              await clearTelemetryData();
              loadTelemetryHistory();
            }}
            onSimulateCrash={handleSimulateCrash}
            lang={lang}
          />
        )}

        {currentTab === 'blueprint' && (
          <AndroidBlueprintModal lang={lang} />
        )}
      </main>

      {/* Android Notification Bar Simulator Drawer */}
      <VirtualNotification
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        currentSpeedKmH={currentSpeedKmH}
        sdvsBoostDb={sdvsBoostDb}
      />
    </div>
  );
}
