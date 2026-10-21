import { SdvsConfig, SdvsCurveType } from '../types';

/**
 * Standard default configuration for Speed-Dependent Volume Scaling (SDVS)
 */
export const DEFAULT_SDVS_CONFIG: SdvsConfig = {
  enabled: true,
  curveType: 'exponential',
  minSpeedKmH: 15,
  maxSpeedKmH: 130,
  maxBoostDb: 8.0,
  smoothingFactor: 0.15,
  roadNoiseCompEnabled: true,
};

/**
 * Convert decibels to linear amplitude gain multiplier
 * Gain = 10 ^ (dB / 20)
 */
export function dbToGain(db: number): number {
  if (isNaN(db)) return 1.0;
  return Math.pow(10, db / 20);
}

/**
 * Convert linear amplitude gain multiplier to decibels
 * dB = 20 * log10(gain)
 */
export function gainToDb(gain: number): number {
  if (isNaN(gain) || gain <= 0) return 0;
  return 20 * Math.log10(gain);
}

/**
 * Low-pass exponential moving average filter to smoothly transition volume without acoustic shock
 */
export function smoothValue(current: number, target: number, alpha: number): number {
  const safeAlpha = Math.max(0.01, Math.min(1.0, alpha));
  return current + safeAlpha * (target - current);
}

/**
 * Calculate the decibel boost recommended for a given vehicle speed
 */
export function calculateSdvsBoostDb(speedKmH: number, config: SdvsConfig): number {
  if (!config.enabled) return 0;

  const validSpeed = Math.max(0, speedKmH);
  if (validSpeed <= config.minSpeedKmH) {
    return 0;
  }
  if (validSpeed >= config.maxSpeedKmH) {
    return Math.max(0, config.maxBoostDb);
  }

  // Normalized speed ratio in range [0, 1]
  const speedRange = config.maxSpeedKmH - config.minSpeedKmH;
  if (speedRange <= 0) return 0;
  
  const ratio = (validSpeed - config.minSpeedKmH) / speedRange;
  const clampedRatio = Math.max(0, Math.min(1, ratio));

  switch (config.curveType) {
    case 'linear':
      return clampedRatio * config.maxBoostDb;

    case 'exponential':
      // Acoustic loudness compensation curve: road noise grows non-linearly with aerodynamic drag
      // ratio^1.7 gives a natural gradual start and punchy highway compensation
      return Math.pow(clampedRatio, 1.7) * config.maxBoostDb;

    case 's_curve': {
      // Sigmoid curve: gentle at low acceleration, steep in the 60-100 km/h transition zone
      const sigmoid = (x: number) => 1 / (1 + Math.exp(-8 * (x - 0.5)));
      const s0 = sigmoid(0);
      const s1 = sigmoid(1);
      const normalizedS = (sigmoid(clampedRatio) - s0) / (s1 - s0);
      return Math.max(0, Math.min(1, normalizedS)) * config.maxBoostDb;
    }

    default:
      return clampedRatio * config.maxBoostDb;
  }
}

/**
 * Estimates interior cabin noise in dBA based on vehicle speed
 * Based on automotive acoustics models:
 * Idle cabin: ~42 dBA
 * 50 km/h: ~62 dBA (tire friction)
 * 100 km/h: ~72 dBA (wind turbulence)
 * 140 km/h: ~78 dBA (aerodynamic vortex)
 */
export function calculateCabinNoiseDb(speedKmH: number): number {
  const speed = Math.max(0, speedKmH);
  if (speed < 5) return 42.0; // Idling with climate control
  return 42.0 + 26.0 * Math.log10(1 + speed / 12);
}

/**
 * Converts km/h to mph for automotive gauges
 */
export function kmhToMph(kmh: number): number {
  return kmh * 0.621371;
}

/**
 * Converts m/s (GPS standard) to km/h
 */
export function msToKmh(ms: number): number {
  return ms * 3.6;
}
