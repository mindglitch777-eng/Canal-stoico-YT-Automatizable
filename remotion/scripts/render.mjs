// Renderiza un Short completo a MP4 (1080x1920, H.264).
//   npm run render -- --short shorts/<id>   -> usa shorts/<id>/build/timeline.json y su voz
//   npm run render -- --demo                -> video de muestra sin voz
import {renderMedia} from '@remotion/renderer';
import {copyFileSync, existsSync, mkdirSync, rmSync} from 'node:fs';
import {basename, join, resolve} from 'node:path';
import {arg, browserOptions, loadTimeline, prepare, REMOTION_DIR, REPO_DIR} from './common.mjs';

let inputProps;
let output;
const shortDir = arg('short');

if (shortDir) {
  inputProps = loadTimeline(shortDir);
  // Copia la voz a public/_render/<id>/ para que Remotion la encuentre.
  const pub = join(REMOTION_DIR, 'public', '_render', inputProps.id);
  rmSync(pub, {recursive: true, force: true});
  mkdirSync(pub, {recursive: true});
  inputProps.scenes = inputProps.scenes.map((s) => {
    if (!s.audio) return s;
    const src = resolve(REPO_DIR, s.audio);
    copyFileSync(src, join(pub, basename(src)));
    return {...s, audio: `_render/${inputProps.id}/${basename(src)}`};
  });
  // Música y efectos generados por código (tools/sfx/mix.py), si el Short los tiene.
  const sound = join(resolve(REPO_DIR, shortDir), 'build', 'sound.wav');
  if (existsSync(sound)) {
    copyFileSync(sound, join(pub, 'sound.wav'));
    inputProps.soundtrack = `_render/${inputProps.id}/sound.wav`;
  }
  output = join(resolve(REPO_DIR, shortDir), 'build', `${inputProps.id}.mp4`);
} else if (process.argv.includes('--demo')) {
  inputProps = undefined; // usa la línea de tiempo de muestra
  output = join(REMOTION_DIR, 'out', 'demo.mp4');
} else {
  console.error('Uso: npm run render -- --short shorts/<id>   |   npm run render -- --demo');
  process.exit(1);
}

const {serveUrl, composition} = await prepare(inputProps);
inputProps = inputProps ?? composition.props;
// --frames 0-90 renderiza solo ese tramo (para pruebas rápidas).
const range = arg('frames')?.split('-').map(Number);
let last = -1;
await renderMedia({
  composition,
  serveUrl,
  codec: 'h264',
  crf: 20,
  outputLocation: output,
  inputProps,
  ...browserOptions(),
  timeoutInMilliseconds: 240000,
  ...(range ? {frameRange: [range[0], range[1]]} : {}),
  // Pestañas en paralelo. En máquinas chicas conviene bajarlo: REMOTION_CONCURRENCY=2
  concurrency: process.env.REMOTION_CONCURRENCY ? Number(process.env.REMOTION_CONCURRENCY) : null,
  onProgress: ({progress}) => {
    const pct = Math.floor(progress * 10) * 10;
    if (pct !== last) {
      last = pct;
      console.log(`render ${pct}%`);
    }
  },
});
console.log(`\nListo: ${output} (${(composition.durationInFrames / composition.fps).toFixed(1)} s)`);
