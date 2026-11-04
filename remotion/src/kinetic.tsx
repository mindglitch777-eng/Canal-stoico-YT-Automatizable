// Tipografía cinética: palabras que entran sincronizadas con la voz, oro con volumen y brillo.
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, parseEmphasis} from './anim';
import {hash, syncTokens} from './director';
import {color, font} from './theme';
import type {Word} from './types';

// Oro con volumen: relleno con degradé que brilla al pasar la luz, extrusión hacia abajo y halo.
export const goldStyle = (frame: number, seed = 0, depth = 7, glow = 1): React.CSSProperties => {
  const sweep = ((frame * 2.2 + seed * 37) % 260) - 80; // franja de luz que cruza la palabra
  const layers = Array.from({length: depth}, (_, i) => `drop-shadow(0 ${i === 0 ? 2 : 1.6}px 0 ${i < depth / 2 ? '#8A6420' : '#5E420F'})`);
  return {
    backgroundImage: `linear-gradient(100deg, #A9822E 0%, #E9C46A ${Math.max(0, sweep - 18)}%, #FFF4C9 ${sweep}%, #E9C46A ${sweep + 18}%, #B88E35 100%)`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    filter: [...layers, `drop-shadow(0 0 ${22 * glow}px rgba(232,184,90,${0.45 * glow}))`].join(' '),
  };
};

// Marfil con un poco de volumen (para que el texto blanco también "salga" de la pantalla).
export const inkStyle = (depth = 4): React.CSSProperties => ({
  color: color.ink,
  filter: [
    ...Array.from({length: depth}, () => 'drop-shadow(0 1.5px 0 #3B342A)'),
    'drop-shadow(0 18px 24px rgba(0,0,0,0.6))',
  ].join(' '),
});

export type Entry = 'slam' | 'rise' | 'flip' | 'mask';

// Texto palabra por palabra. Cada palabra entra cuando la voz la dice (si `words` está),
// si no, en cascada. Las palabras en *oro* entran más fuerte y tiemblan al llegar.
export const KineticText: React.FC<{
  text: string;
  words?: Word[];
  entry?: Entry;
  startFrame?: number;
  span?: number; // segundos para repartir si la voz no dice el texto
  lead?: number; // cuadros de anticipación respecto de la voz
  style?: React.CSSProperties;
  lineStyle?: React.CSSProperties;
  goldScale?: number;
}> = ({text, words, entry = 'slam', startFrame = 0, span = 1.6, lead = 3, style, lineStyle, goldScale = 1.08}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lines = text.split('\n').map((l) => parseEmphasis(l));
  const tokens = lines.flat().map((t) => t.word);
  const times = syncTokens(tokens, words ?? [], span).map((s) => Math.max(0, Math.round(s * fps) - lead) + startFrame);
  let idx = 0;
  return (
    <div style={{perspective: 1400, ...style}}>
      {lines.map((line, li) => (
        <div key={li} style={{display: 'block', whiteSpace: 'normal', ...lineStyle, overflow: entry === 'mask' ? 'hidden' : undefined, paddingBottom: entry === 'mask' ? '0.12em' : undefined}}>
          {line.map(({word, gold}) => {
            const i = idx++;
            const f = frame - times[i];
            const s = spring({frame: f, fps, config: gold ? {damping: 11, stiffness: 180, mass: 0.7} : {damping: 16, stiffness: 200, mass: 0.6}});
            const vis = f >= 0 ? 1 : 0;
            let transform = '';
            let blur = 0;
            if (entry === 'slam') {
              const sc = interpolate(s, [0, 1], [gold ? 3.2 : 2.2, 1]);
              transform = `translateZ(${(1 - s) * 300}px) scale(${sc}) rotate(${(1 - s) * (hash(i) - 0.5) * 24}deg)`;
              blur = (1 - Math.min(1, s)) * 16;
            } else if (entry === 'rise') {
              transform = `translateY(${(1 - s) * 70}px) rotateX(${(1 - s) * -70}deg)`;
              blur = (1 - Math.min(1, s)) * 10;
            } else if (entry === 'flip') {
              transform = `rotateY(${(1 - s) * 95}deg) translateZ(${(1 - s) * 120}px)`;
            } else {
              transform = `translateY(${(1 - s) * 115}%) rotate(${(1 - s) * 6}deg)`;
            }
            // Temblor corto cuando aterriza una palabra dorada
            const shake = gold && f > 0 && f < 14 ? Math.sin(f * 2.3) * (14 - f) * 0.6 : 0;
            const pulse = gold ? 1 + Math.max(0, 1 - Math.abs(f - 7) / 7) * (goldScale - 1) : 1;
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  margin: '0 0.12em',
                  opacity: vis * interpolate(f, [0, 3], [0, 1], clamp),
                  transform: `${transform} translateX(${shake}px) scale(${pulse})`,
                  transformOrigin: '50% 60%',
                  ...(gold ? goldStyle(frame, i) : inkStyle()),
                  ...(blur > 0.3 ? {filter: `blur(${blur}px)`} : {}),
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Texto que se "descifra": letras al azar que se van fijando hasta formar la palabra.
const GLYPHS = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ0123456789$%#';
export const Decode: React.FC<{text: string; startFrame?: number; perChar?: number; style?: React.CSSProperties}> = ({
  text,
  startFrame = 0,
  perChar = 1.2,
  style,
}) => {
  const frame = useCurrentFrame() - startFrame;
  return (
    <div style={style}>
      {text.split('').map((ch, i) => {
        const settle = i * perChar + 6;
        if (frame < i * perChar * 0.4) return <span key={i} style={{opacity: 0}}>{ch}</span>;
        const fixed = frame >= settle || ch === ' ';
        const g = GLYPHS[Math.floor(hash(i * 31 + Math.floor(frame / 2)) * GLYPHS.length)];
        return (
          <span key={i} style={{opacity: fixed ? 1 : 0.7, color: fixed ? undefined : color.ink}}>
            {fixed ? ch : g}
          </span>
        );
      })}
    </div>
  );
};

// Onda expansiva (anillo) que sale de un punto al aterrizar algo importante.
export const Shockwave: React.FC<{at: number; x: string | number; y: string | number; size?: number; color?: string}> = ({
  at,
  x,
  y,
  size = 900,
  color: c = 'rgba(232,184,90,0.9)',
}) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 24) return null;
  const p = f / 24;
  const e = 1 - (1 - p) ** 3;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size * e,
        height: size * e,
        marginLeft: (-size * e) / 2,
        marginTop: (-size * e) / 2,
        borderRadius: '50%',
        border: `${Math.max(1, 14 * (1 - p))}px solid ${c}`,
        opacity: 1 - p,
        boxShadow: `0 0 ${40 * (1 - p)}px ${c}`,
        pointerEvents: 'none',
      }}
    />
  );
};
