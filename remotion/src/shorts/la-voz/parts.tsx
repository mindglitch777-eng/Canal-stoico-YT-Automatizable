// Piezas propias de "la-voz": cine negro en blanco y negro con lluvia, y UN solo color, el rojo de la voz.
// El oro aparece recién cuando él responde.
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {parseEmphasis} from '../../anim';
import {hash, syncTokens} from '../../director';
import {KineticText} from '../../kinetic';
import {font, H, W} from '../../theme';
import type {Scene} from '../../types';

export const N = {
  black: '#050505',
  coal: '#121212',
  gray: '#6E6E6E',
  silver: '#BDBDBD',
  white: '#EDEDED',
  red: '#E3122B',
  redHot: '#FF3B4E',
  warm: '#FFF1DC',
  gold: '#E9B44C',
  goldHot: '#FFE29A',
};

// ---------- texto: placa de cine negro, blanco grande; la voz en rojo; la respuesta en oro ----------
const noirText: React.CSSProperties = {color: N.white, textShadow: '0 4px 0 #000, 0 0 18px rgba(0,0,0,0.9)'};
export const redVoice = (f: number, i: number): React.CSSProperties =>
  ({
    color: N.redHot,
    WebkitTextStroke: '3px #2A0005',
    paintOrder: 'stroke fill',
    textShadow: `0 0 ${18 + 8 * Math.sin(f / 4 + i)}px rgba(255,30,50,0.95), 0 4px 0 #000`,
    transform: `translate(${Math.sin(f * 0.9 + i) * 1.5}px, ${Math.cos(f * 1.1 + i) * 1.5}px)`,
  }) as React.CSSProperties;
export const goldVoice = (f: number): React.CSSProperties =>
  ({color: N.goldHot, WebkitTextStroke: '3px #3A2200', paintOrder: 'stroke fill', textShadow: `0 0 ${22 + 8 * Math.sin(f / 5)}px rgba(255,200,90,0.95), 0 4px 0 #000`}) as React.CSSProperties;

export const NoirTitle: React.FC<{scene: Scene; top?: number; size?: number; accent?: (f: number, i: number) => React.CSSProperties; opacity?: number}> = ({
  scene,
  top = 200,
  size = 108,
  accent = redVoice,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const text = typeof (scene as {onScreen?: unknown}).onScreen === 'string' ? ((scene as {onScreen?: string}).onScreen as string) : '';
  const tokens = text.split('\n').flatMap((l) => parseEmphasis(l)).map((x) => x.word);
  const first = Math.max(0, Math.round((syncTokens(tokens, scene.words, 1.6)[0] ?? 0) * fps) - 3);
  const plate = Math.max(0, Math.min(1, (frame - first) / 4));
  if (plate <= 0) return null;
  return (
    <div style={{position: 'absolute', top, left: 60, width: W - 180, display: 'flex', justifyContent: 'center', zIndex: 8, opacity: opacity * plate}}>
      <div style={{padding: '22px 40px 28px', background: 'rgba(0,0,0,0.86)', border: '3px solid rgba(237,237,237,0.85)', outline: '1px solid rgba(237,237,237,0.4)', outlineOffset: 6, textAlign: 'center'}}>
        <KineticText
          text={text}
          words={scene.words}
          entry="rise"
          lead={3}
          style={{fontFamily: font.serif, fontWeight: 700, fontSize: size, lineHeight: 1.02, letterSpacing: '0.02em', textTransform: 'uppercase'}}
          accentStyle={accent}
          plainStyle={noirText}
          goldScale={1.14}
        />
      </div>
    </div>
  );
};

// ---------- ambiente ----------
// Lluvia diagonal, periódica en el tiempo (sirve para el loop).
export const Rain: React.FC<{t: number; n?: number; speed?: number; opacity?: number; color?: string; frozen?: boolean}> = ({t, n = 140, speed = 1, opacity = 0.55, color = '#DADADA', frozen = false}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity}}>
    {Array.from({length: n}, (_, k) => {
      const len = 40 + hash(k) * 70;
      const v = (1400 + hash(k + 3) * 900) * speed;
      const y = ((((frozen ? 0 : t) * v + hash(k + 7) * (H + 300)) % (H + 300)) + H + 300) % (H + 300) - 150;
      const x = hash(k + 11) * (W + 200) - 100 + y * 0.18;
      return <line key={k} x1={x} y1={y} x2={x - len * 0.18} y2={y - len} stroke={color} strokeWidth={1.5 + hash(k + 5) * 1.5} strokeOpacity={0.4 + hash(k + 9) * 0.6} />;
    })}
  </svg>
);

