// Piezas de "dos-hermanos": un diorama de juguete en 3D (three.js) con cámara libre, que puede atravesar el suelo.
// Todo depende del estado que le pasa cada escena (y del cuadro), sin reloj.
import {ThreeCanvas} from '@remotion/three';
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {hash, rng, syncTokens} from '../../director';
import {KineticText} from '../../kinetic';
import {parseEmphasis} from '../../anim';
import {font, H, W} from '../../theme';
import type {Scene} from '../../types';
import {useCurrentFrame, useVideoConfig} from 'remotion';

export type V3 = [number, number, number];

// ---------------- paleta de juguete ----------------
export const T = {
  navy: '#1D2B4F',
  coral: '#FF5A36',
  teal: '#16A5B8',
  yellow: '#FFC93C',
  cream: '#FFF6E6',
  grass: '#7CC36B',
  grass2: '#8DCB72',
  street: '#8E9AA6',
  wood: '#C89B6D',
  skin: '#F2C9A0',
  hair: '#5A3B22',
  gold: '#FFB300',
  goldHot: '#FFE082',
  soil: '#140B06',
};

// ---------------- estado del mundo ----------------
export type WorldState = {
  t: number; // segundos (para lo que se mueve solo)
  cam: {pos: V3; look: V3; fov: number; roll?: number};
  sky?: 'morning' | 'sunset';
  under?: number; // 0 arriba, 1 bajo tierra
  // maletines (cuadro 0): altura y apertura
  cases?: {y: number; open: number};
  bills?: {dt: number; q: number; qrot: number} | null; // billetes que explotan; q: forman el "?"
  twins?: {jake: V3; sam: V3; rotY: number; rotJ?: number; dark?: number; opacity?: number; sitJ?: number};
  // cosas de Jake: progreso de caída (0..1) y altura de la mano que se las lleva (y extra)
  jake?: {car: number; floors: [number, number, number]; roof: number; pool: number; lift?: {car: number; pool: number; f3: number; f2: number; f1: number; roof: number}; loan?: {car: number; pool: number; f3: number; f2: number; f1: number}};
  sam?: {apt: number; books: number; plant: number; oldcar: number; gray: number; glint: number};
  bloom?: number; // lago y árboles sobre las raíces de Sam
  lots?: {jake: number; sam: number}; // escala del lote
  hand?: {pos: V3; open: number} | null;
  flashes?: number;
  roots?: number; // brillo de las raíces
  table?: number; // mesa familiar (otro lugar del mundo)
  rod?: number; // Sam pesca
};

const JAKE: V3 = [-1.45, 0, -0.1];
const SAM: V3 = [1.45, 0, -0.1];
export const FRAME0_CAM = {pos: [0, 3.9, 5.6] as V3, look: [0, 0.55, 0.9] as V3, fov: 42};
export const TWINS0 = {jake: [-0.24, 0, 1.55] as V3, sam: [0.24, 0, 1.55] as V3, rotY: 0};
export const CASES = [[-0.7, 0, 1.0], [0.7, 0, 1.0]] as V3[];

const mixCol = (hex: string, gray: number) => {
  const c = new THREE.Color(hex);
  const l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11;
  return new THREE.Color(c.r + (l - c.r) * gray, c.g + (l - c.g) * gray, c.b + (l - c.b) * gray);
};

const Cam: React.FC<{pos: V3; look: V3; fov: number; roll?: number}> = ({pos, look, fov, roll = 0}) => {
  const {camera} = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...pos);
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(...look);
  if (cam.fov !== fov || cam.near !== 0.05) {
    cam.fov = fov;
    cam.near = 0.05;
    cam.far = 200;
    cam.updateProjectionMatrix();
  }
  return null;
};

// Cielo: esfera con degradé (mañana o atardecer) que se vuelve tierra oscura bajo el suelo.
const Sky: React.FC<{under: number; sunset: boolean}> = ({under, sunset}) => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(80, 32, 16);
    const top = new THREE.Color(sunset ? '#FF8A65' : '#9ED8F2');
    const hor = new THREE.Color(sunset ? '#FFD59A' : '#FFF1D6');
    const low = new THREE.Color(sunset ? '#C9715A' : '#D9EBD0');
    const cols: number[] = [];
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) / 80;
      const c = y > 0 ? hor.clone().lerp(top, Math.min(1, y * 1.6)) : hor.clone().lerp(low, Math.min(1, -y * 3));
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    return g;
  }, [sunset]);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} color={new THREE.Color('#FFFFFF').lerp(new THREE.Color('#120804'), under)} />
    </mesh>
  );
};

