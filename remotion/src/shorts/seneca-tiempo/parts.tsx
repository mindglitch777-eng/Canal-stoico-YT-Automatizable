// Piezas visuales propias de "seneca-tiempo": oscuridad, luz fría de pantalla, glitch digital.
// El oro aparece SOLO para el tiempo de vida (arena, horas, años).
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {parseEmphasis} from '../../anim';
import {hash, rng, syncTokens} from '../../director';
import {KineticText} from '../../kinetic';
import {font, W} from '../../theme';
import type {Scene} from '../../types';

export const C = {
  bg: '#02050A',
  deep: '#06101E',
  blue: '#2E7BFF',
  cyan: '#7FE3FF',
  ice: '#EAF6FF',
  red: '#FF3B5C',
  gold: '#FFC24A',
  goldHot: '#FFE29A',
};

// ---------- texto ----------
const coldText: React.CSSProperties = {
  color: C.ice,
  textShadow: `2px 0 0 rgba(255,59,92,0.55), -2px 0 0 rgba(127,227,255,0.6), 0 0 26px rgba(80,160,255,0.55), 0 6px 18px rgba(0,0,0,0.9)`,
};
export const timeGold = (frame: number, i: number): React.CSSProperties => ({
  color: C.goldHot,
  textShadow: `0 0 ${18 + 10 * Math.abs(Math.sin(frame / 7 + i))}px rgba(255,190,70,0.95), 0 0 60px rgba(255,160,40,0.6), 0 5px 0 #6E4708`,
});
export const alertRed = (): React.CSSProperties => ({
  color: '#FF5C77',
  textShadow: '0 0 22px rgba(255,59,92,0.9), 3px 0 0 rgba(127,227,255,0.5), 0 5px 0 #4A0012',
});

// Titular en una "tarjeta" de vidrio oscuro (placa) con borde de luz fría. Texto de sistema (Inter).
export const Headline: React.FC<{
  scene: Scene;
  text?: string;
  top?: number;
  size?: number;
  accent?: (frame: number, i: number) => React.CSSProperties;
  entry?: 'slam' | 'rise' | 'flip' | 'mask';
  opacity?: number;
}> = ({scene, text, top = 200, size = 108, accent = timeGold, entry = 'slam', opacity = 1}) => {
  const t = text ?? (typeof (scene as {onScreen?: unknown}).onScreen === 'string' ? ((scene as {onScreen?: string}).onScreen as string) : '');
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // la placa aparece recién con la primera palabra (nunca una placa vacía)
  const tokens = t.split('\n').flatMap((l) => parseEmphasis(l)).map((x) => x.word);
  const first = Math.max(0, Math.round((syncTokens(tokens, scene.words, 1.6)[0] ?? 0) * fps) - 3);
  const plate = Math.max(0, Math.min(1, (frame - first) / 4));
  if (plate <= 0) return null;
  return (
    <div style={{position: 'absolute', top, left: 70, width: W - 190, display: 'flex', justifyContent: 'center', zIndex: 8, opacity: opacity * plate, transform: `scale(${0.92 + 0.08 * plate})`}}>
      <div style={{padding: '22px 34px 28px', borderRadius: 30, background: 'linear-gradient(180deg, rgba(4,10,20,0.88), rgba(4,10,20,0.72))', border: '2px solid rgba(127,227,255,0.35)', textAlign: 'center'}}>
        <KineticText
          text={t}
          words={scene.words}
          entry={entry}
          lead={3}
          style={{fontFamily: font.sans, fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: '-0.03em'}}
          accentStyle={accent}
          plainStyle={coldText}
          goldScale={1.18}
        />
      </div>
    </div>
  );
};

