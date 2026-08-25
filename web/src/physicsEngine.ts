export type CoefficientSource = 'analytical' | 'measured';

export interface FlightInputs {
  densityKgM3: number;
  velocityMs: number;
  referenceAreaM2: number;
  characteristicLengthM: number;
  aspectRatio: number;
  viscosityPaS: number;
  angleOfAttackDeg: number;
  massKg: number;
  cl: number;
  cd: number;
  clMax: number;
  oswaldEfficiency: number;
  speedOfSoundMs: number;
  coefficientSource: CoefficientSource;
  isLiftingSurface: boolean;
}

export interface PhysicsResult {
  dynamicPressurePa: number;
  liftN: number;
  dragN: number;
  liftToDrag: number;
  reynolds: number;
  mach: number;
  weightN: number;
  stallSpeedMs: number | null;
  stallMarginDeg: number | null;
  separationEstimate: number | null;
  inducedDragCoefficient: number | null;
}

export interface AirfoilPolarPoint {
  alphaDeg: number;
  cl: number;
  cd: number;
  liftToDrag: number;
  stalled: boolean;
  separation: number;
}

export const G0 = 9.80665;
export const EDUCATIONAL_STALL_ANGLE_DEG = 15;

export function assertFinitePositive(name: string, value: number, allowZero = false): void {
  if (!Number.isFinite(value) || (allowZero ? value < 0 : value <= 0)) {
    throw new Error(`${name} must be ${allowZero ? 'zero or greater' : 'greater than zero'}.`);
  }
}

export function calculatePhysics(input: FlightInputs): PhysicsResult {
  assertFinitePositive('Air density', input.densityKgM3);
  assertFinitePositive('Velocity', input.velocityMs, true);
  assertFinitePositive('Reference area', input.referenceAreaM2);
  assertFinitePositive('Characteristic length', input.characteristicLengthM);
  assertFinitePositive('Aspect ratio', input.aspectRatio);
  assertFinitePositive('Dynamic viscosity', input.viscosityPaS);
  assertFinitePositive('Mass', input.massKg, true);
  assertFinitePositive('Speed of sound', input.speedOfSoundMs);
  assertFinitePositive('Oswald efficiency', input.oswaldEfficiency);
  if (!Number.isFinite(input.cl) || !Number.isFinite(input.cd)) throw new Error('CL and CD must be finite.');
  if (input.clMax <= 0 || !Number.isFinite(input.clMax)) throw new Error('CLmax must be positive and finite.');

  const q = 0.5 * input.densityKgM3 * input.velocityMs ** 2;
  const lift = q * input.referenceAreaM2 * input.cl;
  const drag = q * input.referenceAreaM2 * input.cd;
  const reynolds = input.densityKgM3 * input.velocityMs * input.characteristicLengthM / input.viscosityPaS;
  const mach = input.velocityMs / input.speedOfSoundMs;
  const weight = input.massKg * G0;
  const stallSpeed = input.isLiftingSurface
    ? Math.sqrt((2 * weight) / (input.densityKgM3 * input.referenceAreaM2 * input.clMax))
    : null;
  const liftToDrag = Math.abs(drag) > Number.EPSILON ? lift / drag : 0;
  const stallMarginDeg = input.isLiftingSurface ? EDUCATIONAL_STALL_ANGLE_DEG - input.angleOfAttackDeg : null;
  const separationEstimate = input.isLiftingSurface
    ? Math.min(1, Math.max(0, (input.angleOfAttackDeg - 10) / 10))
    : null;
  const inducedDragCoefficient = input.isLiftingSurface
    ? input.cl ** 2 / (Math.PI * input.oswaldEfficiency * input.aspectRatio)
    : null;

  return {
    dynamicPressurePa: q,
    liftN: lift,
    dragN: drag,
    liftToDrag,
    reynolds,
    mach,
    weightN: weight,
    stallSpeedMs: stallSpeed,
    stallMarginDeg,
    separationEstimate,
    inducedDragCoefficient,
  };
}