// ---------------- muñecos de madera (gemelos y familia) ----------------
export const Peg: React.FC<{pos: V3; shirt: string; rotY?: number; glasses?: boolean; dark?: number; point?: number; sit?: number; s?: number; opacity?: number}> = ({
  pos,
  shirt,
  rotY = 0,
  glasses = false,
  dark = 0,
  point = 0,
  sit = 0,
  s = 1,
  opacity = 1,
}) => {
  const d = (hex: string) => new THREE.Color(hex).lerp(new THREE.Color('#0E1424'), dark);
  const tr = opacity < 1;
  return (
    <group position={[pos[0], pos[1] - sit * 0.12, pos[2]]} rotation={[0, rotY, 0]} scale={s}>
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.13, 0.05, 24]} />
        <meshStandardMaterial color={d('#E9D3B0')} roughness={0.6} transparent={tr} opacity={opacity} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.12, 0.34, 24]} />
        <meshStandardMaterial color={d(shirt)} roughness={0.45} transparent={tr} opacity={opacity} />
      </mesh>
      <mesh position={[0, 0.48, 0]} castShadow>
        <sphereGeometry args={[0.1, 24, 16]} />
        <meshStandardMaterial color={d(T.skin)} roughness={0.5} transparent={tr} opacity={opacity} />
      </mesh>
      <mesh position={[0, 0.515, -0.012]} scale={[1.05, 0.72, 1.05]}>
        <sphereGeometry args={[0.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={d(T.hair)} roughness={0.6} transparent={tr} opacity={opacity} />
      </mesh>
      {glasses ? (
        <mesh position={[0, 0.49, 0.088]}>
          <boxGeometry args={[0.13, 0.035, 0.02]} />
          <meshStandardMaterial color="#111" metalness={0.6} roughness={0.2} transparent={tr} opacity={opacity} />
        </mesh>
      ) : (
        <>
          <mesh position={[-0.034, 0.49, 0.092]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color={dark > 0.5 ? '#0E1424' : '#1A1A1A'} transparent={tr} opacity={opacity} />
          </mesh>
          <mesh position={[0.034, 0.49, 0.092]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color={dark > 0.5 ? '#0E1424' : '#1A1A1A'} transparent={tr} opacity={opacity} />
          </mesh>
        </>
      )}
      {point > 0 ? (
        <mesh position={[0.06, 0.3, 0.12]} rotation={[-Math.PI / 2 + 0.3 * (1 - point), 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.22, 10]} />
          <meshStandardMaterial color={d(shirt)} />
        </mesh>
      ) : null}
    </group>
  );
};

// ---------------- maletín dorado gigante ----------------
const Briefcase: React.FC<{pos: V3; open: number; rotY: number}> = ({pos, open, rotY}) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.62, 0.4, 0.2]} />
      <meshStandardMaterial color={T.gold} metalness={0.25} roughness={0.3} emissive="#8A5600" emissiveIntensity={0.35} />
    </mesh>
    {/* tapa que se abre */}
    <group position={[0, 0.4, -0.1]} rotation={[-open * 1.9, 0, 0]}>
      <mesh position={[0, 0.0, 0.1]} castShadow>
        <boxGeometry args={[0.63, 0.04, 0.21]} />
        <meshStandardMaterial color={T.goldHot} metalness={0.25} roughness={0.3} emissive="#8A5600" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.06, 0.1]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.07, 0.018, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#6B4A00" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
    {open > 0.3 ? (
      <mesh position={[0, 0.41, 0]}>
        <boxGeometry args={[0.56, 0.02, 0.16]} />
        <meshStandardMaterial color="#5DBB63" />
      </mesh>
    ) : null}
  </group>
);