// Grano + titileo de película + viñeta (el grano se repite cada 8 cuadros: empalma el loop).
export const Film: React.FC<{f: number; total?: number}> = ({f}) => {
  const seed = ((f % 8) + 8) % 8;
  const flick = 0.04 * Math.sin(f * 1.7) + 0.03 * hash(seed);
  return (
    <>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.16, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
        <filter id="noirGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noirGrain)" />
      </svg>
      <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.05 + flick})`, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 65% at 50% 45%, transparent 40%, rgba(0,0,0,0.9) 100%)', pointerEvents: 'none'}} />
    </>
  );
};

// Sombras de persiana.
export const Blinds: React.FC<{angle?: number; opacity?: number}> = ({angle = -18, opacity = 0.55}) => (
  <div style={{position: 'absolute', inset: -200, background: `repeating-linear-gradient(${angle}deg, rgba(0,0,0,${opacity}) 0px, rgba(0,0,0,${opacity}) 34px, transparent 34px, transparent 70px)`, pointerEvents: 'none'}} />
);

// Ciudad de noche (siluetas grises con ventanas).
export const Skyline: React.FC<{y: number; t: number; lit?: number; scale?: number}> = ({y, t, lit = 1, scale = 1}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    <g transform={`translate(0 ${y}) scale(1 ${scale})`}>
      {Array.from({length: 11}, (_, k) => {
        const bw = 80 + hash(k) * 90;
        const bx = k * 100 - 20;
        const bh = 300 + hash(k + 4) * 600;
        return (
          <g key={k}>
            <rect x={bx} y={-bh} width={bw} height={bh + 600} fill={k % 2 ? '#161616' : '#1E1E1E'} />
            {Array.from({length: 16}, (_, j) => {
              const wx = bx + 12 + (j % 3) * (bw / 3.4);
              const wy = -bh + 30 + Math.floor(j / 3) * 56;
              const on = hash(k * 31 + j) > 0.55 && lit > 0;
              return wy < 0 ? <rect key={j} x={wx} y={wy} width={14} height={22} fill={on ? '#CFCFCF' : '#262626'} opacity={on ? (0.5 + 0.4 * Math.sin(t + j)) * lit : 1} /> : null;
            })}
          </g>
        );
      })}
    </g>
  </svg>
);

// ---------- el detective (sombrero y piloto) ----------
// Perfil de la cabeza (mira a la derecha), en una caja de 520x620.
export const HEAD_PROFILE =
  'M150 600 C150 540 170 500 200 480 C180 460 168 430 170 400 C160 396 156 384 162 376 C156 352 160 320 172 296 ' +
  'C186 268 214 252 248 250 C292 248 330 270 342 312 C348 330 348 348 346 360 C358 378 368 394 372 408 ' +
  'C374 414 368 418 360 418 C362 426 360 432 354 434 C358 440 356 448 350 450 C354 462 346 474 332 478 ' +
  'C312 484 296 484 282 482 C278 500 282 520 292 540 C340 552 380 570 400 600 Z';
export const Fedora: React.FC<{color?: string}> = ({color = '#0A0A0A'}) => (
  <g>
    <path d="M90 300 C120 286 380 282 420 300 C400 312 120 316 90 300 Z" fill={color} />
    <path d="M160 296 C160 230 190 196 256 196 C320 196 352 230 350 296 Z" fill={color} />
    <path d="M166 280 C220 270 300 270 346 280 L346 292 C300 284 220 284 166 292 Z" fill="#2A2A2A" />
  </g>
);
export const DetectiveHead: React.FC<{x: number; y: number; s?: number; rim?: string; rimAmt?: number; mouth?: 'none' | 'red' | 'gold'; open?: number}> = ({
  x,
  y,
  s = 1,
  rim = N.white,
  rimAmt = 1,
  mouth = 'none',
  open = 0,
}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <defs>
      <linearGradient id={`face${mouth}`} x1="1" y1="0" x2="0" y2="0">
        <stop offset="0" stopColor={rim} stopOpacity={0.9 * rimAmt} />
        <stop offset="0.25" stopColor="#3A3A3A" />
        <stop offset="1" stopColor="#0B0B0B" />
      </linearGradient>
    </defs>
    <g transform={`translate(${x} ${y}) scale(${s}) translate(-260 -420)`}>
      {/* cuello del piloto */}
      <path d="M120 600 C150 520 200 500 230 520 L300 560 C340 540 380 560 420 600 Z" fill="#1A1A1A" />
      <path d={HEAD_PROFILE} fill={`url(#face${mouth})`} />
      <Fedora />
      {/* oreja */}
      <path d="M232 380 C214 370 212 404 230 412" fill="none" stroke="#5A5A5A" strokeWidth={4} />
      {mouth !== 'none' ? <ellipse cx={346} cy={446} rx={10 + open * 4} ry={3 + open * 6} fill={mouth === 'red' ? N.redHot : N.goldHot} /> : null}
    </g>
  </svg>
);

