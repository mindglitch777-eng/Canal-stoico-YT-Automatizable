// Piezas de "elegido-por-vos": dos capas (publicidad brillante / plano técnico), baldes, mano, hilos, marcas en rojo.
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {parseEmphasis} from '../../anim';
import {hash, syncTokens} from '../../director';
import {KineticText} from '../../kinetic';
import {font, H, W} from '../../theme';
import type {Scene} from '../../types';

export const B = {
  navy: '#0B2545',
  navy2: '#13315C',
  cyan: '#5BC0EB',
  cyanHot: '#B8ECFF',
  red: '#FF3B3B',
  redInk: '#E8202A',
  white: '#F4FAFF',
  cinemaRed: '#C8102E',
  cinemaDeep: '#5A0614',
  gold: '#FFC23A',
  cream: '#FFF4DC',
  skin: '#E9B48C',
  skinDark: '#C88B64',
};

// ---------------- fondos ----------------
// Plano técnico: azul marino con cuadrícula cian.
export const Blueprint: React.FC<{opacity?: number}> = ({opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      opacity,
      background: `radial-gradient(ellipse at 50% 40%, ${B.navy2} 0%, ${B.navy} 70%)`,
      backgroundImage: `linear-gradient(rgba(91,192,235,0.18) 2px, transparent 2px), linear-gradient(90deg, rgba(91,192,235,0.18) 2px, transparent 2px), linear-gradient(rgba(91,192,235,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(91,192,235,0.07) 1px, transparent 1px), radial-gradient(ellipse at 50% 40%, ${B.navy2} 0%, ${B.navy} 70%)`,
      backgroundSize: '120px 120px, 120px 120px, 24px 24px, 24px 24px, 100% 100%',
    }}
  />
);

// Cine brillante: cortinado rojo, marquesina de focos que corren, mostrador.
export const Cinema: React.FC<{t: number; dim?: number}> = ({t, dim = 0}) => (
  <div style={{position: 'absolute', inset: 0, filter: dim ? `saturate(${1 - dim * 0.6}) brightness(${1 - dim * 0.3})` : undefined}}>
    <div style={{position: 'absolute', inset: 0, background: `repeating-linear-gradient(90deg, ${B.cinemaDeep} 0px, ${B.cinemaRed} 45px, ${B.cinemaDeep} 90px)`}} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, rgba(255,210,120,0.55) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)'}} />
    {/* marquesina */}
    <div style={{position: 'absolute', left: 60, top: 470, width: W - 120, height: 120, background: 'linear-gradient(180deg, #2A1206, #120600)', border: `6px solid ${B.gold}`, borderRadius: 16}}>
      {Array.from({length: 22}, (_, i) => {
        const on = (i + Math.floor(t * 10)) % 3 === 0;
        return <div key={i} style={{position: 'absolute', left: 12 + i * 43.5, top: -4, width: 18, height: 18, borderRadius: 9, background: on ? '#FFF4C2' : '#7A5A1A', boxShadow: on ? '0 0 14px #FFD36A' : undefined}} />;
      })}
      {Array.from({length: 22}, (_, i) => {
        const on = (i + Math.floor(t * 10)) % 3 === 1;
        return <div key={i} style={{position: 'absolute', left: 12 + i * 43.5, bottom: -4, width: 18, height: 18, borderRadius: 9, background: on ? '#FFF4C2' : '#7A5A1A', boxShadow: on ? '0 0 14px #FFD36A' : undefined}} />;
      })}
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 60, letterSpacing: '0.18em', color: '#FFE7A3', textShadow: '0 0 18px rgba(255,200,90,0.9)'}}>SNACKS</div>
    </div>
    {/* mostrador */}
    <div style={{position: 'absolute', left: 0, top: 1210, width: W, height: 710, background: 'linear-gradient(180deg, #F4E1B5 0%, #C99A4A 8%, #6E3B10 9%, #3A1A05 100%)'}} />
  </div>
);