// ---------- celular ----------
export const Phone: React.FC<{x: number; y: number; w?: number; on?: number; screen?: React.ReactNode; glow?: number; rot?: number}> = ({
  x,
  y,
  w = 300,
  on = 1,
  screen,
  glow = 1,
  rot = 0,
}) => {
  const h = w * 2.05;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg)`}}>
      {/* halo de luz fría (degradé radial, sin blur) */}
      <div style={{position: 'absolute', left: -w * 0.9, top: -h * 0.5, width: w * 2.8, height: h * 2, background: `radial-gradient(ellipse at 50% 50%, rgba(70,150,255,${0.38 * on * glow}) 0%, rgba(40,110,255,${0.12 * on * glow}) 35%, transparent 65%)`}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: w * 0.16, background: 'linear-gradient(135deg, #2A3442, #0B0F15 60%, #39424F)', padding: w * 0.04}}>
        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.13, overflow: 'hidden', background: on > 0.01 ? `linear-gradient(170deg, rgba(40,110,255,${on}), rgba(10,30,90,${on}) 55%, rgba(120,200,255,${on * 0.8}))` : '#030405'}}>
          {screen}
          <div style={{position: 'absolute', left: '35%', top: '2%', width: '30%', height: '3.5%', borderRadius: 20, background: '#05070A'}} />
          {/* reflejo del vidrio */}
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, transparent 35%, transparent 70%, rgba(255,255,255,0.06) 100%)'}} />
        </div>
      </div>
    </div>
  );
};

// ---------- tarjeta de notificación ----------
const APPS: Array<{c: string; g: string}> = [
  {c: '#FF3B5C', g: '♥'},
  {c: '#2E7BFF', g: '✉'},
  {c: '#25D366', g: '●'},
  {c: '#FFB020', g: '★'},
  {c: '#8A5CFF', g: '▶'},
  {c: '#FF6A3D', g: '%'},
];
const MSGS = ['New message', 'Someone liked your post', 'Sale ends in 2h', '3 new videos for you', 'You were mentioned', 'Your streak is at risk', 'Flash deal: 70% off', 'Live now'];
export const Notif: React.FC<{i: number; w?: number; style?: React.CSSProperties}> = ({i, w = 420, style}) => {
  const a = APPS[i % APPS.length];
  return (
    <div style={{width: w, padding: '14px 18px', borderRadius: 22, background: 'rgba(235,244,255,0.94)', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 14px 30px rgba(0,0,0,0.55)', fontFamily: font.sans, ...style}}>
      <div style={{width: 54, height: 54, borderRadius: 14, background: a.c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, flexShrink: 0}}>{a.g}</div>
      <div style={{minWidth: 0}}>
        <div style={{fontSize: 20, fontWeight: 800, color: '#0A1422', letterSpacing: '0.02em'}}>NOW</div>
        <div style={{fontSize: 26, fontWeight: 600, color: '#14202E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{MSGS[i % MSGS.length]}</div>
      </div>
    </div>
  );
};

// ---------- reloj de arena de píxeles ----------
// p: 0 = arriba lleno, 1 = todo abajo. Arena de oro (el tiempo), vidrio de píxeles fríos.
export const PixelHourglass: React.FC<{x: number; y: number; cell?: number; p: number; t: number; frozen?: boolean; empty?: boolean}> = ({x, y, cell = 22, p, t, frozen = false, empty = false}) => {
  const rows = 26;
  const half = rows / 2;
  const widthAt = (r: number) => Math.max(1, Math.round((r < half ? half - r : r - half + 1) * 0.95));
  // celdas de cada mitad, ordenadas desde donde se apoya la arena
  const top: Array<[number, number]> = [];
  for (let r = half - 1; r >= 0; r--) for (let c = -widthAt(r); c < widthAt(r); c++) top.push([r, c]);
  const bot: Array<[number, number]> = [];
  for (let r = rows - 1; r >= half; r--) for (let c = -widthAt(r); c < widthAt(r); c++) bot.push([r, c]);
  const total = top.length;
  const topN = empty ? 0 : Math.round(total * (1 - p));
  const botN = empty ? 0 : Math.min(bot.length, Math.round(total * p));
  const sandSet = new Set<string>();
  top.slice(0, topN).forEach(([r, c]) => sandSet.add(`${r}:${c}`));
  bot.slice(0, botN).forEach(([r, c]) => sandSet.add(`${r}:${c}`));
  const cells = [...top, ...bot].map(([r, c]) => {
    const sand = sandSet.has(`${r}:${c}`);
    return (
      <rect
        key={`${r}:${c}`}
        x={c * cell}
        y={r * cell}
        width={cell - 3}
        height={cell - 3}
        rx={3}
        fill={sand ? (hash(r * 31 + c + Math.floor(t * 8)) > 0.85 ? C.goldHot : C.gold) : 'rgba(127,227,255,0.07)'}
        stroke={sand ? 'none' : 'rgba(127,227,255,0.22)'}
        strokeWidth={1}
      />
    );
  });
  const stream: React.ReactNode[] = [];
  if (!empty && p > 0.001 && p < 0.999) {
    for (let k = 0; k < 6; k++) {
      const yy = ((((frozen ? 0 : t) * 2.2 + k / 6) % 1) + 1) % 1;
      stream.push(<rect key={k} x={-cell / 2 + 1} y={half * cell + yy * (half - 2) * cell} width={cell - 3} height={cell - 3} rx={3} fill={C.goldHot} />);
    }
  }
  return (
    <svg width={W} height={rows * cell + 40} style={{position: 'absolute', left: x - W / 2, top: y - (rows * cell) / 2, overflow: 'visible'}}>
      <g transform={`translate(${W / 2} 0)`}>
        <rect x={-14 * cell} y={-cell} width={28 * cell} height={cell * 0.7} rx={6} fill="rgba(127,227,255,0.35)" />
        <rect x={-14 * cell} y={rows * cell + 4} width={28 * cell} height={cell * 0.7} rx={6} fill="rgba(127,227,255,0.35)" />
        {cells}
        {stream}
      </g>
    </svg>
  );
};

// ---------- silueta de perfil (mira a la derecha), iluminada por la pantalla ----------
export const PROFILE =
  'M60 420 C70 360 96 330 120 318 C104 300 96 270 98 240 C92 236 90 226 96 220 C92 200 96 170 112 146 ' +
  'C130 116 168 98 206 100 C250 102 284 128 296 168 C302 186 302 204 300 216 C310 232 318 246 322 258 ' +
  'C324 264 318 268 310 268 C312 276 310 282 304 284 C308 290 306 298 300 300 C304 312 298 324 284 328 ' +
  'C266 334 250 334 236 332 C232 346 234 360 242 372 C290 384 330 400 352 420 Z';
export const Person: React.FC<{x: number; y: number; scale?: number; light?: string; lightAmt?: number; flip?: boolean; gray?: number}> = ({
  x,
  y,
  scale = 1,
  light = C.cyan,
  lightAmt = 1,
  flip = false,
  gray = 0,
}) => {
  const id = `pg${Math.round(x)}${Math.round(y)}${light.slice(1)}`;
  return (
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <defs>
        <linearGradient id={id} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor={light} stopOpacity={0.85 * lightAmt} />
          <stop offset="0.35" stopColor="#0B1422" stopOpacity={1} />
          <stop offset="1" stopColor="#03060B" />
        </linearGradient>
      </defs>
      <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale}) translate(-200 -420)`} opacity={1 - gray * 0.3}>
        <path d={PROFILE} fill={`url(#${id})`} stroke={light} strokeOpacity={0.55 * lightAmt} strokeWidth={3} />
      </g>
    </svg>
  );
};

