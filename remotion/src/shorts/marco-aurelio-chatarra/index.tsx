// Video a medida: "You'd never pay $5,000 for scrap metal" (shorts/marco-aurelio-chatarra/short.json).
// Cada escena es un mundo propio; las transiciones están dentro de cada escena, como pide el guion.
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Flashes, Lens} from '../../fx';
import type {CustomShortProps} from '..';
import {S1Watch, S2Empire, S3Instead, S11Loop} from './scenesA';
import {S4Feast, S5Robe} from './scenesB';
import {S6Phone, S7Treadmill, S8Spiral, spiralRot} from './scenesC';
import {S9Labels, S10Marble} from './scenesD';
import {wordFrame} from './util';

const SCENES = [S1Watch, S2Empire, S3Instead, S4Feast, S5Robe, S6Phone, S7Treadmill, S8Spiral, null, S10Marble, S11Loop];

export const MarcoAurelioChatarra: React.FC<CustomShortProps> = ({timeline, spans}) => {
  const fps = timeline.fps || 30;
  const s8 = timeline.scenes[7];
  // La espiral se congela en 'hypnotized' y estalla 0,4 s después (en la escena 9).
  const snap8 = wordFrame(s8, fps, 'hypnotized', 1, 'end', 0.85);
  const spiral = {
    rot: spiralRot(snap8 / fps),
    zoom: 1 + (snap8 / spans[7].dur) * 0.6,
    dropF: spans[7].from + snap8 + Math.round(0.4 * fps) - spans[8].from,
  };
  return (
    <AbsoluteFill>
      {timeline.scenes.map((scene, i) => {
        const C = SCENES[i];
        return (
          <Sequence key={i} from={spans[i].from} durationInFrames={spans[i].dur} name={`${i + 1}`} layout="none">
            <AbsoluteFill>{C ? <C scene={scene} dur={spans[i].dur} /> : <S9Labels scene={scene} dur={spans[i].dur} spiral={spiral} />}</AbsoluteFill>
          </Sequence>
        );
      })}
      <Flashes />
      <Lens />
    </AbsoluteFill>
  );
};

// Escenas sin subtítulos (la cita ya se lee grabada en el mármol).
export const noCaptions = [10];