// ---------------- balde de pochoclo ----------------
export const Bucket: React.FC<{x: number; y: number; w: number; h: number; mode?: 'bright' | 'blue'; t?: number; glow?: number; hollow?: number}> = ({x, y, w, h, mode = 'bright', t = 0, glow = 0, hollow = 0}) => {
  // (x, y) = centro de la base
  const top = w * 0.5;
  const bot = w * 0.36;
  const id = `b${Math.round(x)}${Math.round(w)}${mode}`;
  const blue = mode === 'blue';
  const stroke = blue ? B.cyan : '#7A0A1A';
  const kernels = Array.from({length: Math.round(w / 9)}, (_, i) => {
    const kx = -top * 0.92 + (i / Math.max(1, Math.round(w / 9) - 1)) * top * 1.84;
    const ky = -h - 10 - Math.abs(Math.sin(i * 2.3)) * w * 0.12 - (1 - Math.abs(kx) / top) * w * 0.1;
    const pop = Math.max(0, Math.sin(t * 6 + i * 1.7)) ** 8; // saltitos periódicos
    return {kx, ky: ky - pop * 18, r: w * (0.055 + 0.02 * hash(i))};
  });
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <path d={`M${x - top} ${y - h} L${x + top} ${y - h} L${x + bot} ${y} L${x - bot} ${y} Z`} />
        </clipPath>
      </defs>
      {glow > 0 ? <ellipse cx={x} cy={y - h / 2} rx={w * 0.9} ry={h * 0.85} fill={blue ? 'rgba(91,192,235,0.25)' : 'rgba(255,220,120,0.55)'} opacity={glow} /> : null}
      {/* pochoclo */}
      {hollow < 1
        ? kernels.map((k, i) => (
            <circle key={i} cx={x + k.kx} cy={y + k.ky} r={k.r} fill={blue ? 'none' : i % 3 ? '#FFF6D8' : '#FFE9A8'} stroke={blue ? B.cyan : '#D9B76A'} strokeWidth={blue ? 2.5 : 2} opacity={1 - hollow} />
          ))
        : null}
      <g clipPath={`url(#${id})`}>
        {blue ? (
          <rect x={x - top} y={y - h} width={top * 2} height={h} fill="rgba(11,37,69,0.6)" />
        ) : (
          Array.from({length: 7}, (_, i) => <rect key={i} x={x - top + (i * top * 2) / 7} y={y - h} width={top / 7} height={h} fill={B.cinemaRed} />)
        )}
        {!blue ? <rect x={x - top} y={y - h} width={top * 2} height={h} fill="url(#none)" /> : null}
      </g>
      {!blue ? <path d={`M${x - top} ${y - h} L${x + top} ${y - h} L${x + bot} ${y} L${x - bot} ${y} Z`} fill="none" stroke={stroke} strokeWidth={5} /> : null}
      {!blue ? <rect x={x - top} y={y - h} width={top * 2} height={h} fill="none" /> : null}
      {blue ? <path d={`M${x - top} ${y - h} L${x + top} ${y - h} L${x + bot} ${y} L${x - bot} ${y} Z`} fill="none" stroke={B.cyan} strokeWidth={4} strokeDasharray={hollow > 0 ? '14 8' : undefined} /> : null}
      {/* fondo blanco del balde (franja con el texto) */}
      {!blue ? <rect x={x - bot * 0.9} y={y - h * 0.42} width={bot * 1.8} height={h * 0.2} rx={6} fill="#FFFFFF" opacity={0.92} /> : null}
      {!blue ? (
        <text x={x} y={y - h * 0.27} textAnchor="middle" fontFamily="Inter, Arial" fontWeight={900} fontSize={h * 0.12} fill={B.cinemaRed}>
          POPCORN
        </text>
      ) : null}
    </svg>
  );
};

