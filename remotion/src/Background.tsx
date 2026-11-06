import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {color} from './theme';

// Fondo base detrás del mundo 3D: negro cálido con una luz que respira.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const lx = 50 + Math.sin(t * 0.25) * 12;
  const ly = 35 + Math.cos(t * 0.18) * 8;
  return (
    <AbsoluteFill style={{backgroundColor: color.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 60% at ${lx}% ${ly}%, rgba(200,162,74,0.14) 0%, ${color.bgWarm} 45%, ${color.bg} 85%)`,
        }}
      />
    </AbsoluteFill>
  );
};
