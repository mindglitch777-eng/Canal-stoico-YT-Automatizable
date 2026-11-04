import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from './Background';
import {Captions} from './Captions';
import {DirectorProvider, goldWords, norm, onScreenText} from './director';
import {Camera, Flashes, Lens, Progress, transitionStyle} from './fx';
import {Chart} from './scenes/Chart';
import {Counter} from './scenes/Counter';
import {Hook} from './scenes/Hook';
import {Quote} from './scenes/Quote';
import {Outro, Statement} from './scenes/Statement';
import {TwoColumns} from './scenes/TwoColumns';
import type {Scene, Timeline} from './types';
import {World3D} from './World3D';

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

export const Short: React.FC<Timeline> = (timeline) => {
  const {scenes, captions = true} = timeline;
  const {fps} = useVideoConfig();
  const spans = scenes.map((s) => ({from: Math.round(s.start * fps), dur: Math.max(1, Math.round(s.duration * fps))}));
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
        {captions &&
          scenes.map((scene, i) =>
            duplicated(scene) ? null : (
              <Sequence key={`c${i}`} from={spans[i].from} durationInFrames={spans[i].dur} layout="none">
                <Captions words={scene.words} gold={goldWords(onScreenText(scene))} />
              </Sequence>
            ),
          )}
        <Lens />
        <Progress />
        {scenes.map((scene, i) =>
          scene.audio ? (
            <Sequence key={`a${i}`} from={spans[i].from} durationInFrames={spans[i].dur} layout="none">
              <Audio src={staticFile(scene.audio)} />
            </Sequence>
          ) : null,
        )}
      </AbsoluteFill>
    </DirectorProvider>
  );
};
