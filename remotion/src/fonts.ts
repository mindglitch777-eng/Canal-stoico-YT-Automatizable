import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fuentes locales (OFL), cargadas antes de renderizar cualquier cuadro.
const faces: Array<[string, string, string, 'normal' | 'italic']> = [
  ['Cormorant Garamond', 'cormorant-garamond-latin-500-normal.woff2', '500', 'normal'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-600-normal.woff2', '600', 'normal'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-700-normal.woff2', '700', 'normal'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-500-italic.woff2', '500', 'italic'],
  ['Inter', 'inter-latin-500-normal.woff2', '500', 'normal'],
  ['Inter', 'inter-latin-700-normal.woff2', '700', 'normal'],
  ['Inter', 'inter-latin-800-normal.woff2', '800', 'normal'],
];

for (const [family, file, weight, style] of faces) {
  loadFont({family, url: staticFile(`fonts/${file}`), weight, style});
}
