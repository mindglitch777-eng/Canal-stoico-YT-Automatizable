// Video a medida: "dos-hermanos" (shorts/dos-hermanos/short.json). Diorama de juguete en 3D; bajo tierra, raíces de oro.
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {CustomShortProps} from '..';
import type {CaptionTheme} from '../../Captions';
import {S1, S10, S11, S2, S3, S4, S5, S6, S7, S8, S9} from './scenes';

const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11];

export const DosHermanos: React.FC<CustomShortProps> = ({timeline, spans}) => (
  <AbsoluteFill style={{background: '#FFF6E6'}}>
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

// La cita (escena 8) ya crece en pantalla.
export const noCaptions = [8];

export const screen: Record<number, string[]> = {
  1: ['Both got $1,000,000.'],
  2: ['Jake: what you see.'],
  3: ['Sam: what you don\'t.', 'HA HA'],
  4: ['Jake: 2M followers.', '2,000,000 FOLLOWERS'],
  5: ['Sam: boring.'],
  6: ['Month 12.', 'MONTH 11 12', 'LOAN'],
  7: ['Borrowed vs invisible.'],
  9: ['Looked rich. Was rich.'],
  10: ['There were never two brothers.'],
  11: ['Which one are you?'],
};

// Subtítulos de juguete: placa amarilla con borde azul; las palabras clave en coral.
export const captionTheme: CaptionTheme = {
  pill: 'linear-gradient(180deg, #FFE27A, #FFC93C 60%, #F0A500)',
  edge: '#1D2B4F',
  glow: 'rgba(255,201,60,0.6)',
  text: '#FFFFFF',
  activeText: '#1D2B4F',
  key: '#FF5A36',
};
