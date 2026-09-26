// Screenshot comparison harness. Each case renders a prototype route at the board size of the design
// (designs/<module>/canvas.json), drives it into the designed state through real interaction, takes a
// screenshot and compares it with designs/<module>/screenshots/<board>.png.
//
// The design screenshots were rendered without the Roboto web font (fallback sans-serif), so Google
// Fonts is blocked here too; otherwise every line of text would count as a difference.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

// Playwright compiles specs as CommonJS, so __dirname is available.
const here = __dirname;
export const repo = join(here, '../../..');
export const outDir = join(here, '../visual-results');

export interface VisualCase {
  module: string;          // designs/<module>
  board: string;           // <board>.dc.html / screenshots/<board>.png
  path: string;            // prototype route
  persona?: string | null; // user id; null = signed out; default u-linh
  steps?: (page: Page) => Promise<void>; // interaction that brings the page into the designed state
  note?: string;           // known, accepted differences (design-questions, decisions)
  keepFocus?: boolean;
  scenario?: 'audit' | 'preparation' | 'ready' | 'audited' | 'certified'; // seed scenario (src/mock/scenarios.ts), default audit     // keep keyboard focus (boards that show an open menu or a focused field)
}

export function boardSize(module: string, board: string): { w: number; h: number } {
  const canvas = JSON.parse(readFileSync(join(repo, 'designs', module, 'canvas.json'), 'utf8'));
  const b = canvas.boards[`${board}.dc.html`];
  if (!b) throw new Error(`${module}/${board}: not in canvas.json`);
  return { w: b.w, h: b.h };
}

export async function prepare(page: Page, c: VisualCase) {
  const { w, h } = boardSize(c.module, c.board);
  await page.setViewportSize({ width: w, height: h });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const persona = c.persona === undefined ? 'u-linh' : c.persona;
  // Fresh seed, chosen persona and no mock latency, once per test (not on later navigations).
  await page.addInitScript(([p, sc]) => {
    if (sessionStorage.getItem('__visual')) return;
    sessionStorage.setItem('__visual', '1');
    localStorage.clear();
    localStorage.setItem('dtp-persona', p ?? '');
    localStorage.setItem('dtp-latency', '0');
    localStorage.setItem('dtp-scenario', sc);
  }, [persona, c.scenario ?? 'audit'] as const);
  // The Demo pill is a prototype tool, not part of any design.
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style');
      s.textContent = '.demo{display:none!important} *{caret-color:transparent!important}';
      document.head.appendChild(s);
    });
  });
  await page.goto(c.path);
  await page.waitForLoadState('networkidle');
  if (c.steps) await c.steps(page);
  // Designs are drawn without focus rings or caret: drop focus unless a step asked to keep it.
  await page.mouse.move(0, 0);
  if (!c.keepFocus) await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.());
  await page.waitForTimeout(400); // let transitions (modal fade, snackbar) settle
}

export interface VisualResult { module: string; board: string; path: string; diffPercent: number; note?: string }

export async function compare(page: Page, c: VisualCase): Promise<VisualResult> {
  const { w, h } = boardSize(c.module, c.board);
  const dir = join(outDir, c.module);
  mkdirSync(dir, { recursive: true });
  const actual = PNG.sync.read(await page.screenshot({ fullPage: false }));
  const expected = PNG.sync.read(readFileSync(join(repo, 'designs', c.module, 'screenshots', `${c.board}.png`)));
  const W = Math.min(w, expected.width, actual.width), H = Math.min(h, expected.height, actual.height);
  const crop = (img: PNG) => { const out = new PNG({ width: W, height: H }); PNG.bitblt(img, out, 0, 0, W, H, 0, 0); return out; };
  const a = crop(actual), e = crop(expected);
  const diff = new PNG({ width: W, height: H });
  const n = pixelmatch(e.data, a.data, diff.data, W, H, { threshold: 0.15, includeAA: false });
  // Side by side: design | prototype | diff.
  const side = new PNG({ width: W * 3 + 16, height: H });
  side.data.fill(255);
  PNG.bitblt(e, side, 0, 0, W, H, 0, 0);
  PNG.bitblt(a, side, 0, 0, W, H, W + 8, 0);
  PNG.bitblt(diff, side, 0, 0, W, H, W * 2 + 16, 0);
  writeFileSync(join(dir, `${c.board}.actual.png`), PNG.sync.write(a));
  writeFileSync(join(dir, `${c.board}.side.png`), PNG.sync.write(side));
  const result: VisualResult = { module: c.module, board: c.board, path: c.path, diffPercent: Math.round((n / (W * H)) * 10000) / 100, note: c.note };
  writeFileSync(join(dir, `${c.board}.json`), JSON.stringify(result, null, 2));
  return result;
}
