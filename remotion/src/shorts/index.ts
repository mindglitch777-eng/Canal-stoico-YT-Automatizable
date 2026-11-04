// Videos a medida (prompts/estandar-viral.md): cada Short con composición propia se registra acá.
// Si un Short no está en la lista, se arma con las escenas genéricas.
import type React from 'react';
import type {Timeline} from '../types';
import * as marcoAurelio from './marco-aurelio-chatarra';

export type CustomShortProps = {timeline: Timeline; spans: Array<{from: number; dur: number}>};

// noCaptions: escenas (desde 1) que no llevan subtítulos.
export const customShorts: Record<string, {component: React.FC<CustomShortProps>; noCaptions?: number[]}> = {
  'marco-aurelio-chatarra': {component: marcoAurelio.MarcoAurelioChatarra, noCaptions: marcoAurelio.noCaptions},
};
