// Piezas propias de "diogenes-rey": vasija griega de figuras negras que cobra vida.
// Terracota, negro mate con líneas incisas, grietas de cerámica y el sol como única luz.
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {parseEmphasis} from '../../anim';
import {rng, syncTokens} from '../../director';
import {KineticText} from '../../kinetic';
import {font, H, W} from '../../theme';
import type {Scene} from '../../types';

export const V = {
  clay: '#C9622B',
  clayLight: '#E3874A',
  clayDark: '#8E3A14',
  black: '#140A05',
  incise: '#D9773A',
  sun: '#FFD36B',
  sunHot: '#FFF2C2',
};

// ---------- texto: tablilla de terracota con guarda; letras negras, el sol en oro ----------
const blackText: React.CSSProperties = {color: V.black, textShadow: '0 2px 0 rgba(255,210,160,0.35)'};
export const sunText = (f: number): React.CSSProperties => ({color: V.sunHot, WebkitTextStroke: `4px ${V.black}`, paintOrder: 'stroke fill', textShadow: `0 0 ${18 + 8 * Math.sin(f / 5)}px rgba(255,200,80,0.9), 0 5px 0 ${V.black}`} as React.CSSProperties);

export const Meander: React.FC<{y: number; h?: number; color?: string}> = ({y, h = 46, color = V.black}) => {
  const u = h / 2;
  let d = '';
  for (let x = 0; x < W + u * 4; x += u * 4) {
    d += `M${x} ${y + h} L${x} ${y} L${x + u * 3} ${y} L${x + u * 3} ${y + u * 1.4} L${x + u} ${y + u * 1.4} L${x + u} ${y + u * 0.7} L${x + u * 2} ${y + u * 0.7} `;
  }
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <rect x={0} y={y - 10} width={W} height={h + 20} fill={V.clay} />
      <path d={d} fill="none" stroke={color} strokeWidth={h * 0.14} />
      <rect x={0} y={y - 10} width={W} height={4} fill={color} />
      <rect x={0} y={y + h + 6} width={W} height={4} fill={color} />
    </svg>
  );
};

export const Tablet: React.FC<{scene: Scene; text?: string; top?: number; size?: number; opacity?: number; entry?: 'slam' | 'rise' | 'flip' | 'mask'}> = ({
  scene,
  text,
  top = 210,
  size = 98,
  opacity = 1,
  entry = 'rise',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = text ?? (typeof (scene as {onScreen?: unknown}).onScreen === 'string' ? ((scene as {onScreen?: string}).onScreen as string) : '');
  const tokens = t.split('\n').flatMap((l) => parseEmphasis(l)).map((x) => x.word);
  const first = Math.max(0, Math.round((syncTokens(tokens, scene.words, 1.6)[0] ?? 0) * fps) - 3);
  const plate = Math.max(0, Math.min(1, (frame - first) / 5));
  if (plate <= 0) return null;
  return (
    <div style={{position: 'absolute', top, left: 70, width: W - 190, display: 'flex', justifyContent: 'center', zIndex: 8, opacity: opacity * plate, transform: `translateY(${(1 - plate) * -30}px)`}}>
      <div style={{padding: '22px 40px 28px', background: `linear-gradient(180deg, ${V.clayLight}, ${V.clay})`, border: `6px solid ${V.black}`, outline: `3px solid ${V.clayLight}`, outlineOffset: -14, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.55)'}}>
        <KineticText
          text={t}
          words={scene.words}
          entry={entry}
          lead={3}
          style={{fontFamily: font.serif, fontWeight: 700, fontSize: size, lineHeight: 1.02, letterSpacing: '0.03em', textTransform: 'uppercase'}}
          accentStyle={(fr) => sunText(fr)}
          plainStyle={blackText}
          goldScale={1.2}
        />
      </div>
    </div>
  );
};

// ---------- la superficie de la vasija ----------
export const VaseSurface: React.FC<{children?: React.ReactNode; tint?: number; light?: number}> = ({children, tint = 0, light = 1}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: V.clay}}>
    {/* textura de cerámica */}
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.35}}>
      <filter id="clayNoise">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves={3} seed={3} />
        <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.18  0 0 0 0 0.05  0 0 0 0.7 0" />
      </filter>
      <rect width={W} height={H} filter="url(#clayNoise)" />
    </svg>
    {children}
    {/* curvatura del cilindro: oscuro a los costados, brillo vertical */}
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(90deg, rgba(40,10,0,${0.75}) 0%, rgba(40,10,0,0.1) 22%, rgba(255,220,180,${0.12 * light}) 42%, rgba(40,10,0,0.05) 60%, rgba(40,10,0,0.7) 100%)`, pointerEvents: 'none'}} />
    {tint > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(10,4,2,${tint})`, pointerEvents: 'none'}} /> : null}
  </div>
);

