import { test } from '@playwright/test';
import { compare, prepare } from './harness';
import { cases } from './cases';

for (const c of cases) {
  test(`${c.module} · ${c.board}`, async ({ page }) => {
    await prepare(page, c);
    const r = await compare(page, c);
    test.info().annotations.push({ type: 'diff', description: `${r.diffPercent}%` });
  });
}
