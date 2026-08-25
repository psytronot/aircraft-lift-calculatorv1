import { describe, expect, it } from 'vitest';
import { calculateValidationMetric } from './referenceValidation';

const FIXTURE = [
  { alphaDeg: -2, cl: -0.22 },
  { alphaDeg: 0, cl: 0 },
  { alphaDeg: 2, cl: 0.22 },
  { alphaDeg: 4, cl: 0.44 },
  { alphaDeg: 6, cl: 0.66 },
  { alphaDeg: 8, cl: 0.88 },
  { alphaDeg: 10, cl: 1.05 },
];

describe('reference validation metric engine', () => {
  it('calculates zero error for identical reference data', () => {
    const metric = calculateValidationMetric(FIXTURE, FIXTURE);
    expect(metric.mae).toBe(0);
    expect(metric.rmse).toBe(0);
    expect(metric.maxAbsError).toBe(0);
    expect(metric.comparedPoints).toBe(7);
  });

  it('reports deterministic error when the model differs', () => {
    const predicted = FIXTURE.map((p) => ({ ...p, cl: p.cl + 0.05 }));
    const metric = calculateValidationMetric(predicted, FIXTURE);
    expect(metric.mae).toBeCloseTo(0.05, 12);
    expect(metric.rmse).toBeCloseTo(0.05, 12);
    expect(metric.maxAbsError).toBeCloseTo(0.05, 12);
    expect(metric.comparedPoints).toBe(7);
  });

  it('rejects validation when there are no overlapping alpha points', () => {
    expect(() => calculateValidationMetric([{ alphaDeg: 20, cl: 1 }], FIXTURE)).toThrow(/No overlapping/);
  });
});