// ---------- mano (silueta plana con luz de borde) ----------
export const Hand: React.FC<{x: number; y: number; scale?: number; rot?: number; open?: boolean; flip?: boolean; color?: string}> = ({x, y, scale = 1, rot = 0, open = true, flip = false, color = '#0E1A2B'}) => (
  <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -scale : scale} ${scale})`} fill={color} stroke={C.cyan} strokeOpacity={0.6} strokeWidth={3}>
      <rect x={-200} y={-46} width={150} height={92} rx={30} />
      <rect x={-70} y={-62} width={120} height={124} rx={36} />
      {(open ? [-48, -16, 16, 48] : [-36, -12, 12, 36]).map((dy, k) => (
        <rect key={k} x={36} y={dy - 14} width={open ? 92 - Math.abs(dy) * 0.5 : 46} height={28} rx={14} />
      ))}
      <rect x={-10} y={open ? -96 : -74} width={30} height={open ? 70 : 40} rx={15} transform={open ? 'rotate(-35 5 -60)' : undefined} />
    </g>
  </svg>
);

// ---------- billete de $100 (grabado frío, sin imitar un billete real) ----------
export const Bill: React.FC<{x: number; y: number; w?: number; rot?: number}> = ({x, y, w = 360, rot = 0}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w * 0.21, width: w, height: w * 0.42, transform: `rotate(${rot}deg)`, borderRadius: 8, background: 'linear-gradient(135deg, #B9D6C4, #7FA892 55%, #A9C9B6)', border: '3px solid #36584A', boxShadow: '0 16px 30px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', fontFamily: font.serif, fontWeight: 700, color: '#1E3A2E'}}>
    <span style={{fontSize: w * 0.17}}>100</span>
    <span style={{width: w * 0.26, height: w * 0.26, borderRadius: '50%', border: '3px solid #36584A', background: 'radial-gradient(circle, #9DBFAA, #6F977F)'}} />
    <span style={{fontSize: w * 0.17}}>100</span>
  </div>
);

// ---------- glitch por franjas ----------
export const GlitchBars: React.FC<{f: number; amount: number; seed?: number}> = ({f, amount, seed = 1}) => {
  if (amount <= 0.02) return null;
  const r = rng(seed * 1000 + Math.floor(f / 2));
  return (
    <svg width={W} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {Array.from({length: 7}, (_, k) => {
        const y = r() * 1920;
        const h = 6 + r() * 60 * amount;
        const dx = (r() - 0.5) * 160 * amount;
        return <rect key={k} x={dx} y={y} width={W} height={h} fill={k % 2 ? 'rgba(127,227,255,0.35)' : 'rgba(255,59,92,0.3)'} />;
      })}
    </svg>
  );
};

// Pantalla fría: barrido de líneas + viñeta azul (propio de este video).
export const ScreenFX: React.FC<{f: number; warm?: number}> = ({f, warm = 0}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 2px, transparent 2px, transparent 5px)', backgroundPosition: `0 ${((f % 5) + 5) % 5}px`, pointerEvents: 'none'}} />
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 85% 65% at 50% 45%, transparent 45%, ${warm > 0.5 ? 'rgba(20,8,0,0.85)' : 'rgba(0,4,12,0.88)'} 100%)`, pointerEvents: 'none'}} />
  </>
);