// Billetes que explotan como confeti; con `q` se juntan en un signo de pregunta que gira.
const QMARK = (() => {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < 26; i++) {
    const a = Math.PI * 1.0 - (i / 25) * Math.PI * 1.5;
    pts.push([Math.cos(a) * 0.32, 0.55 + Math.sin(a) * 0.32]);
  }
  for (let i = 0; i < 8; i++) pts.push([0, 0.22 - i * 0.03 + 0.0]);
  for (let i = 0; i < 6; i++) pts.push([Math.cos(i) * 0.04, -0.12 + Math.sin(i) * 0.04]);
  return pts;
})();
const Bills: React.FC<{dt: number; q: number; qrot: number}> = ({dt, q, qrot}) => {
  const bills = useMemo(() => {
    const r = rng(5);
    return Array.from({length: 90}, (_, i) => {
      const src = CASES[i % 2];
      return {o: [src[0], 0.42, src[2]] as V3, v: [(r() - 0.5) * 3.2, 2.2 + r() * 2.8, (r() - 0.4) * 2.6] as V3, spin: [(r() - 0.5) * 14, (r() - 0.5) * 14, (r() - 0.5) * 10] as V3};
    });
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({color: '#6CC56F', roughness: 0.6, side: THREE.DoubleSide}), []);
  const geo = useMemo(() => new THREE.PlaneGeometry(0.16, 0.075), []);
  return (
    <group>
      {bills.map((b, i) => {
        const y0 = b.o[1] + b.v[1] * dt - 4.2 * dt * dt;
        const land = y0 < 0.01;
        const p: V3 = [b.o[0] + b.v[0] * dt * (land ? 0.9 : 1), Math.max(0.01, y0), b.o[2] + b.v[2] * dt * (land ? 0.9 : 1)];
        const rot: V3 = land ? [-Math.PI / 2, 0, b.spin[2]] : [b.spin[0] * dt, b.spin[1] * dt, b.spin[2] * dt];
        // forma del "?" (entre los gemelos, girando)
        const qp = QMARK[i % QMARK.length];
        const target: V3 = [Math.cos(qrot) * qp[0], 0.75 + qp[1] * 1.3, 1.55 + Math.sin(qrot) * qp[0]];
        const k = i < QMARK.length ? q : 0;
        const pos: V3 = [p[0] + (target[0] - p[0]) * k, p[1] + (target[1] - p[1]) * k, p[2] + (target[2] - p[2]) * k];
        const rr: V3 = [rot[0] * (1 - k), rot[1] * (1 - k) + qrot * k, rot[2] * (1 - k)];
        return <mesh key={i} geometry={geo} material={mat} position={pos} rotation={rr} castShadow />;
      })}
    </group>
  );
};

// ---------------- cosas de Jake ----------------
const Supercar: React.FC<{pos: V3; rotY?: number}> = ({pos, rotY = 0.5}) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <mesh position={[0, 0.12, 0]} castShadow>
      <boxGeometry args={[0.82, 0.13, 0.38]} />
      <meshStandardMaterial color="#E53935" metalness={0.5} roughness={0.25} />
    </mesh>
    <mesh position={[-0.05, 0.22, 0]} castShadow>
      <boxGeometry args={[0.38, 0.1, 0.32]} />
      <meshStandardMaterial color="#1B2333" metalness={0.8} roughness={0.1} />
    </mesh>
    <mesh position={[0.38, 0.2, 0]}>
      <boxGeometry args={[0.06, 0.04, 0.4]} />
      <meshStandardMaterial color="#B71C1C" />
    </mesh>
    {[
      [-0.27, 0.19],
      [0.27, 0.19],
      [-0.27, -0.19],
      [0.27, -0.19],
    ].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.07, z]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
        <meshStandardMaterial color="#151515" />
      </mesh>
    ))}
  </group>
);
const Floor: React.FC<{y: number; w: number; d: number; color?: string}> = ({y, w, d, color = '#F7F2EA'}) => (
  <group position={[0, y, 0]}>
    <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
      <boxGeometry args={[w, 0.32, d]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
    {[-0.42, -0.14, 0.14, 0.42].map((x, i) => (
      <mesh key={i} position={[x * w, 0.17, d / 2 + 0.005]}>
        <boxGeometry args={[0.14, 0.15, 0.01]} />
        <meshStandardMaterial color="#3B6EA5" emissive="#FFE9A8" emissiveIntensity={0.25} />
      </mesh>
    ))}
  </group>
);
const Pool: React.FC<{pos: V3}> = ({pos}) => (
  <group position={pos}>
    <mesh position={[0, 0.02, 0]} receiveShadow>
      <boxGeometry args={[0.85, 0.04, 0.5]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    <mesh position={[0, 0.045, 0]}>
      <boxGeometry args={[0.75, 0.01, 0.4]} />
      <meshStandardMaterial color="#40C4FF" emissive="#40C4FF" emissiveIntensity={0.25} roughness={0.1} />
    </mesh>
  </group>
);

// Etiqueta "LOAN" (textura de canvas).
const useLoanTex = () =>
  useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 220;
    const g = c.getContext('2d')!;
    g.fillStyle = '#FFFFFF';
    g.beginPath();
    g.roundRect(10, 10, 492, 200, 30);
    g.fill();
    g.lineWidth = 14;
    g.strokeStyle = '#D32F2F';
    g.stroke();
    g.fillStyle = '#D32F2F';
    g.font = '900 150px Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('LOAN', 256, 118);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
const Loan: React.FC<{pos: V3; flip: number; tex: THREE.Texture}> = ({pos, flip, tex}) =>
  flip > 0 ? (
    <mesh position={pos} rotation={[0, (1 - flip) * Math.PI, 0]}>
      <planeGeometry args={[0.9, 0.39]} />
      <meshBasicMaterial map={tex} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  ) : null;

// La mano gigante del banco (puño de camisa y manga de traje).
const BankHand: React.FC<{pos: V3; open: number}> = ({pos, open}) => (
  <group position={pos}>
    <mesh position={[0, 4.2, 0]}>
      <boxGeometry args={[0.95, 7, 0.95]} />
      <meshStandardMaterial color="#22304F" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.62, 0]}>
      <boxGeometry args={[0.85, 0.22, 0.85]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.48, 0.0]}>
      <cylinderGeometry args={[0.03, 0.03, 0.06, 10]} />
      <meshStandardMaterial color={T.gold} metalness={0.8} roughness={0.2} />
    </mesh>
    <mesh position={[0, 0.3, 0]} castShadow>
      <boxGeometry args={[0.72, 0.42, 0.42]} />
      <meshStandardMaterial color={T.skin} roughness={0.55} />
    </mesh>
    {[-0.26, -0.09, 0.09, 0.26].map((x, i) => (
      <mesh key={i} position={[x, 0.02, 0.12 + open * 0.08]} rotation={[0.35 - open * 0.6, 0, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.32, 6, 10]} />
        <meshStandardMaterial color={T.skin} roughness={0.55} />
      </mesh>
    ))}
    <mesh position={[0.42, 0.18, 0.1]} rotation={[0, 0, -0.7 - open * 0.4]} castShadow>
      <capsuleGeometry args={[0.075, 0.24, 6, 10]} />
      <meshStandardMaterial color={T.skin} roughness={0.55} />
    </mesh>
  </group>
);

