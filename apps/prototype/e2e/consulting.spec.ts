// Modules 06 and 07 (UC-SRQ-001…010, decisions D3, D4, D8, D9): consulting requests end to end.
import { expect, test, type Page } from '@playwright/test';

async function as(page: Page, name: RegExp, reset = false) {
  if (page.url() === 'about:blank') await page.goto('/login');
  await page.getByRole('button', { name: /Demo/ }).click();
  const d = page.getByRole('dialog', { name: 'Demo: switch persona' });
  if (reset) { await d.getByRole('button', { name: 'Reset: audit in progress' }).click(); await page.getByRole('button', { name: /Demo/ }).click(); }
  await d.getByRole('button', { name }).click();
}
const pick = async (page: Page, label: RegExp, option: string | RegExp) => {
  await page.getByLabel(label).first().click();
  await page.getByRole('option', { name: option }).first().click();
};
async function chooseDate(page: Page, label: RegExp) {
  await page.getByLabel(label).first().click();
  await page.locator('.gr-cal__day:not([disabled])').filter({ hasText: /^28$/ }).first().click();
}

test('gap analysis: submit → approve (one consultant per customer) → information loop → report → access ends', async ({ page }) => {
  await as(page, /Wei Chen/, true);
  await page.goto('/service-requests/gap-analysis');
  await page.getByRole('button', { name: 'Request a gap analysis' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Choose a framework.')).toBeVisible();
  await page.locator('label.radio-card', { hasText: 'ISO/IEC 27001' }).first().click();
  await expect(page.getByText('Choose a framework.')).toHaveCount(0);
  await pick(page, /^Scope/, 'Head office · Taipei');
  await expect(page.getByText('Workspace linked automatically')).toBeVisible();
  await expect(page.getByText('All changes saved')).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Submit request' }).click();
  await expect(page.getByText('Tell SGS what you want to achieve.')).toBeVisible();
  await page.getByLabel(/^What do you want to achieve/).fill('Prepare for the 2027 surveillance audit.');
  await chooseDate(page, /^Earliest start/);
  await page.getByLabel(/^I allow the assigned SGS consultant/).check();
  await page.getByLabel(/^I confirm the information is accurate/).check();
  await page.getByRole('button', { name: 'Submit request' }).click();
  await expect(page.getByText('Submitted · waiting for SGS')).toBeVisible();
  const id = page.url().split('/').pop()!;
  expect(id).toMatch(/^GA-2026-00\d$/);

  await as(page, /Minh Nguyen/);
  await page.goto(`/ops/requests/gap-analysis/${id}`);
  await page.getByRole('button', { name: 'Approve & assign' }).click();
  const a = page.getByRole('dialog', { name: 'Approve and assign consultant' });
  await pick(page, /^Consultant/, 'Wei Lin');
  await chooseDate(page, /^On site from/);
  await chooseDate(page, /^On site to/);
  await a.getByRole('button', { name: 'Approve & assign' }).click();
  await expect(a.getByText(/Anna Lee is already the active consultant for ABC Trading/)).toBeVisible();
  await pick(page, /^Consultant/, 'Anna Lee');
  await a.getByRole('button', { name: 'Approve & assign' }).click();
  await expect(page.getByText('Request approved · Anna Lee assigned')).toBeVisible();

  await as(page, /Anna Lee/);
  await page.goto(`/ops/my-assignments/gap-analysis/${id}`);
  await page.getByRole('button', { name: 'Request information' }).click();
  await page.getByLabel(/^What do you need/).fill('Please share the supplier list before the visit.');
  await page.getByRole('button', { name: 'Send to customer' }).click();
  await expect(page.getByText(/Information requested\./)).toBeVisible();

  await as(page, /Wei Chen/);
  await page.goto(`/service-requests/gap-analysis/${id}`);
  await expect(page.getByText('SGS requested more information')).toBeVisible();
  await page.getByLabel(/^Your answer/).fill('Uploaded to the workspace under A.5.19.');
  await page.getByRole('button', { name: 'Send answer' }).click();
  await expect(page.getByText('Answer sent. SGS continues with your request.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'SGS requested more information' })).toHaveCount(0);

  await as(page, /Anna Lee/);
  await page.goto(`/ops/my-assignments/gap-analysis/${id}/workspace`);
  await expect(page.getByText('Read only').first()).toBeVisible();
  await page.goto(`/ops/my-assignments/gap-analysis/${id}`);
  await page.getByRole('button', { name: 'Upload report' }).first().click();
  const u = page.getByRole('dialog', { name: 'Upload report and complete' });
  await u.getByRole('button', { name: 'Complete request' }).click();
  await expect(u.getByText('Upload the final report (PDF).')).toBeVisible();
  await u.locator('input[type=file]').first().setInputFiles({ name: 'final.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(3000) });
  await u.getByLabel(/^This report is final/).check();
  await u.getByRole('button', { name: 'Complete request' }).click();
  await expect(page.getByText(/completed\. ABC Trading/)).toBeVisible();
  await page.goto(`/ops/my-assignments/gap-analysis/${id}/workspace`);
  await expect(page.getByText(/Your access to this workspace ended on/)).toBeVisible();

  await as(page, /Wei Chen/);
  await page.goto(`/service-requests/gap-analysis/${id}`);
  await expect(page.getByText(`${id} – Gap Analysis Report.pdf`)).toBeVisible();
});

test('a submitted request can be withdrawn; a rejected one can be requested again', async ({ page }) => {
  await as(page, /Linh Tran/, true);
  await page.goto('/service-requests/implementation-support/IS-2026-004');
  await page.getByRole('button', { name: 'Request actions' }).click();
  await page.getByRole('menuitem', { name: 'Withdraw request' }).click();
  await page.getByRole('dialog', { name: 'Withdraw this request?' }).getByRole('button', { name: 'Withdraw request' }).click();
  await expect(page.getByText(/Withdrawn on/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Request actions' })).toHaveCount(0);

  await page.goto('/service-requests/gap-analysis/GA-2026-001');
  await page.getByRole('button', { name: 'Request again' }).click();
  await expect(page).toHaveURL(/\/new\?draft=GA-2026-\d+&step=2/);
  await expect(page.getByLabel(/^What do you want to achieve/)).toHaveValue('Prepare for the OEM supplier assessment.');
});

test('implementation support: consultant shares a deliverable, the customer sees it, then completes', async ({ page }) => {
  await as(page, /Anna Lee/, true);
  await page.goto('/ops/my-assignments/implementation-support/IS-2026-003');
  await page.getByRole('button', { name: 'Share deliverable' }).first().click();
  const d = page.getByRole('dialog', { name: 'Share a deliverable' });
  await d.getByLabel(/^Title/).fill('Backup test plan');
  await d.locator('input[type=file]').setInputFiles({ name: 'backup-plan.docx', mimeType: 'application/octet-stream', buffer: Buffer.alloc(1000) });
  await d.getByRole('button', { name: 'Share with customer' }).click();
  await expect(page.getByText('IS-2026-003 – Backup test plan.docx')).toBeVisible();

  await as(page, /Linh Tran/);
  await page.goto('/service-requests/implementation-support/IS-2026-003');
  await expect(page.getByText('IS-2026-003 – Backup test plan.docx')).toBeVisible();

  await as(page, /Anna Lee/);
  await page.goto('/ops/my-assignments/implementation-support/IS-2026-003');
  await page.getByRole('button', { name: 'Complete request' }).click();
  const c = page.getByRole('dialog', { name: 'Complete this request' });
  await c.getByRole('button', { name: 'Complete request' }).click();
  await expect(c.getByText('Confirm the work is finished.')).toBeVisible();
  await c.getByLabel(/^The work is finished/).check();
  await c.getByRole('button', { name: 'Complete request' }).click();
  await expect(page.getByText('Completed').first()).toBeVisible();
});
