import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { GeometryState } from './geometry';
import { GEOMETRY_LIBRARY } from './geometry';
import { getRenderOrientation } from './rendererOrientation';
import { createShapeGeometry } from './shapeRenderer';

interface SceneProps { geometry: GeometryState; angleDeg: number; windDirection: 'leftToRight' | 'rightToLeft'; }

function makeFlowLines(direction: 1 | -1, scale: number): THREE.LineSegments {
  const positions: number[] = []; const count = 15; const segments = 72; const xStart = -8 * scale; const xEnd = 8 * scale; const bodyHalf = Math.max(0.35 * scale, 0.6);
  for (let row = 0; row < count; row++) { const baseY = (row - (count - 1) / 2) * 0.38 * scale; for (let i = 0; i < segments; i++) { const x0 = xStart + (xEnd - xStart) * i / segments; const x1 = xStart + (xEnd - xStart) * (i + 1) / segments; const wakeX0 = x0 * direction; const wakeX1 = x1 * direction; const nearBody0 = Math.exp(-((wakeX0) ** 2) / (1.5 * scale) ** 2); const nearBody1 = Math.exp(-((wakeX1) ** 2) / (1.5 * scale) ** 2); const wake0 = Math.exp(-((wakeX0 - 1.7 * scale) ** 2) / (3.2 * scale) ** 2); const wake1 = Math.exp(-((wakeX1 - 1.7 * scale) ** 2) / (3.2 * scale) ** 2); const offset0 = Math.sign(baseY || 1) * bodyHalf * 0.45 * nearBody0 + Math.sign(baseY || 1) * bodyHalf * 0.25 * wake0; const offset1 = Math.sign(baseY || 1) * bodyHalf * 0.45 * nearBody1 + Math.sign(baseY || 1) * bodyHalf * 0.25 * wake1; positions.push(x0, baseY + offset0, 0, x1, baseY + offset1, 0); } }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); const material = new THREE.LineBasicMaterial({ color: 0x58b7ff, transparent: true, opacity: 0.48 }); return new THREE.LineSegments(geometry, material);
}

function makeFlowParticles(direction: 1 | -1, scale: number): THREE.Points {
  const count = 72; const positions = new Float32Array(count * 3); const xStart = -8 * scale; const xRange = 16 * scale;
  for (let i = 0; i < count; i++) { const row = i % 12; positions[i * 3] = xStart + (i / count) * xRange; positions[i * 3 + 1] = (row - 5.5) * 0.5 * scale; positions[i * 3 + 2] = -0.08; }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); const material = new THREE.PointsMaterial({ color: 0x7dc8ff, size: Math.max(0.035 * scale, 0.04), sizeAttenuation: true, transparent: true, opacity: 0.9 }); const points = new THREE.Points(geometry, material); points.userData = { direction, scale, xStart, xRange, count }; return points;
}

export function FlightScene({ geometry, angleDeg, windDirection }: SceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = hostRef.current; if (!host) return;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x06111b);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 1000); const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); host.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; scene.add(new THREE.HemisphereLight(0x9cc9ff, 0x06111b, 2)); const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(5, 8, 5); scene.add(key); scene.add(new THREE.GridHelper(24, 24, 0x123b55, 0x0d2638));
    const object = new THREE.Mesh(createShapeGeometry(geometry), new THREE.MeshStandardMaterial({ color: 0xb9d0ec, metalness: 0.1, roughness: 0.45 })); const definition = GEOMETRY_LIBRARY.find((item) => item.id === geometry.id); const isPlanar = definition?.family === 'airfoil' || definition?.family === 'shape2d'; const orientation = getRenderOrientation(geometry); object.rotation.set(orientation.rotationX, orientation.rotationY, orientation.rotationZ + (isPlanar ? angleDeg * Math.PI / 180 : 0)); scene.add(object);
    object.geometry.computeBoundingBox(); const size = object.geometry.boundingBox?.getSize(new THREE.Vector3()) ?? new THREE.Vector3(1, 1, 1); const sceneScale = Math.max(size.length(), 2); camera.position.set(sceneScale * 1.55, sceneScale * 0.95, sceneScale * 1.55); controls.target.set(0, 0, 0); controls.minDistance = sceneScale * 0.45; controls.maxDistance = sceneScale * 8;
    const direction = windDirection === 'leftToRight' ? 1 : -1; const flow = makeFlowLines(direction, sceneScale / 4); const particles = makeFlowParticles(direction, sceneScale / 4); flow.position.set(0, 0.7 * sceneScale, -1.4); particles.position.copy(flow.position); scene.add(flow, particles);
    const particlePositions = particles.geometry.getAttribute('position') as THREE.BufferAttribute;
    const animate = (time: number) => { controls.update(); const data = particles.userData as { direction: number; scale: number; xStart: number; xRange: number; count: number }; const travel = ((time * 0.00055 * data.direction) % data.xRange + data.xRange) % data.xRange; for (let i = 0; i < data.count; i++) { const base = (i / data.count) * data.xRange; let x = data.xStart + ((base + travel) % data.xRange); if (data.direction < 0) x = -data.xStart - ((base + travel) % data.xRange); particlePositions.setX(i, x); } particlePositions.needsUpdate = true; renderer.render(scene, camera); };
    renderer.setAnimationLoop(animate);
    const resize = () => { const w = host.clientWidth; const h = Math.max(360, host.clientHeight); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); }; resize(); window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); renderer.setAnimationLoop(null); controls.dispose(); flow.geometry.dispose(); (flow.material as THREE.Material).dispose(); particles.geometry.dispose(); (particles.material as THREE.Material).dispose(); object.geometry.dispose(); (object.material as THREE.Material).dispose(); renderer.dispose(); if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement); };
  }, [geometry, angleDeg, windDirection]);
  return <div ref={hostRef} className="scene-host" aria-label="Three dimensional aerodynamic visualization" />;
}
