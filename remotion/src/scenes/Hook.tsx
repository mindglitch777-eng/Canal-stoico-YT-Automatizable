import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, RevealText} from '../anim';
import {color, font, safe, W} from '../theme';
import type {HookScene} from '../types';

// Gancho: frase grande que entra palabra por palabra y una línea de oro que la subraya.
export const Hook: React.FC<{scene: HookScene; durationInFrames: number}> = ({scene}) => {
  const frame = useCurrentFrame();
  const words = scene.text.replace(/\*/g, '').split(/\s+/).length;
  const lineStart = words * 3 + 4;
  const zoom = 1 + ease(frame, 0, 90, 0, 0.04);
  return (
    <div
      style={{
        position: 'absolute',
        top: safe.top + 120,
        left: safe.side,
        width: W - safe.side * 2,
        transform: `scale(${zoom})`,
        transformOrigin: 'center top',
      }}
    >
      {scene.kicker ? (
        <div
          style={{
            fontFamily: font.sans,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: '0.32em',
            color: color.gold,
            opacity: ease(frame, 0, 10),
            marginBottom: 36,
            textTransform: 'uppercase',
          }}
        >
          {scene.kicker}
        </div>
      ) : null}
      <RevealText
        text={scene.text}
        perWord={3}
        style={{fontFamily: font.serif, fontWeight: 700, fontSize: 118, lineHeight: 1.02, color: color.ink}}
      />
      <div
        style={{
          marginTop: 48,
          height: 4,
          width: `${ease(frame, lineStart, lineStart + 18) * 62}%`,
          background: `linear-gradient(90deg, ${color.gold}, rgba(200,162,74,0))`,
        }}
      />
    </div>
  );
};
