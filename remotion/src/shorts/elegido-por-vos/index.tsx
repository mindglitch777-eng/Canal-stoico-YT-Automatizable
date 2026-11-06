// Video a medida: "elegido-por-vos" (shorts/elegido-por-vos/short.json). Publicidad brillante que se desviste en plano técnico;
// en el giro, este mismo Short aparece en un celular con sus propios trucos marcados en rojo.
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {CustomShortProps} from '..';
import {S1, S10, S11, S2, S3, S4, S5, S6, S7, S8, S9} from './scenes';
import {PLAN_CAPTIONS} from './theme';

const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11];

export const ElegidoPorVos: React.FC<CustomShortProps> = ({timeline, spans}) => (
  <AbsoluteFill style={{background: '#0B2545'}}>
    {timeline.scenes.map((scene, i) => {
      const Sc = SCENES[i];
      return (
        <Sequence key={i} from={spans[i].from} durationInFrames={spans[i].dur} name={`${i + 1}`} layout="none">
          <AbsoluteFill>{Sc ? <Sc scene={scene} dur={spans[i].dur} all={timeline.scenes} spans={spans} /> : null}</AbsoluteFill>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

// La cita (escena 9) ya se escribe en pantalla.
export const noCaptions = [9];

export const screen: Record<number, string[]> = {
  1: ["You didn't choose this.", '3 TRICKS', 'MEDIUM'],
  2: ['$3 $6.50 $7', 'SMART CHOICE', 'POPCORN'],
  3: ['The large is bait.', 'EMPTY CARDBOARD'],
  4: ['84% took the bait.', 'USELESS OPTION', 'CHEAPER', 'EXPENSIVE', 'without it 32%'],
  5: ['$4.99 = $4', 'your brain $4'],
  6: ['Was $200. Now a gift.', '$99'],
  7: ['This video did it too.', 'TRICK #1'],
  8: ['Question. 3. Lit words.', '#1 a question', '#2 the number 3', '#3 lit words'],
  10: ['Pause 3 seconds.'],
  11: ['Did you choose this?'],
};

export const captionTheme = PLAN_CAPTIONS;
