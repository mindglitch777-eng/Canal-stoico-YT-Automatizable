// Video a medida: "He told Alexander the Great to move. Why?" (shorts/diogenes-rey/short.json).
// Estilo: vasija griega de figuras negras que cobra vida; se quiebra y por las grietas aparece el mundo de hoy.
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {CustomShortProps} from '..';
import type {CaptionTheme} from '../../Captions';
import {S1, S10, S11, S2, S3, S4, S5, S6, S7, S8, S9} from './scenes';

const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11];

export const DiogenesRey: React.FC<CustomShortProps> = ({timeline, spans}) => (
  <AbsoluteFill style={{background: '#140A05'}}>
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

export const noCaptions = [4, 6];

export const screen: Record<number, string[]> = {
  1: ['He told a king move'],
  2: ['King at 20', 'twenty'],
  3: ['A clay jar', 'CLOAK STAFF BAG CUP'],
  5: ['They laughed'],
  7: ['Who can walk away', 'POWER BATNA'],
  8: ['Need less'],
  9: ['Army vs sunlight'],
  10: ["Can't be bought"],
  11: ['Want less'],
};

// Subtítulos de terracota con letra negra; el sol en oro.
export const captionTheme: CaptionTheme = {
  pill: 'linear-gradient(180deg, #F2A468, #C9622B 60%, #8E3A14)',
  edge: '#3A1406',
  glow: 'rgba(255,170,80,0.6)',
  text: '#FFF1E0',
  activeText: '#140A05',
  key: '#FFD36B',
};
