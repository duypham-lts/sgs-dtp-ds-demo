// Render-equivalence check: every official demo (components/<Name>/preview.html) is rendered to static
// HTML twice — once with the reference bundle (dist/components/bundle.js) and once with this TypeScript
// port — and the two outputs must be identical, character for character.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import * as esbuild from 'esbuild';
import { listPreviews, readPreview } from './preview-to-module.mjs';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
const ds = join(pkg, '../../design-system/graphite');
const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function loadCjs(code, extra = {}) {
  const module = { exports: {} };
  const fn = new Function('module', 'exports', 'require', ...Object.keys(extra), code);
  fn(module, module.exports, require, ...Object.values(extra));
  return module.exports;
}

// Reference implementation.
const refWindow = { React };
vm.runInNewContext(readFileSync(join(ds, 'dist/components/bundle.js'), 'utf8'), { window: refWindow });
const Ref = refWindow.Graphite;

// Port.
const built = await esbuild.build({
  entryPoints: [join(pkg, 'src/index.ts')], bundle: true, write: false, format: 'cjs', platform: 'node',
  external: ['react'], logLevel: 'silent',
});
const Port = loadCjs(built.outputFiles[0].text);

let pass = 0;
const failures = [];
const skipped = [];
for (const name of listPreviews(join(ds, 'components'))) {
  const { body } = readPreview(join(ds, 'components'), name);
  if (!body) { skipped.push(name); continue; }
  const { code } = await esbuild.transform(body, { loader: 'js', format: 'cjs' });
  const render = (G) => {
    const mod = loadCjs(code, { React, G, h: React.createElement });
    return renderToStaticMarkup(React.createElement(mod.default));
  };
  const a = render(Ref);
  const b = render(Port);
  if (a === b) pass++;
  else {
    let i = 0;
    while (a[i] === b[i]) i++;
    failures.push(`${name}: first difference at ${i}\n  ref : …${a.slice(Math.max(0, i - 60), i + 80)}\n  port: …${b.slice(Math.max(0, i - 60), i + 80)}`);
  }
}
console.log(`Render check: ${pass} demos identical, ${failures.length} different, skipped (not a React demo): ${skipped.join(', ') || 'none'}`);
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
