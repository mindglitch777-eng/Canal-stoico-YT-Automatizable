// Capas de edición que van por encima de todo: cámara con cortes, destellos, luces y transiciones.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp} from './anim';
import {drift, energyAt, hash, TRANSITIONS, useDirector, useDirectorData, type TransitionKind} from './director';
import {color, H, W} from './theme';

// Cámara 2D/3D sobre el contenido: deriva suave + corte de plano cada ~1,5 s + golpe de zoom y temblor.
// Se usa fuera de las Sequence (cuadro global).
export const Camera: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {frame, fps, energy, shot, prevShot, hits} = useDirector();
  const t = frame / fps;
  // Corte de plano rápido (3 cuadros) — se siente como un jump cut, no como un paneo lento.
  const k = interpolate(frame - shot.from, [0, 3], [0, 1], clamp);
  const mix = (a: number, b: number) => a + (b - a) * k;
  const zoom = mix(prevShot.zoom, shot.zoom) + t * 0.004 + energy * 0.07;
  const rx = mix(prevShot.rx, shot.rx) + drift(t * 0.5, 3) * 2.2;
  const ry = mix(prevShot.ry, shot.ry) + drift(t * 0.45, 7) * 2.8;
  const x = mix(prevShot.x, shot.x);
  const y = mix(prevShot.y, shot.y);
  // Temblor: sólo justo después de un golpe fuerte.
  const kick = energyAt(hits.filter((h) => h.strength >= 0.7), frame, 4);
  const sx = Math.sin(frame * 1.9) * kick * 14;
  const sy = Math.cos(frame * 2.7) * kick * 10;
  // Aberración cromática en los golpes
  const ca = Math.min(1, energy) * 6;
  return (
    <AbsoluteFill style={{perspective: 1800, perspectiveOrigin: '50% 40%'}}>
      <AbsoluteFill
        style={{
          transform: `translate(${x + sx}px, ${y + sy}px) scale(${zoom}) rotateX(${rx}deg) rotateY(${ry}deg)`,
          transformOrigin: '50% 38%',
          transformStyle: 'preserve-3d',
          filter: ca > 0.4 ? `drop-shadow(${ca}px 0 0 rgba(255,40,70,0.45)) drop-shadow(${-ca}px 0 0 rgba(40,220,255,0.4))` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Destello de luz en cada cambio de escena y barrido anamórfico en cada golpe dorado.
export const Flashes: React.FC = () => {
  const {frame, hits} = useDirector();
  const scene = energyAt(hits.filter((h) => h.kind === 'scene'), frame, 3);
  const gold = energyAt(hits.filter((h) => h.kind !== 'scene'), frame, 6);
  const last = [...hits].reverse().find((h) => h.frame <= frame && h.kind !== 'scene');
  const flareY = last ? 420 + hash(last.frame) * 600 : 700;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: '#FFF6DF', opacity: Math.min(0.4, scene * 0.36), mixBlendMode: 'screen'}} />
      {gold > 0.05 && (
        <div
          style={{
            position: 'absolute',
            left: -200,
            width: W + 400,
            top: flareY - 3,
            height: 6,
            background: 'linear-gradient(90deg, transparent, rgba(255,214,140,0.95) 45%, #FFFFFF 50%, rgba(255,214,140,0.95) 55%, transparent)',
            opacity: Math.min(1, gold),
            transform: `scaleX(${0.6 + gold * 0.6})`,
            boxShadow: '0 0 40px 12px rgba(232,184,90,0.55)',
            mixBlendMode: 'screen',
          }}
        />
      )}
      {gold > 0.05 && (
        <div
          style={{
            position: 'absolute',
            left: W / 2 - 500,
            top: flareY - 500,
            width: 1000,
            height: 1000,
            background: 'radial-gradient(circle, rgba(255,220,150,0.35) 0%, transparent 60%)',
            opacity: Math.min(1, gold),
            mixBlendMode: 'screen',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// Filtraciones de luz que flotan (como en lentes de cine) + grano + viñeta.
export const Lens: React.FC = () => {
  const {frame, fps, energy} = useDirector();
  const t = frame / fps;
  const blobs = [
    {x: 20 + drift(t * 0.2, 1) * 30, y: 15 + drift(t * 0.15, 2) * 15, c: 'rgba(255,170,70,0.20)', s: 900},
    {x: 85 + drift(t * 0.18, 3) * 20, y: 70 + drift(t * 0.2, 4) * 20, c: 'rgba(200,120,40,0.16)', s: 1100},
  ];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.s,
            height: b.s,
            marginLeft: -b.s / 2,
            marginTop: -b.s / 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.c} 0%, transparent 65%)`,
            opacity: 0.8 + energy * 0.6,
            mixBlendMode: 'screen',
          }}
        />
      ))}
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.11, mixBlendMode: 'overlay'}}>
        <filter id="grain2">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 10} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain2)" />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 42%, transparent 50%, rgba(0,0,0,0.78) 100%)'}} />
    </AbsoluteFill>
  );
};

// Barra de progreso arriba: le dice al ojo "falta poco" (retención).
export const Progress: React.FC = () => {
  const {frame, total} = useDirector();
  const p = Math.min(1, frame / Math.max(1, total));
  return (
    <div style={{position: 'absolute', top: 0, left: 0, width: W, height: 10, background: 'rgba(239,232,216,0.08)'}}>
      <div style={{width: `${p * 100}%`, height: '100%', background: `linear-gradient(90deg, #8A6420, ${color.gold}, #FFE7A3)`, boxShadow: '0 0 18px rgba(232,184,90,0.8)'}} />
    </div>
  );
};

// Transición de cada escena (entrada y salida), distinta en cada cambio.
// `f` = cuadro dentro de la escena, `dur` = largo de la escena, `index` = número de escena.
export const transitionStyle = (f: number, dur: number, index: number): React.CSSProperties => {
  const IN = 7;
  const OUT = 6;
  const kindIn: TransitionKind = TRANSITIONS[(index + 4) % TRANSITIONS.length];
  const kindOut: TransitionKind = TRANSITIONS[index % TRANSITIONS.length];
  const pin = index === 0 ? 1 : interpolate(f, [0, IN], [0, 1], clamp);
  const pout = interpolate(f, [dur - OUT, dur], [0, 1], clamp);
  const ein = 1 - (1 - pin) ** 3;
  const eout = pout ** 2;
  let transform = '';
  let filter = '';
  let opacity = 1;
  let clipPath: string | undefined;
  const apply = (kind: TransitionKind, p: number, dir: 1 | -1) => {
    // p: 0 = en su lugar, 1 = fuera. dir: -1 entrando, 1 saliendo.
    if (p <= 0.001) return;
    switch (kind) {
      case 'zoomThrough':
        transform += ` scale(${dir === 1 ? 1 + p * 2.2 : 1 - p * 0.5})`;
        filter += ` blur(${p * 18}px)`;
        opacity *= 1 - p * 0.9;
        break;
      case 'whip':
        transform += ` translateX(${dir * p * 1300}px) skewX(${dir * p * -12}deg)`;
        filter += ` blur(${p * 22}px)`;
        break;
      case 'flip':
        transform += ` rotateY(${dir * p * 92}deg) translateZ(${-p * 200}px)`;
        opacity *= 1 - p * 0.4;
        break;
      case 'glitch': {
        const off = (hash(Math.round(p * 20) + index) - 0.5) * 160 * p;
        transform += ` translateX(${off}px)`;
        clipPath = `inset(${hash(index * 3 + Math.round(p * 9)) * 40 * p}% 0 ${hash(index * 7 + Math.round(p * 7)) * 40 * p}% 0)`;
        filter += ` drop-shadow(${12 * p}px 0 0 rgba(255,40,70,0.8)) drop-shadow(${-12 * p}px 0 0 rgba(40,220,255,0.8))`;
        break;
      }
      case 'drop':
        transform += ` translateY(${dir * p * -900}px) rotateX(${dir * p * 50}deg)`;
        opacity *= 1 - p * 0.5;
        break;
    }
  };
  apply(kindIn, 1 - ein, -1);
  apply(kindOut, eout, 1);
  return {transform: transform || undefined, filter: filter || undefined, opacity, clipPath, transformStyle: 'preserve-3d'};
};

// Para escenas que necesitan saber la energía (cuadro local + inicio de la escena).
export const useLocalEnergy = (sceneStartFrame: number) => {
  const {hits} = useDirectorData();
  const f = useCurrentFrame();
  return energyAt(hits, f + sceneStartFrame);
};
