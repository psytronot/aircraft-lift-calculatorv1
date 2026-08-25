import { describe, expect, it } from 'vitest';
import { calculateValidationMetric, NACA0012_LOW_SPEED_REFERENCE } from './referenceValidation';

describe('NACA 0012 reference validation', () => {
  it('calculates zero error for identical reference data', () => {
    const metric = calculateValidationMetric(NACA0012_LOW_SPEED_REFERENCE, NACA0012_LOW_SPEED_REFERENCE);
    expect(metric.mae).toBe(0); expect(metric.rmse).toBe(0); expect(metric.maxAbsError).toBe(0); expect(metric.comparedPoints).toBe(7);
  });
  it('reports a deterministic error when the model differs', () => {
    const predicted = NACA0012_LOW_SPEED_REFERENCE.map((p) => ({ ...p, cl: p.cl + 0.05 }));
    const metric = calculateValidationMetric(predicted, NACA0012_LOW_SPEED_REFERENCE);
    expect(metric.mae).toBeCloseTo(0.05, 12); expect(metric.rmse).toBeCloseTo(0.05, 12); expect(metric.maxAbsError).toBeCloseTo(0.05, 12); expect(metric.comparedPoints).toBe(7);
  });
});
