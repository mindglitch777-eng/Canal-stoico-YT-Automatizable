// Prueba de plantillas: un cuadro por escena + una hoja de contactos.
//   npm run test:templates                         -> línea de tiempo de muestra
//   npm run test:templates -- --short shorts/<id>  -> un Short ya armado
import {renderStill} from '@remotion/renderer';
import {mkdirSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {arg, browserOptions, loadTimeline, prepare, REMOTION_DIR} from './common.mjs';

const shortDir = arg('short');
let inputProps;
if (shortDir) {
  inputProps = loadTimeline(shortDir);
  // Para cuadros sueltos no hace falta el audio.
  inputProps.scenes = inputProps.scenes.map((s) => ({...s, audio: null}));
}

const outDir = join(REMOTION_DIR, 'out', 'stills');
rmSync(outDir, {recursive: true, force: true});
mkdirSync(outDir, {recursive: true});

const {serveUrl, composition} = await prepare(inputProps);
// Sin --short se usa la línea de tiempo de muestra (defaultProps de la composición).
inputProps = inputProps ?? composition.props;
const files = [];
// --at 0.3,0.8 = qué momentos de cada escena (fracción de su duración). Por defecto 0.8.
const at = (arg('at') ?? '0.8').split(',').map(Number);
const shots = inputProps.scenes.flatMap((scene, i) => at.map((a, k) => ({scene, i, a, k})));
for (const {scene, i, a, k} of shots) {
  const frame = Math.round((scene.start + scene.duration * a) * composition.fps);
  const file = join(outDir, `${String(i + 1).padStart(2, '0')}${at.length > 1 ? String.fromCharCode(97 + k) : ''}-${scene.type}.png`);
  await renderStill({
    composition,
    serveUrl,
    output: file,
    frame,
    inputProps,
    timeoutInMilliseconds: 120000,
    ...browserOptions(),
  });
  files.push(file);
  console.log(`OK ${scene.type} -> ${file}`);
}

// Hoja de contactos con todas las escenas (si hay ffmpeg).
try {
  const cols = Math.min(at.length > 1 ? at.length * 2 : 4, files.length);
  const rows = Math.ceil(files.length / cols);
  const sheet = join(outDir, 'contact-sheet.png');
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    ...files.flatMap((f) => ['-i', f]),
    '-filter_complex',
    `${files.map((_, i) => `[${i}:v]scale=360:640[v${i}]`).join(';')};` +
      `${files.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${files.length}:layout=` +
      files.map((_, i) => `${(i % cols) * 360}_${Math.floor(i / cols) * 640}`).join('|') +
      `:fill=black`,
    '-frames:v', '1', sheet,
  ]);
  console.log(`Hoja de contactos -> ${sheet} (${cols}x${rows})`);
} catch {
  console.log('Sin ffmpeg: no armé la hoja de contactos.');
}
console.log(`\n${files.length} plantillas renderizadas sin errores.`);
