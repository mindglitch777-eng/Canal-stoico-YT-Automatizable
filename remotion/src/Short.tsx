import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from './Background';
import {Captions} from './Captions';
import {DirectorProvider, goldWords, norm, onScreenText, screenTexts} from './director';
import {useFontsReady} from './fonts';
import {Camera, Flashes, Lens, Progress, transitionStyle} from './fx';
import {Chart} from './scenes/Chart';
import {Counter} from './scenes/Counter';
import {Hook} from './scenes/Hook';
import {Quote} from './scenes/Quote';
import {Outro, Statement} from './scenes/Statement';
import {TwoColumns} from './scenes/TwoColumns';
import type {Scene, Timeline} from './types';
import {World3D} from './World3D';
import {customShorts} from './shorts';

export type SceneProps<S extends Scene = Scene> = {scene: S; durationInFrames: number; startFrame: number; index: number};

const SceneBody: React.FC<SceneProps> = (p) => {
  const {scene} = p;
  switch (scene.type) {
    case 'hook':
      return <Hook {...p} scene={scene} />;
    case 'quote':
      return <Quote {...p} scene={scene} />;
    case 'twoColumns':
      return <TwoColumns {...p} scene={scene} />;
    case 'chart':
      return <Chart {...p} scene={scene} />;
    case 'counter':
      return <Counter {...p} scene={scene} />;
    case 'statement':
      return <Statement {...p} scene={scene} />;
    case 'outro':
      return <Outro {...p} scene={scene} />;
    case 'custom':
      // Sin composición propia: muestra su texto como una frase (prototipo rápido).
      return <Statement {...p} scene={{...scene, type: 'statement', text: scene.onScreen ?? ''}} />;
  }
};

const SceneLayer: React.FC<SceneProps> = (p) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={transitionStyle(f, p.durationInFrames, p.index)}>
      <SceneBody {...p} />
    </AbsoluteFill>
  );
};

// Si la escena ya muestra en pantalla lo mismo que dice la voz, no repetimos subtítulos.
const duplicated = (scene: Scene) => {
  const on = onScreenText(scene).replace(/\*/g, '');
  return on !== '' && norm(on) === norm(scene.say);
};

// Capas comunes a todos los videos: voz, música y efectos, subtítulos.
const Voice: React.FC<{scenes: Scene[]; spans: Array<{from: number; dur: number}>; soundtrack?: string | null}> = ({scenes, spans, soundtrack}) => (
  <>
    {scenes.map((scene, i) =>
      scene.audio ? (
        <Sequence key={`a${i}`} from={spans[i].from} durationInFrames={spans[i].dur} layout="none">
          <Audio src={staticFile(scene.audio)} />
        </Sequence>
      ) : null,
    )}
    {soundtrack ? <Audio src={staticFile(soundtrack)} /> : null}
  </>
);

const CaptionsLayer: React.FC<{scenes: Scene[]; spans: Array<{from: number; dur: number}>; skip?: number[]; screen?: Record<number, string[]>; fadeAt?: number}> = ({
  scenes,
  spans,
  skip = [],
  screen = {},
  fadeAt,
}) => {
  const f = useCurrentFrame();
  const fade = fadeAt === undefined ? 1 : Math.max(0, Math.min(1, (fadeAt - f) / 6));
  return (
  <div style={{position: 'absolute', inset: 0, opacity: fade}}>
    {scenes.map((scene, i) =>
      duplicated(scene) || skip.includes(i + 1) ? null : (
        <Sequence key={`c${i}`} from={spans[i].from} durationInFrames={spans[i].dur} layout="none">
          <Captions words={scene.words} gold={goldWords(onScreenText(scene))} screen={[...screenTexts(scene), ...(screen[i + 1] ?? [])]} />
        </Sequence>
      ),
    )}
  </div>
  );
};

export const Short: React.FC<Timeline> = (timeline) => {
  useFontsReady();
  const {scenes, captions = true} = timeline;
  const {fps} = useVideoConfig();
  const spans = scenes.map((s) => ({from: Math.round(s.start * fps), dur: Math.max(1, Math.round(s.duration * fps))}));
  // La última escena llega exactamente hasta el final de la línea de tiempo (sin cuadros vacíos por redondeo).
  if (spans.length) spans[spans.length - 1].dur = Math.max(1, Math.round(timeline.total * fps) - spans[spans.length - 1].from);
  // Video a medida: si el Short tiene su propia composición (src/shorts/<id>/), se usa esa.
  const custom = customShorts[timeline.id];
  if (custom) {
    const Custom = custom.component;
    return (
      <DirectorProvider timeline={timeline}>
        <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#050505'}}>
          <Custom timeline={timeline} spans={spans} />
          {captions ? <CaptionsLayer scenes={scenes} spans={spans} skip={custom.noCaptions} screen={custom.screen} fadeAt={custom.loop ? Math.round(timeline.total * fps) : undefined} /> : null}
          <Voice scenes={scenes} spans={spans} soundtrack={timeline.soundtrack} />
        </AbsoluteFill>
      </DirectorProvider>
    );
  }
  return (
    <DirectorProvider timeline={timeline}>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <Background />
        <World3D scenes={scenes} />
        <Camera>
          {scenes.map((scene, i) => (
            <Sequence key={i} from={spans[i].from} durationInFrames={spans[i].dur} name={`${i + 1}-${scene.type}`} layout="none">
              <SceneLayer scene={scene} durationInFrames={spans[i].dur} startFrame={spans[i].from} index={i} />
            </Sequence>
          ))}
        </Camera>
        <Flashes />
        {captions ? <CaptionsLayer scenes={scenes} spans={spans} /> : null}
        <Lens />
        <Progress />
        <Voice scenes={scenes} spans={spans} soundtrack={timeline.soundtrack} />
      </AbsoluteFill>
    </DirectorProvider>
  );
};
