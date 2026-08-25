import type { GeometryState } from './geometry';

export interface RenderOrientation {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
}

/**
 * Maps the mathematical flow convention to the Three.js primitive's local axis.
 * The scene uses +X as the incoming-flow axis.
 */
export function getRenderOrientation(state: GeometryState): RenderOrientation {
  switch (state.id) {
    case 'cylinder':
    case 'cone':
    case 'coneFrustum':
      // Three.js cylinder/cone primitives are built around local +Y.
      // Axis flow means their physical axis must become +X.
      return state.flowMode === 'axis'
        ? { rotationX: 0, rotationY: 0, rotationZ: Math.PI / 2 }
        : { rotationX: 0, rotationY: 0, rotationZ: 0 };

    case 'triangularPrism':
      // ExtrudeGeometry extrudes along +Z. Axis flow means extrusion/length -> +X.
      return state.flowMode === 'axis'
        ? { rotationX: 0, rotationY: Math.PI / 2, rotationZ: 0 }
        : { rotationX: 0, rotationY: 0, rotationZ: 0 };

    case 'cuboid':
    case 'rectangularPrism':
      // BoxGeometry uses X=length, Y=height, Z=width.
      // Face flow selects width as the flow axis.
      return state.flowMode === 'face'
        ? { rotationX: 0, rotationY: Math.PI / 2, rotationZ: 0 }
        : { rotationX: 0, rotationY: 0, rotationZ: 0 };

    default:
      return { rotationX: 0, rotationY: 0, rotationZ: 0 };
  }
}
