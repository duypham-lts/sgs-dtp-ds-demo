// Modules 08 and 09 (UC-SRQ-001/006, UC-REV-001…016, UC-CRT-001/003): certification and audit review.
import { expect, test, type Page } from '@playwright/test';

async function as(page: Page, name: RegExp, reset?: 'Reset: audit in progress' | 'Reset: before the audit' | 'Reset: ready to close') {
  if (page.url() === 'about:blank') await page.goto('/login');
  await page.getByRole('button', { name: /Demo/ }).click();
  const d = page.getByRole('dialog', { name: 'Demo: switch persona' });
  if (reset) { await d.getByRole('button', { name: reset }).click(); await page.getByRole('button', { name: /Demo/ }).click(); }
  await d.getByRole('button', { name }).click();
}
const pick = async (page: Page, label: RegExp, option: string | RegExp) => {
  await page.getByLabel(label).first().click();
  await page.getByRole('option', { name: option }).first().click();
};
const pdf = (name: string) => ({ name, mimeType: 'application/pdf', buffer: Buffer.alloc(2000) });
async function pickDate(page: Page, label: RegExp, which: 'first' | 'last' = 'last') {
  await page.getByLabel(label).first().click();
  const days = page.locator('.gr-cal__day:not([disabled])');
  await (which === 'first' ? days.first() : days.last()).click();
}

test('request certification from a workspace → SGS assigns → auditor starts the review → workspace locked', async ({ page }) => {
  await as(page, /Linh Tran/, 'Reset: audit in progress');
  await page.goto('/workspaces/ws-42001-ai');
  await page.getByRole('button', { name: 'Request certification' }).click();
  const m = page.getByRole('dialog', { name: 'Request certification' });
  await m.getByRole('button', { name: 'Send request' }).click();
  await expect(m.getByText('Choose the preferred audit period.')).toBeVisible();
  await pick(page, /^Preferred audit period/, 'Q1 2027');
  await m.getByRole('button', { name: 'Send request' }).click();
  await expect(page.getByText('Submitted · waiting for SGS')).toBeVisible();
  const id = page.url().split('/').pop()!;

  await as(page, /Grace Lin/);
  await page.goto('/ops/requests/certification');
  await page.getByRole('row', { name: new RegExp(id) }).getByRole('button').last().click();
  await page.getByRole('menuitem', { name: 'Assign auditor' }).click();
  await pick(page, /^Auditor/, 'Kai Huang');
  await page.getByRole('dialog', { name: 'Assign auditor' }).getByRole('button', { name: 'Assign' }).click();
  await expect(page.getByText(`${id} assigned to Kai Huang`)).toBeVisible();

  await as(page, /Kai Huang/);
  await page.goto(`/ops/audits/${id}`);
  await page.getByRole('button', { name: 'Start audit review' }).click();
  await page.getByRole('dialog', { name: 'Start audit review' }).getByRole('button', { name: 'Start review' }).click();
  await expect(page).toHaveURL(new RegExp(`/ops/audits/${id}/review`));
  await expect(page.getByText(/In review · 0 of 76 reviewed/)).toBeVisible();

  await as(page, /Linh Tran/);
  await page.goto('/workspaces/ws-42001-ai');
  await expect(page.getByText('Audit review in progress · evidence is locked')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Upload evidence' })).toHaveCount(0);
});

test('clarification and corrective action loop between customer and auditor', async ({ page }) => {
  await as(page, /Wei Chen/, 'Reset: audit in progress');
  await page.goto('/reviews/rv-cr015');
  await expect(page.getByText('1 response is overdue')).toBeVisible();
  await page.getByRole('button', { name: 'Respond' }).click();
  const r = page.getByRole('dialog', { name: 'Respond to the auditor' });
  await r.getByLabel(/^Your answer/).fill('Q3 minutes attached.');
  await r.locator('input[type=file]').setInputFiles(pdf('account-review-2026Q3.pdf'));
  await r.getByRole('button', { name: 'Send response' }).click();
  await expect(page.getByText('Response sent for R.1.1.4')).toBeVisible();
  await expect(page.getByText('1 response is overdue')).toHaveCount(0);

  await page.goto('/workspaces/ws-a10-cdp?req=R.3.1.3');
  await page.getByRole('button', { name: 'Submit corrective action' }).click();
  const c = page.getByRole('dialog', { name: 'Submit corrective action' });
  await c.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(c.getByText('Add the evidence of the correction.')).toBeVisible();
  await c.getByLabel(/^Action taken/).fill('Restore test done.');
  await pickDate(page, /^Completed on/);
  await c.locator('input[type=file]').setInputFiles(pdf('restore-test.pdf'));
  await c.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByText('Corrective action submitted for F-003')).toBeVisible();

  await as(page, /David Wu/);
  await page.goto('/ops/audits/CR-2026-015/review?item=R.1.1.4');
  await page.getByRole('button', { name: 'Evaluate answer' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('R.1.1.4 accepted')).toBeVisible();
  await page.goto('/ops/audits/CR-2026-015/review?item=R.3.1.3');
  await page.getByRole('button', { name: 'Evaluate' }).click();
  await page.getByLabel('Not accepted — send back to the customer').check();
  await page.getByRole('button', { name: 'Save decision' }).click();
  await expect(page.getByText('Tell the customer what is missing.')).toBeVisible();
  await page.getByLabel(/^Comment to the customer/).fill('Add the signed report.');
  await page.getByRole('button', { name: 'Save decision' }).click();
  await expect(page.getByText('F-003 sent back to the customer')).toBeVisible();

  await as(page, /Wei Chen/);
  await page.goto('/workspaces/ws-a10-cdp?req=R.3.1.3');
  await expect(page.getByText('Open · resubmit')).toBeVisible();
  await expect(page.getByText('David Wu: Add the signed report.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit corrective action again' })).toBeVisible();
});