/**
 * Educational analytical airfoil model.
 * Linear thin-airfoil lift is used up to a configurable stall angle; beyond it,
 * CL decays smoothly and an additional separation/form-drag term is introduced.
 * This is NOT a CFD or wind-tunnel model and is intentionally labeled as such in the UI.
 */
export function analyticalAirfoilCoefficients(angleDeg: number, aspectRatio: number, oswaldEfficiency: number): Pick<FlightInputs, 'cl' | 'cd' | 'clMax'> {
  const alphaRad = angleDeg * Math.PI / 180;
  const clLinear = 2 * Math.PI * alphaRad;
  const clMax = 1.4;
  const stallAngle = EDUCATIONAL_STALL_ANGLE_DEG;
  const cd0 = 0.02;
  const inducedFactor = 1 / (Math.PI * Math.max(oswaldEfficiency, 0.01) * Math.max(aspectRatio, 0.01));

  let cl: number;
  let separation = 0;
  if (angleDeg <= stallAngle) {
    cl = Math.max(-clMax * 0.75, Math.min(clMax, clLinear));
  } else {
    separation = Math.min(1, (angleDeg - stallAngle) / 15);
    const postStallDecay = Math.max(0.55, 1 - 0.45 * separation);
    cl = clMax * postStallDecay;
  }

  const cd = cd0 + inducedFactor * cl ** 2 + 0.9 * separation ** 2;
  return { cl, cd, clMax };
}

export function generateAirfoilSweep(
  aspectRatio: number,
  oswaldEfficiency: number,
  minAlphaDeg = -20,
  maxAlphaDeg = 30,
  stepDeg = 1,
): AirfoilPolarPoint[] {
  if (!Number.isFinite(stepDeg) || stepDeg <= 0) throw new Error('Sweep step must be greater than zero.');
  if (maxAlphaDeg < minAlphaDeg) throw new Error('Sweep maximum must be greater than or equal to minimum.');

  const points: AirfoilPolarPoint[] = [];
  for (let alpha = minAlphaDeg; alpha <= maxAlphaDeg + stepDeg * 0.001; alpha += stepDeg) {
    const alphaDeg = Number(alpha.toFixed(6));
    const coefficients = analyticalAirfoilCoefficients(alphaDeg, aspectRatio, oswaldEfficiency);
    const stalled = alphaDeg > EDUCATIONAL_STALL_ANGLE_DEG;
    const separation = stalled ? Math.min(1, (alphaDeg - EDUCATIONAL_STALL_ANGLE_DEG) / 15) : 0;
    points.push({
      alphaDeg,
      cl: coefficients.cl,
      cd: coefficients.cd,
      liftToDrag: Math.abs(coefficients.cd) > Number.EPSILON ? coefficients.cl / coefficients.cd : 0,
      stalled,
      separation,
    });
  }
  return points;
}

export function validatePhysicsResult(input: FlightInputs, result: PhysicsResult): string[] {
  const errors: string[] = [];
  const expectedQ = 0.5 * input.densityKgM3 * input.velocityMs ** 2;
  if (Math.abs(result.dynamicPressurePa - expectedQ) > Math.max(1e-9, expectedQ * 1e-12)) errors.push('Dynamic pressure mismatch.');
  const expectedLift = expectedQ * input.referenceAreaM2 * input.cl;
  if (Math.abs(result.liftN - expectedLift) > Math.max(1e-9, Math.abs(expectedLift) * 1e-12)) errors.push('Lift mismatch.');
  const expectedDrag = expectedQ * input.referenceAreaM2 * input.cd;
  if (Math.abs(result.dragN - expectedDrag) > Math.max(1e-9, Math.abs(expectedDrag) * 1e-12)) errors.push('Drag mismatch.');
  return errors;
}
