// Module 10 (UC-AUD-001/002/004): actions and reads are recorded and shown to SGS Admin and Customer Admin.
import { expect, test, type Page } from '@playwright/test';

async function as(page: Page, name: RegExp, reset = false) {
  if (page.url() === 'about:blank') await page.goto('/login');
  await page.getByRole('button', { name: /Demo/ }).click();
  const d = page.getByRole('dialog', { name: 'Demo: switch persona' });
  if (reset) { await d.getByRole('button', { name: 'Reset: audit in progress' }).click(); await page.getByRole('button', { name: /Demo/ }).click(); }
  await d.getByRole('button', { name }).click();
}

test('consultant opens a workspace → SGS Admin and Customer Admin see the consultant activity', async ({ page }) => {
  await as(page, /Anna Lee/, true);
  await page.goto('/ops/my-assignments/gap-analysis/GA-2026-004/workspace');
  await expect(page.getByText('Read only', { exact: true }).first()).toBeVisible();

  await as(page, /Minh Nguyen/);
  await page.goto('/ops/audit-logs');
  await page.getByLabel(/^Action/).first().click();
  await page.getByRole('option', { name: 'Consultant activity' }).click();
  const row = page.getByRole('row', { name: /Opened workspace \(read only\).*GA-2026-004/ }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button').last().click();
  await page.getByRole('menuitem', { name: 'View details' }).click();
  await expect(page.getByRole('dialog').getByText('anna.lee@sgs.com', { exact: false })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('button', { name: 'Clear filters' })).toBeDisabled();

  await as(page, /Linh Tran/);
  await page.goto('/audit-logs');
  await expect(page.getByRole('heading', { name: 'Activity log' })).toBeVisible();
  await expect(page.getByRole('row', { name: /Opened workspace \(read only\).*GA-2026-004/ }).first()).toBeVisible();
  await expect(page.getByRole('columnheader', { name: /Customer/ })).toHaveCount(0);
});

test('Customer User and SGS User have no audit log', async ({ page }) => {
  await as(page, /Wei Chen/, true);
  await page.goto('/audit-logs');
  await expect(page.getByRole('link', { name: 'Audit Logs' })).toHaveCount(0);
  await expect(page.getByText(/don’t have access|not allowed|can’t see/i).first()).toBeVisible();
  await as(page, /Grace Lin/);
  await page.goto('/ops/audit-logs');
  await expect(page.getByRole('link', { name: 'Audit Logs' })).toHaveCount(0);
});
