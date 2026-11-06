// Piezas propias de "millonario-invisible": estudio de concurso de TV, publicidad de lujo y rayos X.
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {parseEmphasis} from '../../anim';
import {hash, rng, syncTokens} from '../../director';
import {KineticText} from '../../kinetic';
import {font, H, W} from '../../theme';
import type {Scene} from '../../types';

export const G = {
  stageTop: '#2A0A4A',
  stageMid: '#5B1380',
  magenta: '#FF3FD0',
  violet: '#8B5CFF',
  amber: '#FFB21A',
  yellow: '#FFE14D',
  cyan: '#59F3FF',
  xray: '#0A1E2E',
  red: '#FF3B3B',
  green: '#4DFF9A',
  gold: '#FFD24D',
};

// ---------- texto de concurso ----------
const showText: React.CSSProperties = {color: '#FFFFFF', textShadow: '0 0 18px rgba(255,63,208,0.8), 0 6px 0 #3A0A5A, 0 10px 24px rgba(0,0,0,0.8)'};
export const accentYellow = (f: number): React.CSSProperties => ({color: G.yellow, textShadow: `0 0 ${20 + 8 * Math.sin(f / 4)}px rgba(255,210,40,0.95), 0 6px 0 #8A4A00, 0 10px 24px rgba(0,0,0,0.8)`});
export const accentRed = (): React.CSSProperties => ({color: '#FF5555', textShadow: '0 0 22px rgba(255,40,40,0.95), 0 6px 0 #5A0000'});
export const accentGreen = (f: number): React.CSSProperties => ({color: G.gold, textShadow: `0 0 ${24 + 10 * Math.sin(f / 3)}px rgba(255,220,80,1), 0 6px 0 #6B4A00`});
export const accentWarm = (): React.CSSProperties => ({color: '#FFD9A0', textShadow: '0 0 22px rgba(255,170,80,0.9), 0 6px 0 #5A3000'});

// Marquesina con focos que se encienden en cadena (lit=0: apagada, después del giro).
export const Marquee: React.FC<{w: number; h: number; lit?: number}> = ({w, h, lit = 1}) => {
  const f = useCurrentFrame();
  const step = 34;
  const bulbs: Array<[number, number]> = [];
  for (let x = 14; x < w - 6; x += step) bulbs.push([x, 12], [x, h - 12]);
  for (let y = 12 + step; y < h - 12; y += step) bulbs.push([12, y], [w - 12, y]);
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={26} fill="rgba(20,4,36,0.9)" stroke={lit > 0.5 ? G.amber : '#555'} strokeWidth={4} />
      {bulbs.map(([x, y], k) => {
        const on = lit > 0.5 && (k + Math.floor(f / 3)) % 3 !== 0;
        return <circle key={k} cx={x} cy={y} r={7} fill={on ? '#FFF3B0' : '#5A4A3A'} stroke={on ? G.amber : '#3A3A3A'} strokeWidth={2} />;
      })}
    </svg>
  );
};

