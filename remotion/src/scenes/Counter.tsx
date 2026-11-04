import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease} from '../anim';
import {color, font, safe, W} from '../theme';
import type {CounterScene} from '../types';

// Número grande que cuenta de `from` a `to`.
export const Counter: React.FC<{scene: CounterScene; durationInFrames: number}> = ({scene, durationInFrames}) => {
  const frame = useCurrentFrame();
  const end = Math.max(15, Math.floor(durationInFrames * 0.55));
  const p = ease(frame, 4, end);
  const value = scene.from + (scene.to - scene.from) * p;
  const decimals = scene.decimals ?? 0;
  const txt = value.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  const settle = ease(frame, end, end + 8);
  return (
    <div style={{position: 'absolute', top: safe.top + 200, left: safe.side, width: W - safe.side * 2, textAlign: 'center'}}>
      <div
        style={{
          fontFamily: font.serif,
          fontWeight: 700,
          fontSize: 230,
          lineHeight: 1,
          color: color.gold,
          fontVariantNumeric: 'tabular-nums',
          transform: `scale(${1 + settle * 0.04})`,
          textShadow: `0 0 ${40 * settle}px rgba(200,162,74,0.35)`,
        }}
      >
        {scene.prefix ?? ''}
        {txt}
        {scene.suffix ?? ''}
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: font.serif,
          fontWeight: 600,
          fontSize: 64,
          lineHeight: 1.1,
          color: color.ink,
          opacity: ease(frame, 8, 20),
        }}
      >
        {scene.label}
      </div>
    </div>
  );
};