// Cuerpo entero (de pie o corriendo), silueta.
export const Detective: React.FC<{x: number; y: number; s?: number; run?: number; phase?: number; color?: string; flipX?: boolean}> = ({x, y, s = 1, run = 0, phase = 0, color = '#0A0A0A', flipX = false}) => {
  const leg = Math.sin(phase) * 30 * run;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <g transform={`translate(${x} ${y}) scale(${flipX ? -s : s} ${s})`} fill={color}>
        <path d="M-10 -420 C-40 -420 -50 -380 -44 -350 L44 -350 C50 -380 40 -420 10 -420 Z" />
        <path d="M-80 -350 L80 -350 L76 -346 C70 -360 -70 -360 -76 -346 Z" />
        <circle cx={0} cy={-330} r={30} />
        {/* piloto */}
        <path d={`M-50 -300 C-70 -200 -80 -120 -${70 + run * 20} -40 L${70 + run * 20} -40 C80 -120 70 -200 50 -300 Z`} />
        <path d={`M-14 -40 L${-14 + leg} 0 L${-2 + leg} 0 L4 -40 Z M10 -40 L${14 - leg} 0 L${26 - leg} 0 L28 -40 Z`} />
        <path d={`M-40 -280 L${-60 - run * 20} ${-170 + leg * 0.6} L${-46 - run * 20} ${-166 + leg * 0.6} L-30 -270 Z`} />
      </g>
    </svg>
  );
};

