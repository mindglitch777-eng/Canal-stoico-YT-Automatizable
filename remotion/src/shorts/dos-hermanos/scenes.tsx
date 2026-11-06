// Las 11 escenas de "dos-hermanos".
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import {hash, rng, syncTokens} from '../../director';
import {font, W} from '../../theme';
import type {Scene} from '../../types';
import {clamp, inOut, lerp, outCubic, useLocal, wordFrame} from '../common';
import {CASES, FRAME0_CAM, T, TABLE_AT, TiltShift, ToyTitle, TWINS0, World, type V3, type WorldState} from './parts';

type P = {scene: Scene; dur: number};
type Cam = WorldState['cam'];

const mixV = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const mixCam = (a: Cam, b: Cam, k: number): Cam => ({pos: mixV(a.pos, b.pos, k), look: mixV(a.look, b.look, k), fov: a.fov + (b.fov - a.fov) * k, roll: (a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * k});
// Recorrido de cámara por cuadros clave (con suavizado).
const camPath = (f: number, keys: Array<{f: number; c: Cam}>): Cam => {
  if (f <= keys[0].f) return keys[0].c;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f <= b.f) return mixCam(a.c, b.c, inOut((f - a.f) / Math.max(1, b.f - a.f)));
  }
  return keys[keys.length - 1].c;
};
const drift = (c: Cam, f: number, amt = 0.05): Cam => ({...c, pos: [c.pos[0] + Math.sin(f / 23) * amt, c.pos[1] + Math.sin(f / 31) * amt * 0.6, c.pos[2] + Math.cos(f / 27) * amt]});
const dropP = (f: number, at: number, fps: number) => (f < at ? 0 : Math.min(1.04, spring({frame: f - at, fps, config: {damping: 12, stiffness: 220, mass: 0.6}})));

// ---------------- Cuadro 0 (también es el final del loop) ----------------
const T_IMPACT = 0.5;
export const caseY = (t: number) => (t < T_IMPACT ? 7 * (T_IMPACT - t) ** 2 : Math.max(0, Math.sin((t - T_IMPACT) * 14) * 0.08 * Math.exp(-(t - T_IMPACT) * 8)));
export const frame0State = (t: number): WorldState => ({
  t,
  cam: FRAME0_CAM,
  cases: {y: caseY(t), open: 0},
  twins: {...TWINS0, rotY: 0},
});
export const Frame0: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <World s={frame0State(t)} />
    <TiltShift />
  </AbsoluteFill>
);

// Destello blanco (impactos).
const Flash: React.FC<{f: number; at: number; amt?: number; color?: string}> = ({f, at, amt = 0.8, color = '#FFFFFF'}) => (
  <AbsoluteFill style={{background: color, opacity: interpolate(f - at, [0, 1, 7], [0, amt, 0], clamp), pointerEvents: 'none'}} />
);

