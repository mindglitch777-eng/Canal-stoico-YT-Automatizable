import {continueRender, delayRender, staticFile} from 'remotion';

// Fuentes locales (OFL). Se declaran con @font-face y se espera a que carguen, pero con
// un límite: antes se usaba loadFont() de @remotion/fonts y, con varias pestañas en paralelo
// (y más con el 3D), alguna pestaña se quedaba esperando una fuente para siempre y el render
// moría a los 120 s. Ahora, si una fuente tarda más de 15 s, el render sigue igual.
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
  const css = faces
    .map(
      ([family, file, weight, style]) =>
        `@font-face{font-family:"${family}";src:url("${staticFile(`fonts/${file}`)}") format("woff2");font-weight:${weight};font-style:${style};font-display:block;}`,
    )
    .join('\n');
  const tag = document.createElement('style');
  tag.id = 'cf-fonts';
  tag.textContent = css;
  document.head.appendChild(tag);

  const handle = delayRender('Cargando fuentes', {timeoutInMilliseconds: 60000});
  const all = Promise.all(faces.map(([family, , weight, style]) => document.fonts.load(`${style} ${weight} 40px "${family}"`)));
  const limit = new Promise((resolve) => setTimeout(resolve, 15000));
  Promise.race([all, limit])
    .catch(() => undefined)
    .then(() => continueRender(handle));
}
