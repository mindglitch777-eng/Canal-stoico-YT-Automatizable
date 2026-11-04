import {bundle} from '@remotion/bundler';
import {selectComposition} from '@remotion/renderer';
import {readFileSync, existsSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const REMOTION_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const REPO_DIR = resolve(REMOTION_DIR, '..');

// En GitHub Actions Remotion baja su propio navegador.
// En sesiones sin internet abierto se usa un Chromium ya instalado:
//   REMOTION_BROWSER_EXECUTABLE=/ruta/a/chrome
// El mundo 3D usa WebGL: "swangle" (SwiftShader) funciona en máquinas sin GPU, como Actions.
//   REMOTION_GL=angle  para usar la GPU si hay una.
export const browserOptions = () => {
  const exe = process.env.REMOTION_BROWSER_EXECUTABLE;
  const chromiumOptions = {gl: process.env.REMOTION_GL || 'swangle'};
  return exe ? {browserExecutable: exe, chromeMode: 'chrome-for-testing', chromiumOptions} : {chromiumOptions};
};

export const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

export const loadTimeline = (shortDir) => {
  const p = join(resolve(REPO_DIR, shortDir), 'build', 'timeline.json');
  if (!existsSync(p)) {
    throw new Error(`No existe ${p}. Corré antes: python tools/tts.py ${shortDir}`);
  }
  return JSON.parse(readFileSync(p, 'utf8'));
};

export const prepare = async (inputProps) => {
  const serveUrl = await bundle({entryPoint: join(REMOTION_DIR, 'src', 'index.ts')});
  const composition = await selectComposition({serveUrl, id: 'Short', inputProps, ...browserOptions()});
  return {serveUrl, composition};
};
