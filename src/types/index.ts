export type Language = 'en' | 'ar' | 'fr' | 'de' | 'es';

export type SdvsCurveType = 'linear' | 'exponential' | 's_curve';

export interface SdvsConfig {
  enabled: boolean;
  curveType: SdvsCurveType;
  minSpeedKmH: number; // Speed below which no boost is applied (e.g., 15 km/h)
  maxSpeedKmH: number; // Speed at which max boost is applied (e.g., 120 km/h)
  maxBoostDb: number;  // Max volume boost in dB (e.g., +8 dB)
  smoothingFactor: number; // Low-pass alpha (0.05 to 0.5) to avoid abrupt jumps
  roadNoiseCompEnabled: boolean; // Cabin acoustic compensation
}

export type IgnitionState = 'OFF' | 'ACC' | 'ON' | 'RUN';

export interface IgnitionConfig {
  autoPlayOnIgnition: boolean;
  autoPauseOnCutoff: boolean;
  crankDelaySeconds: number; // Grace delay before starting playback after ignition ON (default 1.5s)
  cutoffCountdownSeconds: number; // Grace delay before pause after power loss (default 3s)
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  url?: string;
  isProcedural?: boolean;
  proceduralTheme?: 'synthwave' | 'ambient_night' | 'highway_drift' | 'desert_run';
  bpm?: number;
  coverColor: string;
  artworkUrl?: string;
  fileSize?: string;
}

export interface TelemetryEvent {
  id: string;
  timestamp: number;
  type: 'init' | 'playback' | 'sdvs' | 'ignition' | 'audio_underrun' | 'error';
  message: string;
  metadata?: Record<string, any>;
}

export interface TelemetryStats {
  sessionStartTime: number;
  totalPlayTimeSeconds: number;
  totalDistanceKm: number;
  averageSpeedKmH: number;
  maxSpeedKmH: number;
  maxDbBoostApplied: number;
  ignitionCycles: number;
  underrunIncidents: number;
  soLoaderInitTimeMs: number;
  playbackServiceStartTimeMs: number;
}
