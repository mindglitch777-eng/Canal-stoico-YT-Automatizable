import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {useSceneFade} from './anim';
import {Background} from './Background';
import {Captions} from './Captions';
import {Chart} from './scenes/Chart';
import {Counter} from './scenes/Counter';
import {Hook} from './scenes/Hook';
import {Quote} from './scenes/Quote';
import {Outro, Statement} from './scenes/Statement';
import {TwoColumns} from './scenes/TwoColumns';
import type {Scene, Timeline} from './types';

const SceneBody: React.FC<{scene: Scene; durationInFrames: number}> = ({scene, durationInFrames}) => {
  switch (scene.type) {
    case 'hook':
      return <Hook scene={scene} durationInFrames={durationInFrames} />;
    case 'quote':
      return <Quote scene={scene} durationInFrames={durationInFrames} />;
    case 'twoColumns':
      return <TwoColumns scene={scene} durationInFrames={durationInFrames} />;
    case 'chart':
      return <Chart scene={scene} durationInFrames={durationInFrames} />;
    case 'counter':
      return <Counter scene={scene} durationInFrames={durationInFrames} />;
    case 'statement':
      return <Statement scene={scene} durationInFrames={durationInFrames} />;
    case 'outro':
      return <Outro scene={scene} durationInFrames={durationInFrames} />;
  }
};

// Si la escena ya muestra en pantalla lo mismo que dice la voz, no repetimos subtítulos.
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const onScreenText = (scene: Scene) => {
  switch (scene.type) {
    case 'hook':
    case 'statement':
    case 'outro':
      return scene.text;
    case 'quote':
      return scene.quote;
    default:
      return '';
  }
};

const SceneLayer: React.FC<{scene: Scene; durationInFrames: number; captions: boolean}> = ({
  scene,
  durationInFrames,
  captions,
}) => {
  const opacity = useSceneFade(durationInFrames);
  const duplicated = norm(onScreenText(scene)) === norm(scene.say);
  return (
    <AbsoluteFill style={{opacity}}>
      <SceneBody scene={scene} durationInFrames={durationInFrames} />
      {captions && !duplicated ? <Captions words={scene.words} /> : null}
    </AbsoluteFill>
  );
};

export const Short: React.FC<Timeline> = ({scenes, captions = true}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Background />
      {scenes.map((scene, i) => {
        const from = Math.round(scene.start * fps);
        const dur = Math.max(1, Math.round(scene.duration * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={dur} name={`${i + 1}-${scene.type}`}>
            <SceneLayer scene={scene} durationInFrames={dur} captions={captions} />
            {scene.audio ? <Audio src={staticFile(scene.audio)} /> : null}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
