import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {color} from './theme';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const ease = (frame: number, from: number, to: number, a = 0, b = 1) =>
  interpolate(frame, [from, to], [a, b], {...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1)});

// "Palabras *doradas*": lo que va entre asteriscos se pinta de oro.
export const parseEmphasis = (text: string) => {
  const out: Array<{word: string; gold: boolean}> = [];
  let gold = false;
  for (const part of text.split('*')) {
    for (const w of part.split(/\s+/).filter(Boolean)) out.push({word: w, gold});
    gold = !gold;
  }
  return out;
};

// Texto que aparece palabra por palabra (sube y se desenfoca hacia nítido).
export const RevealText: React.FC<{
  text: string;
  startFrame?: number;
  perWord?: number;
  style?: React.CSSProperties;
  goldColor?: string;
}> = ({text, startFrame = 0, perWord = 3, style, goldColor = color.gold}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lines = text.split('\n');
  let i = 0;
  return (
    <div style={style}>
      {lines.map((line, li) => (
        <div key={li}>
          {parseEmphasis(line).map(({word, gold}) => {
            const idx = i++;
            const s = spring({frame: frame - startFrame - idx * perWord, fps, config: {damping: 200}});
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  marginRight: '0.24em',
                  opacity: s,
                  transform: `translateY(${(1 - s) * 28}px)`,
                  filter: `blur(${(1 - s) * 8}px)`,
                  color: gold ? goldColor : undefined,
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

// Entrada y salida suave de cada escena.
export const useSceneFade = (durationInFrames: number) => {
  const frame = useCurrentFrame();
  const inn = ease(frame, 0, 8);
  const out = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], clamp);
  return Math.min(inn, out);
};
