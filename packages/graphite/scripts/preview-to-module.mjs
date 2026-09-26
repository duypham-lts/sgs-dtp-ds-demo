// Turns a design-system/graphite/components/<Name>/preview.html demo into an ES module whose
// default export renders the demo. Used by the /_components showcase and by verify-render.mjs.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as acorn from 'acorn';

export function listPreviews(componentsDir) {
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(componentsDir, d.name, 'preview.html')))
    .map((d) => d.name)
    .sort();
}

export function readPreview(componentsDir, name) {
  const html = readFileSync(join(componentsDir, name, 'preview.html'), 'utf8');
  const card = html.match(/<!-- @dsCard ([^>]*?)-->/);
  const attrs = card ? card[1] : '';
  const meta = {
    name,
    group: (attrs.match(/group="([^"]+)"/) || [])[1] || 'Other',
    height: +((attrs.match(/height=(\d+)/) || [])[1] || 0),
    width: +((attrs.match(/width=(\d+)/) || [])[1] || 0),
    page: /\bpage\b/.test(attrs),
  };
  const readme = join(componentsDir, name, 'README.md');
  meta.description = existsSync(readme) ? firstParagraph(readFileSync(readme, 'utf8')) : '';
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!m || !/ReactDOM\.createRoot/.test(m[1])) return { meta, body: null };
  return { meta, body: toModuleBody(m[1], name) };
}

function firstParagraph(md) {
  const lines = md.split('\n');
  const out = [];
  for (const l of lines.slice(1)) {
    if (!l.trim()) { if (out.length) break; else continue; }
    if (l.startsWith('#') || l.startsWith('|') || l.startsWith('```')) { if (out.length) break; else continue; }
    out.push(l.trim());
  }
  return out.join(' ');
}

// Returns module body code (no imports). Expects `React`, `G` and `h` to be in scope.
function toModuleBody(script, name) {
  const ast = acorn.parse(script, { ecmaVersion: 2020, sourceType: 'script' });
  let out = '';
  let last = 0;
  let found = false;
  for (const stmt of ast.body) {
    if (stmt.type === 'VariableDeclaration') {
      const keep = stmt.declarations.filter((d) => !['G', 'h'].includes(d.id.name));
      if (keep.length !== stmt.declarations.length) {
        out += script.slice(last, stmt.start);
        if (keep.length) out += stmt.kind + ' ' + keep.map((d) => script.slice(d.start, d.end)).join(', ') + ';';
        last = stmt.end;
      }
      continue;
    }
    if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'CallExpression') {
      const call = stmt.expression;
      const callee = script.slice(call.callee.start, call.callee.end);
      if (/^ReactDOM\.createRoot\(.*\)\.render$/s.test(callee)) {
        if (call.arguments.length !== 1) throw new Error(name + ': render() expects one argument');
        const arg = script.slice(call.arguments[0].start, call.arguments[0].end);
        out += script.slice(last, stmt.start);
        out += 'export default function Preview() {\n  return (' + arg + ');\n}';
        last = stmt.end;
        found = true;
      }
    }
  }
  out += script.slice(last);
  if (!found) throw new Error(name + ': no ReactDOM.createRoot(...).render(...) call');
  if (/\bwindow\.|\bdocument\.getElementById/.test(out)) throw new Error(name + ': preview still references window/document');
  return out;
}
