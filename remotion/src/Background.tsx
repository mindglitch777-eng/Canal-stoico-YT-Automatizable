import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {color, H, W} from './theme';

// Fondo continuo: negro cálido, una luz que respira y grano de película.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const lx = 50 + Math.sin(t * 0.25) * 12;
  const ly = 30 + Math.cos(t * 0.18) * 8;
  const glow = 0.55 + Math.sin(t * 0.6) * 0.06;
  return (
    <AbsoluteFill style={{backgroundColor: color.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 85% 55% at ${lx}% ${ly}%, rgba(200,162,74,${0.16 * glow}) 0%, ${color.bgWarm} 45%, ${color.bg} 85%)`,
        }}
      />
      {/* Columnas finas, guiño a la Stoa */}
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.07}}>
        {[180, 360, 720, 900].map((x) => (
          <line key={x} x1={x} y1={0} x2={x} y2={H} stroke={color.ink} strokeWidth={1} />
        ))}
      </svg>
      {/* Grano */}
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.09, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 8} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      {/* Viñeta */}
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)'}}
      />
    </AbsoluteFill>
  );
};
