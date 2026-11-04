import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, RevealText} from '../anim';
import {font, safe, W, color} from '../theme';
import type {StatementScene, OutroScene} from '../types';

// Afirmación centrada; *palabras* en oro.
export const Statement: React.FC<{scene: StatementScene; durationInFrames: number}> = ({scene}) => {
  const frame = useCurrentFrame();
  const scale = 0.96 + ease(frame, 0, 40) * 0.04;
  return (
    <div
      style={{
        position: 'absolute',
        top: safe.top,
        height: safe.contentBottom - safe.top,
        left: safe.side,
        width: W - safe.side * 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        transform: `scale(${scale})`,
      }}
    >
      <RevealText
        text={scene.text}
        perWord={3}
        style={{fontFamily: font.serif, fontWeight: 700, fontSize: 104, lineHeight: 1.05, color: color.ink}}
      />
    </div>
  );
};

// Cierre: frase final, un círculo que se cierra (invita a volver a ver) y la marca.
export const Outro: React.FC<{scene: OutroScene; durationInFrames: number}> = ({scene, durationInFrames}) => {
  const frame = useCurrentFrame();
  const r = 150;
  const circ = 2 * Math.PI * r;
  const p = ease(frame, 4, Math.max(20, durationInFrames - 10));
  return (
    <div
      style={{
        position: 'absolute',
        top: safe.top + 40,
        left: safe.side,
        width: W - safe.side * 2,
        textAlign: 'center',
      }}
    >
      <svg width={r * 2 + 20} height={r * 2 + 20} style={{display: 'block', margin: '0 auto 50px'}}>
        <circle cx={r + 10} cy={r + 10} r={r} fill="none" stroke={color.goldDim} strokeWidth={4} />
        <circle
          cx={r + 10}
          cy={r + 10}
          r={r}
          fill="none"
          stroke={color.gold}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - p)}
          transform={`rotate(-90 ${r + 10} ${r + 10})`}
        />
        <text
          x={r + 10}
          y={r + 34}
          textAnchor="middle"
          fontFamily={font.serif}
          fontWeight={700}
          fontSize={72}
          fill={color.gold}
          opacity={ease(frame, 6, 18)}
        >
          CF
        </text>
      </svg>
      <RevealText
        text={scene.text}
        perWord={3}
        startFrame={6}
        style={{fontFamily: font.serif, fontWeight: 700, fontSize: 88, lineHeight: 1.06, color: color.ink}}
      />
      <div
        style={{
          marginTop: 46,
          fontFamily: font.sans,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: '0.4em',
          color: color.muted,
          opacity: ease(frame, 20, 34),
        }}
      >
        CALM FORTUNE
      </div>
    </div>
  );
};
