// Identidad visual de Calm Fortune: oscuro, mínimo, mármol y oro.
export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const color = {
  bg: '#0A0A0B',
  bgWarm: '#17140F',
  ink: '#EFE8D8',
  muted: '#8F887A',
  gold: '#C8A24A',
  goldDim: 'rgba(200, 162, 74, 0.22)',
  red: '#B5483B',
  line: 'rgba(239, 232, 216, 0.12)',
};

export const font = {
  serif: '"Cormorant Garamond", Georgia, serif',
  sans: 'Inter, Arial, sans-serif',
};

// Zona segura para Shorts: la interfaz de YouTube tapa abajo y a la derecha.
export const safe = {
  top: 230,
  contentBottom: 1130, // el contenido de la escena termina acá
  captionY: 1230, // subtítulos
  side: 90,
};

// Centro visual del contenido (entre el borde de arriba y los subtítulos).
export const stage = {
  top: safe.top,
  bottom: safe.contentBottom,
  centerY: (safe.top + safe.contentBottom) / 2,
};
