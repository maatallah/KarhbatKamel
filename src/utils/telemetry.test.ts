import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateTelemetry, exportTelemetryAsJson } from './telemetry';
import { TelemetryEvent, TelemetryStats } from '../types';

test('aggregateTelemetry computes averages and max speed accurately', () => {
  const mockEvents: TelemetryEvent[] = [
    {
      id: '1',
      timestamp: 1000,
      type: 'sdvs',
      message: 'Speed scaling adjustment',
      metadata: { speedKmH: 40, boostDb: 2.1 },
    },
    {
      id: '2',
      timestamp: 2000,
      type: 'sdvs',
      message: 'Speed scaling adjustment',
      metadata: { speedKmH: 80, boostDb: 5.4 },
    },
    {
      id: '3',
      timestamp: 3000,
      type: 'sdvs',
      message: 'Speed scaling adjustment',
      metadata: { speedKmH: 120, boostDb: 8.0 },
    },
    {
      id: '4',
      timestamp: 4000,
      type: 'ignition',
      message: 'Ignition power connected',
      metadata: { action: 'connected' },
    },
    {
      id: '5',
      timestamp: 5000,
      type: 'audio_underrun',
      message: 'Buffer underrun caught',
    },
  ];

  const stats = aggregateTelemetry(mockEvents);

  assert.equal(stats.averageSpeedKmH, 80); // (40 + 80 + 120) / 3 = 80
  assert.equal(stats.maxSpeedKmH, 120);
  assert.equal(stats.maxDbBoostApplied, 8.0);
  assert.equal(stats.ignitionCycles, 1);
  assert.equal(stats.underrunIncidents, 1);
  assert.ok(stats.soLoaderInitTimeMs > 0);
});

test('exportTelemetryAsJson generates valid parseable JSON with metadata', () => {
  const mockStats: TelemetryStats = {
    sessionStartTime: 1000,
    totalPlayTimeSeconds: 450,
    totalDistanceKm: 12.4,
    averageSpeedKmH: 65,
    maxSpeedKmH: 110,
    maxDbBoostApplied: 7.2,
    ignitionCycles: 2,
    underrunIncidents: 0,
    soLoaderInitTimeMs: 14.5,
    playbackServiceStartTimeMs: 21.0,
  };

  const jsonStr = exportTelemetryAsJson([], mockStats);
  const parsed = JSON.parse(jsonStr);

  assert.equal(parsed.app, 'Auto Music Player (AMP)');
  assert.equal(parsed.stats.totalDistanceKm, 12.4);
  assert.equal(parsed.stats.maxSpeedKmH, 110);
  assert.ok(Array.isArray(parsed.events));
});