// ---------------- la mano que agarra el balde ----------------
// grip 0: abierta (lejos), 1: agarrando. (x, y): donde se cierran los dedos.
export const Hand: React.FC<{x: number; y: number; s?: number; grip?: number; mode?: 'bright' | 'blue'; reach?: number}> = ({x, y, s = 1, grip = 1, mode = 'bright', reach = 0}) => {
  const blue = mode === 'blue';
  const fill = blue ? 'rgba(11,37,69,0.75)' : B.skin;
  const stroke = blue ? B.cyan : B.skinDark;
  const sw = blue ? 4 : 3;
  const curl = grip;
  const fingers = [0, 1, 2, 3].map((i) => {
    const fy = -70 + i * 46;
    const len = 150 - Math.abs(i - 1.2) * 22;
    return {fy, len: len * (1 - curl * 0.25), rot: -6 + i * 4 - curl * 10};
  });
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <g transform={`translate(${x + reach} ${y}) scale(${s})`}>
        {/* manga */}
        <path d="M150 -110 L560 -60 L560 170 L150 120 Z" fill={blue ? 'rgba(11,37,69,0.8)' : '#1E2A44'} stroke={blue ? B.cyan : '#0F172A'} strokeWidth={sw} />
        <path d="M130 -115 L180 -110 L180 125 L130 120 Z" fill={blue ? 'none' : '#F2F2F2'} stroke={blue ? B.cyan : '#BBB'} strokeWidth={sw} />
        {/* palma */}
        <path d="M-10 -95 C60 -120 130 -100 140 -60 L140 90 C120 130 40 140 -10 110 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
        {/* dedos que envuelven el balde (hacia la izquierda) */}
        {fingers.map((fg, i) => (
          <g key={i} transform={`translate(0 ${fg.fy}) rotate(${fg.rot})`}>
            <rect x={-fg.len} y={-19} width={fg.len + 20} height={38} rx={19} fill={fill} stroke={stroke} strokeWidth={sw} />
            <path d={`M${-fg.len + 30} -8 L${-fg.len + 30} 8`} stroke={stroke} strokeWidth={2} opacity={0.6} />
            <ellipse cx={-fg.len + 12} cy={-4} rx={10} ry={7} fill={blue ? 'none' : '#F7D2BA'} stroke={blue ? B.cyan : 'none'} strokeWidth={2} />
          </g>
        ))}
        {/* pulgar */}
        <g transform={`translate(40 -100) rotate(${-50 + curl * 20})`}>
          <rect x={-110} y={-20} width={130} height={40} rx={20} fill={fill} stroke={stroke} strokeWidth={sw} />
        </g>
      </g>
    </svg>
  );
};

// Puntas de los dedos (para atar los hilos de marioneta).
export const fingertips = (x: number, y: number, s: number, reach = 0) =>
  [0, 1, 2, 3].map((i) => {
    const len = (150 - Math.abs(i - 1.2) * 22) * 0.75;
    return [x + reach - len * s + 14 * s, y + (-70 + i * 46) * s] as [number, number];
  });

// Hilos de marioneta desde el techo hasta los dedos. slack 0: tensos, 1: flojos y caídos.
export const Strings: React.FC<{tips: Array<[number, number]>; appear?: number; slack?: number; color?: string; f: number}> = ({tips, appear = 1, slack = 0, color = B.cyan, f}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    {/* cruz de control arriba */}
    <g opacity={appear}>
      <rect x={300} y={80 - slack * 200} width={480} height={18} rx={9} fill="none" stroke={color} strokeWidth={4} />
      <rect x={531} y={20 - slack * 200} width={18} height={140} rx={9} fill="none" stroke={color} strokeWidth={4} />
    </g>
    {tips.map(([tx, ty], i) => {
      const sx = 330 + i * 140;
      const sy = 90 - slack * 200;
      const len = (ty - sy) * appear;
      const ey = sy + len;
      const ex = sx + (tx - sx) * appear;
      const sag = slack * 420 + Math.sin(f * 0.1 + i) * 6 * (1 - slack);
      const midX = (sx + ex) / 2 + slack * (i - 1.5) * 60;
      const midY = (sy + ey) / 2 + sag;
      return <path key={i} d={`M${sx} ${sy} Q${midX} ${midY} ${ex} ${ey + slack * 300}`} fill="none" stroke={color} strokeWidth={4} opacity={0.95 * (1 - slack * 0.4)} />;
    })}
  </svg>
);

