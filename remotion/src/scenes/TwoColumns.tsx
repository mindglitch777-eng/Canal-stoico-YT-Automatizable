import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../anim';
import {hash} from '../director';
import {Decode, inkStyle} from '../kinetic';
import type {SceneProps} from '../Short';
import {Stage} from '../stage';
import {color, font} from '../theme';
import type {TwoColumnsScene} from '../types';

// Letras que se rompen y caen con gravedad (para lo que "no está en tu control").
const Shatter: React.FC<{text: string; at: number; seed: number}> = ({text, at, seed}) => {
  const frame = useCurrentFrame();
  const f = frame - at;
  return (
    <span style={{display: 'inline-block', whiteSpace: 'nowrap'}}>
      {text.split('').map((ch, i) => {
        if (f <= 0) return <span key={i}>{ch}</span>;
        const r1 = hash(seed * 100 + i);
        const r2 = hash(seed * 100 + i + 50);
        const t = f / 30;
        const x = (r1 - 0.5) * 260 * t;
        const y = -120 * t * (0.6 + r2) + 0.5 * 2600 * t * t;
        const rot = (r1 - 0.5) * 720 * t;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translate(${x}px, ${y}px) rotate(${rot}deg) translateZ(${r2 * 200 * t}px)`,
              opacity: interpolate(f, [8, 26], [1, 0], clamp),
              whiteSpace: 'pre',
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

const Card: React.FC<{
  title: string;
  items: string[];
  side: 'left' | 'right';
  enterAt: number;
  itemTimes: number[];
  strikeTimes?: number[];
}> = ({title, items, side, enterAt, itemTimes, strikeTimes}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - enterAt, fps, config: {damping: 14, stiffness: 120}});
  const dir = side === 'left' ? -1 : 1;
  const good = side === 'left';
  const accent = good ? color.gold : color.red;
  return (
    <div
      style={{
        width: 900,
        padding: '34px 44px 30px',
        borderRadius: 28,
        background: good
          ? 'linear-gradient(160deg, rgba(232,184,90,0.16), rgba(20,17,12,0.55) 60%)'
          : 'linear-gradient(200deg, rgba(181,72,59,0.14), rgba(20,17,12,0.55) 60%)',
        border: `2px solid ${good ? 'rgba(232,184,90,0.55)' : 'rgba(181,72,59,0.45)'}`,
        boxShadow: `0 40px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 ${good ? 40 : 20}px ${good ? 'rgba(232,184,90,0.18)' : 'rgba(181,72,59,0.12)'}`,
        backdropFilter: 'blur(6px)',
        transform: `rotateX(${(1 - s) * dir * -100}deg) rotateY(${dir * 4}deg) translateZ(${(1 - s) * -400}px)`,
        opacity: interpolate(frame - enterAt, [0, 6], [0, 1], clamp),
        transformStyle: 'preserve-3d',
        textAlign: 'left',
      }}
    >
      <Decode
        text={title.toUpperCase()}
        startFrame={enterAt + 4}
        style={{fontFamily: font.sans, fontWeight: 800, fontSize: 30, letterSpacing: '0.2em', color: accent, paddingBottom: 16, borderBottom: `2px solid ${accent}`, marginBottom: 14}}
      />
      {items.map((it, i) => {
        const at = itemTimes[i];
        const p = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 220, mass: 0.6}});
        const strike = strikeTimes?.[i];
        const sp = strike !== undefined ? interpolate(frame, [strike, strike + 7], [0, 1], clamp) : 0;
        return (
          <div
            key={i}
            style={{
              position: 'relative',
              fontFamily: font.serif,
              fontWeight: 600,
              fontSize: 66,
              lineHeight: 1.05,
              margin: '12px 0',
              opacity: frame >= at ? 1 : 0,
              transform: `translateX(${(1 - p) * dir * 120}px) translateZ(${(1 - p) * 160}px) scale(${0.8 + 0.2 * p})`,
              ...inkStyle(3),
            }}
          >
            {good ? (
              <span style={{color: color.gold, marginRight: 14, display: 'inline-block', transform: `scale(${p})`}}>✓</span>
            ) : null}
            {strike !== undefined ? <Shatter text={it} at={strike + 9} seed={i + 3} /> : it}
            {strike !== undefined && sp > 0 ? (
              <div
                style={{
                  position: 'absolute',
                  left: -6,
                  top: '52%',
                  height: 7,
                  width: `${sp * 104}%`,
                  background: `linear-gradient(90deg, #FF6A55, ${color.red})`,
                  boxShadow: '0 0 18px rgba(255,80,60,0.9)',
                  transform: `rotate(${-3 + hash(i) * 6}deg)`,
                  opacity: interpolate(frame, [strike + 9, strike + 16], [1, 0], clamp),
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// Contraste: dos tarjetas de vidrio que giran en 3D. Lo tuyo se marca en oro;
// lo que no controlás se tacha en rojo y se hace pedazos.
export const TwoColumns: React.FC<SceneProps<TwoColumnsScene>> = ({scene, durationInFrames}) => {
  const frame = useCurrentFrame();
  const n = scene.left.items.length + scene.right.items.length;
  const span = durationInFrames * 0.55;
  const step = Math.max(5, Math.min(14, span / Math.max(1, n)));
  const leftTimes = scene.left.items.map((_, i) => Math.round(10 + i * step));
  const rightStart = 16 + scene.left.items.length * step;
  const rightTimes = scene.right.items.map((_, i) => Math.round(rightStart + i * step));
  const strikeBase = Math.max(rightTimes[rightTimes.length - 1] + 12, Math.round(durationInFrames * 0.62));
  const strikeTimes = scene.right.items.map((_, i) => Math.round(strikeBase + i * 7));
  const beam = 0.7 + Math.sin(frame * 0.9) * 0.15 + (hash(Math.floor(frame / 3)) > 0.85 ? 0.3 : 0);
  return (
    <Stage>
      <div style={{display: 'flex', flexDirection: 'column', gap: 46, alignItems: 'center', transformStyle: 'preserve-3d', position: 'relative'}}>
        <Card title={scene.left.title} items={scene.left.items} side="left" enterAt={0} itemTimes={leftTimes} />
        {/* Rayo de luz entre las dos */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: -90,
            right: -90,
            height: 4,
            marginTop: -2,
            background: `linear-gradient(90deg, transparent, rgba(255,231,163,${beam}), transparent)`,
            boxShadow: `0 0 30px 6px rgba(232,184,90,${beam * 0.5})`,
            transform: `scaleX(${interpolate(frame, [0, 14], [0, 1], clamp)})`,
          }}
        />
        <Card title={scene.right.title} items={scene.right.items} side="right" enterAt={6} itemTimes={rightTimes} strikeTimes={strikeTimes} />
      </div>
    </Stage>
  );
};
