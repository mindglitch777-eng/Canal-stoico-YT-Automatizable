// Reloj de oro en 3D que explota en sus piezas (engranajes, tornillos, resortes, vidrio)
// y se vuelve a armar. Todo depende de los valores que recibe (no del reloj del sistema).
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {rng} from '../../director';
import {H, W} from '../../theme';

// Reflejos reales en el metal: un "estudio" virtual como mapa de entorno.
export const StudioEnv: React.FC<{intensity?: number}> = ({intensity = 1}) => {
  const {gl, scene} = useThree();
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return tex;
  }, [gl]);
  scene.environment = env;
  (scene as unknown as {environmentIntensity: number}).environmentIntensity = intensity;
  return null;
};

export const CameraRig: React.FC<{pos: [number, number, number]; look?: [number, number, number]; fov: number; roll?: number}> = ({pos, look = [0, 0, 0], fov, roll = 0}) => {
  const {camera} = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...pos);
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(...look);
  if (cam.fov !== fov) {
    cam.fov = fov;
    cam.updateProjectionMatrix();
  }
  return null;
};

const gearShape = (r: number, teeth: number, depth: number, hole: number) => {
  const s = new THREE.Shape();
  const steps = teeth * 4;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const k = i % 4;
    const rr = k === 1 || k === 2 ? r + depth : r;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  const h = new THREE.Path();
  h.absarc(0, 0, hole, 0, Math.PI * 2, true);
  s.holes.push(h);
  // rayos del engranaje
  for (let k = 0; k < 4; k++) {
    const a0 = (k / 4) * Math.PI * 2 + 0.35;
    const p = new THREE.Path();
    p.absarc(Math.cos(a0) * r * 0.58, Math.sin(a0) * r * 0.58, r * 0.2, 0, Math.PI * 2, true);
    s.holes.push(p);
  }
  return s;
};

const dialTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const g = c.getContext('2d')!;
  const cx = 512;
  // esfera negra con "sunburst"
  const grad = g.createRadialGradient(cx, cx, 20, cx, cx, 512);
  grad.addColorStop(0, '#1E1A14');
  grad.addColorStop(1, '#050403');
  g.fillStyle = grad;
  g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 360; i++) {
    g.strokeStyle = `rgba(255,220,150,${i % 2 ? 0.035 : 0.015})`;
    g.beginPath();
    g.moveTo(cx, cx);
    const a = (i / 360) * Math.PI * 2;
    g.lineTo(cx + Math.cos(a) * 520, cx + Math.sin(a) * 520);
    g.stroke();
  }
  // minutero
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const r0 = i % 5 === 0 ? 400 : 430;
    g.strokeStyle = i % 5 === 0 ? '#E8C26A' : 'rgba(232,194,106,0.6)';
    g.lineWidth = i % 5 === 0 ? 14 : 4;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r0, cx + Math.sin(a) * r0);
    g.lineTo(cx + Math.cos(a) * 470, cx + Math.sin(a) * 470);
    g.stroke();
  }
  g.fillStyle = '#E8C26A';
  g.font = '600 92px "Cormorant Garamond", Georgia, serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const roman: Array<[string, number]> = [['XII', 0], ['III', 3], ['VI', 6], ['IX', 9]];
  for (const [txt, h] of roman) {
    const a = (h / 12) * Math.PI * 2 - Math.PI / 2;
    g.fillText(txt, cx + Math.cos(a) * 320, cx + Math.sin(a) * 320);
  }
  g.font = '600 40px "Cormorant Garamond", Georgia, serif';
  g.fillText('CALM FORTUNE', cx, cx - 150);
  g.font = '500 26px Inter, Arial, sans-serif';
  g.fillStyle = 'rgba(232,194,106,0.75)';
  g.fillText('A U T O M A T I C', cx, cx + 170);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

type Part = {
  geo: THREE.BufferGeometry;
  mat: THREE.Material;
  home: THREE.Vector3;
  homeRot: THREE.Euler;
  dir: THREE.Vector3;
  spin: THREE.Vector3;
  reach: number;
};

export type WatchState = {
  explode: number; // 0 = armado, 1 = piezas en su punto más lejano
  secTicks: number; // posición del segundero (en pasos de 3°)
  glint: number; // fase del brillo que cruza el cristal (0..1)
  cam: [number, number, number];
  look?: [number, number, number];
  fov: number;
  roll?: number;
  light?: number; // multiplicador de luz (golpes)
};

