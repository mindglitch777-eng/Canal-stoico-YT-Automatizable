import type {Scene, Timeline, Word} from './types';

// Línea de tiempo de muestra (sin voz) con los 7 tipos de escena.
// Sirve para la prueba de plantillas y como vista previa en Remotion Studio.

type DistOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type Draft = DistOmit<Scene, 'start' | 'duration' | 'words'> & {duration?: number};

const fakeWords = (say: string, duration: number): Word[] => {
  const tokens = say.split(/\s+/).filter(Boolean);
  const step = (duration - 0.3) / Math.max(1, tokens.length);
  return tokens.map((text, i) => ({text, start: 0.1 + i * step, end: 0.1 + (i + 1) * step - 0.03}));
};

export const buildSilent = (id: string, drafts: Draft[]): Timeline => {
  let t = 0;
  const scenes = drafts.map((d) => {
    const duration = d.duration ?? Math.max(2.2, d.say.split(/\s+/).length / 2.6 + 0.4);
    const s = {...d, start: t, duration, words: fakeWords(d.say, duration), audio: null} as Scene;
    t += duration;
    return s;
  });
  return {id, fps: 30, captions: true, scenes, total: t};
};

export const demoTimeline: Timeline = buildSilent('demo', [
  {
    type: 'hook',
    kicker: 'Seneca · 4 BC – 65 AD',
    text: "One of Rome's *richest* men\ntrained to be *poor.*",
    say: "One of Rome's richest men trained to be poor.",
  },
  {
    type: 'quote',
    quote: 'It is not the man who has too little, but the man who craves more, that is poor.',
    author: 'Seneca',
    source: 'Letters to Lucilius, 2',
    say: 'It is not the man who has too little, but the man who craves more, that is poor.',
  },
  {
    type: 'twoColumns',
    left: {title: 'Your control', items: ['Your spending', 'Your effort', 'Your reaction']},
    right: {title: 'Not yours', items: ['The market', 'The economy', 'Other people']},
    say: 'Epictetus split the world in two. What you control, and what you do not.',
  },
  {
    type: 'chart',
    points: [100, 108, 104, 117, 112, 96, 88, 91, 80],
    trend: 'down',
    label: 'Your portfolio, this month',
    annotation: '−20%',
    say: 'Your portfolio just dropped twenty percent.',
  },
  {
    type: 'counter',
    from: 0,
    to: 2,
    suffix: '×',
    label: 'how much more a loss hurts than a gain feels good',
    say: 'Researchers found a loss hurts about twice as much as a gain feels good.',
  },
  {
    type: 'statement',
    text: 'Wealth is not what you *own.*\nIt is what you can *lose* calmly.',
    say: 'Wealth is not what you own. It is what you can lose calmly.',
  },
  {
    type: 'outro',
    text: 'So, are you *rich*\nor just afraid?',
    say: 'So, are you rich, or just afraid?',
  },
]);
