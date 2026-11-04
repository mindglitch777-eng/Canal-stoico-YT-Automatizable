// Copia las fuentes (licencia OFL) de node_modules a public/fonts para cargarlas sin internet.
import {copyFileSync, mkdirSync, existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'fonts');
mkdirSync(out, {recursive: true});

const files = [
  ['@fontsource/cormorant-garamond', 'cormorant-garamond-latin-500-normal.woff2'],
  ['@fontsource/cormorant-garamond', 'cormorant-garamond-latin-600-normal.woff2'],
  ['@fontsource/cormorant-garamond', 'cormorant-garamond-latin-700-normal.woff2'],
  ['@fontsource/cormorant-garamond', 'cormorant-garamond-latin-500-italic.woff2'],
  ['@fontsource/inter', 'inter-latin-500-normal.woff2'],
  ['@fontsource/inter', 'inter-latin-700-normal.woff2'],
  ['@fontsource/inter', 'inter-latin-800-normal.woff2'],
];

for (const [pkg, file] of files) {
  const src = join(root, 'node_modules', pkg, 'files', file);
  if (!existsSync(src)) {
    console.error(`No encontré ${src}`);
    process.exit(1);
  }
  copyFileSync(src, join(out, file));
}
copyFileSync(join(root, 'node_modules/@fontsource/cormorant-garamond/LICENSE'), join(out, 'LICENSE-cormorant-garamond.txt'));
copyFileSync(join(root, 'node_modules/@fontsource/inter/LICENSE'), join(out, 'LICENSE-inter.txt'));
console.log(`Fuentes copiadas a ${out}`);