// ---------------- cosas de Sam ----------------
const SamThings: React.FC<{st: NonNullable<WorldState['sam']>; t: number}> = ({st, t}) => {
  const g = st.gray;
  const drop = (p: number) => (1 - p) * 2.6;
  return (
    <group>
      {st.apt > 0 ? (
        <group position={[SAM[0] + 0.25, drop(st.apt), SAM[2] - 0.55]}>
          <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.55, 0.56, 0.5]} />
            <meshStandardMaterial color={mixCol('#F2D7A6', g)} roughness={0.6} />
          </mesh>
          {[0.14, 0.38].map((y, i) => (
            <mesh key={i} position={[0, y, 0.255]}>
              <boxGeometry args={[0.32, 0.12, 0.01]} />
              <meshStandardMaterial color={mixCol('#5C8FBF', g)} />
            </mesh>
          ))}
        </group>
      ) : null}
      {st.books > 0 ? (
        <group position={[SAM[0] - 0.4, drop(st.books), SAM[2] + 0.25]}>
          {['#E57373', '#64B5F6', '#FFD54F', '#81C784'].map((c, i) => (
            <mesh key={i} position={[0, 0.025 + i * 0.05, 0]} rotation={[0, i * 0.3, 0]} castShadow>
              <boxGeometry args={[0.26, 0.045, 0.18]} />
              <meshStandardMaterial color={mixCol(c, g)} />
            </mesh>
          ))}
        </group>
      ) : null}
      {st.plant > 0 ? (
        <group position={[SAM[0] + 0.35, drop(st.plant), SAM[2] + 0.35]} scale={0.6 + 0.4 * st.plant}>
          <mesh position={[0, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.05, 0.12, 16]} />
            <meshStandardMaterial color={mixCol('#D8774A', g)} />
          </mesh>
          <mesh position={[0, 0.17, 0]} castShadow>
            <sphereGeometry args={[0.075, 16, 12]} />
            <meshStandardMaterial color={mixCol('#43A047', g)} />
          </mesh>
        </group>
      ) : null}
      {st.oldcar > 0 ? (
        <group position={[SAM[0] - 0.1, drop(st.oldcar), SAM[2] + 0.75]} rotation={[0, -0.3, 0]}>
          <mesh position={[0, 0.14, 0]} castShadow>
            <boxGeometry args={[0.6, 0.16, 0.32]} />
            <meshStandardMaterial color={mixCol('#9E9D6B', g)} roughness={0.8} />
          </mesh>
          <mesh position={[-0.03, 0.27, 0]} castShadow>
            <boxGeometry args={[0.36, 0.12, 0.28]} />
            <meshStandardMaterial color={mixCol('#B7B58A', g)} roughness={0.8} />
          </mesh>
          {[
            [-0.2, 0.16],
            [0.2, 0.16],
            [-0.2, -0.16],
            [0.2, -0.16],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.06, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.04, 14]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          ))}
        </group>
      ) : null}
      {/* la grieta del piso con el brillo dorado que nadie mira */}
      <mesh position={[SAM[0] + 0.55, 0.026, SAM[2] + 0.85]} rotation={[-Math.PI / 2, 0, 0.6]}>
        <planeGeometry args={[0.32, 0.03]} />
        <meshBasicMaterial color={st.glint > 0 ? new THREE.Color(T.goldHot).multiplyScalar(1 + st.glint * 2) : new THREE.Color('#3A2A18')} toneMapped={false} />
      </mesh>
      {st.glint > 0 ? <pointLight position={[SAM[0] + 0.55, 0.15, SAM[2] + 0.85]} intensity={st.glint * 3} distance={1.5} color={T.gold} /> : null}
      <mesh position={[0, -10, 0]}>
        <boxGeometry args={[0.01, 0.01, 0.01 + t * 0]} />
        <meshBasicMaterial color="#000" />
      </mesh>
    </group>
  );
};

