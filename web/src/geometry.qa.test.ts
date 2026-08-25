import { describe, expect, it } from 'vitest';
import { GEOMETRY_LIBRARY, computeGeometry, type GeometryState, type ShapeId } from './geometry';

const makeState = (id: ShapeId, values: Record<string, number>, flowMode: 'axis' | 'face' = 'axis'): GeometryState => ({ id, values, flowMode });
const approx = (actual: number, expected: number, tolerance = 1e-10) => expect(actual).toBeCloseTo(expected, Math.max(0, Math.floor(-Math.log10(tolerance))));

const expectedShapes: ShapeId[] = ['naca0012','naca2412','naca4412','flatPlate','circle','rectangle','triangle','ellipse','cube','cuboid','sphere','cylinder','cone','triangularPrism','rectangularPrism','squarePyramid','coneFrustum','ellipsoid'];

describe('deep geometry QA matrix', () => {
  it('contains exactly the supported geometry set', () => {
    expect(GEOMETRY_LIBRARY.map((g) => g.id)).toEqual(expectedShapes);
    expect(new Set(GEOMETRY_LIBRARY.map((g) => g.id)).size).toBe(expectedShapes.length);
  });

  it.each([
    ['circle', makeState('circle', { radius: 2 }), Math.PI * 4, 4 / 3 * Math.PI * 8],
    ['rectangle', makeState('rectangle', { length: 3, width: 2 }), 6, 0],
    ['triangle', makeState('triangle', { base: 4, height: 3 }), 6, 0],
    ['ellipse', makeState('ellipse', { semiMajor: 2, semiMinor: 1 }), 2 * Math.PI, 0],
    ['cube', makeState('cube', { side: 2 }), 4, 8],
    ['cuboid', makeState('cuboid', { length: 3, width: 2, height: 4 }), 8, 24],
    ['sphere', makeState('sphere', { radius: 2 }), 4 * Math.PI, 32 / 3 * Math.PI],
    ['cylinder', makeState('cylinder', { radius: 2, length: 5 }), 4 * Math.PI, 20 * Math.PI],
    ['cone', makeState('cone', { radius: 2, length: 5 }), 4 * Math.PI, 20 * Math.PI / 3],
    ['triangularPrism', makeState('triangularPrism', { base: 4, height: 3, length: 5 }), 12, 30],
    ['rectangularPrism', makeState('rectangularPrism', { length: 3, width: 2, height: 4 }), 8, 24],
    ['squarePyramid', makeState('squarePyramid', { base: 4, height: 3 }), 16, 16],
    ['coneFrustum', makeState('coneFrustum', { radius1: 2, radius2: 1, length: 3 }), 4 * Math.PI, Math.PI * 3 * (4 + 2 + 1) / 3],
    ['ellipsoid', makeState('ellipsoid', { radiusX: 2, radiusY: 3, radiusZ: 4 }), 12 * Math.PI, 32 * Math.PI],
  ] as const)('%s has deterministic reference area and volume', (_name, state, expectedArea, expectedVolume) => {
    const result = computeGeometry(state);
    approx(result.mathematicalAreaM2, expectedArea);
    approx(result.volumeM3, expectedVolume);
    expect(Number.isFinite(result.referenceAreaM2)).toBe(true);
    expect(result.referenceAreaM2).toBeGreaterThan(0);
  });

  it('uses projected face area for cuboids and prisms under face flow', () => {
    const cuboid = computeGeometry(makeState('cuboid', { length: 3, width: 2, height: 4 }, 'face'));
    expect(cuboid.referenceAreaM2).toBe(12);
    const prism = computeGeometry(makeState('triangularPrism', { base: 4, height: 3, length: 5 }, 'face'));
    expect(prism.referenceAreaM2).toBe(15);
  });

  it('changes reference area correctly for cylinder and cone orientation', () => {
    const cylinderAxis = computeGeometry(makeState('cylinder', { radius: 2, length: 5 }, 'axis'));
    const cylinderFace = computeGeometry(makeState('cylinder', { radius: 2, length: 5 }, 'face'));
    expect(cylinderAxis.referenceAreaM2).toBeCloseTo(4 * Math.PI);
    expect(cylinderFace.referenceAreaM2).toBe(20);
    const coneAxis = computeGeometry(makeState('cone', { radius: 2, length: 5 }, 'axis'));
    const coneFace = computeGeometry(makeState('cone', { radius: 2, length: 5 }, 'face'));
    expect(coneAxis.referenceAreaM2).toBeCloseTo(4 * Math.PI);
    expect(coneFace.referenceAreaM2).toBe(10);
  });

  it('keeps every geometry result finite and positive for representative valid dimensions', () => {
    for (const def of GEOMETRY_LIBRARY) {
      const values = Object.fromEntries(def.parameters.map((key) => [key, 1]));
      const result = computeGeometry(makeState(def.id, values));
      for (const value of Object.values(result)) if (typeof value === 'number') expect(Number.isFinite(value)).toBe(true);
      expect(result.referenceAreaM2).toBeGreaterThan(0);
      expect(result.characteristicLengthM).toBeGreaterThan(0);
      expect(result.aspectRatio).toBeGreaterThan(0);
    }
  });

  it('does not allow zero/negative source dimensions to create non-finite geometry', () => {
    for (const def of GEOMETRY_LIBRARY) {
      const values = Object.fromEntries(def.parameters.map((key) => [key, 0]));
      const result = computeGeometry(makeState(def.id, values));
      expect(Number.isFinite(result.referenceAreaM2)).toBe(true);
      expect(result.referenceAreaM2).toBeGreaterThan(0);
    }
  });
});