test('the auditor closes a ready review, SGS creates the certificate, the customer sees it', async ({ page }) => {
  await as(page, /David Wu/, 'Reset: ready to close');
  await page.goto('/ops/audits/CR-2026-015/review');
  await page.getByRole('button', { name: 'Close review' }).click();
  const m = page.getByRole('dialog', { name: 'Close review' });
  await expect(m.getByText('Ready to close')).toBeVisible();
  await m.getByRole('button', { name: 'Close review' }).click();
  await expect(m.getByText('Confirm the review is complete.')).toBeVisible();
  await m.getByLabel(/^The review is complete/).check();
  await m.locator('input[type=file]').setInputFiles(pdf('report.pdf'));
  await m.getByRole('button', { name: 'Close review' }).click();
  await expect(page.getByText(/Review closed\./)).toBeVisible();

  await as(page, /Grace Lin/);
  await page.goto('/ops/requests/certification?tab=cert');
  await page.getByRole('row', { name: /CR-2026-015/ }).getByRole('button').last().click();
  await page.getByRole('menuitem', { name: 'Create certification record' }).click();
  const d = page.getByRole('dialog', { name: 'Create certification record' });
  await d.getByLabel(/^Certificate number/).fill('TW26/1142');
  await pick(page, /^Accreditation/, 'TAF');
  await pickDate(page, /^Certificate date/, 'first');
  await page.getByLabel(/^Valid to/).first().click();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /next month/i }).first().click().catch(() => {});
  await page.locator('.gr-cal__day:not([disabled])').last().click();
  await d.getByLabel(/^Certificate scope/).fill('Operation of the customer data platform.');
  await d.getByLabel(/^Certified sites/).fill('Taipei, TW');
  await d.getByRole('button', { name: 'Create and notify customer' }).click();
  await expect(page.getByText('Certificate TW26/1142 created. ABC Trading Co., Ltd. is notified.')).toBeVisible();

  await as(page, /Linh Tran/);
  await page.goto('/service-requests/certification/CR-2026-015');
  await expect(page.getByText(/Certificate TW26\/1142 issued/).first()).toBeVisible();
  await page.getByRole('button', { name: 'View certificate' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Security Baselines for ICT Systems (Appendix 10)' })).toBeVisible();
  await page.goto('/workspaces/ws-a10-cdp');
  await expect(page.getByText(/Audit review closed on .* · workspace unlocked/)).toBeVisible();
});

