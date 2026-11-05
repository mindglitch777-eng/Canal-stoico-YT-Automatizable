// Video a medida: "la-voz" (shorts/la-voz/short.json). Cine negro en blanco y negro; el rojo es la voz que te tienta, el oro la tuya.
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {CustomShortProps} from '..';
import type {CaptionTheme} from '../../Captions';
import {S1, S10, S11, S2, S3, S4, S5, S6, S7, S8, S9} from './scenes';

const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11];

export const LaVoz: React.FC<CustomShortProps> = ({timeline, spans}) => (
  <AbsoluteFill style={{background: '#050505'}}>
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

// La cita (escena 8) ya está escrita en la lluvia.
export const noCaptions = [8];

export const screen: Record<number, string[]> = {
  1: ['3 words. Every time.', 'you deserve it'],
  2: ['You deserve it.', 'BUY NOW'],
  3: ['Click. −$84.'],
  4: ['Friday. Payday. Breakup.', 'you deserve it', 'BAR'],
  5: ['$8,736 a year'],
  6: ['Ads. Apps. Midnight sales.', 'SALE', 'MIDNIGHT SALE'],
  7: ['It sounds like you.', 'you deserve it'],
  9: ['Not today.', 'NOT TODAY'],
  10: ['2 words. $8,000 a year.', '$8,736 a year'],
  11: ['Listen tonight.', 'you deserve it'],
};

// Subtítulos: placa roja con texto blanco; las palabras clave en rojo.
export const captionTheme: CaptionTheme = {
  pill: 'linear-gradient(180deg, #FF5A6A, #E3122B 60%, #8A0A18)',
  edge: '#3A0006',
  glow: 'rgba(255,30,50,0.6)',
  text: '#F2F2F2',
  activeText: '#FFFFFF',
  key: '#FF3B4E',
};