// Partículas de arena dorada a lo largo de una curva (de -> a), periódicas en el tiempo (sirve para el loop).
export const SandStream: React.FC<{from: [number, number]; to: [number, number]; bend?: number; t: number; n?: number; speed?: number; frozen?: boolean; size?: number}> = ({
  from,
  to,
  bend = -160,
  t,
  n = 40,
  speed = 0.8,
  frozen = false,
  size = 12,
}) => {
  const [x0, y0] = from;
  const [x1, y1] = to;
  const mx = (x0 + x1) / 2 + bend;
  const my = (y0 + y1) / 2 - Math.abs(bend) * 0.4;
  return (
    <svg width={W} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>
      {Array.from({length: n}, (_, k) => {
        const u = ((((frozen ? 0 : t) * speed + k / n) % 1) + 1) % 1;
        const px = (1 - u) ** 2 * x0 + 2 * (1 - u) * u * mx + u * u * x1 + (hash(k) - 0.5) * 30;
        const py = (1 - u) ** 2 * y0 + 2 * (1 - u) * u * my + u * u * y1 + (hash(k + 50) - 0.5) * 30;
        const s = size * (0.6 + hash(k + 9) * 0.6);
        return <rect key={k} x={px - s / 2} y={py - s / 2} width={s} height={s} rx={2} fill={k % 4 ? C.gold : C.goldHot} opacity={0.95} />;
      })}
    </svg>
  );
};