// Lago, árboles y flores que florecen sobre las raíces.
const Bloom: React.FC<{k: number; t: number}> = ({k, t}) => {
  const trees = useMemo(() => {
    const r = rng(19);
    return Array.from({length: 9}, () => ({x: SAM[0] + (r() - 0.5) * 2.0, z: SAM[2] + (r() - 0.5) * 2.2 - 0.3, s: 0.6 + r() * 0.6, d: r()}));
  }, []);
  const flowers = useMemo(() => {
    const r = rng(23);
    return Array.from({length: 40}, () => ({x: SAM[0] + (r() - 0.5) * 2.1, z: SAM[2] + (r() - 0.5) * 2.4, c: ['#FF8A80', '#FFF59D', '#F48FB1', '#FFFFFF'][Math.floor(r() * 4)], d: r()}));
  }, []);
  return (
    <group>
      <mesh position={[SAM[0] - 0.1, 0.031, SAM[2] + 0.35]} rotation={[-Math.PI / 2, 0, 0]} scale={Math.max(0.001, k)}>
        <circleGeometry args={[0.55, 40]} />
        <meshStandardMaterial color="#4FC3F7" emissive="#FFB074" emissiveIntensity={0.25 + 0.05 * Math.sin(t * 3)} roughness={0.05} metalness={0.2} />
      </mesh>
      {trees.map((tr, i) => {
        const s = Math.max(0, Math.min(1, (k - tr.d * 0.5) * 2)) * tr.s;
        if (s <= 0 || Math.hypot(tr.x - SAM[0] + 0.1, tr.z - SAM[2] - 0.35) < 0.65) return null;
        return (
          <group key={i} position={[tr.x, 0.02, tr.z]} scale={s}>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.025, 0.03, 0.2, 8]} />
              <meshStandardMaterial color="#7B5236" />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow>
              <coneGeometry args={[0.16, 0.36, 12]} />
              <meshStandardMaterial color="#2E9E58" />
            </mesh>
          </group>
        );
      })}
      {flowers.map((fl, i) => {
        const s = Math.max(0, Math.min(1, (k - fl.d * 0.6) * 3));
        if (s <= 0) return null;
        return (
          <mesh key={i} position={[fl.x, 0.04, fl.z]} scale={s}>
            <sphereGeometry args={[0.03, 8, 6]} />
            <meshStandardMaterial color={fl.c} emissive={fl.c} emissiveIntensity={0.2} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------------- bajo tierra: raíces de oro (Sam) y cadenas en el vacío (Jake) ----------------
const Roots: React.FC<{glow: number; t: number}> = ({glow, t}) => {
  const tubes = useMemo(() => {
    const r = rng(31);
    const out: THREE.TubeGeometry[] = [];
    const grow = (p: THREE.Vector3, dir: THREE.Vector3, len: number, rad: number, depth: number) => {
      const pts = [p.clone()];
      let q = p.clone();
      let d = dir.clone();
      for (let i = 0; i < 6; i++) {
        d = d.clone().add(new THREE.Vector3((r() - 0.5) * 0.7, (r() - 0.5) * 0.3, (r() - 0.5) * 0.7)).normalize();
        q = q.clone().add(d.clone().multiplyScalar(len / 6));
        pts.push(q.clone());
      }
      out.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, rad, 8, false));
      if (depth > 0) {
        for (let k = 0; k < 2; k++) {
          const at = pts[2 + Math.floor(r() * 4)];
          const nd = d.clone().add(new THREE.Vector3((r() - 0.5) * 1.6, -0.2 - r() * 0.4, (r() - 0.5) * 1.4)).normalize();
          grow(at, nd, len * 0.62, rad * 0.6, depth - 1);
        }
      }
    };
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      grow(new THREE.Vector3(SAM[0] + Math.cos(a) * 0.15, -0.05, SAM[2] + Math.sin(a) * 0.15), new THREE.Vector3(Math.cos(a) * 0.6, -1, Math.sin(a) * 0.6).normalize(), 2.6, 0.07, 3);
    }
    return out;
  }, []);
  const pulse = 0.75 + 0.25 * Math.sin(t * 5);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({color: T.gold, metalness: 0.6, roughness: 0.3, emissive: new THREE.Color('#FF9F00')}), []);
  mat.emissiveIntensity = (0.4 + 1.4 * glow) * pulse;
  return (
    <group>
      {tubes.map((g, i) => (
        <mesh key={i} geometry={g} material={mat} />
      ))}
      <pointLight position={[SAM[0], -1.2, SAM[2] + 0.6]} intensity={14 * glow * pulse} distance={7} color="#FFB300" />
      <pointLight position={[SAM[0], -2.6, SAM[2] + 1.6]} intensity={8 * glow} distance={6} color="#FF8F00" />
    </group>
  );
};
const Chains: React.FC<{t: number}> = ({t}) => {
  const link = useMemo(() => new THREE.TorusGeometry(0.07, 0.018, 8, 18), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({color: '#5E6672', metalness: 0.9, roughness: 0.35}), []);
  return (
    <group>
      {[-0.55, 0, 0.5].map((dx, c) => (
        <group key={c} position={[JAKE[0] + dx, -0.05, JAKE[2] + (c - 1) * 0.35]} rotation={[0, 0, Math.sin(t * 1.3 + c) * 0.05]}>
          {Array.from({length: 22}, (_, i) => (
            <mesh key={i} geometry={link} material={mat} position={[0, -i * 0.11, 0]} rotation={[0, i % 2 ? Math.PI / 2 : 0, Math.PI / 2]} />
          ))}
        </group>
      ))}
      <pointLight position={[JAKE[0], -1.0, JAKE[2] + 1.5]} intensity={1.6} distance={5} color="#8FA7C9" />
    </group>
  );
};

