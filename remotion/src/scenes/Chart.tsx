import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../anim';
import {hash} from '../director';
import {Decode, Shockwave} from '../kinetic';
import type {SceneProps} from '../Short';
import {Stage} from '../stage';
import {color, font, stage, W} from '../theme';
import type {ChartScene} from '../types';

const CW = 900;
const CH = 540;

// Gráfico en un plano 3D con grilla que corre. La cámara persigue la punta de la línea
// (zoom cerrado), y al final se abre para mostrar todo. Si cae: choque rojo, temblor y glitch.
export const Chart: React.FC<SceneProps<ChartScene>> = ({scene, durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pts = scene.points.length >= 2 ? scene.points : [0, 1];
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const pad = 30;
  const xy = pts.map((v, i) => [pad + (i / (pts.length - 1)) * (CW - pad * 2), pad + (1 - (v - min) / (max - min || 1)) * (CH - pad * 2)] as const);

  const drawEnd = Math.max(24, Math.round(durationInFrames * 0.62));
  const p = interpolate(frame, [4, drawEnd], [0, 1], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
  // Punta de la línea en este cuadro
  const fi = p * (pts.length - 1);
  const i0 = Math.min(pts.length - 2, Math.floor(fi));
  const tt = fi - i0;
  const hx = xy[i0][0] + (xy[i0 + 1][0] - xy[i0][0]) * tt;
  const hy = xy[i0][1] + (xy[i0 + 1][1] - xy[i0][1]) * tt;
  const value = pts[i0] + (pts[i0 + 1] - pts[i0]) * tt;
  const change = ((value - pts[0]) / (pts[0] || 1)) * 100;
  const visible = xy.slice(0, i0 + 1).concat([[hx, hy]]);
  const d = visible.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${d} L ${hx.toFixed(1)} ${CH} L ${xy[0][0]} ${CH} Z`;

  // ¿Cuándo empieza la caída? Después del máximo (si la tendencia es bajar).
  const peakIdx = pts.indexOf(max);
  const falling = scene.trend === 'down' && fi > peakIdx + 0.15;
  const fallStart = Math.round(4 + ((peakIdx + 0.15) / (pts.length - 1)) * (drawEnd - 4));
  const stroke = falling ? '#FF5A48' : '#F0C35E';

  // Cámara: zoom 1.9 sobre la punta mientras dibuja; se abre en el último tramo.
  const open = spring({frame: frame - drawEnd, fps, config: {damping: 14, stiffness: 90}});
  const zoom = interpolate(open, [0, 1], [1.9, 1]);
  const camX = (CW / 2 - hx) * (1 - open);
  const camY = (CH / 2 - hy) * (1 - open);
  const quake = falling && frame - fallStart < 18 ? Math.sin(frame * 3.1) * (18 - (frame - fallStart)) * 1.6 : 0;
  const glitch = falling && hash(Math.floor(frame / 2) + 3) > 0.82;

  const done = spring({frame: frame - drawEnd - 4, fps, config: {damping: 9, stiffness: 160, mass: 0.7}});
  const gridShift = (frame * 6) % 80;

  return (
    <>
      {falling ? (
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, rgba(194,72,58,0.0) 30%, rgba(194,72,58,0.28) 100%)', opacity: interpolate(frame, [fallStart, fallStart + 8], [0, 1], clamp)}} />
      ) : null}
      {scene.trend === 'down' ? <Shockwave at={fallStart} x={W / 2} y={stage.centerY} size={1400} color="rgba(255,90,72,0.85)" /> : null}
      <Stage>
        <Decode
          text={scene.label.toUpperCase()}
          style={{fontFamily: font.sans, fontWeight: 800, fontSize: 32, letterSpacing: '0.22em', color: color.muted, marginBottom: 26}}
        />
        <div style={{width: CW, height: CH, perspective: 1400, transform: `translateX(${quake}px)`}}>
          <div
            style={{
              position: 'relative',
              width: CW,
              height: CH,
              transform: `rotateX(${14 - open * 8}deg) rotateY(${-6 + Math.sin(frame / 30) * 4}deg) scale(${zoom}) translate(${camX}px, ${camY}px)`,
              transformOrigin: '50% 50%',
              transformStyle: 'preserve-3d',
              filter: glitch ? 'drop-shadow(10px 0 0 rgba(255,40,70,0.8)) drop-shadow(-10px 0 0 rgba(40,220,255,0.7))' : undefined,
            }}
          >
            {/* Grilla que corre (sensación de velocidad) */}
            <div
              style={{
                position: 'absolute',
                inset: -200,
                backgroundImage: `linear-gradient(rgba(232,184,90,0.10) 2px, transparent 2px), linear-gradient(90deg, rgba(232,184,90,0.10) 2px, transparent 2px)`,
                backgroundSize: '80px 80px',
                backgroundPosition: `${-gridShift}px 0px`,
                WebkitMaskImage: 'radial-gradient(ellipse at center, #000 40%, transparent 75%)',
                transform: 'translateZ(-60px)',
              }}
            />
            <svg width={CW} height={CH} style={{position: 'absolute', overflow: 'visible'}}>
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path d={area} fill="url(#area)" />
              <path d={d} fill="none" stroke={stroke} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" filter="url(#glow)" />
              {/* Estela de chispas detrás de la punta */}
              {Array.from({length: 10}, (_, k) => {
                const a = hash(k + Math.floor(frame / 2) * 13);
                const b = hash(k * 7 + Math.floor(frame / 2));
                return <circle key={k} cx={hx - a * 60} cy={hy + (b - 0.5) * 40} r={2 + a * 4} fill="#FFE7A3" opacity={(1 - a) * (1 - open)} />;
              })}
              <circle cx={hx} cy={hy} r={16 + Math.sin(frame / 3) * 4} fill={stroke} filter="url(#glow)" />
              <circle cx={hx} cy={hy} r={7} fill="#FFFFFF" />
            </svg>
            {/* Valor que corre junto a la punta */}
            <div
              style={{
                position: 'absolute',
                left: hx + 26,
                top: hy - 80,
                fontFamily: font.sans,
                fontWeight: 800,
                fontSize: 44 / zoom + 10,
                color: change < 0 ? '#FF6A55' : '#F0C35E',
                textShadow: '0 4px 14px rgba(0,0,0,0.9)',
                opacity: 1 - open,
                whiteSpace: 'nowrap',
              }}
            >
              {change >= 0 ? '+' : '−'}
              {Math.abs(change).toFixed(1)}%
            </div>
          </div>
        </div>
        {scene.annotation ? (
          <div
            style={{
              marginTop: 10,
              fontFamily: font.serif,
              fontWeight: 700,
              fontSize: 210,
              lineHeight: 1,
              color: scene.trend === 'down' ? '#FF5A48' : '#F0C35E',
              transform: `scale(${interpolate(done, [0, 1], [3, 1])}) rotate(${(1 - done) * -8}deg)`,
              opacity: frame > drawEnd + 4 ? Math.min(1, done * 2) : 0,
              filter: `${Array.from({length: 8}, () => `drop-shadow(0 1.6px 0 ${scene.trend === 'down' ? '#6E1D14' : '#6B4E17'})`).join(' ')} drop-shadow(0 0 30px ${scene.trend === 'down' ? 'rgba(255,80,60,0.6)' : 'rgba(232,184,90,0.6)'})`,
            }}
          >
            {scene.annotation}
          </div>
        ) : null}
      </Stage>
    </>
  );
};