// ---------------- 1) Los dos reciben $1,000,000. Why? ----------------
export const S1: React.FC<P> = ({scene}) => {
  const {f, fps, t} = useLocal();
  const whyF = wordFrame(scene, fps, 'why', 1, 'start', 0.88);
  const frozen = f >= whyF;
  const tf = frozen ? whyF / fps : t;
  const impF = Math.round(T_IMPACT * fps);
  const open = spring({frame: Math.round(tf * fps) - impF - 3, fps, config: {damping: 10, stiffness: 160}});
  const dt = tf - T_IMPACT - 0.12;
  const q = lerp(f, whyF + 2, whyF + 16, 0, 1, inOut);
  const qrot = frozen ? ((f - whyF) / fps) * 2.4 : 0;
  const close: Cam = {pos: [0, 1.25, 3.9], look: [0, 0.55, 1.25], fov: 42};
  let cam: Cam = FRAME0_CAM;
  if (f >= impF) cam = mixCam(FRAME0_CAM, close, outCubic(Math.min(1, (f - impF) / 9)));
  if (f >= impF + 9) cam = drift(close, f, 0.04);
  if (frozen) {
    const a = ((f - whyF) / fps) * 0.9;
    cam = {pos: [Math.sin(a) * 2.75, 1.25, 1.55 + Math.cos(a) * 2.75], look: [0, 0.7, 1.55], fov: 40};
  }
  const shake = f >= impF && f < impF + 8 ? (8 - (f - impF)) * 3 : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${Math.sin(f * 2.1) * shake}px, ${Math.cos(f * 2.7) * shake}px)`}}>
        <World s={{t: tf, cam, cases: {y: caseY(tf), open}, bills: dt > 0 ? {dt, q, qrot} : null, twins: {...TWINS0, rotY: 0}}} />
      </AbsoluteFill>
      <TiltShift />
      <Flash f={f} at={impF} amt={0.5} />
      <Flash f={f} at={whyF} amt={0.7} />
      {frozen ? <AbsoluteFill style={{background: 'rgba(29,43,79,0.12)'}} /> : null}
      <ToyTitle scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 2) Jake compra lo que se ve ----------------
const JAKE_POS: V3 = [-0.95, 0, 1.0];
const SAM_POS: V3 = [0.95, 0, 1.0];
export const S2: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const carF = wordFrame(scene, fps, 'supercar', 1, 'start', 0.55);
  const manF = wordFrame(scene, fps, 'mansion', 1, 'start', 0.75);
  const wideF = Math.min(dur - 10, manF + 16);
  const shots: Array<[number, Cam]> = [
    [0, {pos: [-0.35, 0.85, 3.0], look: [-0.95, 0.42, 1.0], fov: 34}],
    [carF - 2, {pos: [-0.2, 0.7, 2.2], look: [-1.1, 0.14, 0.65], fov: 38}],
    [manF - 1, {pos: [-0.65, 0.22, 1.7], look: [-1.45, 0.8, -0.65], fov: 50}],
    [wideF, {pos: [-1.25, 3.2, 4.7], look: [-1.45, 0.25, 0], fov: 40}],
  ];
  const cur = shots.filter(([a]) => f >= a).pop()!;
  const cam = drift(cur[1], f - cur[0], 0.08);
  const floors: [number, number, number] = [dropP(f, manF - 1, fps), dropP(f, manF + 4, fps), dropP(f, manF + 9, fps)];
  return (
    <AbsoluteFill>
      <World
        s={{
          t,
          cam,
          jake: {car: dropP(f, carF - 3, fps), floors, roof: dropP(f, manF + 13, fps), pool: dropP(f, wideF + 2, fps)},
          twins: {jake: JAKE_POS, sam: SAM_POS, rotY: 0.2, rotJ: 0.35},
        }}
      />
      <TiltShift />
      {shots.slice(1).map(([a], i) => (
        <Flash key={i} f={f} at={a} amt={0.35} />
      ))}
      <ToyTitle scene={scene} />
    </AbsoluteFill>
  );
};

// Globos de risa ("HA HA") de la familia.
const Laugh: React.FC<{x: number; y: number; f: number; at: number; rise: number; s?: number}> = ({x, y, f, at, rise, s = 1}) => {
  const {fps} = useLocal();
  const k = spring({frame: f - at, fps, config: {damping: 9, stiffness: 240, mass: 0.5}});
  if (f < at) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y - rise, transform: `translate(-50%,-50%) scale(${k * s}) rotate(${Math.sin(f * 0.7 + x) * 6}deg)`, padding: '10px 26px', background: '#FFFFFF', border: `6px solid ${T.navy}`, borderRadius: 40, fontFamily: font.sans, fontWeight: 900, fontSize: 58, color: T.coral, boxShadow: `0 6px 0 ${T.navy}`}}>
      HA HA
    </div>
  );
};

// ---------------- 3) Sam compra lo que no se ve; la familia se ríe ----------------
export const S3: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const famF = wordFrame(scene, fps, 'family', 1, 'start', 0.6);
  const laughF = wordFrame(scene, fps, 'laughed', 1, 'start', 0.75);
  const table = f >= famF;
  const zoom = lerp(f, 0, famF, 0, 1, inOut);
  const camA = mixCam({pos: [1.85, 2.3, 3.9], look: [1.5, 0.1, 0], fov: 40}, {pos: [2.0, 0.42, 1.05], look: [1.8, 0.12, 0.25], fov: 30}, zoom);
  const camB = drift({pos: [TABLE_AT[0], 1.25 - lerp(f, famF, dur, 0, 0.2), 2.5 - lerp(f, famF, dur, 0, 0.5)], look: [TABLE_AT[0], 0.32, 0.05], fov: 42}, f, 0.03);
  const rise = lerp(f, dur - 12, dur, 0, 700, (x) => x * x);
  const sam = {apt: dropP(f, 2, fps), books: dropP(f, 7, fps), plant: dropP(f, 12, fps), oldcar: 0, gray: 0, glint: 0};
  return (
    <AbsoluteFill>
      <World s={{t, cam: table ? camB : camA, sam, table: table ? 1 : 0, twins: {jake: JAKE_POS, sam: SAM_POS, rotY: -0.2}}} />
      <TiltShift />
      {table ? (
        <>
          <Flash f={f} at={famF} amt={0.35} />
          {[
            [250, 760],
            [540, 690],
            [830, 760],
            [200, 990],
            [880, 990],
          ].map(([x, y], i) => (
            <Laugh key={i} x={x} y={y} f={f} at={laughF + i * 3} rise={rise * (1 + i * 0.1)} s={1 - (i % 2) * 0.15} />
          ))}
        </>
      ) : null}
      <ToyTitle scene={scene} accent={T.teal} />
    </AbsoluteFill>
  );
};

// ---------------- 4) Seis meses después: 2 millones de seguidores ----------------
const Heart: React.FC<{x: number; y: number; s: number; c: string}> = ({x, y, s, c}) => (
  <svg width={80 * s} height={80 * s} viewBox="0 0 80 80" style={{position: 'absolute', left: x, top: y}}>
    <path d="M40 70 C10 48 4 30 16 18 C26 8 38 14 40 24 C42 14 54 8 64 18 C76 30 70 48 40 70 Z" fill={c} stroke={T.navy} strokeWidth={5} />
  </svg>
);
export const S4: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const hadF = wordFrame(scene, fps, 'had', 1, 'start', 0.4);
  const milF = wordFrame(scene, fps, 'million', 1, 'end', 0.7);
  const wideF = Math.round(dur * 0.72);
  const p = interpolate(f, [hadF, milF], [0, 1], {...clamp, easing: (x) => x ** 2.4});
  const n = Math.round(2_000_000 * p);
  const wide = f >= wideF;
  const grow = lerp(f, wideF, dur, 0, 1, outCubic);
  const cam: Cam = wide ? drift({pos: [0, 5.6, 6.6], look: [-0.3, 0, 0], fov: 38}, f) : {pos: [-0.3, 0.3, 2.5], look: [-1.45, 0.95, -0.6], fov: 50, roll: lerp(f, 0, wideF, 0.04, 0.16)};
  const hearts = useMemo(() => {
    const r = rng(44);
    return Array.from({length: 26}, () => ({x: 80 + r() * 820, d: r(), s: 0.6 + r() * 0.9, c: r() > 0.5 ? T.coral : '#FF8FB1'}));
  }, []);
  const full = {car: 1, floors: [1, 1, 1] as [number, number, number], roof: 1, pool: 1};
  return (
    <AbsoluteFill>
      <World s={{t, cam, jake: full, flashes: wide ? 0 : 1, lots: {jake: 1 + 0.3 * grow, sam: 1 - 0.3 * grow}, sam: {apt: 1, books: 1, plant: 1, oldcar: 0, gray: 0, glint: 0}, twins: {jake: JAKE_POS, sam: SAM_POS, rotY: 0}}} />
      <TiltShift />
      {!wide
        ? hearts.map((h, i) => {
            const lt = (f - hadF) / fps - h.d * 1.2;
            if (lt < 0) return null;
            return <Heart key={i} x={h.x + Math.sin(lt * 3 + i) * 30} y={1350 - lt * 520} s={h.s} c={h.c} />;
          })
        : null}
      {/* contador enorme */}
      <div style={{position: 'absolute', top: 560, width: W - 120, left: 0, textAlign: 'center', opacity: f >= hadF ? 1 : 0}}>
        <div style={{display: 'inline-block', padding: '18px 34px', background: T.coral, border: `8px solid ${T.navy}`, borderRadius: 30, boxShadow: `0 10px 0 ${T.navy}`, transform: `scale(${1 + (f >= milF && f < milF + 8 ? 0.08 * (1 - (f - milF) / 8) : 0)})`}}>
          <div style={{fontFamily: font.sans, fontWeight: 900, fontSize: 124, color: '#FFFFFF', lineHeight: 1, WebkitTextStroke: `4px ${T.navy}`, paintOrder: 'stroke fill', fontVariantNumeric: 'tabular-nums'}}>{n.toLocaleString('en-US')}</div>
          <div style={{fontFamily: font.sans, fontWeight: 900, fontSize: 46, color: '#FFFFFF', letterSpacing: '0.12em'}}>FOLLOWERS</div>
        </div>
      </div>
      <Flash f={f} at={wideF} amt={0.3} />
      <ToyTitle scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 5) Sam, el aburrido. (pista: brillo dorado en la grieta) ----------------
export const S5: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const carF = wordFrame(scene, fps, 'car', 1, 'start', 0.8);
  const gF = Math.round(dur * 0.5);
  const glint = f >= gF && f < gF + 7 ? 1 - Math.abs(f - gF - 3) / 4 : 0;
  const base: Cam = {pos: [1.5, 2.4, 3.9], look: [1.5, 0.15, 0.1], fov: 40};
  const crack: Cam = {pos: [2.05, 0.55, 1.7], look: [2.0, 0.03, 0.75], fov: 18};
  const zk = f >= gF - 2 && f < gF + 9 ? Math.min(1, (f - gF + 2) / 3, (gF + 9 - f) / 3) : 0;
  const cam = mixCam(base, crack, Math.max(0, zk));
  return (
    <AbsoluteFill>
      <World s={{t, cam, sam: {apt: 1, books: 1, plant: 1, oldcar: dropP(f, carF - 3, fps), gray: lerp(f, 0, 8), glint}, twins: {jake: JAKE_POS, sam: SAM_POS, rotY: 0}}} />
      <TiltShift />
      <AbsoluteFill style={{background: 'rgba(120,120,120,0.18)'}} />
      <ToyTitle scene={scene} accent="#8A8F98" />
      {/* hoja de calendario que se arranca (transición) */}
      {f > dur - 7 ? <Calendar f={f - (dur - 7)} num={11} tear={0} /> : null}
    </AbsoluteFill>
  );
};

// Calendario de juguete: la hoja `num` se arranca (tear 0..1) y deja ver la siguiente.
const Calendar: React.FC<{f: number; num: number; tear: number}> = ({f, num, tear}) => {
  const enter = Math.min(1, f / 6);
  const page = (n: number, extra: React.CSSProperties) => (
    <div style={{position: 'absolute', inset: 0, background: '#FFFFFF', border: `8px solid ${T.navy}`, borderRadius: 26, overflow: 'hidden', ...extra}}>
      <div style={{height: 90, background: T.coral, borderBottom: `8px solid ${T.navy}`, fontFamily: font.sans, fontWeight: 900, fontSize: 50, color: '#FFF', textAlign: 'center', lineHeight: '90px', letterSpacing: '0.1em'}}>MONTH</div>
      <div style={{fontFamily: font.sans, fontWeight: 900, fontSize: 210, color: T.navy, textAlign: 'center', lineHeight: '260px'}}>{n}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: W / 2 - 200 - 60, top: 560 - (1 - enter) * 900, width: 400, height: 380, zIndex: 7}}>
      {page(num + 1, {})}
      {tear < 1 ? page(num, {transformOrigin: '50% 0%', transform: `rotateX(${tear * 100}deg) translateY(${tear * 400}px) rotate(${tear * 25}deg)`, opacity: 1 - tear * 0.6}) : null}
    </div>
  );
};

// ---------------- 6) Mes 12: la mano del banco se lo lleva todo ----------------
const PIECES: Array<{key: 'car' | 'pool' | 'f3' | 'f2' | 'f1'; at: V3; top: number}> = [
  {key: 'car', at: [-1.1, 0, 0.65], top: 0.3},
  {key: 'pool', at: [-1.95, 0, 0.5], top: 0.06},
  {key: 'f3', at: [-1.45, 0, -0.65], top: 1.4},
  {key: 'f2', at: [-1.45, 0, -0.65], top: 0.64},
  {key: 'f1', at: [-1.45, 0, -0.65], top: 0.32},
];
export const S6: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const twF = wordFrame(scene, fps, 'twelve', 1, 'start', 0.4);
  const tear = lerp(f, twF - 2, twF + 8, 0, 1, (x) => x * x);
  const calOut = lerp(f, twF + 12, twF + 20, 0, 1, (x) => x * x);
  const a0 = twF + 10;
  const L = (dur - 4 - a0) / PIECES.length;
  const lift = {car: 0, pool: 0, f3: 0, f2: 0, f1: 0, roof: 0};
  const loan = {car: 0, pool: 0, f3: 0, f2: 0, f1: 0};
  let hand: WorldState['hand'] = null;
  let shake = 0;
  PIECES.forEach((p, k) => {
    const s = a0 + k * L;
    const u = (f - s) / L;
    if (u >= 1) {
      lift[p.key] = 40;
    } else if (u >= 0) {
      const down = Math.min(1, u / 0.35);
      const up = u > 0.4 ? (u - 0.4) / 0.6 : 0;
      const ly = outCubic(up) * 2.8;
      lift[p.key] = ly;
      hand = {pos: [p.at[0], p.top + 0.08 + (1 - outCubic(down)) * 4 + ly, p.at[2]], open: u < 0.38 ? 1 : 0};
      if (u > 0.36 && u < 0.5) shake = 6;
    }
    if (u >= 0.4) loan[p.key] = Math.min(1, (u - 0.4) * 4);
  });
  lift.roof = lift.f3;
  const cam = {pos: [-1.0, 3.1, 5.5] as V3, look: [-1.45, 0.65, -0.2] as V3, fov: 44};
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${Math.sin(f * 2.3) * shake}px, ${Math.cos(f * 1.9) * shake}px)`}}>
        <World s={{t, cam, jake: {car: 1, floors: [1, 1, 1], roof: 1, pool: 1, lift, loan}, hand, sam: {apt: 1, books: 1, plant: 1, oldcar: 1, gray: 1, glint: 0}, twins: {jake: JAKE_POS, sam: SAM_POS, rotY: 0, rotJ: -0.4}}} />
      </AbsoluteFill>
      <TiltShift />
      {calOut < 1 ? (
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${-calOut * 1200}px)`}}>
          <Calendar f={20} num={11} tear={tear} />
        </div>
      ) : null}
      <ToyTitle scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 7) EL GIRO: la cámara atraviesa el suelo ----------------
const DirtBurst: React.FC<{f: number; at: number}> = ({f, at}) => {
  const bits = useMemo(() => {
    const r = rng(70);
    return Array.from({length: 60}, () => ({a: r() * Math.PI * 2, v: 600 + r() * 1400, s: 10 + r() * 40, c: ['#5A3B22', '#3A2414', '#7A5234', '#7CC36B'][Math.floor(r() * 4)]}));
  }, []);
  const lt = (f - at) / 30;
  if (lt < -0.1 || lt > 0.6) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: '#2A1A0E', opacity: interpolate(lt, [-0.1, 0, 0.12], [0, 1, 0], clamp)}} />
      {lt > 0
        ? bits.map((b, i) => (
            <div key={i} style={{position: 'absolute', left: 540 + Math.cos(b.a) * b.v * lt, top: 960 + Math.sin(b.a) * b.v * lt, width: b.s, height: b.s * 0.8, background: b.c, borderRadius: 6, transform: `rotate(${b.a * 90 + lt * 500}deg)`, opacity: 1 - lt / 0.6}} />
          ))
        : null}
    </AbsoluteFill>
  );
};
export const S7: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const invF = wordFrame(scene, fps, 'invisible', 1, 'start', 0.8);
  const borF = wordFrame(scene, fps, 'borrowed', 1, 'start', 0.3);
  const k1 = Math.round(dur * 0.1);
  const k2 = Math.round(dur * 0.17);
  const keys = [
    {f: 0, c: {pos: [-1.45, 3.0, 3.4] as V3, look: [-1.45, 0, 0] as V3, fov: 40}},
    {f: k1, c: {pos: [-1.45, 0.25, 0.8] as V3, look: [-1.45, -1.2, -0.3] as V3, fov: 52}},
    {f: k2, c: {pos: [-1.45, -1.3, 1.1] as V3, look: [-1.45, -1.5, -0.4] as V3, fov: 56}},
    {f: Math.max(k2 + 4, invF - 10), c: {pos: [-1.2, -1.45, 1.5] as V3, look: [-1.3, -1.5, -0.4] as V3, fov: 56}},
    {f: invF + 4, c: {pos: [0.6, -1.4, 2.6] as V3, look: [1.45, -1.2, -0.2] as V3, fov: 56}},
    {f: dur, c: {pos: [0.2, -1.55, 5.6] as V3, look: [1.3, -1.35, -0.2] as V3, fov: 58}},
  ];
  const cam = camPath(f, keys);
  const under = cam.pos[1] < -0.03 ? 1 : 0;
  const crossF = useMemo(() => {
    for (let i = 0; i < 200; i++) if (camPath(i, keys).pos[1] < -0.03) return i;
    return k1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dur, invF]);
  const roots = f < invF ? 0.35 : 0.35 + 0.65 * Math.min(1, (f - invF) / 8);
  return (
    <AbsoluteFill style={{background: T.soil}}>
      <World s={{t, cam, under, roots, sam: {apt: 1, books: 1, plant: 1, oldcar: 1, gray: 0, glint: 0}, jake: {car: 0, floors: [0, 0, 0], roof: 0, pool: 0}, twins: {jake: [-1.45, 0, 0.3], sam: SAM_POS, rotY: 0}}} />
      <TiltShift dark={under} />
      <DirtBurst f={f} at={crossF} />
      <Flash f={f} at={invF} amt={0.45} color={T.goldHot} />
      {f >= borF ? <ToyTitle scene={scene} dark={!!under} accent={T.gold} /> : null}
    </AbsoluteFill>
  );
};

// ---------------- 8) La cita, que crece como raíces ----------------
export const S8: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const quote = typeof (scene as {quote?: unknown}).quote === 'string' ? ((scene as {quote?: string}).quote as string) : '';
  const tokens = quote.split(/\s+/).filter(Boolean);
  const startIdx = Math.max(0, scene.words.findIndex((w) => w.text.toLowerCase().startsWith('the')));
  const times = syncTokens(tokens, scene.words.slice(startIdx), 2.2).map((x) => Math.round(x * fps));
  const preT = syncTokens(['Seneca', 'knew'], scene.words, 1).map((x) => Math.round(x * fps));
  const k = lerp(f, 0, dur, 0, 1, (x) => x);
  const cam = mixCam({pos: [0.7, -2.5, 4.8], look: [1.35, -1.9, 0], fov: 56}, {pos: [0.9, -1.0, 4.3], look: [1.4, -0.7, 0], fov: 54}, inOut(k));
  const last = times[times.length - 1] ?? 0;
  return (
    <AbsoluteFill style={{background: T.soil}}>
      <World s={{t, cam, under: 1, roots: 1, jake: {car: 0, floors: [0, 0, 0], roof: 0, pool: 0}}} />
      <TiltShift dark={1} />
      {/* zarcillos de oro que suben desde abajo */}
      <svg width={W} height={1920} style={{position: 'absolute', inset: 0}}>
        {[180, 400, 680, 900].map((x, i) => (
          <path key={i} d={`M${x} 1920 C${x + 80} 1600 ${x - 90} 1300 ${x + 20} ${980 - i * 30}`} fill="none" stroke={T.gold} strokeWidth={10 - i} strokeLinecap="round" strokeDasharray={1200} strokeDashoffset={1200 * (1 - Math.min(1, k * 1.4 - i * 0.08))} opacity={0.8} style={{filter: 'drop-shadow(0 0 12px rgba(255,179,0,0.8))'}} />
        ))}
      </svg>
      <div style={{position: 'absolute', top: 360, width: W - 120, left: 0, textAlign: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 52, letterSpacing: '0.3em', color: '#FFF3D6'}}>
        {['SENECA', 'KNEW:'].map((w, i) => (
          <span key={i} style={{marginRight: '0.5em', opacity: Math.max(0, Math.min(1, (f - preT[i] + 3) / 4))}}>
            {w}
          </span>
        ))}
      </div>
      <div style={{position: 'absolute', top: 470, left: 70, width: W - 190, padding: '30px 34px', background: 'rgba(14,8,4,0.93)', border: `5px solid ${T.gold}`, borderRadius: 28, textAlign: 'center', fontFamily: font.serif, fontWeight: 700, fontSize: 112, lineHeight: 1.06}}>
        {tokens.map((tok, i) => {
          const a = times[i] ?? 0;
          const s = spring({frame: f - a + 2, fps, config: {damping: 13, stiffness: 200}});
          const poor = /poor/i.test(tok);
          return (
            <span key={i} style={{display: 'inline-block', margin: '0 0.13em', color: poor ? T.goldHot : '#FFF3D6', opacity: f >= a - 2 ? 1 : 0, transform: `translateY(${(1 - s) * 90}px) scaleY(${0.4 + 0.6 * s})`, transformOrigin: '50% 100%', textShadow: poor ? '0 0 24px rgba(255,179,0,0.9)' : '0 4px 0 #000'}}>
              {tok}
            </span>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 1090, width: W - 120, left: 0, textAlign: 'center', fontFamily: font.serif, fontStyle: 'italic', fontSize: 48, color: T.goldHot, opacity: lerp(f, last, last + 10)}}>Seneca, Letters to Lucilius 2</div>
    </AbsoluteFill>
  );
};

// ---------------- 9) Jake parecía rico. Sam era rico. (pantalla partida al atardecer) ----------------
export const S9: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const wasF = wordFrame(scene, fps, 'was', 1, 'start', 0.6);
  const split = interpolate(f, [wasF, wasF + 14], [540, 250], {...clamp, easing: outCubic});
  const bloom = lerp(f, 0, Math.max(10, wasF), 0.2, 1, outCubic);
  const cam = drift({pos: [-0.1, 2.5, 6.9], look: [-0.1, 0.25, 0], fov: 48}, f, 0.05);
  return (
    <AbsoluteFill>
      <World s={{t, cam, sky: 'sunset', bloom, rod: 1, sam: {apt: 1, books: 1, plant: 1, oldcar: 1, gray: 0, glint: 0}, jake: {car: 0, floors: [0, 0, 0], roof: 0, pool: 0}, twins: {jake: [-1.45, 0, 0.4], sam: [1.0, 0, 0.0], rotY: 2.3, rotJ: 0, sitJ: 1}, roots: 0}} />
      <TiltShift />
      {/* lado de Jake: frío y apagado */}
      <div style={{position: 'absolute', left: 0, top: 0, width: split, height: 1920, background: 'rgba(25,35,70,0.55)'}} />
      <div style={{position: 'absolute', left: split - 6, top: 0, width: 12, height: 1920, background: T.cream, boxShadow: '0 0 20px rgba(255,200,120,0.9)'}} />
      <Flash f={f} at={wasF} amt={0.3} color="#FFE0B2" />
      <ToyTitle scene={scene} accent={T.yellow} />
      <div style={{opacity: 0}}>{dur}</div>
    </AbsoluteFill>
  );
};

// Silueta de una persona mirando el celular (el espectador).
export const Viewer: React.FC<{x: number; y: number; s: number; opacity: number; glow: number; split?: number}> = ({x, y, s, opacity, glow, split = 0}) => (
  <svg width={W} height={1920} style={{position: 'absolute', inset: 0, opacity}}>
    <defs>
      <radialGradient id="phoneGlow">
        <stop offset="0" stopColor="#DFF3FF" stopOpacity={0.95} />
        <stop offset="1" stopColor="#DFF3FF" stopOpacity={0} />
      </radialGradient>
    </defs>
    {[-1, 1].map((side) => (
      <g key={side} transform={`translate(${x + side * split * 120} ${y}) scale(${s})`} opacity={split > 0 ? 1 : side > 0 ? 1 : 0}>
        <path d="M-150 330 C-150 200 -110 140 -40 125 L40 125 C110 140 150 200 150 330 Z" fill="#0E1424" />
        <ellipse cx={0} cy={40} rx={78} ry={92} transform="rotate(14)" fill="#0E1424" />
        <path d="M-20 110 L30 110 L36 140 L-26 140 Z" fill="#0E1424" />
        {/* brazos hacia el celular */}
        <path d="M-120 230 C-80 200 -30 190 10 175 L22 196 C-20 215 -70 230 -100 260 Z" fill="#141B30" />
        <rect x={6} y={150} width={46} height={78} rx={8} transform="rotate(-24 29 189)" fill="#BFE6FF" />
        <ellipse cx={30} cy={120} rx={110} ry={90} fill="url(#phoneGlow)" opacity={glow * 0.6} />
      </g>
    ))}
  </svg>
);

// ---------------- 10) Nunca hubo dos hermanos ----------------
export const S10: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const neverF = wordFrame(scene, fps, 'never', 1, 'start', 0.62);
  const turn = lerp(f, 4, Math.round(dur * 0.35), 0, 1, inOut);
  const meet = lerp(f, Math.round(dur * 0.3), neverF, 0, 1, inOut);
  const fz = Math.min(f, neverF);
  const cam = mixCam({pos: [0, 0.95, 4.7], look: [0, 0.45, 1.55], fov: 34}, {pos: [0, 0.62, 2.95], look: [0, 0.45, 1.55], fov: 34}, inOut(fz / Math.max(1, neverF)));
  const x = 0.62 * (1 - meet);
  const dark = lerp(f, neverF - 6, neverF, 0, 1, (q) => q);
  const sil = lerp(f, neverF, neverF + 8, 0, 1, (q) => q);
  return (
    <AbsoluteFill>
      <World s={{t: fz / fps, cam, twins: {jake: [-x, 0, 1.55], sam: [x, 0, 1.55], rotY: Math.PI * (1 - turn) + (1 - meet) * 0.0, dark, opacity: 1 - sil}}} />
      <TiltShift />
      <AbsoluteFill style={{background: `rgba(255,246,230,${0.55 * sil})`}} />
      <Viewer x={540} y={720} s={1.7} opacity={sil} glow={sil} />
      <Flash f={f} at={neverF} amt={0.6} />
      <ToyTitle scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 11) Sos vos, cada día de cobro. ¿Qué hermano sos? (vuelve el cuadro 0) ----------------
export const S11: React.FC<P> = ({scene, dur}) => {
  const {f, fps} = useLocal();
  const fl = f + 1 - dur;
  const tl = fl / fps;
  const settle = Math.round(dur * 0.55);
  const splitK = lerp(f, 4, Math.round(dur * 0.25), 0, 1, inOut);
  const back = lerp(f, Math.round(dur * 0.12), settle, 0, 1, inOut);
  const start: WorldState['cam'] = {pos: [0, 0.62, 2.95], look: [0, 0.45, 1.55], fov: 34};
  const headOut = lerp(f, dur - 14, dur - 4, 1, 0);
  if (f >= settle) {
    return (
      <AbsoluteFill>
        <Frame0 t={tl} />
        <ToyTitle scene={scene} opacity={headOut} />
      </AbsoluteFill>
    );
  }
  const jx = TWINS0.jake[0] * splitK;
  return (
    <AbsoluteFill>
      <World s={{t: tl, cam: mixCam(start, FRAME0_CAM, back), cases: {y: caseY(tl), open: 0}, twins: {jake: [jx, 0, 1.55], sam: [-jx, 0, 1.55], rotY: 0, dark: 1 - splitK, opacity: splitK > 0.05 ? 1 : 0}}} />
      <TiltShift />
      <AbsoluteFill style={{background: `rgba(255,246,230,${0.55 * (1 - splitK)})`}} />
      <Viewer x={540} y={720} s={1.7} opacity={1 - splitK} glow={1 - splitK} split={splitK} />
      <ToyTitle scene={scene} opacity={headOut} />
    </AbsoluteFill>
  );
};

export {CASES, hash};