export const ShowHeadline: React.FC<{
  scene: Scene;
  accent?: (f: number, i: number) => React.CSSProperties;
  top?: number;
  size?: number;
  lit?: number;
  opacity?: number;
  entry?: 'slam' | 'rise' | 'flip' | 'mask';
}> = ({scene, accent = accentYellow, top = 190, size = 104, lit = 1, opacity = 1, entry = 'slam'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const text = typeof (scene as {onScreen?: unknown}).onScreen === 'string' ? ((scene as {onScreen?: string}).onScreen as string) : '';
  const tokens = text.split('\n').flatMap((l) => parseEmphasis(l)).map((x) => x.word);
  const first = Math.max(0, Math.round((syncTokens(tokens, scene.words, 1.6)[0] ?? 0) * fps) - 3);
  const plate = Math.max(0, Math.min(1, (frame - first) / 4));
  if (plate <= 0) return null;
  const lines = text.split('\n').length;
  const w = 840;
  const h = lines * size * 1.08 + 84;
  return (
    <div style={{position: 'absolute', top, left: (W - 120 - w) / 2 + 30, width: w, height: h, zIndex: 8, opacity: opacity * plate, transform: `scale(${0.9 + 0.1 * plate})`}}>
      <Marquee w={w} h={h} lit={lit} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <KineticText
          text={text}
          words={scene.words}
          entry={entry}
          lead={3}
          style={{fontFamily: font.sans, fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: '-0.02em', transform: 'skewX(-7deg)'}}
          accentStyle={(fr, i) => accent(fr, i)}
          plainStyle={showText}
          goldScale={1.2}
        />
      </div>
    </div>
  );
};

// ---------- estudio ----------
export const Studio: React.FC<{t: number; dark?: number; beams?: number}> = ({t, dark = 0, beams = 1}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${G.stageTop} 0%, ${G.stageMid} 55%, #1A0428 56%, #0A0212 100%)`}} />
    {/* pared de LED */}
    <div style={{position: 'absolute', left: 0, top: 120, width: W, height: 900, backgroundImage: 'radial-gradient(circle, rgba(255,120,240,0.35) 2.5px, transparent 3px)', backgroundSize: '26px 26px', opacity: 0.6 * (1 - dark)}} />
    {/* público (bokeh) */}
    {Array.from({length: 24}, (_, k) => (
      <div key={k} style={{position: 'absolute', left: hash(k) * W, top: 1120 + hash(k + 3) * 80, width: 30 + hash(k + 5) * 30, height: 30 + hash(k + 5) * 30, borderRadius: '50%', background: k % 3 ? 'rgba(255,63,208,0.25)' : 'rgba(255,178,26,0.25)', opacity: (0.5 + 0.5 * Math.sin(t * 2 + k)) * (1 - dark)}} />
    ))}
    {/* piso brillante */}
    <div style={{position: 'absolute', left: 0, top: 1060, width: W, height: H - 1060, background: 'linear-gradient(180deg, rgba(255,63,208,0.25), rgba(10,2,18,0.95) 60%)'}} />
    {/* haces de luz que barren */}
    {beams > 0 &&
      [0, 1, 2, 3].map((k) => {
        const a = Math.sin(t * 0.9 + k * 1.7) * 28;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: 120 + k * 260,
              top: -40,
              width: 160,
              height: 1500,
              transformOrigin: '50% 0%',
              transform: `rotate(${a}deg)`,
              background: `linear-gradient(180deg, rgba(255,255,255,${0.35 * beams * (1 - dark)}) 0%, rgba(255,200,255,${0.08 * beams * (1 - dark)}) 60%, transparent 100%)`,
              clipPath: 'polygon(45% 0, 55% 0, 100% 100%, 0 100%)',
              mixBlendMode: 'screen',
            }}
          />
        );
      })}
    {dark > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.85 * dark})`}} /> : null}
  </div>
);

// ---------- autos genéricos (sin logos) ----------
export const SportsCar: React.FC<{w?: number; gray?: number}> = ({w = 420, gray = 0}) => (
  <svg width={w} height={w * 0.42} viewBox="0 0 200 84" style={{filter: gray > 0 ? `grayscale(${gray}) brightness(${1 - gray * 0.3})` : undefined, overflow: 'visible'}}>
    <defs>
      <linearGradient id="scar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FF6A6A" />
        <stop offset="0.6" stopColor="#C0101A" />
        <stop offset="1" stopColor="#5A0006" />
      </linearGradient>
    </defs>
    <path d="M6 58 C10 44 28 40 54 36 L84 22 C100 16 130 16 146 24 L176 38 C190 42 196 48 196 58 L196 64 L6 64 Z" fill="url(#scar)" stroke="#2A0004" strokeWidth={2} />
    <path d="M88 26 C100 20 126 20 140 27 L156 38 L80 38 Z" fill="#9FD8FF" opacity={0.85} />
    <path d="M20 46 L180 44" stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
    <circle cx={46} cy={64} r={14} fill="#141414" stroke="#C9CED6" strokeWidth={4} />
    <circle cx={160} cy={64} r={14} fill="#141414" stroke="#C9CED6" strokeWidth={4} />
  </svg>
);

export const Sedan: React.FC<{w?: number}> = ({w = 380}) => (
  <svg width={w} height={w * 0.5} viewBox="0 0 200 100" style={{overflow: 'visible'}}>
    <path d="M10 70 L14 52 C16 46 24 44 34 44 L54 26 C58 22 64 20 72 20 L128 20 C136 20 142 22 146 28 L162 44 C178 44 188 48 190 56 L190 70 Z" fill="#B9AE92" stroke="#4A4434" strokeWidth={2.5} />
    <path d="M60 28 L96 28 L96 44 L46 44 Z M102 28 L136 28 L152 44 L102 44 Z" fill="#7F949E" />
    <rect x={150} y={52} width={30} height={6} fill="#8A3A2A" />
    <circle cx={50} cy={72} r={14} fill="#1A1A1A" stroke="#777" strokeWidth={4} />
    <circle cx={152} cy={72} r={14} fill="#1A1A1A" stroke="#777" strokeWidth={4} />
    <path d="M30 60 L40 56" stroke="#6E6450" strokeWidth={2} />
  </svg>
);

export const Pickup: React.FC<{w?: number}> = ({w = 600}) => (
  <svg width={w} height={w * 0.5} viewBox="0 0 220 110" style={{overflow: 'visible'}}>
    <path d="M8 76 L8 56 L80 56 L92 30 C94 26 98 24 104 24 L140 24 C146 24 150 26 152 30 L164 54 L206 58 C212 60 214 64 214 70 L214 80 L8 80 Z" fill="#3E5A73" stroke="#14202A" strokeWidth={2.5} />
    <path d="M100 30 L140 30 L154 54 L96 54 Z" fill="#9FC2D6" opacity={0.85} />
    <rect x={8} y={56} width={72} height={6} fill="#2A3E50" />
    {/* polvo */}
    <path d="M14 66 C40 62 60 70 80 64" stroke="rgba(190,170,130,0.6)" strokeWidth={6} fill="none" />
    <circle cx={50} cy={82} r={16} fill="#141414" stroke="#888" strokeWidth={5} />
    <circle cx={176} cy={82} r={16} fill="#141414" stroke="#888" strokeWidth={5} />
    <rect x={194} y={64} width={18} height={8} rx={2} fill="#FFE9A0" />
  </svg>
);

// ---------- los dos concursantes ----------
// mode: 'normal' | 'xray' | 'gray'. Dibujados en una caja de 300 x 600 (cabeza arriba, atril abajo).
export const Man: React.FC<{kind: 'flashy' | 'plain'; mode?: 'normal' | 'xray' | 'gray'; blink?: boolean; smile?: number; label?: string; led?: number}> = ({
  kind,
  mode = 'normal',
  blink = false,
  smile = 1,
  label,
  led = 1,
}) => {
  const xr = mode === 'xray';
  const gray = mode === 'gray';
  const skin = xr ? 'none' : gray ? '#9A9A9A' : '#F2C29B';
  const stroke = xr ? G.cyan : '#2A1430';
  const sw = xr ? 4 : 3;
  const flashy = kind === 'flashy';
  return (
    <svg width={300} height={600} viewBox="0 0 300 600" style={{overflow: 'visible', filter: gray ? 'grayscale(1) brightness(0.7)' : xr ? 'drop-shadow(0 0 10px rgba(89,243,255,0.8))' : undefined}}>
      {/* torso */}
      {flashy ? (
        <path d="M40 420 C40 330 80 300 150 300 C220 300 260 330 260 420 Z" fill={xr ? 'rgba(89,243,255,0.08)' : '#D81E8C'} stroke={stroke} strokeWidth={sw} />
      ) : (
        <path d="M40 420 C40 330 80 300 150 300 C220 300 260 330 260 420 Z" fill={xr ? 'rgba(89,243,255,0.08)' : '#8A8F96'} stroke={stroke} strokeWidth={sw} />
      )}
      {!xr && flashy ? (
        <>
          <path d="M120 300 L150 380 L180 300 Z" fill="#FFF6F0" />
          <path d="M110 300 L150 390 L100 420 Z M190 300 L150 390 L200 420 Z" fill="#A0126A" />
          {/* cadena de oro */}
          {Array.from({length: 9}, (_, k) => {
            const a = Math.PI * (0.15 + k * 0.0875);
            return <circle key={k} cx={150 - Math.cos(a) * 46} cy={300 + Math.sin(a) * 52} r={7} fill="#FFD24D" stroke="#8A6400" strokeWidth={2} />;
          })}
        </>
      ) : null}
      {!xr && !flashy ? (
        <>
          <path d="M80 310 C90 270 210 270 220 310" fill="#7A7F86" stroke="#2A1430" strokeWidth={3} />
          <path d="M135 330 L132 372 M165 330 L168 372" stroke="#EEE" strokeWidth={4} />
          <rect x={110} y={360} width={80} height={40} rx={8} fill="#7A7F86" stroke="#2A1430" strokeWidth={2} />
        </>
      ) : null}
      {/* cuello y cabeza */}
      <rect x={128} y={260} width={44} height={50} fill={skin} stroke={xr ? 'none' : stroke} strokeWidth={2} />
      <rect x={80} y={100} width={140} height={170} rx={60} fill={skin} stroke={stroke} strokeWidth={sw} />
      {xr ? (
        <>
          {/* cráneo y columna */}
          <ellipse cx={150} cy={170} rx={56} ry={62} fill="none" stroke={G.cyan} strokeWidth={4} />
          <path d="M112 210 Q150 260 188 210" fill="none" stroke={G.cyan} strokeWidth={4} />
          <circle cx={128} cy={170} r={14} fill="none" stroke={G.cyan} strokeWidth={3} />
          <circle cx={172} cy={170} r={14} fill="none" stroke={G.cyan} strokeWidth={3} />
          <path d="M150 270 L150 420" stroke={G.cyan} strokeWidth={6} strokeDasharray="10 6" />
          {[320, 350, 380].map((y) => (
            <path key={y} d={`M150 ${y} Q100 ${y - 10} 80 ${y + 14} M150 ${y} Q200 ${y - 10} 220 ${y + 14}`} fill="none" stroke={G.cyan} strokeWidth={3} />
          ))}
        </>
      ) : (
        <>
          {/* pelo */}
          {flashy ? (
            <path d="M80 150 C78 92 120 78 160 82 C200 86 226 104 222 150 C210 124 170 110 140 118 C110 124 94 136 80 150 Z" fill={gray ? '#444' : '#1A1014'} />
          ) : (
            <path d="M82 140 C80 96 118 86 150 88 C186 90 220 100 218 140 C206 122 196 128 186 116 C172 130 160 118 148 128 C136 116 120 132 110 122 C100 132 90 128 82 140 Z" fill={gray ? '#555' : '#6A4A2E'} />
          )}
          {/* ojos */}
          {flashy ? (
            <>
              <path d="M96 160 L144 160 L140 188 L102 188 Z M156 160 L204 160 L198 188 L160 188 Z" fill="#0A0A0A" />
              <path d="M144 166 L156 166" stroke="#0A0A0A" strokeWidth={5} />
              <path d="M106 166 L122 166" stroke="rgba(255,255,255,0.8)" strokeWidth={4} />
            </>
          ) : (
            <>
              <ellipse cx={124} cy={174} rx={9} ry={blink ? 1.5 : 9} fill="#1A1014" />
              <ellipse cx={176} cy={174} rx={9} ry={blink ? 1.5 : 9} fill="#1A1014" />
            </>
          )}
          {/* boca */}
          {flashy ? (
            <path d={`M112 220 Q150 ${220 + 34 * smile} 188 220 Z`} fill="#FFFFFF" stroke="#2A1430" strokeWidth={3} />
          ) : (
            <path d="M128 226 Q150 238 172 226" fill="none" stroke="#2A1430" strokeWidth={4} strokeLinecap="round" />
          )}
        </>
      )}
      {/* atril */}
      <path d="M20 420 L280 420 L256 600 L44 600 Z" fill={xr ? 'rgba(89,243,255,0.06)' : gray ? '#3A3A3A' : '#2C0A44'} stroke={xr ? G.cyan : gray ? '#666' : G.amber} strokeWidth={4} />
      {label ? (
        <>
          <rect x={60} y={450} width={180} height={70} rx={10} fill="#140608" stroke={gray ? '#555' : G.amber} strokeWidth={3} />
          <text x={150} y={500} textAnchor="middle" fontFamily="Inter, Arial" fontWeight={900} fontSize={42} fill={gray ? '#777' : G.amber} opacity={led}>
            {label}
          </text>
        </>
      ) : null}
    </svg>
  );
};

// Cadena de eslabones (deuda) entre dos puntos.
export const Chain: React.FC<{from: [number, number]; to: [number, number]; color?: string; label?: string; tension?: number}> = ({from, to, color = G.cyan, label, tension = 0}) => {
  const [x0, y0] = from;
  const [x1, y1] = to;
  const n = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - y0) / 34));
  const sag = 60 * (1 - tension);
  const links = Array.from({length: n}, (_, k) => {
    const u = k / (n - 1);
    const x = x0 + (x1 - x0) * u;
    const y = y0 + (y1 - y0) * u + Math.sin(Math.PI * u) * sag;
    const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
    return <ellipse key={k} cx={x} cy={y} rx={18} ry={9} fill="none" stroke={color} strokeWidth={5} transform={`rotate(${ang + (k % 2 ? 90 : 0) * 0} ${x} ${y})`} opacity={k % 2 ? 0.8 : 1} />;
  });
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>
      {links}
      {label ? (
        <text x={(x0 + x1) / 2} y={(y0 + y1) / 2 + sag * 0.6 - 24} textAnchor="middle" fontFamily="Inter, Arial" fontWeight={900} fontSize={30} fill={G.red} stroke="#000" strokeWidth={4} paintOrder="stroke">
          {label}
        </text>
      ) : null}
    </svg>
  );
};

// Confeti (determinístico).
export const Confetti: React.FC<{t: number; t0: number; gold?: boolean; n?: number}> = ({t, t0, gold = false, n = 70}) => {
  if (t < t0) return null;
  const r = rng(7);
  const items = Array.from({length: n}, () => ({x: r() * W, vy: 300 + r() * 500, sway: r() * 6, s: 14 + r() * 16, c: r(), rot: r() * 360, d: r() * 0.4}));
  const colors = gold ? ['#FFD24D', '#FFE9A0', '#E0A93A'] : ['#FF3FD0', '#FFE14D', '#59F3FF', '#8B5CFF'];
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {items.map((it, k) => {
        const lt = t - t0 - it.d;
        if (lt < 0) return null;
        const y = -40 + it.vy * lt;
        if (y > H) return null;
        const x = it.x + Math.sin(lt * it.sway + k) * 40;
        return <rect key={k} x={x} y={y} width={it.s} height={it.s * 0.5} fill={colors[Math.floor(it.c * colors.length)]} transform={`rotate(${it.rot + lt * 400} ${x} ${y})`} />;
      })}
    </svg>
  );
};