test('training: customer requests a course → SGS assigns a contact → customer sees the contact', async ({ page }) => {
  await as(page, /Linh Tran/, 'Reset: audit in progress');
  await page.goto('/service-requests/training');
  await page.getByPlaceholder('Search services').fill('22301');
  await page.getByRole('row', { name: /Internal Auditor Training Course ISO 22301/ }).getByRole('button', { name: 'Request' }).click();
  const m = page.getByRole('dialog', { name: 'Request a training course' });
  await m.getByRole('button', { name: 'Send request' }).click();
  await expect(m.getByText('Enter the number of participants.')).toBeVisible();
  await m.getByLabel(/^Participants/).fill('8');
  await expect(m.getByText('Enter the number of participants.')).toBeHidden();
  await pick(page, /^Format/, 'Online');
  await pick(page, /^Preferred month/, 'Flexible');
  await pick(page, /^Language/, 'English');
  await m.getByRole('button', { name: 'Send request' }).click();
  await expect(page.getByText('Submitted · waiting for SGS')).toBeVisible();
  await expect(page.getByRole('heading', { name: /ISO 22301 Internal Auditor/ })).toBeVisible();
  const id = page.url().split('/').pop()!;

  await as(page, /Minh Nguyen/);
  await page.goto('/ops/requests/training');
  await page.getByRole('row', { name: new RegExp(id) }).getByRole('button').last().click();
  await page.getByRole('menuitem', { name: 'Assign' }).click();
  const a = page.getByRole('dialog', { name: 'Assign training request' });
  await a.getByRole('button', { name: 'Assign', exact: true }).click();
  await expect(a.getByText('Choose who takes the request.')).toBeVisible();
  await pick(page, /^Assign to/, 'Mei Chang');
  await a.getByRole('button', { name: 'Assign', exact: true }).click();
  await expect(page.getByText(`${id} assigned to Mei Chang`)).toBeVisible();

  await as(page, /Linh Tran/);
  await page.goto(`/service-requests/training/${id}`);
  await expect(page.getByText('Your SGS contact')).toBeVisible();
  await expect(page.getByText(/Assigned to SGS contact Mei Chang/)).toBeVisible();
});

test('internal notes stay with SGS; All requests lists every service (D7, UC-SRQ-002)', async ({ page }) => {
  await as(page, /Grace Lin/, 'Reset: audit in progress');
  await page.goto('/ops/requests/certification/CR-2026-018');
  await expect(page.getByText('Prefer David again for continuity.')).toBeVisible();
  await page.getByPlaceholder('Add a note — only SGS can see it').fill('Customer asked for a Mandarin-speaking auditor.');
  await page.getByRole('button', { name: /Send/ }).click();
  await expect(page.getByText('Customer asked for a Mandarin-speaking auditor.')).toBeVisible();

  await page.goto('/ops/requests');
  for (const id of ['CR-2026-018', 'TR-2026-022', 'GA-2026-006']) await page.getByPlaceholder('Search requests or customers').fill(id), await expect(page.getByRole('link', { name: id })).toBeVisible();

  await as(page, /Linh Tran/);
  await page.goto('/service-requests/certification/CR-2026-018');
  await expect(page.getByRole('heading', { name: /CR-2026-018/ })).toBeVisible();
  await expect(page.getByText('Mandarin-speaking')).toHaveCount(0);
  await expect(page.getByText('Internal notes')).toHaveCount(0);
  await page.goto('/service-requests');
  await page.getByPlaceholder('Search requests').fill('TR-2026-022');
  await expect(page.getByText('No requests yet').or(page.getByText(/No (results|matches)/i)).first()).toBeVisible();
});
