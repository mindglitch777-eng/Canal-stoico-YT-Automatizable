import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../anim';
import {norm} from '../director';
import {useLocalEnergy} from '../fx';
import {goldStyle, KineticText, Shockwave} from '../kinetic';
import type {SceneProps} from '../Short';
import {Stage} from '../stage';
import {font, stage, W} from '../theme';
import type {CounterScene} from '../types';

const NUMBER_WORDS = ['zero', 'one', 'two', 'twice', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'half', 'double', 'triple', 'hundred', 'thousand', 'million', 'percent'];
const DIGIT_H = 400;

// Rodillo de tragamonedas: gira varias vueltas con desenfoque de movimiento y frena en el dígito.
const Reel: React.FC<{digit: number; progress: number; spins: number; delay: number; frame: number; seed: number}> = ({digit, progress, spins, delay, frame, seed}) => {
  const p = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
  const e = 1 - (1 - p) ** 4;
  const pos = digit + spins * 10 * (1 - e); // en "dígitos"
  const speed = spins * 10 * 4 * (1 - p) ** 3; // derivada aproximada → desenfoque
  const strip = Array.from({length: 13}, (_, i) => i - 1);
  const base = Math.floor(pos);
  const gold = goldStyle(frame, seed, 10, 1.3);
  const frac = pos - base;
  return (
    <div style={{position: 'relative', height: DIGIT_H, width: DIGIT_H * 0.62, overflow: 'hidden', transform: 'rotateX(8deg)', WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 22%, #000 78%, transparent)'}}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${-(frac + 1) * DIGIT_H}px)`,
          ...gold,
          filter: speed > 0.5 ? `${gold.filter} blur(${Math.min(14, speed * 0.25)}px)` : gold.filter,
        }}
      >
        {strip.map((k) => (
          <div key={k} style={{height: DIGIT_H, lineHeight: `${DIGIT_H}px`, textAlign: 'center'}}>
            {(((base + k) % 10) + 10) % 10}
          </div>
        ))}
      </div>
    </div>
  );
};

// Número: tragamonedas en 3D que frena justo cuando la voz dice la cifra; al llegar, onda y lluvia de monedas (3D).
export const Counter: React.FC<SceneProps<CounterScene>> = ({scene, durationInFrames, startFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const energy = useLocalEnergy(startFrame);
  const spoken = scene.words.find((w) => /\d/.test(w.text) || NUMBER_WORDS.includes(norm(w.text)));
  const land = Math.min(durationInFrames - 20, Math.max(24, spoken ? Math.round(spoken.start * fps) + 4 : Math.round(durationInFrames * 0.4)));
  const progress = interpolate(frame, [0, land], [0, 1], clamp);
  const decimals = scene.decimals ?? 0;
  const text = scene.to.toFixed(decimals);
  const chars = text.split('');
  const landed = frame >= land;
  const suffixS = spring({frame: frame - land, fps, config: {damping: 9, stiffness: 200, mass: 0.6}});
  const tilt = Math.sin(frame / 22) * 8;
  return (
    <>
      <Shockwave at={land} x={W / 2} y={stage.centerY - 120} size={1500} />
      <Shockwave at={land + 5} x={W / 2} y={stage.centerY - 120} size={900} color="rgba(255,240,200,0.8)" />
      <Stage>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontFamily: font.serif,
            fontWeight: 700,
            fontSize: 380,
            lineHeight: 1,
            transform: `rotateY(${tilt}deg) scale(${1 + energy * 0.12 + (landed ? 0 : 0.04 * Math.sin(frame))})`,
          }}
        >
          {scene.prefix ? <span style={{fontSize: 220, ...goldStyle(frame, 1, 10, 1.3)}}>{scene.prefix}</span> : null}
          {chars.map((c, i) =>
            /\d/.test(c) ? (
              <Reel key={i} digit={Number(c)} progress={progress} spins={3 + i} delay={i * 0.08} frame={frame} seed={i * 3} />
            ) : (
              <span key={i} style={goldStyle(frame, i, 10, 1.3)}>{c}</span>
            ),
          )}
          {scene.suffix ? (
            <span style={{fontSize: 260, display: 'inline-block', ...goldStyle(frame, 8, 10, 1.3), transform: `scale(${suffixS}) rotate(${(1 - suffixS) * -90}deg)`, opacity: landed ? 1 : 0}}>
              {scene.suffix}
            </span>
          ) : null}
        </div>
        <KineticText
          text={scene.label}
          entry="rise"
          startFrame={Math.max(0, land - 2)}
          span={0.6}
          style={{fontFamily: font.serif, fontWeight: 600, fontSize: 70, lineHeight: 1.1, marginTop: 30, maxWidth: 880, whiteSpace: 'normal'}}
          lineStyle={{whiteSpace: 'normal'}}
        />
      </Stage>
    </>
  );
};
