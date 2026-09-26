// Module 04 (UC-FWK-001/002/009/013): import → errors → corrected file → draft → activate / discard.
import { expect, test, type Page } from '@playwright/test';

async function signInAs(page: Page, name: RegExp) {
  await page.goto('/login');
  await page.getByRole('button', { name: /Demo/ }).click();
  await page.getByRole('dialog', { name: 'Demo: switch persona' }).getByRole('button', { name }).click();
}
const xlsx = (name: string) => ({ name, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.alloc(2000) });

test('SGS Admin imports a framework: errors first, then a clean file becomes a draft that can be activated', async ({ page }) => {
  await signInAs(page, /Minh Nguyen/);
  // Start from no draft: discard the seeded one.
  await page.goto('/ops/frameworks/fw-a10-amended');
  await page.getByRole('button', { name: 'Discard draft' }).click();
  await page.getByRole('dialog', { name: 'Discard draft?' }).getByRole('button', { name: 'Discard draft' }).click();
  await expect(page).toHaveURL(/\/ops\/frameworks$/);
  await expect(page.getByRole('row', { name: /amended version/ })).toHaveCount(0);

  await page.getByRole('button', { name: 'Import framework' }).click();
  const d = page.getByRole('dialog', { name: 'Import a framework' });
  await d.getByRole('button', { name: 'Check file' }).click();
  await expect(d.getByText('Choose the completed Excel file.')).toBeVisible();
  await d.locator('input[type=file]').setInputFiles(xlsx('bcm-2019.xlsx'));
  await expect(d.getByText('Choose the completed Excel file.')).toHaveCount(0);
  await d.getByRole('button', { name: 'Check file' }).click();
  await expect(d.getByText('3 errors in bcm-2019.xlsx')).toBeVisible();
  await expect(d.getByRole('row', { name: /R\.8\.4\.2/ })).toBeVisible();

  await d.locator('input[type=file]').setInputFiles(xlsx('SGS_DTP_Framework_Import_Appendix10.xlsx'));
  await d.getByRole('button', { name: 'Check file' }).click();
  await expect(page).toHaveURL(/\/ops\/frameworks\/fw-a10-amended$/);
  await expect(page.getByText('File check passed').first()).toBeVisible();
  await page.getByRole('button', { name: 'Activate', exact: true }).click();
  await page.getByRole('dialog', { name: 'Activate framework' }).getByRole('button', { name: 'Activate framework' }).click();
  await expect(page.getByRole('link', { name: 'Other versions' })).toBeVisible();
  await page.getByRole('link', { name: 'Requirements' }).first().click();
  await expect(page.getByText('79 requirements. Read only')).toBeVisible();

  await page.goto('/ops/frameworks');
  await expect(page.getByRole('row', { name: /amended version/ })).toContainText('Active');
});

test('consultants read frameworks without import actions; auditors have no access', async ({ page }) => {
  await signInAs(page, /Anna Lee/);
  await page.goto('/ops/frameworks');
  await expect(page.getByRole('heading', { level: 1, name: 'Frameworks' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Import framework' })).toHaveCount(0);
  await signInAs(page, /David Wu/);
  await page.goto('/ops/frameworks');
  await expect(page.getByText('You don’t have access to this page')).toBeVisible();
});
