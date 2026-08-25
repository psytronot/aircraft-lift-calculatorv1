import { describe, expect, it } from 'vitest';
import {
  analyticalAirfoilCoefficients,
  calculatePhysics,
  EDUCATIONAL_STALL_ANGLE_DEG,
  generateAirfoilSweep,
  validatePhysicsResult,
} from './physicsEngine';

const base = {
  densityKgM3: 1.225,
  velocityMs: 62,
  referenceAreaM2: 6,
  characteristicLengthM: 1,
  aspectRatio: 6,
  viscosityPaS: 1.81e-5,
  angleOfAttackDeg: 5,
  massKg: 1200,
  cl: 0.5,
  cd: 0.04,
  clMax: 1.4,
  oswaldEfficiency: 0.82,
  speedOfSoundMs: 340.3,
  coefficientSource: 'measured' as const,
  isLiftingSurface: true,
};

describe('deterministic physics engine', () => {
  it('computes dynamic pressure from q = 0.5 rho V^2', () => {
    const result = calculatePhysics(base);
    expect(result.dynamicPressurePa).toBeCloseTo(0.5 * 1.225 * 62 ** 2, 12);
  });

  it('computes lift and drag from q S C', () => {
    const result = calculatePhysics(base);
    expect(result.liftN).toBeCloseTo(result.dynamicPressurePa * 6 * 0.5, 10);
    expect(result.dragN).toBeCloseTo(result.dynamicPressurePa * 6 * 0.04, 10);
  });

  it('computes Reynolds and Mach deterministically', () => {
    const result = calculatePhysics(base);
    expect(result.reynolds).toBeCloseTo((1.225 * 62 * 1) / 1.81e-5, 8);
    expect(result.mach).toBeCloseTo(62 / 340.3, 8);
  });

  it('detects arithmetic regressions', () => {
    const result = calculatePhysics(base);
    expect(validatePhysicsResult(base, result)).toEqual([]);
  });

  it('uses thin-airfoil slope before the educational stall limit', () => {
    const c = analyticalAirfoilCoefficients(5, 6, 0.82);
    expect(c.cl).toBeCloseTo(2 * Math.PI * (5 * Math.PI / 180), 8);
    expect(c.cd).toBeGreaterThan(0);
  });

  it('caps CL at CLmax at the modeled stall angle', () => {
    const atStall = analyticalAirfoilCoefficients(EDUCATIONAL_STALL_ANGLE_DEG, 6, 0.82);
    const postStall = analyticalAirfoilCoefficients(EDUCATIONAL_STALL_ANGLE_DEG + 10, 6, 0.82);
    expect(atStall.cl).toBeCloseTo(1.4, 10);
    expect(postStall.cl).toBeLessThan(atStall.cl);
    expect(postStall.cd).toBeGreaterThan(atStall.cd);
  });

  it('generates a deterministic -20 to +30 degree polar sweep', () => {
    const sweep = generateAirfoilSweep(6, 0.82);
    expect(sweep).toHaveLength(51);
    expect(sweep[0].alphaDeg).toBe(-20);
    expect(sweep[sweep.length - 1].alphaDeg).toBe(30);
    expect(sweep.find((p) => p.alphaDeg === 15)?.stalled).toBe(false);
    expect(sweep.find((p) => p.alphaDeg === 16)?.stalled).toBe(true);
  });

  it('keeps the sweep finite and identifies a maximum CL point', () => {
    const sweep = generateAirfoilSweep(8, 0.85, -10, 25, 0.5);
    expect(sweep.every((p) => Number.isFinite(p.cl) && Number.isFinite(p.cd) && Number.isFinite(p.liftToDrag))).toBe(true);
    expect(Math.max(...sweep.map((p) => p.cl))).toBeCloseTo(1.4, 10);
  });
});
