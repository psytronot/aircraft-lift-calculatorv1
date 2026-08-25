export type CoefficientSource = 'analytical' | 'measured';

export interface FlightInputs {
  densityKgM3: number;
  velocityMs: number;
  referenceAreaM2: number;
  characteristicLengthM: number;
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

export const G0 = 9.80665;

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
  const liftToDrag = Math.abs(drag) > Number.EPSILON ? lift / drag : null;
  const stallMarginDeg = input.isLiftingSurface ? 15 - input.angleOfAttackDeg : null;
  const separationEstimate = input.isLiftingSurface
    ? Math.min(1, Math.max(0, (input.angleOfAttackDeg - 10) / 10))
    : null;
  const inducedDragCoefficient = input.isLiftingSurface
    ? input.cl ** 2 / (Math.PI * input.oswaldEfficiency * Math.max(input.referenceAreaM2 / input.characteristicLengthM ** 2, 0.01))
    : null;

  return {
    dynamicPressurePa: q,
    liftN: lift,
    dragN: drag,
    liftToDrag: liftToDrag ?? 0,
    reynolds,
    mach,
    weightN: weight,
    stallSpeedMs: stallSpeed,
    stallMarginDeg,
    separationEstimate,
    inducedDragCoefficient,
  };
}

export function analyticalAirfoilCoefficients(angleDeg: number, aspectRatio: number, oswaldEfficiency: number): Pick<FlightInputs, 'cl' | 'cd' | 'clMax'> {
  const alphaRad = angleDeg * Math.PI / 180;
  const clLinear = 2 * Math.PI * alphaRad;
  const clMax = 1.4;
  const cl = Math.max(-clMax * 0.75, Math.min(clMax, clLinear));
  const cd0 = 0.02;
  const inducedFactor = 1 / (Math.PI * Math.max(oswaldEfficiency, 0.01) * Math.max(aspectRatio, 0.01));
  const cd = cd0 + inducedFactor * cl ** 2;
  return { cl, cd, clMax };
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
