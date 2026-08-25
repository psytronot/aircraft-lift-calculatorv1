export type GeometryFamily = 'airfoil' | 'shape2d' | 'solid3d';
export type FlowMode = 'axis' | 'face';
export type ShapeId =
  | 'naca0012' | 'naca2412' | 'naca4412' | 'flatPlate'
  | 'circle' | 'rectangle' | 'triangle' | 'ellipse'
  | 'cube' | 'cuboid' | 'sphere' | 'cylinder' | 'cone'
  | 'triangularPrism' | 'rectangularPrism' | 'squarePyramid' | 'coneFrustum' | 'ellipsoid';

export interface GeometryDefinition {
  id: ShapeId;
  name: string;
  family: GeometryFamily;
  parameters: string[];
  description: string;
}

export interface GeometryState {
  id: ShapeId;
  values: Record<string, number>;
  flowMode: FlowMode;
}

export interface GeometryResult {
  mathematicalAreaM2: number;
  surfaceAreaM2: number;
  volumeM3: number;
  referenceAreaM2: number;
  characteristicLengthM: number;
  aspectRatio: number;
  formula: string;
}

export const GEOMETRY_LIBRARY: GeometryDefinition[] = [
  { id: 'naca0012', name: 'NACA 0012', family: 'airfoil', parameters: ['chord', 'span'], description: 'Symmetric 12% thickness airfoil.' },
  { id: 'naca2412', name: 'NACA 2412', family: 'airfoil', parameters: ['chord', 'span'], description: 'Cambered 12% thickness airfoil.' },
  { id: 'naca4412', name: 'NACA 4412', family: 'airfoil', parameters: ['chord', 'span'], description: 'Higher-camber 12% thickness airfoil.' },
  { id: 'flatPlate', name: 'Flat plate', family: 'airfoil', parameters: ['chord', 'span'], description: 'Thin rectangular lifting surface.' },
  { id: 'circle', name: 'Circle', family: 'shape2d', parameters: ['radius'], description: 'Planar circular section.' },
  { id: 'rectangle', name: 'Rectangle', family: 'shape2d', parameters: ['length', 'width'], description: 'Planar rectangle.' },
  { id: 'triangle', name: 'Triangle', family: 'shape2d', parameters: ['base', 'height'], description: 'Planar triangle.' },
  { id: 'ellipse', name: 'Ellipse', family: 'shape2d', parameters: ['semiMajor', 'semiMinor'], description: 'Planar ellipse.' },
  { id: 'cube', name: 'Cube', family: 'solid3d', parameters: ['side'], description: 'Six equal square faces.' },
  { id: 'cuboid', name: 'Cuboid', family: 'solid3d', parameters: ['length', 'width', 'height'], description: 'Rectangular box.' },
  { id: 'sphere', name: 'Sphere', family: 'solid3d', parameters: ['radius'], description: 'Sphere with circular projected area.' },
  { id: 'cylinder', name: 'Cylinder', family: 'solid3d', parameters: ['radius', 'length'], description: 'Circular cylinder.' },
  { id: 'cone', name: 'Cone', family: 'solid3d', parameters: ['radius', 'length'], description: 'Right circular cone.' },
  { id: 'triangularPrism', name: 'Triangular prism', family: 'solid3d', parameters: ['base', 'height', 'length'], description: 'Triangular cross-section extruded along length.' },
  { id: 'rectangularPrism', name: 'Rectangular prism', family: 'solid3d', parameters: ['length', 'width', 'height'], description: 'Rectangular prism.' },
  { id: 'squarePyramid', name: 'Square pyramid', family: 'solid3d', parameters: ['base', 'height'], description: 'Square base with apex.' },
  { id: 'coneFrustum', name: 'Cone frustum', family: 'solid3d', parameters: ['radius1', 'radius2', 'length'], description: 'Truncated right circular cone.' },
  { id: 'ellipsoid', name: 'Ellipsoid', family: 'solid3d', parameters: ['radiusX', 'radiusY', 'radiusZ'], description: 'Ellipsoidal solid.' },
];

const PI = Math.PI;
const value = (state: GeometryState, key: string): number => Math.max(1e-9, state.values[key] ?? 1);

