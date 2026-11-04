// Mundo 3D de fondo (three.js): la cámara vuela por una columnata de la Stoa entre polvo de oro.
// Todo depende del cuadro (no del reloj), así cada render da exactamente lo mismo.
// Reacciona al director: en cada golpe el polvo brilla, la luz sube y la cámara da un tirón.
import {ThreeCanvas} from '@remotion/three';
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {drift, rng, useDirector} from './director';
import {H, W} from './theme';
import type {Scene} from './types';

const DEPTH = 90; // largo del tramo que se repite
const COL_GAP = 7.5;
const COLS = Math.ceil(DEPTH / COL_GAP);
const DUST = 1400;
const COINS = 46;

// Textura redonda y suave para las partículas.
const dotTexture = () => {
  const s = 64;
  const data = new Uint8Array(s * s * 4);
  for (let y = 0; y < s; y++)
    for (let x = 0; x < s; x++) {
      const d = Math.hypot(x - s / 2 + 0.5, y - s / 2 + 0.5) / (s / 2);
      const a = Math.max(0, 1 - d) ** 2.2;
      const i = (y * s + x) * 4;
      data[i] = 255;
      data[i + 1] = 220;
      data[i + 2] = 150;
      data[i + 3] = Math.round(a * 255);
    }
  const t = new THREE.DataTexture(data, s, s, THREE.RGBAFormat);
  t.needsUpdate = true;
  return t;
};

// Cara de moneda: anillos y marca, dibujados en un canvas.
const coinTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(200, 180, 30, 256, 256, 256);
  grad.addColorStop(0, '#FFE7A3');
  grad.addColorStop(0.55, '#C8A24A');
  grad.addColorStop(1, '#6B4E17');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = 'rgba(70,45,10,0.75)';
  for (const [r, w] of [[236, 10], [206, 4], [120, 3]] as const) {
    g.lineWidth = w;
    g.beginPath();
    g.arc(256, 256, r, 0, Math.PI * 2);
    g.stroke();
  }
  // Grafilado del borde
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2;
    g.beginPath();
    g.moveTo(256 + Math.cos(a) * 214, 256 + Math.sin(a) * 214);
    g.lineTo(256 + Math.cos(a) * 230, 256 + Math.sin(a) * 230);
    g.lineWidth = 3;
    g.stroke();
  }
  g.fillStyle = 'rgba(60,38,8,0.9)';
  g.font = '600 190px "Cormorant Garamond", Georgia, serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('CF', 256, 268);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const wrap = (v: number, size: number) => ((v % size) + size) % size;

// hero: 0 = sin moneda, 1 = la moneda pasa volando junto a la cámara, 2 = moneda protagonista arriba al centro
type Mood = {light: string; fog: string; roll: number; speed: number; colonnade: number; coinRain: number; hero: 0 | 1 | 2};
const moodFor = (s: Scene | undefined, local: number): Mood => {
  const base: Mood = {light: '#E8B85A', fog: '#0B0A09', roll: 0, speed: 1, colonnade: 1, coinRain: 0, hero: 0};
  if (!s) return base;
  switch (s.type) {
    case 'hook':
      return {...base, speed: 1.8, hero: 1};
    case 'quote':
      return {...base, speed: 0.7, roll: 0.05};
    case 'counter':
      return {...base, coinRain: 1, speed: 1.2};
    case 'twoColumns':
      return {...base, light: '#D9A54A', roll: -0.06, speed: 0.9};
    case 'chart':
      return {...base, light: s.trend === 'down' && local > 0.45 ? '#C2483A' : '#E8B85A', speed: 1.4, roll: 0.08};
    case 'statement':
      return {...base, speed: 0.6, colonnade: 0.8};
    case 'outro':
      return {...base, speed: 0.5, hero: 2, colonnade: 0.6};
    default:
      return base;
  }
};

const Rig: React.FC<{camZ: number; camX: number; camY: number; roll: number; fov: number}> = ({camZ, camX, camY, roll, fov}) => {
  const {camera} = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(camX, camY, camZ);
  cam.rotation.set(0, 0, roll);
  if (cam.fov !== fov) {
    cam.fov = fov;
    cam.updateProjectionMatrix();
  }
  return null;
};