// ---------------- la mesa familiar (otro lugar del mundo, x = 20) ----------------
export const TABLE_AT: V3 = [20, 0, 0];
const FamilyTable: React.FC<{t: number}> = ({t}) => {
  const seats: Array<[number, number, string]> = [
    [-0.55, -0.35, '#E57373'],
    [0, -0.42, '#BA68C8'],
    [0.55, -0.35, '#4DB6AC'],
    [-0.65, 0.25, '#FFB74D'],
    [0.65, 0.25, '#7986CB'],
  ];
  return (
    <group position={TABLE_AT}>
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[4, 0.4, 3]} />
        <meshStandardMaterial color={T.wood} />
      </mesh>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.06, 0.7]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      {[-0.5, 0.5].flatMap((x) => [-0.28, 0.28].map((z) => [x, z])).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.08, z]}>
          <boxGeometry args={[0.05, 0.16, 0.05]} />
          <meshStandardMaterial color="#8D6E63" />
        </mesh>
      ))}
      {seats.map(([x, z, c], i) => (
        <Peg key={i} pos={[x, 0, z]} shirt={c} rotY={Math.atan2(0.0 - x, 0.6 - z)} point={1} s={0.9 + 0.05 * Math.sin(t * 20 + i) * 0} />
      ))}
      <Peg pos={[0, 0, 0.6]} shirt={T.teal} rotY={Math.PI} s={0.9} />
    </group>
  );
};

