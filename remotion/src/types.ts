// Contrato de datos entre tools/tts.py (que arma la línea de tiempo) y Remotion.
// Tiempos en segundos. Los de `words` son relativos al inicio de la escena.

export type Word = {text: string; start: number; end: number};

type Base = {
  say: string; // lo que dice la voz
  audio?: string | null; // ruta dentro de public/ (la pone render.mjs)
  start: number; // inicio de la escena en el video
  duration: number; // duración de la escena
  words: Word[];
};

export type HookScene = Base & {type: 'hook'; text: string; kicker?: string};
export type QuoteScene = Base & {type: 'quote'; quote: string; author: string; source?: string};
export type TwoColumnsScene = Base & {
  type: 'twoColumns';
  left: {title: string; items: string[]};
  right: {title: string; items: string[]};
};
export type ChartScene = Base & {
  type: 'chart';
  points: number[];
  label: string;
  trend?: 'up' | 'down';
  annotation?: string;
};
export type CounterScene = Base & {
  type: 'counter';
  from: number;
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
};
export type StatementScene = Base & {type: 'statement'; text: string};
export type OutroScene = Base & {type: 'outro'; text: string};
// Escena de un video a medida: la dibuja la composición propia del Short (src/shorts/<id>/).
export type CustomScene = Base & {type: 'custom'; onScreen?: string; visual?: string; [key: string]: unknown};

export type Scene =
  | HookScene
  | QuoteScene
  | TwoColumnsScene
  | ChartScene
  | CounterScene
  | StatementScene
  | OutroScene
  | CustomScene;

export type Timeline = {
  id: string;
  fps: number;
  captions?: boolean;
  scenes: Scene[];
  total: number;
  soundtrack?: string | null; // música + efectos (build/sound.wav), ruta dentro de public/
};
