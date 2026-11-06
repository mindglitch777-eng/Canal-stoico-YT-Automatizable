// Video a medida: "You'd never hand a stranger $100. Why hand your phone 3 hours?" (shorts/seneca-tiempo/short.json).
// Estilo: oscuridad total con luz fría de pantalla, glitch e interfaz; el oro solo para el tiempo de vida.
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {CustomShortProps} from '..';
import type {CaptionTheme} from '../../Captions';
import {S1, S10, S2, S3, S4, S5, S6, S7, S8, S9} from './scenes';

const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10];

export const SenecaTiempo: React.FC<CustomShortProps> = ({timeline, spans}) => (
  <AbsoluteFill style={{background: '#02050A'}}>
    {timeline.scenes.map((scene, i) => {
      const Sc = SCENES[i];
      return (
        <Sequence key={i} from={spans[i].from} durationInFrames={spans[i].dur} name={`${i + 1}`} layout="none">
          <AbsoluteFill>{Sc ? <Sc scene={scene} dur={spans[i].dur} /> : null}</AbsoluteFill>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

export const noCaptions = [6];

export const screen: Record<number, string[]> = {
  1: ['$100 No', '3 hours Sure', '3 HRS'],
  2: ['3+ hours every day'],
  3: ['186 checks'],
  4: ['45 days gone', '365 DAYS'],
  5: ['6 years scrolled', '6 YRS'],
  7: ['Your time free'],
  8: ["Can't buy one minute"],
  9: ['Be stingy with time'],
  10: ['Would you hand a stranger $100'],
};

// Subtítulos fríos (placa celeste); en oro solo las palabras del tiempo.
export const captionTheme: CaptionTheme = {
  pill: 'linear-gradient(180deg, #D6F6FF, #6CCBFF 60%, #2A7BE8)',
  edge: '#0B3A80',
  glow: 'rgba(80,180,255,0.7)',
  text: '#EAF6FF',
  activeText: '#03101F',
  key: '#FFC24A',
};