// ---------------- el mundo ----------------
export const World: React.FC<{s: WorldState}> = ({s}) => {
  const loanTex = useLoanTex();
  const under = s.under ?? 0;
  const sunset = s.sky === 'sunset';
  const lots = s.lots ?? {jake: 1, sam: 1};
  const tw: NonNullable<WorldState['twins']> = s.twins ?? TWINS0;
  const jk = s.jake;
  const lift = jk?.lift ?? {car: 0, pool: 0, f3: 0, f2: 0, f1: 0, roof: 0};
  const loan = jk?.loan ?? {car: 0, pool: 0, f3: 0, f2: 0, f1: 0};
  const drop = (p: number) => (1 - p) * 3.2;
  const sam = s.sam ?? {apt: 0, books: 0, plant: 0, oldcar: 0, gray: 0, glint: 0};
  const flash = s.flashes ?? 0;
  return (
    <ThreeCanvas width={W} height={H} style={{position: 'absolute', inset: 0}} shadows camera={{fov: s.cam.fov, position: s.cam.pos, near: 0.05, far: 200}}>
      <Cam {...s.cam} />
      <Sky under={under} sunset={sunset} />
      <ambientLight intensity={(sunset ? 0.55 : 0.75) * (1 - under * 0.85)} color={sunset ? '#FFD2B0' : '#FFFFFF'} />
      <hemisphereLight args={[sunset ? '#FFB38A' : '#DDF1FF', '#7CA36B', 0.6 * (1 - under)]} />
      <directionalLight
        position={sunset ? [-6, 3, 4] : [4, 8, 5]}
        intensity={(sunset ? 2.0 : 2.4) * (1 - under)}
        color={sunset ? '#FFB070' : '#FFF4E0'}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0005}
      />
      {under > 0 ? <fog attach="fog" args={['#120804', 3, 14]} /> : null}

      {/* base del diorama (solo desde arriba) */}
      {under < 0.5 ? (
        <mesh position={[0, -0.25, 0.1]} receiveShadow>
          <boxGeometry args={[5.4, 0.5, 3.6]} />
          <meshStandardMaterial color={T.wood} roughness={0.7} />
        </mesh>
      ) : null}
      {/* techo de tierra visto desde abajo */}
      <mesh position={[0, -0.02, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.4, 3.6]} />
        <meshStandardMaterial color="#2A1A0E" roughness={1} />
      </mesh>
      {/* calle y lotes */}
      <mesh position={[0, 0.005, 0.1]} receiveShadow>
        <boxGeometry args={[0.78, 0.01, 3.6]} />
        <meshStandardMaterial color={T.street} roughness={0.9} />
      </mesh>
      {Array.from({length: 7}, (_, i) => (
        <mesh key={i} position={[0, 0.012, -1.5 + i * 0.5]}>
          <boxGeometry args={[0.05, 0.004, 0.22]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      ))}
      <group position={[JAKE[0], 0, JAKE[2]]} scale={[lots.jake, 1, lots.jake]}>
        <mesh position={[0, 0.0125, 0]} receiveShadow>
          <boxGeometry args={[2.2, 0.025, 2.7]} />
          <meshStandardMaterial color={T.grass} roughness={0.9} />
        </mesh>
      </group>
      <group position={[SAM[0], 0, SAM[2]]} scale={[lots.sam, 1, lots.sam]}>
        <mesh position={[0, 0.0125, 0]} receiveShadow>
          <boxGeometry args={[2.2, 0.025, 2.7]} />
          <meshStandardMaterial color={mixCol(T.grass2, sam.gray * 0.85)} roughness={0.9} />
        </mesh>
      </group>

      {/* cuadro 0: los maletines */}
      {s.cases ? CASES.map((c, i) => <Briefcase key={i} pos={[c[0], c[1] + s.cases!.y, c[2]]} open={s.cases!.open} rotY={i ? -0.25 : 0.25} />) : null}
      {s.bills ? <Bills {...s.bills} /> : null}

      {/* lo de Jake */}
      {jk ? (
        <group position={[JAKE[0], 0, JAKE[2]]} scale={[lots.jake, lots.jake, lots.jake]}>
          {jk.car > 0 ? (
            <group position={[0.35, drop(jk.car) + lift.car, 0.75]}>
              <Supercar pos={[0, 0, 0]} />
              <Loan pos={[0, 0.55, 0.1]} flip={loan.car} tex={loanTex} />
            </group>
          ) : null}
          {jk.pool > 0 ? (
            <group position={[-0.5, drop(jk.pool) + lift.pool, 0.6]}>
              <Pool pos={[0, 0, 0]} />
              <Loan pos={[0, 0.45, 0.1]} flip={loan.pool} tex={loanTex} />
            </group>
          ) : null}
          <group position={[0, 0, -0.55]}>
            {jk.floors.map((p, i) => {
              if (p <= 0) return null;
              const lf = [lift.f1, lift.f2, lift.f3][i];
              const ln = [loan.f1, loan.f2, loan.f3][i];
              return (
                <group key={i} position={[0, i * 0.32 + drop(p) + lf, 0]}>
                  <Floor y={0} w={1.35} d={0.9} />
                  <Loan pos={[0.95, 0.18, 0.2]} flip={ln} tex={loanTex} />
                </group>
              );
            })}
            {jk.roof > 0 ? (
              <mesh position={[0, 0.96 + 0.22 + drop(jk.roof) + lift.roof, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[0.95, 0.44, 4]} />
                <meshStandardMaterial color="#5C7FA8" roughness={0.5} />
              </mesh>
            ) : null}
          </group>
          {/* flashes de celulares sobre la mansión */}
          {flash > 0
            ? Array.from({length: 26}, (_, i) => {
                const on = hash(i * 31 + Math.floor(s.t * 15)) > 0.55;
                return on ? (
                  <mesh key={i} position={[(hash(i) - 0.5) * 2.2, 1.6 + hash(i + 7) * 1.4, -0.4 + (hash(i + 3) - 0.5) * 1.2]}>
                    <sphereGeometry args={[0.05, 8, 6]} />
                    <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
                  </mesh>
                ) : null;
              })
            : null}
        </group>
      ) : null}

      {/* lo de Sam */}
      <group position={[0, 0, 0]}>
        <SamThings st={sam} t={s.t} />
      </group>
      {(s.bloom ?? 0) > 0 ? <Bloom k={s.bloom!} t={s.t} /> : null}
      {/* caña de pescar */}
      {(s.rod ?? 0) > 0 ? (
        <mesh position={[tw.sam[0] - 0.18, 0.4, tw.sam[2] - 0.1]} rotation={[0.2, 0, 0.9 + Math.sin(s.t * 2) * 0.04]}>
          <cylinderGeometry args={[0.008, 0.012, 0.7, 6]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      ) : null}

      {/* gemelos */}
      {(tw.opacity ?? 1) > 0 ? (
        <>
          <Peg pos={tw.jake} shirt={T.coral} rotY={tw.rotJ ?? tw.rotY} glasses={!!jk && (s.sky !== 'sunset')} dark={tw.dark} sit={tw.sitJ} opacity={tw.opacity} />
          <Peg pos={tw.sam} shirt={T.teal} rotY={tw.rotY} dark={tw.dark} opacity={tw.opacity} />
        </>
      ) : null}

      {s.hand ? <BankHand pos={s.hand.pos} open={s.hand.open} /> : null}
      {(s.table ?? 0) > 0 ? <FamilyTable t={s.t} /> : null}

      {/* bajo tierra */}
      {under > 0 || (s.roots ?? 0) > 0 ? (
        <>
          <Roots glow={s.roots ?? 0} t={s.t} />
          <Chains t={s.t} />
        </>
      ) : null}
    </ThreeCanvas>
  );
};

// ---------------- capas 2D ----------------
// Efecto miniatura (tilt-shift): bruma clara arriba y abajo y viñeta suave.
export const TiltShift: React.FC<{dark?: number}> = ({dark = 0}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(255,250,240,${0.38 * (1 - dark)}) 0%, rgba(255,250,240,0) 22%, rgba(255,250,240,0) 74%, rgba(255,250,240,${0.42 * (1 - dark)}) 100%)`}} />
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(${dark ? '0,0,0' : '60,40,20'},${0.25 + dark * 0.4}) 100%)`}} />
  </>
);

