// Verifies the port still matches design-system/graphite/dist:
//   1. styles/ and tokens.json are byte-identical to dist
//   2. types/index.d.ts equals dist index.d.ts (minus the window.Graphite global)
//   3. every component declared in index.d.ts is exported from src/index.ts, and nothing else
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(pkg, '../../design-system/graphite/dist');
const read = (p) => readFileSync(p, 'utf8');
const fail = [];

for (const [ours, theirs] of [
  ['styles/tokens.css', 'tokens.css'],
  ['styles/components.css', 'components/bundle.css'],
  ['tokens.json', 'tokens.json'],
]) if (read(join(pkg, ours)) !== read(join(dist, theirs))) fail.push(`${ours} differs from dist/${theirs}`);

const dts = read(join(dist, 'components/index.d.ts'));
const ours = read(join(pkg, 'types/index.d.ts')).replace(/^\/\/ Generated.*\n/, '');
if (ours !== dts.replace(/\ndeclare global \{[\s\S]*$/, '\n')) fail.push('types/index.d.ts differs from dist index.d.ts');

const declaredFns = new Set([...dts.matchAll(/export declare function (\w+)/g)].map((m) => m[1]));
const barrel = read(join(pkg, 'src/index.ts'));
const exported = new Set([...barrel.matchAll(/export \{ ([^}]+) \}/g)].flatMap((m) => m[1].split(',').map((s) => s.trim())));
for (const n of declaredFns) if (!exported.has(n)) fail.push(`missing export: ${n}`);
for (const n of exported) if (!declaredFns.has(n)) fail.push(`export not in index.d.ts: ${n}`);

if (fail.length) { console.error('Graphite API check failed:\n - ' + fail.join('\n - ')); process.exit(1); }
console.log(`Graphite API check OK: ${declaredFns.size} components, styles and types identical to dist.`);
