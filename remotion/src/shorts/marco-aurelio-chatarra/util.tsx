import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {norm} from '../../director';
import {KineticText} from '../../kinetic';
import {font, safe, W} from '../../theme';
import type {Scene} from '../../types';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const outExpo = Easing.out(Easing.exp);
export const outCubic = Easing.out(Easing.cubic);
export const inOut = Easing.inOut(Easing.cubic);

// Cuadro (local a la escena) en que la voz dice `text`. Si no está, `fallback` (fracción de la escena).
export const wordFrame = (scene: Scene, fps: number, text: string, occ = 1, edge: 'start' | 'end' = 'start', fallback = 0.5) => {
  let n = 0;
  for (const w of scene.words) {
    if (norm(w.text) === norm(text)) {
      n++;
      if (n === occ) return Math.round(w[edge] * fps);
    }
  }
  return Math.round(scene.duration * fps * fallback);
};

export const lerp = (f: number, a: number, b: number, from = 0, to = 1, easing = outCubic) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});

// Texto en pantalla del guion (`onScreen`), arriba, al ritmo de la voz.
export const OnScreen: React.FC<{scene: Scene; top?: number; size?: number; entry?: 'slam' | 'rise' | 'flip' | 'mask'; style?: React.CSSProperties}> = ({
  scene,
  top = 250,
  size = 104,
  entry = 'slam',
  style,
}) => {
  const text = typeof (scene as {onScreen?: unknown}).onScreen === 'string' ? ((scene as {onScreen?: string}).onScreen as string) : '';
  return (
    <div style={{position: 'absolute', top, left: safe.side, width: W - safe.side * 2, textAlign: 'center', zIndex: 5, ...style}}>
      <KineticText text={text} words={scene.words} entry={entry} lead={3} style={{fontFamily: font.serif, fontWeight: 700, fontSize: size, lineHeight: 1.02}} goldScale={1.15} />
    </div>
  );
};

export const useLocal = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {f, fps, t: f / fps};
};

// Etiqueta de precio colgando de un hilo (sirve para relojes, autos, celulares).
export const PriceTag: React.FC<{text: string; x: number; y: number; rot?: number; scale?: number; burn?: number; style?: React.CSSProperties}> = ({
  text,
  x,
  y,
  rot = 0,
  scale = 1,
  burn = 0,
  style,
}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotateY(${rot}deg) scale(${scale})`, transformStyle: 'preserve-3d', ...style}}>
    <div style={{position: 'absolute', left: -120, top: -46, width: 130, height: 2, background: 'linear-gradient(90deg, transparent, #D9C9A0)', transform: 'rotate(-18deg)'}} />
    <div
      style={{
        position: 'relative',
        padding: '18px 36px 18px 54px',
        background: 'linear-gradient(160deg, #F7EFD9, #E2D3AE)',
        clipPath: 'polygon(14% 0, 100% 0, 100% 100%, 14% 100%, 0 50%)',
        fontFamily: font.serif,
        fontWeight: 700,
        fontSize: 86,
        color: '#2A1E0C',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        WebkitMaskImage: burn > 0 ? `radial-gradient(circle at 70% 60%, transparent ${burn * 140}%, #000 ${burn * 140 + 8}%)` : undefined,
      }}
    >
      <div style={{position: 'absolute', left: 22, top: '50%', width: 16, height: 16, marginTop: -8, borderRadius: '50%', background: '#5A4A2A'}} />
      {text}
    </div>
    {burn > 0 && burn < 1 ? (
      <div
        style={{
          position: 'absolute',
          inset: -30,
          background: `radial-gradient(circle at 70% 60%, transparent ${burn * 140 - 2}%, rgba(255,140,30,0.95) ${burn * 140 + 2}%, rgba(255,60,10,0.6) ${burn * 140 + 7}%, transparent ${burn * 140 + 12}%)`,
          mixBlendMode: 'screen',
          filter: 'blur(2px)',
        }}
      />
    ) : null}
  </div>
);
