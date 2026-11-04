import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease} from '../anim';
import {color, font, safe, W} from '../theme';
import type {TwoColumnsScene} from '../types';

// Dos columnas (ej.: "lo que controlás" vs "lo que no"). Lo de la derecha se tacha.
export const TwoColumns: React.FC<{scene: TwoColumnsScene; durationInFrames: number}> = ({scene, durationInFrames}) => {
  const frame = useCurrentFrame();
  const total = scene.left.items.length + scene.right.items.length;
  const step = Math.max(5, Math.min(14, Math.floor((durationInFrames * 0.6) / Math.max(1, total))));
  const colW = (W - safe.side * 2 - 40) / 2;

  const Column: React.FC<{title: string; items: string[]; side: 'left' | 'right'; offset: number}> = ({
    title,
    items,
    side,
    offset,
  }) => {
    const accent = side === 'left' ? color.gold : color.muted;
    return (
      <div style={{width: colW}}>
        <div
          style={{
            fontFamily: font.sans,
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: accent,
            opacity: ease(frame, offset, offset + 10),
            paddingBottom: 18,
            borderBottom: `3px solid ${accent}`,
            marginBottom: 28,
          }}
        >
          {title}
        </div>
        {items.map((item, i) => {
          const at = offset + 8 + i * step;
          const p = ease(frame, at, at + 10);
          const strike = side === 'right' ? ease(frame, at + 14, at + 24) : 0;
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                fontFamily: font.serif,
                fontWeight: 600,
                fontSize: 58,
                lineHeight: 1.1,
                color: side === 'right' ? `rgba(239,232,216,${1 - strike * 0.55})` : color.ink,
                opacity: p,
                transform: `translateX(${(1 - p) * (side === 'left' ? -30 : 30)}px)`,
                marginBottom: 26,
              }}
            >
              <span style={{position: 'relative', display: 'inline-block'}}>
                {item}
                {side === 'right' ? (
                  <span
                    style={{
                      position: 'absolute',
                      left: -4,
                      top: '54%',
                      height: 4,
                      width: `calc(${strike * 100}% + 8px)`,
                      background: color.red,
                    }}
                  />
                ) : null}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: safe.top + 140,
        left: safe.side,
        width: W - safe.side * 2,
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <Column title={scene.left.title} items={scene.left.items} side="left" offset={0} />
      <Column
        title={scene.right.title}
        items={scene.right.items}
        side="right"
        offset={6 + scene.left.items.length * step}
      />
    </div>
  );
};
