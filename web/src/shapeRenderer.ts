import * as THREE from 'three';
import type { GeometryState } from './geometry';

const positive = (state: GeometryState, key: string) => Math.max(0.01, state.values[key] ?? 1);

export function nacaPoints(state: GeometryState, samples = 80): THREE.Vector2[] {
  const m = Math.max(0, Math.min(0.20, (state.values.camber ?? (state.id === 'naca4412' ? 4 : state.id === 'naca2412' ? 2 : 0)) / 100));
  const p = Math.max(0.01, Math.min(0.90, (state.values.camberPos ?? 40) / 100));
  const t = Math.max(0.001, Math.min(0.40, (state.values.thickness ?? 12) / 100));
  const upper: THREE.Vector2[] = []; const lower: THREE.Vector2[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = i / samples;
    const yt = 5 * t * (0.2969 * Math.sqrt(x) - 0.1260 * x - 0.3516 * x ** 2 + 0.2843 * x ** 3 - 0.1015 * x ** 4);
    let yc = 0; let dy = 0;
    if (m > 0) {
      if (x < p) { yc = m / p ** 2 * (2 * p * x - x ** 2); dy = 2 * m / p ** 2 * (p - x); }
      else { yc = m / (1 - p) ** 2 * ((1 - 2 * p) + 2 * p * x - x ** 2); dy = 2 * m / (1 - p) ** 2 * (p - x); }
    }
    const theta = Math.atan(dy);
    upper.push(new THREE.Vector2(x - yt * Math.sin(theta), yc + yt * Math.cos(theta)));
    lower.push(new THREE.Vector2(x + yt * Math.sin(theta), yc - yt * Math.cos(theta)));
  }
  return [...upper.reverse(), ...lower.slice(1)];
}

function planarShape(state: GeometryState): THREE.BufferGeometry {
  const p = (key: string) => positive(state, key); const shape = new THREE.Shape();
  switch (state.id) {
    case 'circle': shape.absarc(0, 0, p('radius'), 0, Math.PI * 2, false); break;
    case 'rectangle': shape.moveTo(-p('length') / 2, -p('width') / 2); shape.lineTo(p('length') / 2, -p('width') / 2); shape.lineTo(p('length') / 2, p('width') / 2); shape.lineTo(-p('length') / 2, p('width') / 2); shape.closePath(); break;
    case 'triangle': shape.moveTo(-p('base') / 2, 0); shape.lineTo(p('base') / 2, 0); shape.lineTo(0, p('height')); shape.closePath(); break;
    case 'ellipse': shape.absellipse(0, 0, p('semiMajor'), p('semiMinor'), 0, Math.PI * 2, false, 0); break;
    default: throw new Error(`Unsupported planar shape: ${state.id}`);
  }
  return new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false });
}

export function createShapeGeometry(state: GeometryState): THREE.BufferGeometry {
  const p = (key: string) => positive(state, key);
  switch (state.id) {
    case 'naca0012': case 'naca2412': case 'naca4412': {
      const shape = new THREE.Shape(); const points = nacaPoints(state);
      shape.moveTo(points[0].x * p('chord'), points[0].y * p('chord'));
      for (const point of points.slice(1)) shape.lineTo(point.x * p('chord'), point.y * p('chord'));
      shape.closePath(); return new THREE.ExtrudeGeometry(shape, { depth: p('span'), bevelEnabled: false, curveSegments: 2 });
    }
    case 'flatPlate': { const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(p('chord'), 0); shape.lineTo(p('chord'), 0.02 * p('chord')); shape.lineTo(0, 0.02 * p('chord')); shape.closePath(); return new THREE.ExtrudeGeometry(shape, { depth: p('span'), bevelEnabled: false }); }
    case 'circle': case 'rectangle': case 'triangle': case 'ellipse': return planarShape(state);
    case 'cube': return new THREE.BoxGeometry(p('side'), p('side'), p('side'));
    case 'cuboid': case 'rectangularPrism': return new THREE.BoxGeometry(p('length'), p('height'), p('width'));
    case 'sphere': return new THREE.SphereGeometry(p('radius'), 48, 32);
    case 'cylinder': return new THREE.CylinderGeometry(p('radius'), p('radius'), p('length'), 48);
    case 'cone': return new THREE.ConeGeometry(p('radius'), p('length'), 48);
    case 'triangularPrism': { const shape = new THREE.Shape(); shape.moveTo(-p('base') / 2, 0); shape.lineTo(p('base') / 2, 0); shape.lineTo(0, p('height')); shape.closePath(); return new THREE.ExtrudeGeometry(shape, { depth: p('length'), bevelEnabled: false }); }
    case 'squarePyramid': { const g = new THREE.ConeGeometry(p('base') / Math.sqrt(2), p('height'), 4, 1); g.rotateY(Math.PI / 4); return g; }
    case 'coneFrustum': return new THREE.CylinderGeometry(p('radius2'), p('radius1'), p('length'), 48);
    case 'ellipsoid': return new THREE.SphereGeometry(1, 48, 32).scale(p('radiusX'), p('radiusY'), p('radiusZ'));
  }
}