// ---------- la voz: boca de humo rojo que susurra ----------
export const SmokeMouth: React.FC<{x: number; y: number; s?: number; f: number; talk?: number; color?: string; opacity?: number; wisps?: boolean}> = ({
  x,
  y,
  s = 1,
  f,
  talk = 1,
  color = N.red,
  opacity = 1,
  wisps = true,
}) => {
  const open = 0.3 + 0.7 * Math.abs(Math.sin(f * 0.45)) * talk;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', opacity}}>
      <defs>
        <filter id={`smoke${Math.round(x)}`} x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={3} seed={((Math.floor(f / 2) % 12) + 12) % 12 + 1} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={26} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <radialGradient id={`smokeG${Math.round(x)}`}>
          <stop offset="0" stopColor={color} stopOpacity={0.9} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${x} ${y}) scale(${s})`} filter={`url(#smoke${Math.round(x)})`}>
        <ellipse cx={0} cy={0} rx={150} ry={90} fill={`url(#smokeG${Math.round(x)})`} />
        {/* labios */}
        <path d={`M-80 0 C-50 ${-30 - open * 10} -16 ${-22 - open * 6} 0 -12 C16 ${-22 - open * 6} 50 ${-30 - open * 10} 80 0 C50 ${30 + open * 26} -50 ${30 + open * 26} -80 0 Z`} fill={color} />
        <path d={`M-62 0 C-30 ${-6 - open * 4} 30 ${-6 - open * 4} 62 0 C30 ${8 + open * 22} -30 ${8 + open * 22} -62 0 Z`} fill="#140003" />
        {wisps
          ? Array.from({length: 5}, (_, k) => {
              const a = -0.4 + k * 0.2;
              const len = 200 + k * 30;
              const sway = Math.sin(f * 0.12 + k) * 40;
              return <path key={k} d={`M0 0 C${len * 0.3} ${-40 + sway} ${len * 0.6} ${40 - sway} ${len} ${Math.sin(a) * 120 + sway}`} fill="none" stroke={color} strokeOpacity={0.55} strokeWidth={14 - k * 2} strokeLinecap="round" />;
            })
          : null}
      </g>
    </svg>
  );
};

// Letras rojas temblorosas en el aire.
export const RedLetters: React.FC<{text: string; x: number; y: number; size: number; f: number; appear?: number; blur?: number; color?: string}> = ({text, x, y, size, f, appear = 1, color = N.redHot}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', fontFamily: font.serif, fontWeight: 700, fontSize: size, letterSpacing: '0.04em', whiteSpace: 'nowrap', textTransform: 'uppercase'}}>
    {text.split('').map((ch, i) => (
      <span
        key={i}
        style={{
          display: 'inline-block',
          color,
          opacity: Math.max(0, Math.min(1, appear * text.length - i)) * (0.9 + 0.1 * Math.sin(f * 0.6 + i)),
          transform: `translate(${Math.sin(f * 0.3 + i * 1.7) * 2}px, ${Math.cos(f * 0.25 + i) * 3}px)`,
          textShadow: `0 0 22px ${color}, 0 0 44px rgba(255,20,40,0.6)`,
          WebkitTextStroke: '4px #1A0003',
          paintOrder: 'stroke fill',
        }}
      >
        {ch === ' ' ? ' ' : ch}
      </span>
    ))}
  </div>
);

// Vidriera iluminada (lo único luminoso de la calle).
export const ShopWindow: React.FC<{x: number; y: number; w: number; h: number; t: number; label?: string; dark?: number}> = ({x, y, w, h, t, label, dark = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, border: '10px solid #1A1A1A', boxSizing: 'border-box', background: `radial-gradient(ellipse at 50% 40%, rgba(245,245,245,${0.95 * (1 - dark)}) 0%, rgba(150,150,150,${0.6 * (1 - dark)}) 60%, rgba(40,40,40,${0.9}) 100%)`, overflow: 'hidden'}}>
    {/* maniquíes y etiquetas genéricas */}
    {[0.25, 0.55, 0.82].map((u, k) => (
      <svg key={k} width={w} height={h} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${w * u} ${h * 0.95})`} fill={`rgba(20,20,20,${0.85 - dark * 0.3})`}>
          <circle cx={0} cy={-h * 0.62} r={h * 0.06} />
          <path d={`M${-h * 0.09} ${-h * 0.54} L${h * 0.09} ${-h * 0.54} L${h * 0.12} ${-h * 0.15} L${-h * 0.12} ${-h * 0.15} Z`} />
          <rect x={-h * 0.02} y={-h * 0.15} width={h * 0.04} height={h * 0.15} />
        </g>
      </svg>
    ))}
    {label ? <div style={{position: 'absolute', top: 18, width: '100%', textAlign: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 42, letterSpacing: '0.2em', color: dark > 0.5 ? '#333' : '#111'}}>{label}</div> : null}
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent 30%, rgba(255,255,255,${0.25 * (1 - dark)}) ${40 + Math.sin(t * 0.5) * 5}%, transparent 55%)`}} />
  </div>
);