// ---------- figuras negras (siluetas con líneas incisas) ----------
export const HORSE =
  'M40 120 C40 90 70 80 110 82 L190 80 C205 60 215 40 232 30 C245 24 262 28 270 40 L282 52 C286 58 282 64 274 62 L258 58 ' +
  'C252 70 246 86 240 100 C236 120 226 132 214 136 L216 200 L204 200 L200 142 C170 148 130 148 100 142 L98 200 L86 200 L82 136 ' +
  'C70 132 58 132 52 138 L44 200 L32 200 L34 130 C20 140 10 152 4 170 C6 146 20 128 40 120 Z';

export const Rider: React.FC<{x: number; y: number; s?: number; spear?: boolean; color?: string; flip?: boolean}> = ({x, y, s = 1, spear = true, color = V.black, flip = false}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d={HORSE} fill={color} />
    <path d="M120 96 C150 92 180 92 200 98" stroke={V.incise} strokeWidth={2.5} fill="none" />
    <path d="M236 44 C240 50 244 56 252 58" stroke={V.incise} strokeWidth={2} fill="none" />
    {/* jinete */}
    <path d="M128 84 C126 60 132 40 146 30 L156 30 C166 40 168 60 164 84 Z" fill={color} />
    <circle cx={150} cy={20} r={14} fill={color} />
    <path d="M136 10 C146 -10 166 -6 172 10 C160 4 148 6 136 10 Z" fill={color} />
    <path d="M150 6 C150 -14 140 -24 124 -26" stroke={color} strokeWidth={6} fill="none" />
    <path d="M140 60 L170 60" stroke={V.incise} strokeWidth={2} />
    {spear ? <path d="M90 -40 L250 120" stroke={color} strokeWidth={5} /> : null}
    {spear ? <path d="M90 -40 L80 -58 L100 -46 Z" fill={color} /> : null}
  </g>
);

export const Hoplite: React.FC<{x: number; y: number; s?: number; laugh?: number; color?: string}> = ({x, y, s = 1, laugh = 0, color = V.black}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${laugh * 14} 40 120)`}>
    <path d="M30 200 L36 120 L50 120 L54 200 Z M60 200 L56 120 L70 120 L78 200 Z" fill={color} />
    <path d="M24 120 C20 80 30 60 48 56 C66 60 76 80 72 120 Z" fill={color} />
    <circle cx={48} cy={40} r={16} fill={color} />
    <path d="M30 34 C36 10 62 10 68 34 Z" fill={color} />
    <path d="M48 12 C56 -6 80 -6 86 8" stroke={color} strokeWidth={8} fill="none" />
    <circle cx={22} cy={100} r={30} fill={color} />
    <circle cx={22} cy={100} r={20} fill="none" stroke={V.incise} strokeWidth={2.5} />
    <path d="M80 -20 L80 200" stroke={color} strokeWidth={4} />
    <path d="M42 46 L58 46" stroke={V.incise} strokeWidth={2} />
  </g>
);

// Diógenes recostado al sol (cabeza a la izquierda). `wave`: la mano que hace el gesto.
export const Reclining: React.FC<{x: number; y: number; s?: number; wave?: number; color?: string}> = ({x, y, s = 1, wave = 0, color = V.black}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M20 60 C20 40 40 28 58 34 C70 38 74 52 70 62 L120 64 C160 60 200 58 240 66 C262 70 278 80 272 94 C250 98 230 96 210 94 L186 94 C178 70 152 60 140 94 L60 98 C40 98 20 86 20 60 Z" fill={color} />
    <path d="M38 70 C44 84 56 90 66 88" stroke={V.incise} strokeWidth={2.5} fill="none" />
    <path d="M90 74 C130 70 170 70 220 78" stroke={V.incise} strokeWidth={2} fill="none" />
    <path d="M150 80 C160 76 172 78 180 86" stroke={V.incise} strokeWidth={2} fill="none" />
    {/* brazo que se levanta en 'move' */}
    <g transform={`rotate(${-wave * 70} 80 64)`}>
      <path d="M78 62 L130 44 C138 42 142 50 136 54 L84 72 Z" fill={color} />
      <path d="M130 44 L146 30 M134 50 L152 40 M136 54 L154 50" stroke={color} strokeWidth={5} strokeLinecap="round" />
    </g>
    {/* bastón */}
    <path d="M60 104 L250 104" stroke={color} strokeWidth={5} />
  </g>
);

// Perfil de Alejandro (mira a la derecha), con diadema y el cuerno de Amón de sus monedas.
export const ALEX =
  'M70 300 C82 260 96 240 104 226 C88 214 80 196 82 176 C76 172 74 164 80 158 C78 136 84 110 100 90 C120 64 156 50 190 56 ' +
  'C226 62 252 88 258 124 C262 140 260 156 258 166 C270 180 278 196 280 206 C280 212 274 214 266 214 C268 222 264 228 258 230 ' +
  'C262 236 260 244 254 246 C256 258 248 268 232 270 C216 272 204 270 194 266 C190 280 194 292 200 300 Z';
export const AlexProfile: React.FC<{x: number; y: number; s?: number; color?: string; crown?: boolean}> = ({x, y, s = 1, color = V.black, crown = true}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(-170 -180)`}>
    <path d={ALEX} fill={color} />
    {/* rulos y cuerno de Amón */}
    <path d="M110 150 C96 160 98 182 116 186 C132 188 136 170 124 164" stroke={V.incise} strokeWidth={4} fill="none" />
    <path d="M150 70 C170 64 196 66 214 80" stroke={V.incise} strokeWidth={3} fill="none" />
    {crown ? <path d="M96 112 C140 96 200 92 250 108" stroke={V.sun} strokeWidth={9} fill="none" /> : null}
    <path d="M232 150 C240 148 246 152 248 158" stroke={V.incise} strokeWidth={3} fill="none" />
  </g>
);

