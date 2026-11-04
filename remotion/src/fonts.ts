import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

// Fuentes locales (OFL). La hoja @font-face se agrega al cargar el módulo, pero la espera
// (delayRender) se hace DENTRO del componente con useFontsReady().
// Por qué: un delayRender() llamado a nivel de módulo (como hace loadFont() de @remotion/fonts)
// quedaba "pendiente" para Remotion aunque la fuente ya hubiera cargado, y en renders largos
// el video moría a los ~60 s con "delayRender was called but not cleared".
const faces: Array<[string, string, string, 'normal' | 'italic']> = [
  ['Cormorant Garamond', 'cormorant-garamond-latin-500-normal.woff2', '500', 'normal'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-600-normal.woff2', '600', 'normal'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-700-normal.woff2', '700', 'normal'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-500-italic.woff2', '500', 'italic'],
  ['Inter', 'inter-latin-500-normal.woff2', '500', 'normal'],
  ['Inter', 'inter-latin-700-normal.woff2', '700', 'normal'],
  ['Inter', 'inter-latin-800-normal.woff2', '800', 'normal'],
];

if (typeof document !== 'undefined' && !document.getElementById('cf-fonts')) {
  const tag = document.createElement('style');
  tag.id = 'cf-fonts';
  tag.textContent = faces
    .map(
      ([family, file, weight, style]) =>
        `@font-face{font-family:"${family}";src:url("${staticFile(`fonts/${file}`)}") format("woff2");font-weight:${weight};font-style:${style};font-display:block;}`,
    )
    .join('\n');
  document.head.appendChild(tag);
}

// Espera a que estén todas las fuentes (con límite de 15 s para no colgar nunca el render).
export const useFontsReady = () => {
  const [handle] = useState(() => delayRender('Cargando fuentes'));
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      continueRender(handle);
    };
    const timer = setTimeout(finish, 15000);
    Promise.all(faces.map(([family, , weight, style]) => document.fonts.load(`${style} ${weight} 40px "${family}"`)))
      .catch(() => undefined)
      .then(finish);
    return () => {
      clearTimeout(timer);
      finish();
    };
  }, [handle]);
};
