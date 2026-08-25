import { describe, expect, it } from 'vitest';
import { GEOMETRY_LIBRARY, computeGeometry, type GeometryState, type ShapeId } from './geometry';

const state = (id: ShapeId, values: Record<string, number>, flowMode: 'axis' | 'face' = 'axis'): GeometryState => ({ id, values, flowMode });
const close = (actual: number, expected: number) => expect(actual).toBeCloseTo(expected, 10);

describe('geometry library coverage', () => {
  it('contains every supported shape exactly once', () => {
    const ids = GEOMETRY_LIBRARY.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(18);
  });

  it('keeps every definition wired to a geometry family and parameter list', () => {
    for (const definition of GEOMETRY_LIBRARY) {
      expect(['airfoil', 'shape2d', 'solid3d']).toContain(definition.family);
      expect(definition.parameters.length).toBeGreaterThan(0);
      expect(definition.name.length).toBeGreaterThan(0);
    }
  });
});

describe('2D geometry formulas', () => {
  it('computes a circle', () => {
    const r = computeGeometry(state('circle', { radius: 2 }));
    close(r.mathematicalAreaM2, 4 * Math.PI);
    close(r.referenceAreaM2, 4 * Math.PI);
  });

  it('computes a rectangle', () => {
    const r = computeGeometry(state('rectangle', { length: 4, width: 3 }));
    close(r.mathematicalAreaM2, 12);
    close(r.referenceAreaM2, 12);
    close(r.aspectRatio, 4 / 3);
  });

  it('computes a triangle', () => {
    const r = computeGeometry(state('triangle', { base: 4, height: 3 }));
    close(r.mathematicalAreaM2, 6);
    close(r.referenceAreaM2, 6);
  });

  it('computes an ellipse', () => {
    const r = computeGeometry(state('ellipse', { semiMajor: 3, semiMinor: 2 }));
    close(r.mathematicalAreaM2, 6 * Math.PI);
    close(r.aspectRatio, 1.5);
  });
});

describe('airfoil planform geometry', () => {
  it.each(['naca0012', 'naca2412', 'naca4412', 'flatPlate'] as ShapeId[])('%s uses chord × span as reference area', (id) => {
    const r = computeGeometry(state(id, { chord: 2, span: 8 }));
    close(r.mathematicalAreaM2, 16);
    close(r.referenceAreaM2, 16);
    close(r.aspectRatio, 4);
    expect(r.characteristicLengthM).toBe(2);
  });
});

describe('3D geometry formulas', () => {
  it('computes cube face area, surface area and volume', () => {
    const r = computeGeometry(state('cube', { side: 2 }));
    close(r.mathematicalAreaM2, 4);
    close(r.surfaceAreaM2, 24);
    close(r.volumeM3, 8);
    close(r.referenceAreaM2, 4);
  });

  it('computes sphere projected area, surface area and volume', () => {
    const r = computeGeometry(state('sphere', { radius: 2 }));
    close(r.mathematicalAreaM2, 4 * Math.PI);
    close(r.surfaceAreaM2, 16 * Math.PI);
    close(r.volumeM3, 32 * Math.PI / 3);
    close(r.referenceAreaM2, 4 * Math.PI);
  });

  it('computes a cylinder in axial flow', () => {
    const r = computeGeometry(state('cylinder', { radius: 2, length: 5 }, 'axis'));
    close(r.referenceAreaM2, 4 * Math.PI);
    close(r.volumeM3, 20 * Math.PI);
    close(r.surfaceAreaM2, 28 * Math.PI);
  });

  it('computes a cylinder in cross-flow', () => {
    const r = computeGeometry(state('cylinder', { radius: 2, length: 5 }, 'face'));
    close(r.referenceAreaM2, 20);
  });

  it('computes a cone in axial flow', () => {
    const r = computeGeometry(state('cone', { radius: 3, length: 4 }, 'axis'));
    close(r.volumeM3, 12 * Math.PI);
    close(r.referenceAreaM2, 9 * Math.PI);
    close(r.surfaceAreaM2, 24 * Math.PI);
  });

  it('computes the exact broadside projection of a right cone', () => {
    const r = computeGeometry(state('cone', { radius: 3, length: 4 }, 'face'));
    close(r.referenceAreaM2, 12);
  });

  it('computes a rectangular prism in both principal flow orientations', () => {
    const axis = computeGeometry(state('rectangularPrism', { length: 5, width: 2, height: 3 }, 'axis'));
    const face = computeGeometry(state('rectangularPrism', { length: 5, width: 2, height: 3 }, 'face'));
    close(axis.referenceAreaM2, 6);
    close(face.referenceAreaM2, 15);
    close(axis.volumeM3, 30);
    close(axis.surfaceAreaM2, 62);
  });

  it('computes a triangular prism', () => {
    const r = computeGeometry(state('triangularPrism', { base: 4, height: 3, length: 10 }));
    close(r.mathematicalAreaM2, 6);
    close(r.volumeM3, 60);
    close(r.referenceAreaM2, 12);
  });

  it('computes a square pyramid in both principal flow orientations', () => {
    const axis = computeGeometry(state('squarePyramid', { base: 4, height: 3 }, 'axis'));
    const face = computeGeometry(state('squarePyramid', { base: 4, height: 3 }, 'face'));
    close(axis.volumeM3, 16);
    close(axis.referenceAreaM2, 16);
    close(face.referenceAreaM2, 12);
  });

  it('computes a cone frustum in axial flow', () => {
    const r = computeGeometry(state('coneFrustum', { radius1: 3, radius2: 2, length: 4 }, 'axis'));
    close(r.volumeM3, Math.PI * 4 * (9 + 6 + 4) / 3);
    close(r.referenceAreaM2, 9 * Math.PI);
  });

  it('computes the principal broadside projection of a cone frustum', () => {
    const r = computeGeometry(state('coneFrustum', { radius1: 3, radius2: 2, length: 4 }, 'face'));
    close(r.referenceAreaM2, 20);
  });

  it('computes an ellipsoid volume and projected reference area', () => {
    const r = computeGeometry(state('ellipsoid', { radiusX: 3, radiusY: 2, radiusZ: 1 }));
    close(r.volumeM3, 8 * Math.PI);
    close(r.referenceAreaM2, 2 * Math.PI);
    close(r.characteristicLengthM, 6);
  });
});

describe('geometry output invariants', () => {
  it('never produces non-finite geometry results for representative valid inputs', () => {
    for (const definition of GEOMETRY_LIBRARY) {
      const values = Object.fromEntries(definition.parameters.map((key, index) => [key, index + 1]));
      const result = computeGeometry(state(definition.id, values));
      for (const number of Object.values(result).filter((item): item is number => typeof item === 'number')) {
        expect(Number.isFinite(number)).toBe(true);
        expect(number).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