export function computeGeometry(state: GeometryState): GeometryResult {
  const p = (key: string) => value(state, key);
  switch (state.id) {
    case 'naca0012': case 'naca2412': case 'naca4412': case 'flatPlate': {
      const c = p('chord'); const b = p('span'); const area = c * b;
      return { mathematicalAreaM2: area, surfaceAreaM2: area * 2, volumeM3: 0, referenceAreaM2: area, characteristicLengthM: c, aspectRatio: b / c, formula: 'Planform area = c × b' };
    }
    case 'circle': {
      const r = p('radius'); const area = PI * r ** 2;
      return { mathematicalAreaM2: area, surfaceAreaM2: area, volumeM3: 0, referenceAreaM2: area, characteristicLengthM: 2 * r, aspectRatio: 1, formula: 'A = πr²' };
    }
    case 'rectangle': {
      const l = p('length'); const w = p('width'); const area = l * w;
      return { mathematicalAreaM2: area, surfaceAreaM2: area, volumeM3: 0, referenceAreaM2: area, characteristicLengthM: Math.max(l, w), aspectRatio: l / w, formula: 'A = L × W' };
    }
    case 'triangle': {
      const b = p('base'); const h = p('height'); const area = 0.5 * b * h;
      return { mathematicalAreaM2: area, surfaceAreaM2: area, volumeM3: 0, referenceAreaM2: area, characteristicLengthM: b, aspectRatio: b / h, formula: 'A = ½bh' };
    }
    case 'ellipse': {
      const a = p('semiMajor'); const b = p('semiMinor'); const area = PI * a * b;
      return { mathematicalAreaM2: area, surfaceAreaM2: area, volumeM3: 0, referenceAreaM2: area, characteristicLengthM: 2 * a, aspectRatio: a / b, formula: 'A = πab' };
    }
    case 'cube': {
      const s = p('side'); const area = s ** 2;
      return { mathematicalAreaM2: area, surfaceAreaM2: 6 * area, volumeM3: s ** 3, referenceAreaM2: area, characteristicLengthM: s, aspectRatio: 1, formula: 'Face area = s²; surface = 6s²; volume = s³' };
    }
    case 'cuboid': case 'rectangularPrism': {
      const l = p('length'); const w = p('width'); const h = p('height');
      return { mathematicalAreaM2: w * h, surfaceAreaM2: 2 * (l * w + l * h + w * h), volumeM3: l * w * h, referenceAreaM2: state.flowMode === 'axis' ? w * h : l * h, characteristicLengthM: l, aspectRatio: l / Math.max(w, h), formula: 'Surface = 2(LW + LH + WH); volume = LWH; reference = projected principal face' };
    }
    case 'sphere': {
      const r = p('radius'); const area = PI * r ** 2;
      return { mathematicalAreaM2: area, surfaceAreaM2: 4 * PI * r ** 2, volumeM3: 4 / 3 * PI * r ** 3, referenceAreaM2: area, characteristicLengthM: 2 * r, aspectRatio: 1, formula: 'Projected area = πr²; surface = 4πr²; volume = 4/3πr³' };
    }
    case 'cylinder': {
      const r = p('radius'); const l = p('length'); const face = PI * r ** 2;
      return { mathematicalAreaM2: face, surfaceAreaM2: 2 * PI * r * (r + l), volumeM3: PI * r ** 2 * l, referenceAreaM2: state.flowMode === 'axis' ? face : 2 * r * l, characteristicLengthM: l, aspectRatio: l / (2 * r), formula: 'Surface = 2πr(r+L); volume = πr²L; reference = face or projected side' };
    }
    case 'cone': {
      const r = p('radius'); const l = p('length'); const slant = Math.sqrt(r ** 2 + l ** 2); const face = PI * r ** 2;
      return { mathematicalAreaM2: face, surfaceAreaM2: PI * r * (r + slant), volumeM3: PI * r ** 2 * l / 3, referenceAreaM2: state.flowMode === 'axis' ? face : 2 * r * l, characteristicLengthM: l, aspectRatio: l / (2 * r), formula: 'Surface = πr(r+s); volume = 1/3πr²L' };
    }
    case 'triangularPrism': {
      const b = p('base'); const h = p('height'); const l = p('length'); const tri = 0.5 * b * h;
      const side = Math.sqrt((b / 2) ** 2 + h ** 2);
      return { mathematicalAreaM2: tri, surfaceAreaM2: b * l + 2 * tri + 2 * side * l, volumeM3: tri * l, referenceAreaM2: state.flowMode === 'axis' ? b * h : l * h, characteristicLengthM: l, aspectRatio: l / Math.max(b, h), formula: 'Triangle = ½bh; volume = triangle × L' };
    }
    case 'squarePyramid': {
      const b = p('base'); const h = p('height'); const slant = Math.sqrt((b / 2) ** 2 + h ** 2);
      return { mathematicalAreaM2: b ** 2, surfaceAreaM2: b ** 2 + 2 * b * slant, volumeM3: b ** 2 * h / 3, referenceAreaM2: b ** 2, characteristicLengthM: b, aspectRatio: 1, formula: 'Surface = b² + 2bs; volume = 1/3b²h' };
    }
    case 'coneFrustum': {
      const r1 = p('radius1'); const r2 = p('radius2'); const l = p('length'); const slant = Math.sqrt((r1 - r2) ** 2 + l ** 2);
      return { mathematicalAreaM2: PI * r1 ** 2, surfaceAreaM2: PI * (r1 + r2) * slant + PI * (r1 ** 2 + r2 ** 2), volumeM3: PI * l * (r1 ** 2 + r1 * r2 + r2 ** 2) / 3, referenceAreaM2: PI * r1 ** 2, characteristicLengthM: l, aspectRatio: l / Math.max(2 * r1, 1e-9), formula: 'V = πL(r₁²+r₁r₂+r₂²)/3' };
    }
    case 'ellipsoid': {
      const a = p('radiusX'); const b = p('radiusY'); const c = p('radiusZ'); const ref = PI * b * c;
      const surfaceApprox = 4 * PI * (((a * b) ** 1.6 + (a * c) ** 1.6 + (b * c) ** 1.6) / 3) ** (1 / 1.6);
      return { mathematicalAreaM2: ref, surfaceAreaM2: surfaceApprox, volumeM3: 4 / 3 * PI * a * b * c, referenceAreaM2: ref, characteristicLengthM: 2 * a, aspectRatio: a / Math.max(b, c), formula: 'Projected area = πbc; volume = 4/3πabc; surface uses Knud Thomsen approximation' };
    }
  }
}
