import { describe, expect, it } from 'vitest';
import { analyticalAirfoilCoefficients, calculatePhysics, validatePhysicsResult } from './physicsEngine';

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

  it('uses thin-airfoil slope for the analytical educational model', () => {
    const c = analyticalAirfoilCoefficients(5, 6, 0.82);
    expect(c.cl).toBeCloseTo(2 * Math.PI * (5 * Math.PI / 180), 8);
    expect(c.cd).toBeGreaterThan(0);
  });
});
