export type ValidationClass = 'EXACT' | 'MODEL';

export interface ValidationRow {
  shape: string;
  family: string;
  mathematicalArea: string;
  referenceArea: string;
  rendererRule: string;
  physicsUse: string;
  class: ValidationClass;
}

export const VALIDATION_MATRIX: ValidationRow[] = [
  { shape: 'NACA 0012', family: 'Airfoil', mathematicalArea: 'c × b', referenceArea: 'planform c × b', rendererRule: 'NACA 4-digit profile + span extrusion', physicsUse: 'lifting-surface CL/CD model', class: 'EXACT' },
  { shape: 'NACA 2412', family: 'Airfoil', mathematicalArea: 'c × b', referenceArea: 'planform c × b', rendererRule: 'NACA 4-digit profile + span extrusion', physicsUse: 'lifting-surface CL/CD model', class: 'EXACT' },
  { shape: 'NACA 4412', family: 'Airfoil', mathematicalArea: 'c × b', referenceArea: 'planform c × b', rendererRule: 'NACA 4-digit profile + span extrusion', physicsUse: 'lifting-surface CL/CD model', class: 'EXACT' },
  { shape: 'Flat plate', family: 'Airfoil', mathematicalArea: 'c × b', referenceArea: 'planform c × b', rendererRule: 'thin rectangular extrusion', physicsUse: 'lifting-surface CL/CD model', class: 'EXACT' },
  { shape: 'Circle', family: '2D', mathematicalArea: 'πr²', referenceArea: 'πr²', rendererRule: 'planar disk extrusion', physicsUse: 'drag-only coefficient map', class: 'EXACT' },
  { shape: 'Rectangle', family: '2D', mathematicalArea: 'L × W', referenceArea: 'L × W', rendererRule: 'planar rectangle extrusion', physicsUse: 'drag-only coefficient map', class: 'EXACT' },
  { shape: 'Triangle', family: '2D', mathematicalArea: '½bh', referenceArea: '½bh', rendererRule: 'planar triangle extrusion', physicsUse: 'drag-only coefficient map', class: 'EXACT' },
  { shape: 'Ellipse', family: '2D', mathematicalArea: 'πab', referenceArea: 'πab', rendererRule: 'planar ellipse extrusion', physicsUse: 'drag-only coefficient map', class: 'EXACT' },
  { shape: 'Cube', family: '3D', mathematicalArea: 's² face', referenceArea: 'principal projected face', rendererRule: 'box geometry', physicsUse: 'drag-only coefficient map', class: 'EXACT' },
  { shape: 'Cuboid', family: '3D', mathematicalArea: 'wh principal face', referenceArea: 'wh axis / lh face', rendererRule: 'box geometry + orientation mapping', physicsUse: 'drag-only coefficient map', class: 'EXACT' },
  { shape: 'Sphere', family: '3D', mathematicalArea: 'πr² projected', referenceArea: 'πr²', rendererRule: 'sphere geometry', physicsUse: 'drag-only coefficient map', class: 'EXACT' },
  { shape: 'Cylinder', family: '3D', mathematicalArea: 'πr² face', referenceArea: 'πr² axis / 2rL cross-flow', rendererRule: 'cylinder + flow-axis mapping', physicsUse: 'drag-only coefficient map', class: 'EXACT' },
  { shape: 'Cone', family: '3D', mathematicalArea: 'πr² base', referenceArea: 'πr² axis / rL cross-flow', rendererRule: 'cone + flow-axis mapping', physicsUse: 'drag-only coefficient map', class: 'EXACT' },
  { shape: 'Triangular prism', family: '3D', mathematicalArea: '½bh section', referenceArea: 'bh axis / Lh face', rendererRule: 'extruded triangle + axis mapping', physicsUse: 'drag-only coefficient map', class: 'EXACT' },
  { shape: 'Rectangular prism', family: '3D', mathematicalArea: 'wh principal face', referenceArea: 'wh axis / lh face', rendererRule: 'box geometry + orientation mapping', physicsUse: 'drag-only coefficient map', class: 'EXACT' },
  { shape: 'Square pyramid', family: '3D', mathematicalArea: 'b² base', referenceArea: 'b² axis / bh face', rendererRule: '4-sided cone geometry', physicsUse: 'drag-only coefficient map', class: 'EXACT' },
  { shape: 'Cone frustum', family: '3D', mathematicalArea: 'πr₁² base', referenceArea: 'π max(r₁,r₂)² axis / (r₁+r₂)L face', rendererRule: 'cylinder geometry with unequal radii', physicsUse: 'drag-only coefficient map', class: 'EXACT' },
  { shape: 'Ellipsoid', family: '3D', mathematicalArea: 'πbc projected', referenceArea: 'πbc', rendererRule: 'scaled sphere geometry', physicsUse: 'drag-only coefficient map', class: 'EXACT' },
];
