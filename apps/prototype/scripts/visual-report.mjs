// Collects visual-results/<module>/<board>.json (written by pnpm visual) into a markdown table and puts
// it into docs/prototype-plan.md between the visual:start / visual:end markers.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(app, 'visual-results');
const plan = join(app, '../../docs/prototype-plan.md');
if (!existsSync(out)) { console.error('No visual-results/. Run pnpm visual first.'); process.exit(1); }

const rows = [];
for (const m of readdirSync(out, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
  for (const f of readdirSync(join(out, m)).filter((f) => f.endsWith('.json')).sort()) rows.push(JSON.parse(readFileSync(join(out, m, f), 'utf8')));
}
const lines = [
  `Chạy lần cuối: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · ${rows.length} board. Ảnh so sánh (design | prototype | diff) nằm ở \`apps/prototype/visual-results/<module>/<board>.side.png\`.`,
  '',
  '| Module | Board | Route | Pixel khác | Ghi chú |',
  '|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.module} | ${r.board} | \`${r.path}\` | ${r.diffPercent}% | ${r.note ?? ''} |`),
];
const md = lines.join('\n');
writeFileSync(join(out, 'report.md'), md + '\n');
const text = readFileSync(plan, 'utf8');
const start = '<!-- visual:start -->', end = '<!-- visual:end -->';
if (text.includes(start)) {
  writeFileSync(plan, text.slice(0, text.indexOf(start) + start.length) + '\n' + md + '\n' + text.slice(text.indexOf(end)));
  console.log(`Updated docs/prototype-plan.md (${rows.length} boards).`);
} else console.log(md);