// Título de juguete: placa crema con borde azul marino, letras grandes; el énfasis en coral.
const toyPlain: React.CSSProperties = {color: T.navy};
export const toyAccent = (color: string) => (): React.CSSProperties => ({color, WebkitTextStroke: `3px ${T.navy}`, paintOrder: 'stroke fill'}) as React.CSSProperties;
export const ToyTitle: React.FC<{scene: Scene; top?: number; size?: number; accent?: string; opacity?: number; dark?: boolean}> = ({scene, top = 190, size = 100, accent = T.coral, opacity = 1, dark = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const text = typeof (scene as {onScreen?: unknown}).onScreen === 'string' ? ((scene as {onScreen?: string}).onScreen as string) : '';
  const tokens = text.split('\n').flatMap((l) => parseEmphasis(l)).map((x) => x.word);
  const first = Math.max(0, Math.round((syncTokens(tokens, scene.words, 1.6)[0] ?? 0) * fps) - 3);
  const k = Math.max(0, Math.min(1, (frame - first) / 5));
  if (k <= 0 || !text) return null;
  const pop = 0.85 + 0.15 * Math.min(1, k * 1.2);
  return (
    <div style={{position: 'absolute', top, left: 60, width: W - 180, display: 'flex', justifyContent: 'center', zIndex: 8, opacity: opacity * k}}>
      <div style={{transform: `scale(${pop}) rotate(-1.5deg)`, padding: '20px 38px 26px', background: dark ? 'rgba(14,10,6,0.88)' : T.cream, border: `8px solid ${dark ? T.gold : T.navy}`, borderRadius: 34, boxShadow: `0 12px 0 ${dark ? '#5A3A00' : T.navy}, 0 18px 30px rgba(0,0,0,0.25)`, textAlign: 'center'}}>
        <KineticText
          text={text}
          words={scene.words}
          entry="slam"
          lead={3}
          style={{fontFamily: font.sans, fontWeight: 900, fontSize: size, lineHeight: 1.04, letterSpacing: '-0.01em'}}
          accentStyle={toyAccent(accent)}
          plainStyle={dark ? {color: '#FFF3D6'} : toyPlain}
          goldScale={1.12}
        />
      </div>
    </div>
  );
};