// ---------------- marcas en rojo (marcador) ----------------
export const RedCircle: React.FC<{x: number; y: number; rx: number; ry: number; p: number; w?: number}> = ({x, y, rx, ry, p, w = 10}) => {
  const len = Math.PI * 2 * Math.sqrt((rx * rx + ry * ry) / 2) * 1.15;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible', zIndex: 9}}>
      <path
        d={`M${x - rx} ${y} C${x - rx} ${y - ry * 1.3} ${x + rx * 1.1} ${y - ry * 1.2} ${x + rx} ${y} C${x + rx * 0.95} ${y + ry * 1.25} ${x - rx * 1.05} ${y + ry * 1.2} ${x - rx * 0.95} ${y - ry * 0.25}`}
        fill="none"
        stroke={B.red}
        strokeWidth={w}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - p)}
        style={{filter: 'drop-shadow(0 0 6px rgba(255,59,59,0.6))'}}
      />
    </svg>
  );
};
export const RedArrow: React.FC<{x1: number; y1: number; x2: number; y2: number; p: number; bend?: number}> = ({x1, y1, x2, y2, p, bend = 80}) => {
  const mx = (x1 + x2) / 2 + bend;
  const my = (y1 + y2) / 2 - bend * 0.3;
  const ang = Math.atan2(y2 - my, x2 - mx);
  const L = 900;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible', zIndex: 9}}>
      <path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} fill="none" stroke={B.red} strokeWidth={10} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} />
      {p > 0.95 ? (
        <path d={`M${x2 - 44 * Math.cos(ang - 0.5)} ${y2 - 44 * Math.sin(ang - 0.5)} L${x2} ${y2} L${x2 - 44 * Math.cos(ang + 0.5)} ${y2 - 44 * Math.sin(ang + 0.5)}`} fill="none" stroke={B.red} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
    </svg>
  );
};
// Nota escrita a mano en rojo, sobre una placa clara para que se lea.
export const RedNote: React.FC<{text: string; x: number; y: number; size?: number; rot?: number; p?: number}> = ({text, x, y, size = 64, rot = -4, p = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${0.6 + 0.4 * Math.min(1, p)})`, opacity: Math.min(1, p * 2), zIndex: 9, padding: '6px 18px', background: 'rgba(255,255,255,0.94)', borderRadius: 10, border: `4px solid ${B.red}`, fontFamily: font.sans, fontWeight: 900, fontStyle: 'italic', fontSize: size, color: B.redInk, whiteSpace: 'nowrap', letterSpacing: '0.02em'}}>
    {text}
  </div>
);

// Cota de plano (línea con topes y medida).
export const Dim: React.FC<{x1: number; y1: number; x2: number; y2: number; label: string; p?: number}> = ({x1, y1, x2, y2, label, p = 1}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: p}}>
    <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={B.cyanHot} strokeWidth={3} />
    <line x1={x1} y1={y1 - 14} x2={x1} y2={y1 + 14} stroke={B.cyanHot} strokeWidth={3} />
    <line x1={x2} y1={y2 - 14} x2={x2} y2={y2 + 14} stroke={B.cyanHot} strokeWidth={3} />
    <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 16} textAnchor="middle" fontFamily="Inter, Arial" fontWeight={700} fontSize={30} fill={B.cyanHot}>
      {label}
    </text>
  </svg>
);

// Barrido que "desviste" la imagen: muestra `under` desde la izquierda hasta x = p * ancho, con una línea eléctrica.
export const Sweep: React.FC<{p: number; children: React.ReactNode; f: number}> = ({p, children, f}) => {
  if (p <= 0) return null;
  const x = p * (W + 200) - 100;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, clipPath: `polygon(0 0, ${x + 80}px 0, ${x - 80}px 100%, 0 100%)`}}>{children}</div>
      {p < 1 ? (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, zIndex: 7}}>
          <path
            d={Array.from({length: 24}, (_, i) => `${i ? 'L' : 'M'}${x + 80 - (160 * i) / 23 + (hash(i + f * 7) - 0.5) * 30} ${(H * i) / 23}`).join(' ')}
            fill="none"
            stroke={B.cyanHot}
            strokeWidth={8}
            style={{filter: 'drop-shadow(0 0 16px #5BC0EB) drop-shadow(0 0 30px #5BC0EB)'}}
          />
        </svg>
      ) : null}
    </>
  );
};

// ---------------- precio de neón ----------------
export const NeonPrice: React.FC<{x: number; y: number; text: string; on: number; f: number; size?: number; hot?: boolean}> = ({x, y, text, on, f, size = 110, hot = false}) => {
  if (on <= 0) return null;
  const flick = on < 1 ? (hash(Math.floor(f)) > 0.4 ? 1 : 0.35) : 1;
  const col = hot ? '#FFF27A' : '#FFFFFF';
  const glow = hot ? 'rgba(255,220,60,0.95)' : 'rgba(255,80,120,0.9)';
  return (
    <div style={{position: 'absolute', left: x, top: y - (1 - Math.min(1, on)) * 200, transform: 'translate(-50%,-50%)', padding: '6px 26px', border: `6px solid ${col}`, borderRadius: 20, boxShadow: `0 0 26px ${glow}, inset 0 0 18px ${glow}`, background: 'rgba(20,0,10,0.75)', opacity: flick, fontFamily: font.sans, fontWeight: 900, fontSize: size, color: col, textShadow: `0 0 20px ${glow}`, whiteSpace: 'nowrap'}}>
      {text}
    </div>
  );
};

// ---------------- título (placa de plano técnico) ----------------
export const accentRed = (): React.CSSProperties => ({color: '#FF5A5A', textShadow: '0 0 18px rgba(255,59,59,0.7), 0 4px 0 #000'}) as React.CSSProperties;
const plainWhite: React.CSSProperties = {color: B.white, textShadow: '0 4px 0 rgba(0,0,0,0.6)'};
export const PlanTitle: React.FC<{scene: Scene; top?: number; size?: number; opacity?: number; bright?: boolean}> = ({scene, top = 180, size = 100, opacity = 1, bright = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const text = typeof (scene as {onScreen?: unknown}).onScreen === 'string' ? ((scene as {onScreen?: string}).onScreen as string) : '';
  const tokens = text.split('\n').flatMap((l) => parseEmphasis(l)).map((x) => x.word);
  const first = Math.max(0, Math.round((syncTokens(tokens, scene.words, 1.6)[0] ?? 0) * fps) - 3);
  const k = Math.max(0, Math.min(1, (frame - first) / 4));
  if (k <= 0 || !text) return null;
  return (
    <div style={{position: 'absolute', top, left: 60, width: W - 180, display: 'flex', justifyContent: 'center', zIndex: 8, opacity: opacity * k}}>
      <div style={{padding: '18px 36px 24px', background: bright ? 'rgba(40,0,8,0.88)' : 'rgba(6,20,40,0.92)', border: `5px solid ${bright ? B.gold : B.cyan}`, borderRadius: 14, boxShadow: `0 0 30px ${bright ? 'rgba(255,194,58,0.35)' : 'rgba(91,192,235,0.35)'}`, textAlign: 'center'}}>
        <KineticText text={text} words={scene.words} entry="slam" lead={3} style={{fontFamily: font.sans, fontWeight: 900, fontSize: size, lineHeight: 1.04, letterSpacing: '-0.01em'}} accentStyle={accentRed} plainStyle={plainWhite} goldScale={1.12} />
      </div>
    </div>
  );
};

// Teléfono (marco) alrededor de un contenido de 1080x1920.
export const Phone: React.FC<{cx: number; cy: number; s: number; children: React.ReactNode; blue?: boolean}> = ({cx, cy, s, children, blue = true}) => (
  <div style={{position: 'absolute', left: cx - (W / 2 + 46) * s, top: cy - (H / 2 + 46) * s, width: (W + 92) * s, height: (H + 92) * s, borderRadius: 120 * s, background: '#0A0F18', border: `${Math.max(3, 8 * s)}px solid ${blue ? B.cyan : '#333'}`, boxShadow: blue ? '0 0 40px rgba(91,192,235,0.45)' : undefined, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 46 * s - 4, top: 46 * s - 4, width: W, height: H, transform: `scale(${s})`, transformOrigin: '0 0', borderRadius: 80, overflow: 'hidden'}}>{children}</div>
  </div>
);
