import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {color, font, safe, W} from './theme';
import type {Word} from './types';

// Agrupa palabras en bloques cortos: corta en puntuación o cada 4 palabras.
const groupWords = (words: Word[]) => {
  const groups: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 4 || /[.,!?;:—]$/.test(w.text)) {
      groups.push(cur);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);
  return groups;
};

// Subtítulos palabra por palabra; la palabra que suena se pinta de oro.
export const Captions: React.FC<{words: Word[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const groups = groupWords(words);
  const group = groups.find((g) => t >= g[0].start - 0.05 && t <= g[g.length - 1].end + 0.15);
  if (!group) return null;
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
        fontSize: 62,
        lineHeight: 1.2,
        color: color.ink,
        textShadow: '0 4px 18px rgba(0,0,0,0.85)',
      }}
    >
      {group.map((w, i) => {
        const active = t >= w.start && t <= w.end + 0.05;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '0.28em',
              color: active ? color.gold : color.ink,
              transform: `scale(${active ? 1.08 : 1})`,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
