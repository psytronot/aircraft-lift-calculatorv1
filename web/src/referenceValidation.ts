export interface ReferencePoint { alphaDeg: number; cl: number; }
export interface ValidationMetric { mae: number; rmse: number; maxAbsError: number; meanPercentError: number; comparedPoints: number; }
export interface ValidationReport { caseName: string; geometry: string; reynolds: number; mach: number; source: string; metric?: ValidationMetric; status: 'reference-required' | 'validated'; }

export const NACA0012_REFERENCE_CASE = { caseName: 'NACA 0012 — NASA low-speed reference case', geometry: 'NACA 0012', reynolds: 6_000_000, mach: 0.15, source: 'NASA Langley low-turbulence pressure-tunnel / NACA 0012 datasets', status: 'reference-required' as const };

// No fabricated numeric points are embedded. NASA documents multiple NACA 0012 datasets with different Reynolds, Mach, transition and surface conditions. A comparison must use digitized/tabulated points from one specified case.
export const NACA0012_REFERENCE_POINTS: ReferencePoint[] = [];

export function calculateValidationMetric(predicted: ReferencePoint[], reference: ReferencePoint[]): ValidationMetric {
  const refByAlpha = new Map(reference.map((p) => [p.alphaDeg, p.cl])); const errors: number[] = []; const percentErrors: number[] = [];
  for (const point of predicted) { const expected = refByAlpha.get(point.alphaDeg); if (expected === undefined) continue; const error = point.cl - expected; errors.push(error); if (Math.abs(expected) > 1e-12) percentErrors.push(Math.abs(error / expected) * 100); }
  if (!errors.length) throw new Error('No overlapping reference points were available for validation.');
  const mae = errors.reduce((sum, e) => sum + Math.abs(e), 0) / errors.length; const rmse = Math.sqrt(errors.reduce((sum, e) => sum + e * e, 0) / errors.length);
  return { mae, rmse, maxAbsError: Math.max(...errors.map(Math.abs)), meanPercentError: percentErrors.length ? percentErrors.reduce((s, e) => s + e, 0) / percentErrors.length : 0, comparedPoints: errors.length };
}

export function makeValidationReport(predicted: ReferencePoint[], reference: ReferencePoint[]): ValidationReport { return { ...NACA0012_REFERENCE_CASE, metric: calculateValidationMetric(predicted, reference), status: 'validated' }; }
