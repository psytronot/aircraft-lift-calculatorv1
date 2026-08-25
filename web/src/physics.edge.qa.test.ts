import { describe, expect, it } from 'vitest';
import { calculatePhysics, generateAirfoilSweep, type FlightInputs } from './physicsEngine';

const makeInput = (overrides: Partial<FlightInputs> = {}): FlightInputs => ({
  densityKgM3: 1.225,
  velocityMs: 50,
  referenceAreaM2: 10,
  characteristicLengthM: 1,
  aspectRatio: 8,
  viscosityPaS: 1.81e-5,
  angleOfAttackDeg: 5,
  massKg: 1000,
  cl: 0.6,
  cd: 0.04,
  clMax: 1.4,
  oswaldEfficiency: 0.82,
  speedOfSoundMs: 340.3,
  coefficientSource: 'analytical',
  isLiftingSurface: true,
  ...overrides,
});

describe('deep physics edge-case QA', () => {
  it('handles zero velocity without NaN or infinity', () => {
    const r = calculatePhysics(makeInput({ velocityMs: 0 }));
    expect(r.dynamicPressurePa).toBe(0);
    expect(r.liftN).toBe(0);
    expect(r.dragN).toBe(0);
    expect(r.reynolds).toBe(0);
    expect(r.mach).toBe(0);
  });

  it.each([
    ['density', { densityKgM3: 0 }],
    ['area', { referenceAreaM2: 0 }],
    ['length', { characteristicLengthM: 0 }],
    ['aspect ratio', { aspectRatio: 0 }],
    ['viscosity', { viscosityPaS: 0 }],
    ['speed of sound', { speedOfSoundMs: 0 }],
    ['negative velocity', { velocityMs: -1 }],
    ['negative mass', { massKg: -1 }],
  ] as const)('rejects invalid %s', (_name, overrides) => {
    expect(() => calculatePhysics(makeInput(overrides))).toThrow();
  });

  it('rejects NaN and infinity in aerodynamic coefficients', () => {
    expect(() => calculatePhysics(makeInput({ cl: Number.NaN }))).toThrow();
    expect(() => calculatePhysics(makeInput({ cd: Number.POSITIVE_INFINITY }))).toThrow();
  });

  it('rejects invalid CLmax and invalid sweep ranges', () => {
    expect(() => calculatePhysics(makeInput({ clMax: 0 }))).toThrow();
    expect(() => generateAirfoilSweep(8, 0.8, 10, -10, 1)).toThrow();
    expect(() => generateAirfoilSweep(8, 0.8, -10, 10, 0)).toThrow();
  });

  it('preserves expected scaling laws', () => {
    const a = calculatePhysics(makeInput({ velocityMs: 50 }));
    const b = calculatePhysics(makeInput({ velocityMs: 100 }));
    expect(b.dynamicPressurePa / a.dynamicPressurePa).toBeCloseTo(4, 12);
    expect(b.liftN / a.liftN).toBeCloseTo(4, 12);
    expect(b.dragN / a.dragN).toBeCloseTo(4, 12);
  });

  it('preserves linear area scaling for fixed coefficients and flow', () => {
    const a = calculatePhysics(makeInput({ referenceAreaM2: 5 }));
    const b = calculatePhysics(makeInput({ referenceAreaM2: 15 }));
    expect(b.liftN / a.liftN).toBeCloseTo(3, 12);
    expect(b.dragN / a.dragN).toBeCloseTo(3, 12);
  });

  it('keeps the entire polar finite across a wider stress range', () => {
    const sweep = generateAirfoilSweep(0.2, 0.55, -90, 90, 0.25);
    expect(sweep).toHaveLength(721);
    expect(sweep.every((p) => Object.values(p).every((v) => typeof v === 'boolean' || Number.isFinite(v)))).toBe(true);
    expect(sweep.some((p) => p.stalled)).toBe(true);
    expect(sweep.some((p) => p.separation > 0)).toBe(true);
  });

  it('keeps stall speed invariant to angle of attack for fixed weight/area/CLmax', () => {
    const low = calculatePhysics(makeInput({ angleOfAttackDeg: -5 }));
    const high = calculatePhysics(makeInput({ angleOfAttackDeg: 12 }));
    expect(high.stallSpeedMs).toBe(low.stallSpeedMs);
  });
});
