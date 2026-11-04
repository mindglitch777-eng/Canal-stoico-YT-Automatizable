// El "director": a partir de la línea de tiempo calcula, para todo el video,
//  - golpes (hits): inicio de cada escena y cada palabra dorada cuando la voz la dice,
//  - planos (shots): cortes de cámara cada ~1,5 s para que la imagen nunca se quede quieta,
//  - transiciones: una distinta en cada cambio de escena.
// Todas las capas (3D, cámara, texto, destellos) leen de acá, así el video entero late junto.
import React, {createContext, useContext, useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import type {Scene, Timeline, Word} from './types';

export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Aleatorio determinístico (mismo resultado en cada render y en cada pestaña).
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
export const hash = (n: number) => rng(n * 9973 + 17)();

// Ruido suave (suma de senos) para derivas de cámara.
export const drift = (t: number, seed: number) =>
  Math.sin(t * 0.9 + seed) * 0.5 + Math.sin(t * 0.37 + seed * 2.3) * 0.35 + Math.sin(t * 1.7 + seed * 5.1) * 0.15;

export type Hit = {frame: number; strength: number; kind: 'scene' | 'gold' | 'number'};
export type Shot = {from: number; zoom: number; rx: number; ry: number; x: number; y: number};
export const TRANSITIONS = ['zoomThrough', 'whip', 'flip', 'glitch', 'drop'] as const;
export type TransitionKind = (typeof TRANSITIONS)[number];

// Texto que la escena muestra en pantalla (para saber qué palabras van en oro).
export const onScreenText = (scene: Scene) => {
  switch (scene.type) {
    case 'hook':
    case 'statement':
    case 'outro':
      return scene.text;
    case 'quote':
      return scene.quote;
    case 'counter':
      return scene.label;
    default:
      return '';
  }
};

export const goldWords = (text: string) => {
  const out: string[] = [];
  text.split('*').forEach((part, i) => {
    if (i % 2 === 1) out.push(...part.split(/\s+/).map(norm).filter(Boolean));
  });
  return out;
};

// Para cada palabra en pantalla, el segundo (relativo a la escena) en que la voz la dice.
// Si la voz no la dice, se reparte entre la anterior y la siguiente.
export const syncTokens = (tokens: string[], words: Word[], fallbackSpan: number): number[] => {
  const times: Array<number | null> = [];
  let j = 0;
  for (const tok of tokens) {
    const n = norm(tok);
    let found: number | null = null;
    for (let k = j; k < words.length; k++) {
      if (norm(words[k].text) === n) {
        found = words[k].start;
        j = k + 1;
        break;
      }
    }
    times.push(found);
  }
  if (times.every((t) => t === null)) {
    const step = fallbackSpan / Math.max(1, tokens.length);
    return tokens.map((_, i) => i * step);
  }
  // Completa huecos
  const out = [...times];
  for (let i = 0; i < out.length; i++) {
    if (out[i] !== null) continue;
    const prev = i > 0 ? (out[i - 1] as number) : 0;
    let k = i + 1;
    while (k < out.length && out[k] === null) k++;
    const next = k < out.length ? (out[k] as number) : prev + 0.4 * (k - i + 1);
    out[i] = prev + ((next - prev) * 1) / (k - i + 1);
  }
  return out as number[];
};

type DirectorData = {
  fps: number;
  total: number;
  hits: Hit[];
  shots: Shot[];
  sceneStarts: number[];
};

const Ctx = createContext<DirectorData | null>(null);

export const buildDirector = (tl: Timeline): DirectorData => {
  const fps = tl.fps || 30;
  const hits: Hit[] = [];
  const shots: Shot[] = [];
  const sceneStarts: number[] = [];
  const r = rng(tl.id.length * 31 + tl.scenes.length);
  const zooms = [1.0, 1.07, 0.96, 1.1, 1.03];
  tl.scenes.forEach((s, si) => {
    const start = Math.round(s.start * fps);
    const dur = Math.round(s.duration * fps);
    sceneStarts.push(start);
    hits.push({frame: start, strength: 1, kind: 'scene'});
    const gold = new Set(goldWords(onScreenText(s)));
    for (const w of s.words) {
      const n = norm(w.text);
      if (gold.has(n)) hits.push({frame: start + Math.round(w.start * fps), strength: 0.75, kind: 'gold'});
      else if (/\d/.test(n)) hits.push({frame: start + Math.round(w.start * fps), strength: 0.55, kind: 'number'});
    }
    // Planos: un corte cada ~1,5 s, pegado al comienzo de una palabra si hay una cerca.
    let f = 0;
    let k = 0;
    while (f < dur) {
      shots.push({
        from: start + f,
        zoom: k === 0 ? 1 : zooms[(si + k) % zooms.length],
        rx: k === 0 ? 0 : (r() - 0.5) * 7,
        ry: k === 0 ? 0 : (r() - 0.5) * 9,
        x: k === 0 ? 0 : (r() - 0.5) * 36,
        y: k === 0 ? 0 : (r() - 0.5) * 40,
      });
      let next = f + 42 + Math.round(r() * 14);
      const near = s.words.map((w) => Math.round(w.start * fps)).find((wf) => Math.abs(wf - next) < 8);
      if (near !== undefined) next = near;
      if (dur - next < 24) break;
      f = next;
      k++;
    }
  });
  hits.sort((a, b) => a.frame - b.frame);
  return {fps, total: Math.round(tl.total * fps), hits, shots, sceneStarts};
};

export const DirectorProvider: React.FC<{timeline: Timeline; children: React.ReactNode}> = ({timeline, children}) => {
  const data = useMemo(() => buildDirector(timeline), [timeline]);
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
};

export const useDirectorData = () => {
  const d = useContext(Ctx);
  if (!d) throw new Error('Falta DirectorProvider');
  return d;
};

// Energía del golpe en este cuadro (0..~1.3): sube de golpe y cae en ~8 cuadros.
export const energyAt = (hits: Hit[], f: number, decay = 7) => {
  let e = 0;
  for (const h of hits) {
    if (h.frame > f) break;
    const d = f - h.frame;
    if (d < decay * 5) e += h.strength * Math.exp(-d / decay);
  }
  return Math.min(1.3, e);
};

// Lo que usan las capas: cuadro global, energía, plano actual y transición más cercana.
export const useDirector = () => {
  const d = useDirectorData();
  const frame = useCurrentFrame(); // ojo: usar solo fuera de <Sequence> para que sea el cuadro global
  const energy = energyAt(d.hits, frame);
  let shot = d.shots[0];
  let prevShot = d.shots[0];
  for (const s of d.shots) {
    if (s.from > frame) break;
    prevShot = shot;
    shot = s;
  }
  return {...d, frame, energy, shot, prevShot};
};
