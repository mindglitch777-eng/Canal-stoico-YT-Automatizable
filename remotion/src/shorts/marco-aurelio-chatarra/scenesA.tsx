// Escenas 1, 2, 3 y 11: el reloj que explota, el áureo y el Imperio, la riqueza que se apaga, y el loop.
import {ThreeCanvas} from '@remotion/three';
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import * as THREE from 'three';
import {hash, rng} from '../../director';
import {Decode, goldStyle, Shockwave} from '../../kinetic';
import {color, font, H, W} from '../../theme';
import type {Scene} from '../../types';
import {AureusCanvas, AureusMesh} from './Aureus';
import {clamp, lerp, OnScreen, outExpo, PriceTag, useLocal, wordFrame} from './util';
import {CameraRig, StudioEnv, Watch3D, type WatchState} from './Watch3D';

type P = {scene: Scene; dur: number};

// Titular del gancho: se lee en el cuadro 0 (marfil y oro con placa oscura detrás, por delante de los engranajes).
// La escena 11 termina con este mismo titular, en el mismo lugar, para que el loop empalme.
export const HookHeadline: React.FC<{pop?: number; style?: React.CSSProperties}> = ({pop = 0, style}) => {
  const {f} = useLocal();
  return (
    <div style={{position: 'absolute', top: 190, left: 0, width: W, display: 'flex', justifyContent: 'center', zIndex: 6, ...style}}>
      <div
        style={{
          padding: '26px 64px 34px',
          borderRadius: 40,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(6,4,2,0.92) 0%, rgba(6,4,2,0.78) 60%, rgba(6,4,2,0) 100%)',
          textAlign: 'center',
          transform: `scale(${1 + pop * 0.14})`,
        }}
      >
        <div style={{fontFamily: font.serif, fontWeight: 700, fontSize: 150, lineHeight: 0.95, color: '#FFF8EA', textShadow: '0 4px 0 #3B342A, 0 10px 30px rgba(0,0,0,0.95)'}}>$5,000</div>
        <div style={{fontFamily: font.serif, fontWeight: 700, fontSize: 118, lineHeight: 1.05}}>
          <span style={{color: '#FFF8EA', textShadow: '0 4px 0 #3B342A, 0 10px 30px rgba(0,0,0,0.95)'}}>scrap </span>
          <span style={{...goldStyle(0, 3, 7, 1.2)}}>metal?</span>
        </div>
      </div>
    </div>
  );
};

// Grieta en el cristal (primeros 0,5 s): anticipa el estallido.
const Crack: React.FC<{p: number}> = ({p}) => {
  if (p <= 0) return null;
  const r = rng(12);
  const rays = Array.from({length: 9}, () => {
    const a = r() * Math.PI * 2;
    const len = 120 + r() * 260;
    let x = 420;
    let y = 820;
    let d = `M${x} ${y}`;
    for (let k = 1; k <= 4; k++) {
      x += Math.cos(a + (r() - 0.5) * 0.6) * (len / 4) * p;
      y += Math.sin(a + (r() - 0.5) * 0.6) * (len / 4) * p;
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  });
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, zIndex: 4}}>
      {rays.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={5} />
          <path d={d} fill="none" stroke="rgba(235,245,255,0.95)" strokeWidth={2.2} />
        </g>
      ))}
      <circle cx={420} cy={820} r={10 * p} fill="rgba(255,255,255,0.9)" />
    </svg>
  );
};

// Estado del reloj en el cuadro 0 (la escena 11 tiene que terminar exactamente así).
// Macro en 3/4: se ve la esfera, el borde de oro y la corona (se reconoce que es un reloj).
const CAM0: [number, number, number] = [2.2, -1.5, 5.4];
const LOOK0: [number, number, number] = [0.5, -0.2, 0];
const FOV0 = 40;
const tagRot = (t: number) => Math.sin((t * Math.PI * 2) / 3) * 22;

