import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from './anim';
import {hash, norm} from './director';
import {color, font, safe, W} from './theme';
import type {Word} from './types';

// Agrupa palabras en bloques cortos: corta en puntuación o cada 3 palabras (más cortes = más ritmo).
const groupWords = (words: Word[]) => {
  const groups: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 3 || /[.,!?;:—]$/.test(w.text)) {
      groups.push(cur);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);
  return groups;
};

// Subtítulos tipo karaoke: cada bloque entra con un rebote, la palabra que suena
// lleva una placa dorada detrás y las palabras clave salen en oro y más grandes.
export const Captions: React.FC<{words: Word[]; gold?: string[]}> = ({words, gold = []}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const groups = groupWords(words);
  const gi = groups.findIndex((g) => t >= g[0].start - 0.05 && t <= g[g.length - 1].end + 0.12);
  if (gi < 0) return null;
  const group = groups[gi];
  const enter = Math.round((group[0].start - 0.05) * fps);
  const s = spring({frame: frame - enter, fps, config: {damping: 12, stiffness: 220, mass: 0.6}});
  const tilt = (hash(gi) - 0.5) * 5;
  const goldSet = new Set(gold);
  return (
    <div
      style={{
        position: 'absolute',
        top: safe.captionY,
        left: safe.side,
        width: W - safe.side * 2,
        textAlign: 'center',
        fontFamily: font.sans,
        fontWeight: 800,
        fontSize: 66,
        lineHeight: 1.25,
        color: color.ink,
        textTransform: 'uppercase',
        letterSpacing: '0.01em',
        transform: `scale(${interpolate(s, [0, 1], [0.6, 1])}) rotate(${tilt * s}deg) translateY(${(1 - s) * 40}px)`,
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
      }}
    >
      {group.map((w, i) => {
        const active = t >= w.start - 0.02 && t <= w.end + 0.06;
        const key = goldSet.has(norm(w.text));
        const pop = spring({frame: frame - Math.round(w.start * fps), fps, config: {damping: 10, stiffness: 300, mass: 0.5}});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              position: 'relative',
              margin: '0 0.16em',
              padding: '0 0.14em',
              color: active ? '#1A1204' : key ? color.gold : color.ink,
              transform: `scale(${active ? 1 + 0.12 * pop : key ? 1.06 : 1})`,
              textShadow: active ? 'none' : '0 4px 0 rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.9)',
              zIndex: active ? 1 : 0,
            }}
          >
            {active ? (
              <span
                style={{
                  position: 'absolute',
                  inset: '0.02em -0.04em',
                  borderRadius: 14,
                  background: 'linear-gradient(180deg, #FFE7A3, #D8AE52 60%, #A9822E)',
                  boxShadow: '0 6px 0 #6B4E17, 0 0 34px rgba(232,184,90,0.75)',
                  transform: `scaleX(${0.7 + 0.3 * pop}) rotate(${(hash(i + gi * 7) - 0.5) * 6}deg)`,
                  zIndex: -1,
                }}
              />
            ) : null}
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
