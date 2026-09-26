// Module 12 (designs/12-dashboard): every Home shows live numbers and each item opens the right place.
import { expect, test, type Page } from '@playwright/test';

async function as(page: Page, name: RegExp, reset = false) {
  if (page.url() === 'about:blank') await page.goto('/login');
  await page.getByRole('button', { name: /Demo/ }).click();
  const d = page.getByRole('dialog', { name: 'Demo: switch persona' });
  if (reset) { await d.getByRole('button', { name: 'Reset: audit in progress' }).click(); await page.getByRole('button', { name: /Demo/ }).click(); }
  await d.getByRole('button', { name }).click();
}

test('Customer Admin: attention item opens the review; Customer User sees only assigned scopes', async ({ page }) => {
  await as(page, /Linh Tran/, true);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /, Linh$/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Review items to answer/ })).toContainText('3');
  await expect(page.getByText('Kevin Ho hasn’t activated the account yet')).toBeHidden();
  await page.getByRole('button', { name: /Show all/ }).click();
  await expect(page.getByText('Kevin Ho hasn’t activated the account yet')).toBeVisible();
  await page.getByRole('link', { name: /Answer the auditor · R\.1\.1\.4/ }).click();
  await expect(page).toHaveURL(/\/reviews\/rv-cr015/);

  await as(page, /Wei Chen/);
  await page.goto('/');
  await expect(page.getByText('workspaces of the scopes assigned to you')).toBeVisible();
  await expect(page.getByText(/hasn’t activated/)).toHaveCount(0);
});

test('Customer Admin of a new customer: Get started opens the create-scope modal', async ({ page }) => {
  await as(page, /Quang Le/, true);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /^(Good (morning|afternoon|evening)|Welcome), Quang$/ })).toBeVisible();
  await page.getByRole('button', { name: 'Create scope' }).click();
  await expect(page).toHaveURL(/\/scopes/);
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('SGS Admin triages from Home; consultant and auditor land on their next action', async ({ page }) => {
  await as(page, /Minh Nguyen/, true);
  await page.goto('/ops');
  await expect(page.getByRole('link', { name: /Requests to triage/ })).toContainText('5');
  await page.getByRole('row', { name: /TR-2026-021/ }).getByRole('button', { name: 'Assign' }).click();
  await expect(page).toHaveURL(/\/ops\/requests\/training\/TR-2026-021/);

  await as(page, /Anna Lee/);
  await page.goto('/ops');
  await page.getByRole('link', { name: /Upload the final report · GA-2026-004/ }).click();
  await expect(page).toHaveURL(/GA-2026-004\?action=report/);
  await expect(page.getByRole('dialog')).toBeVisible();

  await as(page, /David Wu/);
  await page.goto('/ops');
  await expect(page.getByRole('link', { name: /Review in progress/ })).toContainText('40 of 61 reviewed');
  await page.getByRole('link', { name: /Evaluate answer · R\.5\.3\.4/ }).click();
  await expect(page).toHaveURL(/\/ops\/audits\/CR-2026-015\/review\?item=R\.5\.3\.4/);
});