// ---------------- 1) $5,000 de chatarra ----------------
export const S1Watch: React.FC<P> = ({scene}) => {
  const {f, fps, t} = useLocal();
  const scrapF = wordFrame(scene, fps, 'scrap', 1, 'start', 0.45);
  const howF = wordFrame(scene, fps, 'how', 1, 'start', 0.85);
  const since = Math.max(0, f - scrapF) / fps;
  const freezeAt = Math.max(0, howF - scrapF) / fps;
  const e = f < scrapF ? 0 : 1 - Math.exp(-3.4 * Math.min(since, freezeAt)) + (f > howF ? 0.004 * (f - howF) / fps : 0);
  // Cámara: pegada al cristal → latigazo hacia atrás en 'scrap' → bullet time en 'How?'
  const back = lerp(f, scrapF, scrapF + 8, 0, 1, outExpo);
  const orbit = f > howF ? ((f - howF) / fps) * 0.55 : 0;
  const dist = 5.4 + back * 5;
  const cam: [number, number, number] =
    f > howF ? [Math.sin(orbit) * dist, 0.35 + orbit * 0.4, Math.cos(orbit) * dist] : [CAM0[0] * (1 - back) - t * 0.04, CAM0[1] * (1 - back), dist - (f < scrapF ? t * 0.12 : 0)];
  const look: [number, number, number] = [LOOK0[0] * (1 - back), LOOK0[1] * (1 - back), 0];
  // el segundero se traba (cuadros 6-14) y la grieta crece: algo pasa en los primeros 0,5 s
  const stutter = f >= 6 && f <= 14 ? (f % 2 ? 0.7 : -0.5) : 0;
  const ticks = Math.floor(Math.min(t, howF / fps) / 0.5) + stutter;
  const crack = f < scrapF ? lerp(f, 7, 13, 0, 1, outExpo) : 0;
  const state: WatchState = {explode: e, secTicks: ticks, glint: (t / 2.2) % 1, cam, look, fov: FOV0 + back * 8, roll: back * 0.08 - orbit * 0.05, light: 1 + Math.max(0, 1 - since * 3) * 1.5 * (f >= scrapF ? 1 : 0)};
  // Etiqueta: gira y se quema hasta $0
  const burn = lerp(f, scrapF + 2, scrapF + 22, 0, 0.55);
  const price = Math.round(5000 * (1 - lerp(f, scrapF, scrapF + 20, 0, 1)));
  const spinFast = f > scrapF ? (f - scrapF) * 26 : 0;
  const frozen = f > howF;
  const howS = spring({frame: f - howF, fps, config: {damping: 10, stiffness: 180}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 45% 40%, #2A2116 0%, #0A0806 70%)'}}>
      <AbsoluteFill style={{filter: frozen ? `saturate(${1 - Math.min(0.5, howS * 0.5)}) contrast(1.1)` : undefined}}>
        <Watch3D {...state} />
      </AbsoluteFill>
      <PriceTag
        text={`$${price.toLocaleString('en-US')}`}
        x={790 - (f > scrapF ? lerp(f, scrapF, scrapF + 14, 0, 140) : 0)}
        y={560 - (f > scrapF ? lerp(f, scrapF, scrapF + 14, 0, 120) : 0)}
        rot={tagRot(t) + spinFast * (frozen ? 0 : 1) + (frozen ? (howF - scrapF) * 26 : 0)}
        scale={0.9}
        burn={burn}
      />
      <Crack p={crack} />
      <Shockwave at={scrapF} x={W / 2} y={H * 0.45} size={1600} color="rgba(255,236,200,0.9)" />
      <HookHeadline pop={Math.max(0, 1 - Math.abs(f - scrapF - 3) / 6)} />
      {frozen ? (
        <div style={{position: 'absolute', top: 1010, width: W, textAlign: 'center', fontFamily: font.serif, fontWeight: 700, fontSize: 210, transform: `scale(${interpolate(howS, [0, 1], [2.2, 1])})`, opacity: Math.min(1, howS * 2), ...goldStyle(f, 4, 10, 1.4)}}>
          How?
        </div>
      ) : null}
      {/* Destello del estallido */}
      <AbsoluteFill style={{background: '#FFF8E8', opacity: interpolate(f - scrapF, [0, 1, 6], [0, 0.75, 0], clamp), mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

// ---------------- 2) 50 millones (el áureo y el Imperio) ----------------

// Contorno aproximado del Imperio en tiempos de Marco Aurelio (lon, lat) y el Mediterráneo a excluir.
const EMPIRE: Array<[number, number]> = [
  [-9.5, 42], [-8, 43.6], [-1.6, 43.4], [-1.3, 46.4], [-4.6, 48.5], [0, 49.6], [2, 51], [4.4, 51.9], [6.5, 51.6], [7.6, 50.2], [8.6, 49.2], [9.6, 49.6], [10.6, 49],
  [12.2, 48.6], [16, 48.3], [19, 47.9], [22, 47.6], [25, 47.8], [27.2, 46.6], [29.4, 45.2], [28.8, 44], [28, 42], [29, 41.2], [31, 41.2], [35, 42], [41, 41.1], [42.2, 40],
  [40.2, 37.5], [39.2, 36], [40.6, 34.6], [38, 32.5], [36.5, 29.5], [35, 28], [33.6, 27.6], [34, 26], [33, 24], [31, 24], [28, 26], [25, 30], [25, 31.5], [20.2, 30.4],
  [19, 30.3], [15, 31.2], [11, 32.8], [9.6, 33.8], [8, 35], [6, 35.1], [2, 35.2], [-1, 34.8], [-5, 34], [-6.6, 34.4], [-6.1, 35.8], [-5.6, 36], [-6.5, 36.8], [-9, 37], [-9.5, 39],
];
const BRITAIN: Array<[number, number]> = [[-5.6, 50], [1.4, 51], [1.8, 52.8], [-0.4, 54.9], [-3.2, 55], [-5, 54], [-4.4, 52.2]];
const MED: Array<[number, number]> = [
  [-5.4, 36], [-1, 35.4], [3, 36.8], [10, 37.3], [11, 36.5], [10.5, 34.5], [11, 33.2], [15, 32.2], [19, 30.6], [20, 32], [25, 31.8], [29.5, 31.2], [32, 31.2], [34.3, 31.4],
  [35, 33], [35.8, 35.8], [34, 36.5], [30.5, 36.6], [28, 36.7], [27, 38.5], [26.4, 40.2], [24, 40.8], [23, 39.5], [23.5, 38], [22.8, 36.5], [21.7, 36.8], [21, 38.5], [20.2, 39.6],
  [19.4, 41.5], [16.5, 43.5], [13.8, 45.3], [12.3, 45.4], [13.6, 43.6], [16, 41.5], [18.5, 40.2], [17.2, 39.5], [15.7, 38], [15.6, 40], [13, 41.2], [11.2, 42.4], [10.2, 43.9],
  [8.5, 44.3], [6, 43.1], [3, 43.3], [3.2, 41.9], [0.5, 40.5], [-0.4, 39.2], [0.2, 38.7], [-1, 37.6], [-2.2, 36.7], [-4.5, 36.6],
];
const ISLANDS: Array<[number, number, number]> = [[14, 37.5, 1], [9, 40, 0.9], [9.1, 42.2, 0.5], [24.8, 35.2, 0.7], [33.2, 35.1, 0.6]];
const inPoly = (x: number, y: number, poly: Array<[number, number]>) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const MAP_W = 1000;
const MAP_X0 = 40;
const MAP_Y0 = 520;
const proj = (lon: number, lat: number): [number, number] => [MAP_X0 + ((lon + 11) / 56) * MAP_W, MAP_Y0 + ((57 - lat) / 34) * 760];

const useEmpireDots = () =>
  useMemo(() => {
    const out: Array<{x: number; y: number; d: number}> = [];
    const r = rng(5);
    for (let lat = 56; lat > 23; lat -= 0.62) {
      for (let lon = -10; lon < 43; lon += 0.62 * 0.78) {
        const land = (inPoly(lon, lat, EMPIRE) && !inPoly(lon, lat, MED)) || inPoly(lon, lat, BRITAIN) || ISLANDS.some(([ix, iy, ir]) => Math.hypot(lon - ix, lat - iy) < ir);
        if (!land) continue;
        const [x, y] = proj(lon, lat);
        // se encienden desde Roma hacia afuera
        const dist = Math.hypot(lon - 12.5, lat - 41.9) / 32;
        out.push({x, y, d: Math.min(1, dist * 0.85 + r() * 0.2)});
      }
    }
    return out;
  }, []);

const gearShape2 = (r: number, teeth: number) => {
  const s = new THREE.Shape();
  for (let i = 0; i <= teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const rr = i % 4 === 1 || i % 4 === 2 ? r + 0.07 : r;
    if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  return s;
};

// Las piezas del reloj se arremolinan y forman la moneda.
const CoinWorld: React.FC<{swirl: number; coinIn: number; coinRot: number; cam: [number, number, number]; look: [number, number, number]; light: number}> = ({swirl, coinIn, coinRot, cam, look, light}) => {
  const gears = useMemo(() => {
    const r = rng(77);
    const mat = new THREE.MeshStandardMaterial({color: '#E6B85C', metalness: 1, roughness: 0.25});
    const steel = new THREE.MeshStandardMaterial({color: '#C9CED6', metalness: 1, roughness: 0.25});
    return Array.from({length: 22}, (_, i) => ({
      geo: new THREE.ExtrudeGeometry(gearShape2(0.25 + r() * 0.4, 12 + Math.floor(r() * 10)), {depth: 0.06, bevelEnabled: false}),
      mat: i % 3 === 0 ? steel : mat,
      a0: r() * Math.PI * 2,
      r0: 3 + r() * 4,
      z0: -2 + r() * 6,
      spin: (r() - 0.5) * 10,
    }));
  }, []);
  return (
    <ThreeCanvas width={W} height={H} style={{position: 'absolute', inset: 0}} camera={{fov: 40, position: cam}}>
      <StudioEnv intensity={1.2 * light} />
      <CameraRig pos={cam} look={look} fov={40} />
      <directionalLight position={[2, 5, 6]} intensity={2.4 * light} color="#FFE2A8" />
      <pointLight position={[0, -3, 5]} intensity={25 * light} color="#FF9F4A" />
      {swirl < 1 &&
        gears.map((g, i) => {
          const k = swirl;
          const a = g.a0 + k * Math.PI * 3;
          const rr = g.r0 * (1 - k);
          return (
            <mesh key={i} geometry={g.geo} material={g.mat} position={[Math.cos(a) * rr, 1.3 + Math.sin(a) * rr * 0.7, g.z0 * (1 - k)]} rotation={[g.spin * k, g.spin * 0.5 * k, a]} scale={1 - k * 0.8} />
          );
        })}
      {coinIn > 0 ? <AureusMesh position={[0, 1.9, 0]} rotation={[-0.32, coinRot, 0]} scale={(0.3 + 0.7 * coinIn) * 0.5} /> : null}
    </ThreeCanvas>
  );
};

export const S2Empire: React.FC<P> = ({scene, dur}) => {
  const {f, fps} = useLocal();
  const landF = wordFrame(scene, fps, '50', 1, 'start', 0.6) + 2;
  const swirl = lerp(f, 0, 16, 0, 1);
  const coinIn = spring({frame: f - 10, fps, config: {damping: 11, stiffness: 120}});
  const dots = useEmpireDots();
  const p = interpolate(f, [6, landF], [0, 1], {...clamp, easing: (x) => x ** 2.2});
  const count = Math.round(50_000_000 * p);
  const mapOpen = lerp(f, 4, 20, 0, 1);
  const stampS = spring({frame: f - landF, fps, config: {damping: 9, stiffness: 220, mass: 0.6}});
  const camZoom = lerp(f, 0, dur, 0, 1);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, #1A1712 0%, #060504 75%)'}}>
      {/* Mapa del Imperio: millones de luces (personas) que se encienden desde Roma */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, transform: `scale(${1.5 - mapOpen * 0.5 + camZoom * 0.04})`, transformOrigin: '50% 62%', opacity: mapOpen}}>
        {dots.map((d, i) => {
          const on = p >= d.d;
          const flick = on ? 0.55 + 0.45 * hash(i + Math.floor(f / 3)) : 0.08;
          return <circle key={i} cx={d.x} cy={d.y} r={on ? 3.4 : 2} fill={on ? '#FFD27A' : '#8F887A'} opacity={flick} />;
        })}
      </svg>
      <CoinWorld swirl={swirl} coinIn={coinIn} coinRot={-0.5 + lerp(f, 0, dur, 0, 0.9)} cam={[0, -3.4 + camZoom * 0.4, 9.2 - camZoom * 0.8]} look={[0, 0.8, 0]} light={1 + Math.max(0, 1 - (f - landF) / 10) * (f >= landF ? 1.4 : 0)} />
      {/* Contador */}
      <div style={{position: 'absolute', top: 220, width: W, textAlign: 'center', fontFamily: font.sans, fontWeight: 800, fontSize: 132, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', transform: `scale(${f >= landF ? interpolate(stampS, [0, 1], [1.35, 1]) : 1})`, ...goldStyle(f, 2, 9, 1.3)}}>
        {count.toLocaleString('en-US')}
      </div>
      <div style={{position: 'absolute', top: 380, width: W, textAlign: 'center', fontFamily: font.sans, fontWeight: 800, fontSize: 30, letterSpacing: '0.5em', color: color.muted, opacity: lerp(f, landF, landF + 8)}}>
        PEOPLE
      </div>
      <Shockwave at={landF} x={W / 2} y={300} size={1300} />
      <Decode
        text="MARCUS AURELIUS"
        startFrame={8}
        perChar={1.4}
        style={{position: 'absolute', top: 1100, width: W, textAlign: 'center', fontFamily: font.serif, fontWeight: 700, fontSize: 84, letterSpacing: '0.14em', color: color.ink, textShadow: '0 0 30px rgba(232,184,90,0.6), 0 6px 0 #3B342A'}}
      />
    </AbsoluteFill>
  );
};

// ---------------- 3) Podía comprarlo todo. En cambio... ----------------
const Icon: React.FC<{kind: number; size: number}> = ({kind, size}) => {
  const fill = 'url(#goldIcon)';
  const shapes = [
    // ánfora
    <path key="a" d="M40 8 h20 v10 c0 4 14 10 14 30 c0 22 -10 34 -24 44 h0 c-14 -10 -24 -22 -24 -44 c0 -20 14 -26 14 -30z M30 22 c-12 0 -14 16 -4 20 M70 22 c12 0 14 16 4 20" fill={fill} stroke="#6B4E17" strokeWidth={3} />,
    // copa
    <path key="b" d="M22 10 h56 c0 30 -12 42 -24 46 v22 h16 v8 h-40 v-8 h16 v-22 c-12 -4 -24 -16 -24 -46z" fill={fill} stroke="#6B4E17" strokeWidth={3} />,
    // corona de laurel
    <g key="c" fill={fill} stroke="#6B4E17" strokeWidth={2}>
      {Array.from({length: 9}, (_, i) => {
        const a = Math.PI * (0.15 + i * 0.09);
        return <ellipse key={i} cx={50 - Math.cos(a) * 38} cy={60 - Math.sin(a) * 38} rx={11} ry={5} transform={`rotate(${(a * 180) / Math.PI + 90} ${50 - Math.cos(a) * 38} ${60 - Math.sin(a) * 38})`} />;
      })}
      {Array.from({length: 9}, (_, i) => {
        const a = Math.PI * (0.15 + i * 0.09);
        return <ellipse key={`r${i}`} cx={50 + Math.cos(a) * 38} cy={60 - Math.sin(a) * 38} rx={11} ry={5} transform={`rotate(${(-a * 180) / Math.PI - 90} ${50 + Math.cos(a) * 38} ${60 - Math.sin(a) * 38})`} />;
      })}
    </g>,
    // pila de monedas
    <g key="d" fill={fill} stroke="#6B4E17" strokeWidth={2.5}>
      {[0, 1, 2, 3, 4].map((k) => (
        <ellipse key={k} cx={50} cy={82 - k * 13} rx={34} ry={10} />
      ))}
    </g>,
    // cofre
    <path key="e" d="M12 40 c0 -20 76 -20 76 0 v44 h-76z M12 46 h76 M44 46 v14 h12 v-14" fill={fill} stroke="#6B4E17" strokeWidth={3} />,
    // anillo con gema
    <g key="f">
      <circle cx={50} cy={60} r={28} fill="none" stroke="url(#goldIcon)" strokeWidth={10} />
      <path d="M38 30 l12 -18 l12 18 l-12 10z" fill="#C0303F" stroke="#6B4E17" strokeWidth={2} />
    </g>,
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible', filter: 'drop-shadow(0 0 18px rgba(232,184,90,0.6))'}}>
      <defs>
        <linearGradient id="goldIcon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF0B8" />
          <stop offset="0.5" stopColor="#E0B04F" />
          <stop offset="1" stopColor="#8A6420" />
        </linearGradient>
      </defs>
      {shapes[kind % shapes.length]}
    </svg>
  );
};

export const S3Instead: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const insteadF = wordFrame(scene, fps, 'instead', 1, 'start', 0.35);
  const wroteF = wordFrame(scene, fps, 'wrote', 1, 'start', 0.5);
  const dark = f >= insteadF;
  const pan = Math.sin(t * 0.9) * 40 - t * 30;
  const items = [0, 1, 2, 3, 4, 5, 3, 1];
  // Después de 'Instead': vela y pergamino que se escribe solo
  const candle = spring({frame: f - insteadF - 3, fps, config: {damping: 14}});
  const unroll = lerp(f, insteadF + 4, insteadF + 14, 0.05, 1);
  const writeP = lerp(f, wroteF, dur - 6, 0, 1, (x) => x);
  const flick = 1 + Math.sin(f * 1.7) * 0.06 + (hash(Math.floor(f / 2)) - 0.5) * 0.1;
  const lines = 6;
  return (
    <AbsoluteFill style={{background: dark ? '#030302' : 'radial-gradient(ellipse at 50% 45%, #3A2A12 0%, #0B0805 75%)'}}>
      {!dark ? (
        <AbsoluteFill style={{transform: `translateX(${pan}px)`}}>
          {/* lluvia de monedas al fondo */}
          {Array.from({length: 26}, (_, i) => {
            const x = hash(i) * W;
            const y = ((t * (300 + hash(i + 9) * 400) + hash(i + 3) * H) % (H + 200)) - 100;
            return <AureusCanvas key={`c${i}`} size={70} style={{position: 'absolute', left: x, top: y, transform: `scaleX(${Math.cos(t * 6 + i)})`, opacity: 0.85}} />;
          })}
          <AureusCanvas size={420} style={{position: 'absolute', left: W / 2 - 210, top: 560, transform: `scaleX(${Math.cos(t * 1.4)})`, boxShadow: '0 0 80px rgba(232,184,90,0.6)'}} />
          {items.map((k, i) => {
            const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
            const s = spring({frame: f - 3 - i * 2.2, fps, config: {damping: 10, stiffness: 160}});
            return (
              <div key={i} style={{position: 'absolute', left: W / 2 + Math.cos(a) * 380 - 80, top: 770 + Math.sin(a) * 380 - 80, transform: `scale(${s}) rotate(${(1 - s) * 90}deg)`}}>
                <Icon kind={k} size={160} />
              </div>
            );
          })}
        </AbsoluteFill>
      ) : (
        <>
          {/* mesa de madera */}
          <div style={{position: 'absolute', left: 0, top: 1040, width: W, height: H - 1040, background: 'repeating-linear-gradient(90deg, #2A1A0D 0px, #3A2413 46px, #2E1C0E 92px, #24160A 140px)', opacity: candle}} />
          <div style={{position: 'absolute', left: 0, top: 1040, width: W, height: 8, background: 'linear-gradient(90deg, #4A3018, #7A5228, #4A3018)', opacity: candle}} />
          {/* luz de vela */}
          <AbsoluteFill style={{background: `radial-gradient(circle at 26% 74%, rgba(255,170,70,${0.42 * candle * flick}) 0%, rgba(255,120,40,${0.12 * candle}) 30%, transparent 60%)`}} />
          {/* pergamino */}
          <div
            style={{
              position: 'absolute',
              left: 150,
              top: 560,
              width: 780,
              height: 560,
              transform: `scaleY(${unroll}) rotate(-2deg)`,
              transformOrigin: '50% 0%',
              background: 'radial-gradient(ellipse at 40% 40%, #E9D6A8 0%, #CDAE74 70%, #8E6E3A 100%)',
              borderRadius: 10,
              boxShadow: `0 30px 80px rgba(0,0,0,0.7), inset 0 0 60px rgba(90,55,15,0.6), 0 0 ${60 * candle}px rgba(255,170,70,0.25)`,
              padding: '54px 64px',
              overflow: 'hidden',
            }}
          >
            <div style={{fontFamily: font.serif, fontStyle: 'italic', fontWeight: 600, fontSize: 64, color: '#3A2410', clipPath: `inset(0 ${100 - Math.min(1, writeP * 3) * 100}% 0 0)`}}>To Himself</div>
            {Array.from({length: lines}, (_, i) => {
              const lp = Math.max(0, Math.min(1, writeP * (lines + 1) - 1 - i * 0.9));
              const d = Array.from({length: 26}, (_, k) => `${k === 0 ? 'M' : 'L'} ${k * 24} ${16 + Math.sin(k * 1.9 + i) * 6 + (hash(k + i * 30) - 0.5) * 8}`).join(' ');
              return (
                <svg key={i} width={640} height={36} style={{display: 'block', marginTop: 22}}>
                  <path d={d} fill="none" stroke="#4A2E12" strokeWidth={3.2} strokeLinecap="round" strokeDasharray={1000} strokeDashoffset={1000 - lp * 640} opacity={0.85} />
                </svg>
              );
            })}
          </div>
          {/* vela en SVG (sin filtros de CSS: el desenfoque + sombra de antes salía como un rectángulo blanco) */}
          <svg width={240} height={420} style={{position: 'absolute', left: 120, top: 760, overflow: 'visible'}}>
            <defs>
              <radialGradient id="flame" cx="50%" cy="70%" r="60%">
                <stop offset="0" stopColor="#FFFFFF" />
                <stop offset="0.35" stopColor="#FFE08A" />
                <stop offset="0.75" stopColor="#FF9A2E" />
                <stop offset="1" stopColor="#FF9A2E" stopOpacity={0} />
              </radialGradient>
              <radialGradient id="halo" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#FFB45A" stopOpacity={0.55} />
                <stop offset="1" stopColor="#FFB45A" stopOpacity={0} />
              </radialGradient>
              <linearGradient id="wax" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#BFB294" />
                <stop offset="0.5" stopColor="#F1EAD6" />
                <stop offset="1" stopColor="#A99C7E" />
              </linearGradient>
            </defs>
            <g transform={`translate(120 300) scale(${Math.min(1.08, candle)}) translate(-120 -300)`}>
              <circle cx={120} cy={150} r={130 * flick} fill="url(#halo)" />
              <rect x={94} y={170} width={52} height={150} rx={6} fill="url(#wax)" />
              <path d="M120 170 L120 156" stroke="#2A1E0C" strokeWidth={3} />
              <ellipse cx={120} cy={128} rx={15} ry={32 * flick} fill="url(#flame)" />
            </g>
          </svg>
          <OnScreen scene={scene} top={300} size={120} />
        </>
      )}
      {!dark ? (
        <div style={{position: 'absolute', top: 260, width: W, textAlign: 'center', fontFamily: font.serif, fontWeight: 700, fontSize: 96, ...goldStyle(f, 6, 8, 1.2), opacity: lerp(f, 2, 8)}}>
          Anything.
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------- 11) Desnudalo. Incluso esos $5,000... (loop) ----------------
export const S11Loop: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const tEnd = dur / fps;
  const bareF = wordFrame(scene, fps, 'bare', 1, 'end', 0.55);
  const priceF = wordFrame(scene, fps, '5000', 1, 'start', 0.82);
  // Las piezas vuelven en reversa (desde el estado congelado del gancho) y el reloj se arma
  const back = lerp(f, 0, Math.round(dur * 0.62), 0, 1, (x) => 1 - (1 - x) ** 2.4);
  const e = 0.92 * (1 - back);
  // La cámara vuelve pegada al cristal y termina EXACTAMENTE en la pose del cuadro 0
  const k = lerp(f, Math.round(dur * 0.2), dur - 1, 0, 1, (x) => 1 - (1 - x) ** 3);
  const far: [number, number, number] = [-3.5, 1.4, 9];
  const cam: [number, number, number] = [far[0] + (CAM0[0] - far[0]) * k, far[1] + (CAM0[1] - far[1]) * k, far[2] + (CAM0[2] - far[2]) * k];
  const look: [number, number, number] = [LOOK0[0] * k, LOOK0[1] * k, 0];
  const tl = t - tEnd; // tiempo negativo hasta el final: así el segundero y el brillo empalman con el cuadro 0
  const state: WatchState = {explode: e, secTicks: Math.floor(tl / 0.5), glint: ((tl / 2.2) % 1 + 1) % 1, cam, look, fov: FOV0 + (1 - k) * 8, roll: 0};
  const tagIn = spring({frame: f - priceF + 6, fps, config: {damping: 16, stiffness: 120}});
  const textOut = lerp(f, priceF - 8, priceF - 2, 1, 0);
  const head = spring({frame: f - priceF, fps, config: {damping: 15, stiffness: 160}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 45% 40%, #2A2116 0%, #0A0806 70%)'}}>
      <Watch3D {...state} />
      <PriceTag text="$5,000" x={790 + (1 - tagIn) * 500} y={560} rot={tagRot(tl)} scale={0.9} style={{opacity: tagIn}} />
      <div style={{opacity: textOut}}>
        <OnScreen scene={scene} top={250} size={118} entry="flip" />
      </div>
      {f >= priceF ? <HookHeadline style={{opacity: Math.min(1, head * 1.5), transform: `scale(${interpolate(head, [0, 1], [1.6, 1])})`}} /> : null}
    </AbsoluteFill>
  );
};