// Tinaja (pithos)
export const Pithos: React.FC<{x: number; y: number; s?: number; open?: number}> = ({x, y, s = 1, open = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-150 -60 C-190 40 -170 200 -90 250 L90 250 C170 200 190 40 150 -60 C120 -110 -120 -110 -150 -60 Z" fill={V.black} />
    <ellipse cx={0} cy={-80} rx={110} ry={30} fill={V.black} stroke={V.incise} strokeWidth={3} />
    <ellipse cx={0} cy={-80} rx={80} ry={18} fill="#2A140A" />
    <path d="M-160 20 C-60 40 60 40 160 20" stroke={V.incise} strokeWidth={3} fill="none" />
    <path d="M-150 120 C-60 140 60 140 150 120" stroke={V.incise} strokeWidth={3} fill="none" />
    {open > 0 ? (
      // corte: se ve a Diógenes adentro
      <g opacity={open}>
        <path d="M-120 -20 C-140 60 -120 160 -70 200 L70 200 C120 160 140 60 120 -20 Z" fill={V.clayLight} />
        <Reclining x={-120} y={60} s={0.85} />
      </g>
    ) : null}
  </g>
);

// Grietas de cerámica que se abren desde un punto.
export const Cracks: React.FC<{p: number; cx?: number; cy?: number; seed?: number; light?: string}> = ({p, cx = W / 2, cy = 800, seed = 5, light = V.sun}) => {
  if (p <= 0) return null;
  const r = rng(seed);
  const rays = Array.from({length: 11}, () => {
    let a = r() * Math.PI * 2;
    let x = cx;
    let y = cy;
    let d = `M${x} ${y}`;
    const len = 300 + r() * 600;
    for (let k = 0; k < 7; k++) {
      a += (r() - 0.5) * 0.9;
      x += Math.cos(a) * (len / 7) * p;
      y += Math.sin(a) * (len / 7) * p;
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  });
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {rays.map((d, k) => (
        <g key={k}>
          <path d={d} fill="none" stroke={light} strokeOpacity={0.55} strokeWidth={12 * p} strokeLinecap="round" />
          <path d={d} fill="none" stroke={V.black} strokeWidth={5} strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
};

// Sol con rayos (la única luz del video).
export const Sun: React.FC<{x: number; y: number; r: number; burst?: number; t: number}> = ({x, y, r, burst = 0, t}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
    <defs>
      <radialGradient id="sunG">
        <stop offset="0" stopColor={V.sunHot} />
        <stop offset="0.5" stopColor={V.sun} />
        <stop offset="1" stopColor={V.sun} stopOpacity={0} />
      </radialGradient>
    </defs>
    {Array.from({length: 18}, (_, k) => {
      const a = (k / 18) * Math.PI * 2 + t * 0.15;
      const len = r * (1.6 + burst * 4) * (k % 2 ? 0.8 : 1);
      return <path key={k} d={`M${x + Math.cos(a - 0.06) * r * 0.9} ${y + Math.sin(a - 0.06) * r * 0.9} L${x + Math.cos(a) * len} ${y + Math.sin(a) * len} L${x + Math.cos(a + 0.06) * r * 0.9} ${y + Math.sin(a + 0.06) * r * 0.9} Z`} fill={V.sun} opacity={0.75} />;
    })}
    <circle cx={x} cy={y} r={r * (1 + burst * 0.6)} fill="url(#sunG)" />
    <circle cx={x} cy={y} r={r * 0.6} fill={V.sunHot} />
  </svg>
);