const Column: React.FC<{position: [number, number, number]; mat: THREE.Material}> = ({position, mat}) => (
  <group position={position}>
    <mesh material={mat} position={[0, 0, 0]}>
      <cylinderGeometry args={[0.55, 0.62, 10, 20, 1]} />
    </mesh>
    {/* Estrías: anillos finos para que la luz marque el volumen */}
    <mesh material={mat} position={[0, 5.15, 0]}>
      <boxGeometry args={[1.7, 0.35, 1.7]} />
    </mesh>
    <mesh material={mat} position={[0, 4.85, 0]}>
      <cylinderGeometry args={[0.8, 0.58, 0.35, 20]} />
    </mesh>
    <mesh material={mat} position={[0, -5.1, 0]}>
      <boxGeometry args={[1.6, 0.3, 1.6]} />
    </mesh>
  </group>
);

export const World3D: React.FC<{scenes: Scene[]}> = ({scenes}) => {
  const {frame, fps, energy, sceneStarts} = useDirector();
  const t = frame / fps;

  // Escena actual y progreso dentro de ella
  let si = 0;
  for (let i = 0; i < sceneStarts.length; i++) if (sceneStarts[i] <= frame) si = i;
  const scene = scenes[si];
  const sceneLen = Math.max(1, Math.round((scene?.duration ?? 1) * fps));
  const local = (frame - (sceneStarts[si] ?? 0)) / sceneLen;
  const mood = moodFor(scene, local);

  const tex = useMemo(dotTexture, []);
  const coinTex = useMemo(coinTexture, []);
  const marble = useMemo(
    () => new THREE.MeshStandardMaterial({color: '#4A4238', roughness: 0.55, metalness: 0.15}),
    [],
  );
  const gold = useMemo(
    () => new THREE.MeshStandardMaterial({color: '#D8AE52', roughness: 0.28, metalness: 0.85, emissive: '#3A2808', emissiveIntensity: 0.6}),
    [],
  );
  const faceMat = useMemo(
    () => new THREE.MeshStandardMaterial({map: coinTex, roughness: 0.3, metalness: 0.7, emissive: '#2A1C05', emissiveIntensity: 0.5}),
    [coinTex],
  );

  // Recorrido de la cámara: velocidad acumulada por escena (para que no salte al cambiar de ánimo).
  let camZ = 12;
  for (let i = 0; i < sceneStarts.length; i++) {
    const a = sceneStarts[i];
    const b = i + 1 < sceneStarts.length ? sceneStarts[i + 1] : Infinity;
    if (frame <= a) break;
    const spent = Math.min(frame, b) - a;
    camZ -= (spent / fps) * 2.4 * moodFor(scenes[i], 0.5).speed;
  }
  camZ -= energy * 0.6; // tirón hacia adelante en cada golpe
  const camX = drift(t * 0.6, 1) * 0.6;
  const camY = drift(t * 0.5, 4) * 0.4 + 0.3;
  const fov = 58 - energy * 6;

  // Polvo de oro: posiciones fijas que se repiten alrededor de la cámara.
  const dust = useMemo(() => {
    const r = rng(7);
    const base = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      base[i * 3] = (r() - 0.5) * 26;
      base[i * 3 + 1] = (r() - 0.5) * 34;
      base[i * 3 + 2] = r() * DEPTH;
    }
    return base;
  }, []);
  const dustGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(DUST * 3), 3));
    return g;
  }, []);
  const pos = dustGeo.attributes.position.array as Float32Array;
  for (let i = 0; i < DUST; i++) {
    const z0 = dust[i * 3 + 2];
    pos[i * 3] = dust[i * 3] + Math.sin(t * 0.4 + i) * 0.25;
    pos[i * 3 + 1] = dust[i * 3 + 1] + Math.sin(t * 0.3 + i * 1.7) * 0.3 + t * 0.15 * ((i % 3) - 1);
    pos[i * 3 + 2] = camZ + 4 - wrap(camZ + 4 - (12 - z0), DEPTH);
  }
  dustGeo.attributes.position.needsUpdate = true;

  // Columnas a los dos lados, repetidas a lo largo del camino.
  const columns: Array<[number, number, number]> = [];
  for (let k = 0; k < COLS; k++) {
    const z = camZ + 2 - wrap(camZ + 2 - k * -COL_GAP, DEPTH);
    columns.push([-5.2, 0, z], [5.2, 0, z]);
  }

  // Monedas que caen (escena de números)
  const coins = useMemo(() => {
    const r = rng(99);
    return Array.from({length: COINS}, () => ({
      x: (r() - 0.5) * 9,
      z: -2 - r() * 10,
      delay: r() * 1.4,
      speed: 6 + r() * 5,
      spin: (r() - 0.5) * 10,
      tilt: r() * Math.PI,
    }));
  }, []);
  const rainStart = mood.coinRain ? sceneStarts[si] : null;

  const lightBoost = 1 + energy * 2.2;
  const heroLocal = (frame - (sceneStarts[si] ?? 0)) / fps;
  let hero: {pos: [number, number, number]; spin: number; scale: number} | null = null;
  if (mood.hero === 1) {
    // Viene desde el fondo de la columnata, girando, y pasa rozando la cámara.
    const p = Math.min(1, heroLocal / Math.max(1.2, sceneLen / fps));
    const e = p * p * (3 - 2 * p);
    hero = {pos: [camX + 1.6 - e * 0.8, camY - 1.2 + e * 0.9, camZ - 34 + e * 33], spin: heroLocal * 5, scale: 1};
  } else if (mood.hero === 2) {
    const inn = Math.min(1, heroLocal / 0.7);
    const e = 1 - (1 - inn) ** 3;
    hero = {pos: [camX, camY + 2.1, camZ - 9 - (1 - e) * 20], spin: heroLocal * 1.6 + (1 - e) * 9, scale: 0.85};
  }

  return (
    <ThreeCanvas width={W} height={H} style={{position: 'absolute', inset: 0}} camera={{fov: 58, near: 0.1, far: 140, position: [0, 0, 12]}}>
      <Rig camZ={camZ} camX={camX} camY={camY} roll={mood.roll + drift(t * 0.3, 9) * 0.02} fov={fov} />
      <fog attach="fog" args={[mood.fog, 6, 62]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 4, camZ - 8]} intensity={38 * lightBoost} distance={40} decay={1.6} color={mood.light} />
      <pointLight position={[0, 6, camZ - 40]} intensity={180} distance={80} decay={1.4} color={mood.light} />
      <directionalLight position={[4, 8, 6]} intensity={0.6} color="#FFE2A8" />

      {mood.colonnade > 0 &&
        columns.map((p, i) => <Column key={i} position={p} mat={marble} />)}

      {/* Piso: plano oscuro con brillo dorado lejano */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.25, camZ - 40]}>
        <planeGeometry args={[30, 120]} />
        <meshStandardMaterial color="#100D0A" roughness={0.85} metalness={0.1} />
      </mesh>

      <points geometry={dustGeo}>
        <pointsMaterial
          map={tex}
          size={0.16 * (1 + energy * 1.4)}
          sizeAttenuation
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.75 + energy * 0.25}
          color={mood.light}
        />
      </points>

      {rainStart !== null &&
        coins.map((c, i) => {
          const lt = (frame - rainStart) / fps - c.delay;
          if (lt < 0) return null;
          const y = 9 - lt * c.speed + 0.5 * lt * lt * -2;
          if (y < -9) return null;
          return (
            <mesh key={i} position={[c.x + camX, y + camY, camZ - 8 + c.z]} rotation={[c.tilt + lt * c.spin, lt * c.spin * 0.6, 0.3]} material={gold}>
              <cylinderGeometry args={[0.42, 0.42, 0.07, 28]} />
            </mesh>
          );
        })}

      {hero && (
        <group
          position={hero.pos}
          // Gira sobre el eje vertical como una moneda lanzada.
          rotation={[drift(t, 2) * 0.25, hero.spin, drift(t, 5) * 0.1]}
          scale={hero.scale * (1 + energy * 0.12)}
        >
          <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh material={gold}>
              <cylinderGeometry args={[1.7, 1.7, 0.22, 64, 1, true]} />
            </mesh>
            <mesh position={[0, 0.111, 0]} rotation={[-Math.PI / 2, 0, 0]} material={faceMat}>
              <circleGeometry args={[1.7, 64]} />
            </mesh>
            <mesh position={[0, -0.111, 0]} rotation={[Math.PI / 2, 0, Math.PI]} material={faceMat}>
              <circleGeometry args={[1.7, 64]} />
            </mesh>
          </group>
        </group>
      )}
    </ThreeCanvas>
  );
};
