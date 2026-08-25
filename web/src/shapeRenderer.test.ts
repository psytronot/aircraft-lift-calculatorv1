import { describe, expect, it } from 'vitest';
import { createShapeGeometry, nacaPoints } from './shapeRenderer';
import type { GeometryState, ShapeId } from './geometry';

const state = (id: ShapeId, values: Record<string, number>): GeometryState => ({ id, values, flowMode: 'axis' });

describe('shape renderer', () => {
  it('creates finite geometry for every supported shape', () => {
    const examples: Record<ShapeId, Record<string, number>> = {
      naca0012: { chord: 2, span: 8, thickness: 12, camber: 0, camberPos: 40 },
      naca2412: { chord: 2, span: 8, thickness: 12, camber: 2, camberPos: 40 },
      naca4412: { chord: 2, span: 8, thickness: 12, camber: 4, camberPos: 40 },
      flatPlate: { chord: 2, span: 8 }, circle: { radius: 2 }, rectangle: { length: 4, width: 3 }, triangle: { base: 4, height: 3 }, ellipse: { semiMajor: 3, semiMinor: 2 }, cube: { side: 2 }, cuboid: { length: 5, width: 2, height: 3 }, sphere: { radius: 2 }, cylinder: { radius: 2, length: 5 }, cone: { radius: 3, length: 4 }, triangularPrism: { base: 4, height: 3, length: 10 }, rectangularPrism: { length: 5, width: 2, height: 3 }, squarePyramid: { base: 4, height: 3 }, coneFrustum: { radius1: 3, radius2: 2, length: 4 }, ellipsoid: { radiusX: 3, radiusY: 2, radiusZ: 1 },
    };
    for (const [id, values] of Object.entries(examples) as [ShapeId, Record<string, number>][]) {
      const geometry = createShapeGeometry(state(id, values));
      expect(geometry.attributes.position.count).toBeGreaterThan(0);
      const positions = geometry.attributes.position.array as ArrayLike<number>;
      for (let i = 0; i < positions.length; i++) expect(Number.isFinite(positions[i])).toBe(true);
      geometry.dispose();
    }
  });

  it('uses manual NACA thickness and camber parameters', () => {
    const thin = nacaPoints(state('naca2412', { chord: 1, span: 6, thickness: 8, camber: 2, camberPos: 40 }));
    const thick = nacaPoints(state('naca2412', { chord: 1, span: 6, thickness: 20, camber: 2, camberPos: 40 }));
    const thinExtent = Math.max(...thin.map((p) => p.y)) - Math.min(...thin.map((p) => p.y));
    const thickExtent = Math.max(...thick.map((p) => p.y)) - Math.min(...thick.map((p) => p.y));
    expect(thickExtent).toBeGreaterThan(thinExtent);
  });
});
