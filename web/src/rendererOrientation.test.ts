import { describe, expect, it } from 'vitest';
import { getRenderOrientation } from './rendererOrientation';
import type { GeometryState } from './geometry';

const state = (id: GeometryState['id'], flowMode: GeometryState['flowMode']): GeometryState => ({
  id,
  flowMode,
  values: {},
});

const close = (actual: number, expected: number) => expect(actual).toBeCloseTo(expected, 10);

describe('renderer orientation matches the physics flow convention', () => {
  it('rotates cylinder axis onto +X for axial flow', () => {
    const r = getRenderOrientation(state('cylinder', 'axis'));
    close(r.rotationZ, Math.PI / 2);
  });

  it('keeps cylinder broadside orientation for face flow', () => {
    const r = getRenderOrientation(state('cylinder', 'face'));
    close(r.rotationZ, 0);
  });

  it('rotates cone and frustum longitudinal axes onto +X for axial flow', () => {
    for (const id of ['cone', 'coneFrustum'] as const) {
      const r = getRenderOrientation(state(id, 'axis'));
      close(r.rotationZ, Math.PI / 2);
    }
  });

  it('rotates triangular-prism extrusion onto +X for axial flow', () => {
    const r = getRenderOrientation(state('triangularPrism', 'axis'));
    close(r.rotationY, Math.PI / 2);
  });

  it('rotates rectangular-prism width onto +X for face flow', () => {
    const r = getRenderOrientation(state('rectangularPrism', 'face'));
    close(r.rotationY, Math.PI / 2);
  });

  it('does not silently rotate spherical or planar geometries', () => {
    for (const id of ['sphere', 'circle', 'rectangle', 'triangle', 'ellipse'] as const) {
      const r = getRenderOrientation(state(id, 'axis'));
      expect(r).toEqual({ rotationX: 0, rotationY: 0, rotationZ: 0 });
    }
  });
});
