import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSdvsBoostDb,
  dbToGain,
  gainToDb,
  smoothValue,
  calculateCabinNoiseDb,
  kmhToMph,
  msToKmh,
  DEFAULT_SDVS_CONFIG
} from './sdvs';

test('dbToGain converts decibels to amplitude correctly', () => {
  assert.equal(Math.round(dbToGain(0) * 100) / 100, 1.0);
  assert.equal(Math.round(dbToGain(6.02) * 100) / 100, 2.0); // +6dB is ~2x gain
  assert.equal(Math.round(dbToGain(20) * 100) / 100, 10.0); // +20dB is 10x gain
});

test('gainToDb converts amplitude gain to decibels correctly', () => {
  assert.equal(Math.round(gainToDb(1.0) * 100) / 100, 0);
  assert.equal(Math.round(gainToDb(2.0) * 10) / 10, 6.0);
  assert.equal(Math.round(gainToDb(10.0) * 100) / 100, 20.0);
});

test('calculateSdvsBoostDb respects enabled flag', () => {
  const disabledConfig = { ...DEFAULT_SDVS_CONFIG, enabled: false };
  assert.equal(calculateSdvsBoostDb(100, disabledConfig), 0);
});

test('calculateSdvsBoostDb applies 0 dB boost at or below min speed', () => {
  assert.equal(calculateSdvsBoostDb(0, DEFAULT_SDVS_CONFIG), 0);
  assert.equal(calculateSdvsBoostDb(10, DEFAULT_SDVS_CONFIG), 0);
  assert.equal(calculateSdvsBoostDb(DEFAULT_SDVS_CONFIG.minSpeedKmH, DEFAULT_SDVS_CONFIG), 0);
});

test('calculateSdvsBoostDb caps at maxBoostDb at or above max speed', () => {
  const boostAtMax = calculateSdvsBoostDb(DEFAULT_SDVS_CONFIG.maxSpeedKmH, DEFAULT_SDVS_CONFIG);
  assert.equal(boostAtMax, DEFAULT_SDVS_CONFIG.maxBoostDb);

  const boostBeyondMax = calculateSdvsBoostDb(DEFAULT_SDVS_CONFIG.maxSpeedKmH + 50, DEFAULT_SDVS_CONFIG);
  assert.equal(boostBeyondMax, DEFAULT_SDVS_CONFIG.maxBoostDb);
});

test('calculateSdvsBoostDb calculates linear curve proportionally', () => {
  const linearConfig = {
    ...DEFAULT_SDVS_CONFIG,
    curveType: 'linear' as const,
    minSpeedKmH: 20,
    maxSpeedKmH: 120,
    maxBoostDb: 10,
  };
  // Midway speed: 70 km/h (halfway between 20 and 120)
  const midpointBoost = calculateSdvsBoostDb(70, linearConfig);
  assert.equal(Math.round(midpointBoost * 100) / 100, 5.0);
});

test('smoothValue converges towards target value', () => {
  const initial = 0;
  const target = 10;
  const smoothed1 = smoothValue(initial, target, 0.5);
  assert.equal(smoothed1, 5);

  const smoothed2 = smoothValue(smoothed1, target, 0.5);
  assert.equal(smoothed2, 7.5);
});

test('calculateCabinNoiseDb increases monotonically with speed', () => {
  const idleNoise = calculateCabinNoiseDb(0);
  const cityNoise = calculateCabinNoiseDb(50);
  const highwayNoise = calculateCabinNoiseDb(120);

  assert.ok(cityNoise > idleNoise, 'City noise should exceed idle noise');
  assert.ok(highwayNoise > cityNoise, 'Highway noise should exceed city noise');
});

test('speed unit conversions work accurately', () => {
  assert.equal(Math.round(kmhToMph(100) * 10) / 10, 62.1);
  assert.equal(msToKmh(10), 36.0);
});
