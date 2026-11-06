// Video a medida: "You'll guess wrong. One of these 2 men has $3 million." (shorts/millonario-invisible/short.json).
// Estilo: programa de concurso de TV + publicidad de lujo que se vuelve rayos X; después del giro, el lujo se apaga.
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {CustomShortProps} from '..';
import type {CaptionTheme} from '../../Captions';
import {S1, S10, S11, S2, S3, S4, S5, S6, S7, S8, S9} from './scenes';

const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11];

export const MillonarioInvisible: React.FC<CustomShortProps> = ({timeline, spans}) => (
  <AbsoluteFill style={{background: '#0A0212'}}>
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

export const noCaptions = [8];

export const screen: Record<number, string[]> = {
  1: ["Who's the millionaire", 'LEFT RIGHT'],
  2: ['LEFT or RIGHT', '$180K $25K $4K'],
  3: ['LEFT −$84,000', 'CAR LOAN CARD'],
  4: ['RIGHT $3,000,000'],
  5: ['3 in 4 suit under $600'],
  6: ['Their car Ford', 'MILLIONAIRE'],
  7: ['Looking rich keeps you poor', 'BANK BRAND LOAN'],
  9: ['The look vs freedom'],
  10: ['Wealth is invisible', 'WEALTH'],
  11: ['Look again'],
};

// Subtítulos de concurso: placa amarilla, palabras clave en magenta.
export const captionTheme: CaptionTheme = {
  pill: 'linear-gradient(180deg, #FFF59A, #FFD21A 60%, #FF9A00)',
  edge: '#7A2A00',
  glow: 'rgba(255,200,40,0.75)',
  text: '#FFFFFF',
  activeText: '#2A0A3A',
  key: '#FF6FE0',
};
