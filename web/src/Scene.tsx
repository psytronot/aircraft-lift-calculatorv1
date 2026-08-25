import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { GeometryState } from './geometry';

interface SceneProps { geometry: GeometryState; angleDeg: number; windDirection: 'leftToRight' | 'rightToLeft'; }

function nacaPoints(id: GeometryState['id'], samples = 80): THREE.Vector2[] {
  const digits = id === 'naca0012' ? [0, 0, 12] : id === 'naca4412' ? [4, 4, 12] : [2, 4, 12];
  const m = digits[0] / 100; const p = digits[1] / 10; const t = digits[2] / 100;
  const upper: THREE.Vector2[] = []; const lower: THREE.Vector2[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = i / samples;
    const yt = 5 * t * (0.2969 * Math.sqrt(x) - 0.1260 * x - 0.3516 * x ** 2 + 0.2843 * x ** 3 - 0.1015 * x ** 4);
    let yc = 0; let dy = 0;
    if (m > 0 && p > 0) {
      if (x < p) { yc = m / p ** 2 * (2 * p * x - x ** 2); dy = 2 * m / p ** 2 * (p - x); }
      else { yc = m / (1 - p) ** 2 * ((1 - 2 * p) + 2 * p * x - x ** 2); dy = 2 * m / (1 - p) ** 2 * (p - x); }
    }
    const theta = Math.atan(dy);
    upper.push(new THREE.Vector2(x - yt * Math.sin(theta), yc + yt * Math.cos(theta)));
    lower.push(new THREE.Vector2(x + yt * Math.sin(theta), yc - yt * Math.cos(theta)));
  }
  return [...upper.reverse(), ...lower.slice(1)];
}

function createShape(state: GeometryState): THREE.BufferGeometry {
  const p = (key: string) => Math.max(0.01, state.values[key] ?? 1);
  switch (state.id) {
    case 'naca0012': case 'naca2412': case 'naca4412': case 'flatPlate': {
      const shape = new THREE.Shape();
      if (state.id === 'flatPlate') {
        shape.moveTo(0, 0); shape.lineTo(p('chord'), 0); shape.lineTo(p('chord'), 0.02 * p('chord')); shape.lineTo(0, 0.02 * p('chord')); shape.closePath();
      } else {
        const pts = nacaPoints(state.id);
        shape.moveTo(pts[0].x * p('chord'), pts[0].y * p('chord'));
        for (const point of pts.slice(1)) shape.lineTo(point.x * p('chord'), point.y * p('chord'));
        shape.closePath();
      }
      return new THREE.ExtrudeGeometry(shape, { depth: p('span'), bevelEnabled: false, curveSegments: 2 });
    }
    case 'circle': return new THREE.CylinderGeometry(p('radius'), p('radius'), 0.12, 48);
    case 'rectangle': return new THREE.BoxGeometry(p('length'), p('width'), 0.12);
    case 'triangle': {
      const shape = new THREE.Shape(); shape.moveTo(-p('base') / 2, 0); shape.lineTo(p('base') / 2, 0); shape.lineTo(0, p('height')); shape.closePath();
      return new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false });
    }
    case 'ellipse': return new THREE.SphereGeometry(1, 48, 24).scale(p('semiMajor'), p('semiMinor'), 0.12);
    case 'cube': return new THREE.BoxGeometry(p('side'), p('side'), p('side'));
    case 'cuboid': case 'rectangularPrism': return new THREE.BoxGeometry(p('length'), p('height'), p('width'));
    case 'sphere': return new THREE.SphereGeometry(p('radius'), 48, 32);
    case 'cylinder': return new THREE.CylinderGeometry(p('radius'), p('radius'), p('length'), 48);
    case 'cone': return new THREE.ConeGeometry(p('radius'), p('length'), 48);
    case 'triangularPrism': {
      const shape = new THREE.Shape(); shape.moveTo(-p('base') / 2, 0); shape.lineTo(p('base') / 2, 0); shape.lineTo(0, p('height')); shape.closePath();
      return new THREE.ExtrudeGeometry(shape, { depth: p('length'), bevelEnabled: false });
    }
    case 'squarePyramid': {
      const g = new THREE.ConeGeometry(p('base') / Math.sqrt(2), p('height'), 4, 1);
      g.rotateY(Math.PI / 4); return g;
    }
    case 'coneFrustum': return new THREE.CylinderGeometry(p('radius2'), p('radius1'), p('length'), 48);
    case 'ellipsoid': return new THREE.SphereGeometry(1, 48, 32).scale(p('radiusX'), p('radiusY'), p('radiusZ'));
  }
}

function makeFlowLines(direction: 1 | -1): THREE.LineSegments {
  const positions: number[] = [];
  const count = 13; const segments = 56; const xStart = -10; const xEnd = 10;
  for (let row = 0; row < count; row++) {
    const baseY = (row - (count - 1) / 2) * 0.48;
    for (let i = 0; i < segments; i++) {
      const x0 = xStart + (xEnd - xStart) * i / segments;
      const x1 = xStart + (xEnd - xStart) * (i + 1) / segments;
      const wake = Math.exp(-((x0 - 1.2) ** 2) / 5) * Math.exp(-(baseY ** 2) / 4);
      const y0 = baseY + direction * 0.8 * wake * Math.sign(baseY || 1);
      const y1 = baseY + direction * 0.8 * Math.exp(-((x1 - 1.2) ** 2) / 5) * Math.exp(-(baseY ** 2) / 4) * Math.sign(baseY || 1);
      positions.push(x0 * direction, y0, 0, x1 * direction, y1, 0);
    }
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({ color: 0x58b7ff, transparent: true, opacity: 0.55 });
  return new THREE.LineSegments(geometry, material);
}

export function FlightScene({ geometry, angleDeg, windDirection }: SceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = hostRef.current; if (!host) return;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x06111b);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100); camera.position.set(7, 5, 8);
    const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); host.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.target.set(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0x9cc9ff, 0x06111b, 2));
    const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(5, 8, 5); scene.add(key);
    const grid = new THREE.GridHelper(24, 24, 0x123b55, 0x0d2638); scene.add(grid);
    const object = new THREE.Mesh(createShape(geometry), new THREE.MeshStandardMaterial({ color: 0xb9d0ec, metalness: 0.1, roughness: 0.45 }));
    object.position.set(-1, 0, 0); object.rotation.z = angleDeg * Math.PI / 180; scene.add(object);
    const flow = makeFlowLines(windDirection === 'leftToRight' ? 1 : -1); flow.position.set(0, 0.9, -1.5); scene.add(flow);
    const animate = () => { controls.update(); renderer.render(scene, camera); };
    renderer.setAnimationLoop(animate);
    const resize = () => { const w = host.clientWidth; const h = Math.max(360, host.clientHeight); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); };
    resize(); window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); renderer.setAnimationLoop(null); controls.dispose(); renderer.dispose(); host.removeChild(renderer.domElement); object.geometry.dispose(); (object.material as THREE.Material).dispose(); };
  }, [geometry, angleDeg, windDirection]);
  return <div ref={hostRef} className="scene-host" aria-label="Three dimensional aerodynamic visualization" />;
}
