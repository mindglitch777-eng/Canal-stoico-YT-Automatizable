import React from 'react';
import {evolvePath} from '@remotion/paths';
import {useCurrentFrame} from 'remotion';
import {ease} from '../anim';
import {color, font, safe, W} from '../theme';
import type {ChartScene} from '../types';

// Gráfico de línea que se dibuja solo. trend "down" = rojo, "up" = oro.
export const Chart: React.FC<{scene: ChartScene; durationInFrames: number}> = ({scene, durationInFrames}) => {
  const frame = useCurrentFrame();
  const cw = W - safe.side * 2;
  const ch = 560;
  const pad = 20;
  const pts = scene.points.length >= 2 ? scene.points : [0, 1];
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const xy = pts.map((v, i) => {
    const x = pad + (i / (pts.length - 1)) * (cw - pad * 2);
    const y = pad + (1 - (v - min) / (max - min || 1)) * (ch - pad * 2);
    return [x, y] as const;
  });
  const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const drawEnd = Math.max(20, Math.floor(durationInFrames * 0.65));
  const progress = ease(frame, 6, drawEnd);
  const {strokeDasharray, strokeDashoffset} = evolvePath(progress, d);
  const stroke = scene.trend === 'down' ? color.red : color.gold;
  const area = `${d} L ${xy[xy.length - 1][0]} ${ch} L ${xy[0][0]} ${ch} Z`;
  const [ex, ey] = xy[xy.length - 1];
  const done = ease(frame, drawEnd, drawEnd + 10);
  const pulse = 1 + Math.sin(frame / 4) * 0.15 * done;

  return (
    <div style={{position: 'absolute', top: safe.top + 60, left: safe.side, width: cw}}>
      <div
        style={{
          fontFamily: font.sans,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: color.muted,
          opacity: ease(frame, 0, 10),
          marginBottom: 40,
        }}
      >
        {scene.label}
      </div>
      <svg width={cw} height={ch} style={{overflow: 'visible'}}>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={0} x2={cw} y1={ch * f} y2={ch * f} stroke={color.line} strokeWidth={2} />
        ))}
        <path d={area} fill={stroke} opacity={0.12 * done} />
        <path
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
        <circle cx={ex} cy={ey} r={16 * pulse} fill={stroke} opacity={done} />
      </svg>
      {scene.annotation ? (
        <div
          style={{
            marginTop: 34,
            fontFamily: font.serif,
            fontWeight: 700,
            fontSize: 76,
            color: stroke,
            opacity: done,
            transform: `translateY(${(1 - done) * 16}px)`,
          }}
        >
          {scene.annotation}
        </div>
      ) : null}
    </div>
  );
};
