// Module 05 (UC-SCP-001…006, UC-EVD-003…013/016): scopes, frameworks, workspaces and evidence.
import { expect, test, type Page } from '@playwright/test';

async function signInAs(page: Page, name: RegExp, scenario: 'audit' | 'preparation' = 'audit') {
  await page.goto('/login');
  await page.getByRole('button', { name: /Demo/ }).click();
  const d = page.getByRole('dialog', { name: 'Demo: switch persona' });
  await d.getByRole('button', { name: scenario === 'audit' ? 'Reset: audit in progress' : 'Reset: before the audit' }).click();
  await page.getByRole('button', { name: /Demo/ }).click();
  await d.getByRole('button', { name }).click();
}
const pick = async (page: Page, label: RegExp, option: string | RegExp) => {
  await page.getByLabel(label).first().click();
  await page.getByRole('option', { name: option }).first().click();
};

test('Customer Admin creates a scope, links a tiered framework and changes the tier', async ({ page }) => {
  await signInAs(page, /Linh Tran/);
  await page.goto('/scopes');
  await page.getByRole('button', { name: 'Create scope' }).first().click();
  const d = page.getByRole('dialog', { name: 'Create scope' });
  await d.getByRole('button', { name: 'Create scope' }).click();
  await expect(d.getByText('Choose the type of scope.')).toBeVisible();
  await d.locator('label.radio-card', { hasText: 'Product' }).first().click();
  await expect(d.getByText('Choose the type of scope.')).toHaveCount(0);
  await d.getByLabel(/^Name/).fill('Payments gateway');
  await d.getByLabel(/^What is in scope/).fill('Card payment gateway and its APIs.');
  await d.getByRole('button', { name: 'Create scope' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Payments gateway' })).toBeVisible();

  await page.getByRole('button', { name: 'Link framework' }).click();
  const l = page.getByRole('dialog', { name: 'Link a framework' });
  await pick(page, /^Framework/, /Appendix 10/);
  await l.getByRole('button', { name: 'Link and create workspace' }).click();
  await expect(l.getByText('Choose the protection tier.')).toBeVisible();
  await l.locator('label.radio-card', { hasText: 'Basic' }).first().click();
  await l.getByRole('button', { name: 'Link and create workspace' }).click();
  await expect(page.getByRole('row', { name: /Appendix 10 · 2022/ })).toContainText('0 / 44');

  await page.getByRole('button', { name: 'Change tier' }).click();
  const t = page.getByRole('dialog', { name: 'Change tier' });
  await t.locator('label.radio-card', { hasText: 'High' }).first().click();
  await expect(t.getByText('32 more requirements to meet')).toBeVisible();
  await t.getByRole('button', { name: 'Change to High' }).click();
  await expect(page.getByRole('row', { name: /Appendix 10 · 2022/ })).toContainText('0 / 76');
});

test('tier and scope are locked while the audit reviews the workspace', async ({ page }) => {
  await signInAs(page, /Linh Tran/);
  await page.goto('/scopes/s-cdp');
  await page.getByRole('button', { name: 'Change tier' }).click();
  await expect(page.getByText('Tier can’t be changed during an audit')).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Change tier' }).getByRole('button', { name: 'Change tier' })).toBeDisabled();
});

test('Customer User uploads evidence, coverage goes up, and unlinking keeps the file in the library', async ({ page }) => {
  await signInAs(page, /Wei Chen/, 'preparation');
  await page.goto('/workspaces/ws-a10-cdp?req=R.1.1.3');
  await expect(page.getByText('Preparing · 62% coverage')).toBeVisible();
  await page.getByRole('button', { name: 'Upload evidence' }).click();
  const d = page.getByRole('dialog', { name: 'Upload evidence' });
  await d.getByRole('button', { name: 'Upload' }).click();
  await expect(d.getByText('Choose a file.')).toBeVisible();
  await d.locator('input[type=file]').setInputFiles({ name: 'ad-inactive-accounts.png', mimeType: 'image/png', buffer: Buffer.alloc(4000) });
  await expect(d.getByText('Scanning for viruses…')).toBeVisible();
  await expect(d.getByLabel(/^Name/)).toHaveValue('Ad inactive accounts');
  await d.getByRole('button', { name: 'Upload' }).click();
  await expect(page.getByText('Evidence uploaded for R.1.1.3')).toBeVisible();
  await expect(page.getByText('Preparing · 64% coverage')).toBeVisible({ timeout: 5000 });

  await page.getByRole('button', { name: 'View Ad inactive accounts' }).click();
  await page.getByRole('button', { name: 'Unlink from R.1.1.3' }).click();
  await expect(page.getByText('Mapping removed from R.1.1.3. The file stays in your library.')).toBeVisible();
  await page.goto('/documents?workspace=ws-a10-cdp');
  await page.getByRole('tab', { name: /Not linked/ }).click();
  await expect(page.getByRole('row', { name: /Ad inactive accounts/ })).toContainText('Not linked');
});

test('Customer Viewer reads a workspace but cannot change evidence; other tenants are invisible', async ({ page }) => {
  await signInAs(page, /Iris Huang/);
  await page.goto('/workspaces/ws-27001-hq');
  await expect(page.getByRole('heading', { level: 1, name: 'ISO/IEC 27001 · 2022' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Upload evidence' })).toHaveCount(0);
  await page.goto('/workspaces/ws-tisax-fab');
  await expect(page.getByText('This workspace doesn’t exist')).toBeVisible();
});
