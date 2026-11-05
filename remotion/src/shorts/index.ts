// Videos a medida (prompts/estandar-viral.md): cada Short con composición propia se registra acá.
// Si un Short no está en la lista, se arma con las escenas genéricas.
import type React from 'react';
import type {Timeline} from '../types';
import * as marcoAurelio from './marco-aurelio-chatarra';
import * as senecaTiempo from './seneca-tiempo';
import * as millonario from './millonario-invisible';
import * as diogenes from './diogenes-rey';

export type CustomShortProps = {timeline: Timeline; spans: Array<{from: number; dur: number}>};

// noCaptions: escenas (desde 1) sin subtítulos.
// screen: textos que la composición dibuja en cada escena (desde 1), para no repetirlos en subtítulos.
// loop: el video empalma consigo mismo (sin cola al final, subtítulos que se apagan en el empalme).
import type {CaptionTheme} from '../Captions';

export type CustomShort = {component: React.FC<CustomShortProps>; noCaptions?: number[]; screen?: Record<number, string[]>; loop?: boolean; captionTheme?: CaptionTheme};
export const customShorts: Record<string, CustomShort> = {
  'marco-aurelio-chatarra': {component: marcoAurelio.MarcoAurelioChatarra, noCaptions: marcoAurelio.noCaptions, screen: marcoAurelio.screen, loop: true},
  'seneca-tiempo': {component: senecaTiempo.SenecaTiempo, noCaptions: senecaTiempo.noCaptions, screen: senecaTiempo.screen, loop: true, captionTheme: senecaTiempo.captionTheme},
  'millonario-invisible': {component: millonario.MillonarioInvisible, noCaptions: millonario.noCaptions, screen: millonario.screen, loop: true, captionTheme: millonario.captionTheme},
  'diogenes-rey': {component: diogenes.DiogenesRey, noCaptions: diogenes.noCaptions, screen: diogenes.screen, loop: true, captionTheme: diogenes.captionTheme},
};