export const Watch3D: React.FC<WatchState & {style?: React.CSSProperties}> = ({explode, secTicks, glint, cam, look, fov, roll, light = 1, style}) => {
  const mats = useMemo(() => {
    const gold = new THREE.MeshStandardMaterial({color: '#E6B85C', metalness: 1, roughness: 0.22});
    const goldDark = new THREE.MeshStandardMaterial({color: '#B8873A', metalness: 1, roughness: 0.32});
    const steel = new THREE.MeshStandardMaterial({color: '#C9CED6', metalness: 1, roughness: 0.25});
    const ruby = new THREE.MeshStandardMaterial({color: '#B3122E', metalness: 0.2, roughness: 0.1, emissive: '#3A0008'});
    const dial = new THREE.MeshStandardMaterial({map: dialTexture(), metalness: 0.3, roughness: 0.45});
    const glass = new THREE.MeshPhysicalMaterial({color: '#FFFFFF', metalness: 0, roughness: 0.02, transmission: 0, transparent: true, opacity: 0.12, clearcoat: 1});
    const shard = new THREE.MeshPhysicalMaterial({color: '#E9F4FF', metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.55, side: THREE.DoubleSide, clearcoat: 1});
    return {gold, goldDark, steel, ruby, dial, glass, shard};
  }, []);

  const parts = useMemo<Part[]>(() => {
    const r = rng(42);
    const out: Part[] = [];
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, home: [number, number, number], reach: number, dir?: [number, number, number], homeRot?: [number, number, number]) => {
      const d = dir ? new THREE.Vector3(...dir) : new THREE.Vector3(r() - 0.5, r() - 0.5, 0.35 + r() * 0.9);
      out.push({
        geo,
        mat,
        home: new THREE.Vector3(...home),
        homeRot: new THREE.Euler(...(homeRot ?? [0, 0, 0])),
        dir: d.normalize(),
        spin: new THREE.Vector3((r() - 0.5) * 6, (r() - 0.5) * 6, (r() - 0.5) * 6),
        reach,
      });
    };
    // Engranajes (escondidos detrás de la esfera hasta que explota)
    for (let i = 0; i < 14; i++) {
      const rad = 0.25 + r() * 0.55;
      const g = new THREE.ExtrudeGeometry(gearShape(rad, 10 + Math.floor(r() * 14), 0.07, rad * 0.18), {depth: 0.06, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 1, curveSegments: 6});
      g.center();
      const a = r() * Math.PI * 2;
      const rr = r() * 1.2;
      add(g, i % 3 === 0 ? mats.steel : i % 3 === 1 ? mats.gold : mats.goldDark, [Math.cos(a) * rr, Math.sin(a) * rr, -0.15 - r() * 0.25], 3 + r() * 4);
    }
    // Tornillos
    for (let i = 0; i < 22; i++) {
      const g = new THREE.CylinderGeometry(0.035, 0.035, 0.18, 10);
      const a = r() * Math.PI * 2;
      add(g, mats.steel, [Math.cos(a) * 1.4, Math.sin(a) * 1.4, -0.2], 4 + r() * 5, undefined, [Math.PI / 2, 0, 0]);
    }
    // Rubíes
    for (let i = 0; i < 10; i++) {
      add(new THREE.OctahedronGeometry(0.05), mats.ruby, [(r() - 0.5) * 1.6, (r() - 0.5) * 1.6, -0.18], 3 + r() * 4);
    }
    // Resortes (hélices)
    for (let i = 0; i < 4; i++) {
      const pts = Array.from({length: 120}, (_, k) => new THREE.Vector3(Math.cos(k * 0.5) * 0.12, Math.sin(k * 0.5) * 0.12, k * 0.0022 - 0.42));
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.012, 6, false);
      add(g, mats.steel, [(r() - 0.5) * 1.2, (r() - 0.5) * 1.2, -0.25], 3 + r() * 3);
    }
    // Esquirlas de vidrio (vuelan hacia la cámara)
    for (let i = 0; i < 26; i++) {
      const s = new THREE.Shape();
      const n = 3 + Math.floor(r() * 2);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + r() * 0.8;
        const rr = 0.12 + r() * 0.3;
        if (k === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
        else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      const a = r() * Math.PI * 2;
      const rr = Math.sqrt(r()) * 1.8;
      add(new THREE.ShapeGeometry(s), mats.shard, [Math.cos(a) * rr, Math.sin(a) * rr, 0.16], 5 + r() * 4, [Math.cos(a) * 0.6, Math.sin(a) * 0.6, 1]);
    }
    return out;
  }, [mats]);

  const caseGeo = useMemo(() => new THREE.TorusGeometry(2.05, 0.2, 32, 128), []);
  const bezelGeo = useMemo(() => new THREE.CylinderGeometry(2.05, 2.1, 0.32, 128, 1, true), []);
  const backGeo = useMemo(() => new THREE.CylinderGeometry(2.05, 2.05, 0.08, 96), []);
  const dialGeo = useMemo(() => new THREE.CircleGeometry(1.95, 96), []);
  const lugGeo = useMemo(() => new THREE.BoxGeometry(0.5, 0.9, 0.22), []);

  // La esfera, la caja y las agujas también se separan (más lento que las piezas chicas).
  const e = explode;
  const shellOffset = (dx: number, dy: number, dz: number, k: number): [number, number, number] => [dx * e * k, dy * e * k, dz * e * k];
  const sec = -secTicks * ((3 * Math.PI) / 180);
  const minute = -(secTicks / 120) * ((6 * Math.PI) / 180) - 1.1;
  const hour = minute / 12 - 0.4;

  return (
    <ThreeCanvas width={W} height={H} style={{position: 'absolute', inset: 0, ...style}} camera={{fov, near: 0.05, far: 100, position: cam}}>
      <StudioEnv intensity={1.1 * light} />
      <CameraRig pos={cam} look={look} fov={fov} roll={roll} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[3, 4, 6]} intensity={2.2 * light} color="#FFE6B8" />
      <pointLight position={[-4, -2, 4]} intensity={30 * light} color="#FFB56A" />

      {/* Caja, bisel y fondo */}
      <group position={shellOffset(0, -0.3, -3, 1)} rotation={[e * 0.6, e * -0.4, 0]}>
        <mesh geometry={caseGeo} material={mats.gold} />
        <mesh geometry={bezelGeo} material={mats.gold} rotation={[Math.PI / 2, 0, 0]} />
        <mesh geometry={backGeo} material={mats.goldDark} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.16]} />
        <mesh geometry={lugGeo} material={mats.gold} position={[0, 2.35, -0.05]} />
        <mesh geometry={lugGeo} material={mats.gold} position={[0, -2.35, -0.05]} />
        <mesh material={mats.gold} position={[2.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.3, 24]} />
        </mesh>
      </group>
      {/* Esfera */}
      <mesh geometry={dialGeo} material={mats.dial} position={shellOffset(0.2, 0.4, -1.5, 1)} rotation={[e * -0.9, e * 0.7, e * 0.3]} />
      {/* Agujas */}
      <group position={shellOffset(-0.3, 0.6, 1.2, 1)} rotation={[e * 1.2, e * 0.5, 0]}>
        <mesh material={mats.gold} rotation={[0, 0, hour]} position={[0, 0, 0.03]}>
          <boxGeometry args={[0.09, 1.0, 0.03]} />
        </mesh>
        <mesh material={mats.gold} rotation={[0, 0, minute]} position={[0, 0, 0.05]}>
          <boxGeometry args={[0.06, 1.55, 0.03]} />
        </mesh>
        <group rotation={[0, 0, sec]}>
          <mesh material={mats.ruby} position={[0, 0.65, 0.07]}>
            <boxGeometry args={[0.025, 1.6, 0.02]} />
          </mesh>
        </group>
        <mesh material={mats.gold} position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 24]} />
        </mesh>
      </group>
      {/* Cristal entero (desaparece al estallar) con el brillo que lo cruza */}
      {e < 0.02 ? (
        <>
          <mesh material={mats.glass} position={[0, 0, 0.16]}>
            <circleGeometry args={[1.98, 96]} />
          </mesh>
          <mesh position={[-2.4 + glint * 4.8, 0, 0.17]} rotation={[0, 0, -0.5]}>
            <planeGeometry args={[0.35, 5]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </>
      ) : null}
      {/* Piezas */}
      {parts.map((p, i) => {
        const isShard = p.mat === mats.shard;
        if (isShard && e < 0.02) return null;
        const d = p.reach * e;
        return (
          <mesh
            key={i}
            geometry={p.geo}
            material={p.mat}
            position={[p.home.x + p.dir.x * d, p.home.y + p.dir.y * d, p.home.z + p.dir.z * d]}
            rotation={[p.homeRot.x + p.spin.x * e, p.homeRot.y + p.spin.y * e, p.homeRot.z + p.spin.z * e]}
          />
        );
      })}
    </ThreeCanvas>
  );
};
