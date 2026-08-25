import { describe, expect, it } from 'vitest';
import { VALIDATION_MATRIX } from './validationMatrix';
import { GEOMETRY_LIBRARY } from './geometry';

describe('validation matrix', () => {
  it('covers every supported geometry exactly once', () => {
    expect(VALIDATION_MATRIX).toHaveLength(GEOMETRY_LIBRARY.length);
    expect(new Set(VALIDATION_MATRIX.map((row) => row.shape)).size).toBe(VALIDATION_MATRIX.length);
  });

  it('keeps mathematical geometry classified as exact', () => {
    expect(VALIDATION_MATRIX.every((row) => row.class === 'EXACT')).toBe(true);
  });

  it('documents both renderer and physics responsibility for every shape', () => {
    for (const row of VALIDATION_MATRIX) {
      expect(row.rendererRule.length).toBeGreaterThan(0);
      expect(row.physicsUse.length).toBeGreaterThan(0);
      expect(row.referenceArea.length).toBeGreaterThan(0);
    }
  });
});
