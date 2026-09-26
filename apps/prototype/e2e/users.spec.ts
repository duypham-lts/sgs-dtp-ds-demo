// Module 03 (UC-USR-001/003/006, UC-ACC-001…007): flows driven through the UI.
import { expect, test, type Page } from '@playwright/test';

async function signInAs(page: Page, name: RegExp) {
  await page.goto('/login');
  await page.getByRole('button', { name: /Demo/ }).click();
  await page.getByRole('dialog', { name: 'Demo: switch persona' }).getByRole('button', { name }).click();
}
const rowMenu = async (page: Page, row: RegExp, item: string) => {
  await page.getByRole('row', { name: row }).getByRole('button').last().click();
  await page.getByRole('menuitem', { name: item }).click();
};

test('Customer Admin invites a user; the invitee activates from the email and sees only the given scope', async ({ page }) => {
  await signInAs(page, /Linh Tran/);
  await page.goto('/admin/users');
  await page.getByRole('button', { name: 'Invite user' }).click();
  const dialog = page.getByRole('dialog', { name: 'Invite a user' });
  await dialog.getByRole('button', { name: 'Send invitation' }).click();
  await expect(dialog.getByText('Enter an email address.')).toBeVisible();
  await dialog.getByLabel(/^Email/).fill('wei.chen@abc-trading.com');
  await expect(dialog.getByText('Enter an email address.')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Send invitation' }).click();
  await expect(dialog.getByText('This email already has an account on the platform.')).toBeVisible();
  await dialog.getByLabel(/^Email/).fill('lily.wang@abc-trading.com');
  await dialog.getByLabel(/^Full name/).fill('Lily Wang');
  await dialog.getByLabel(/^Scope access/).click();
  await page.getByRole('option', { name: /AI platform/ }).click();
  await dialog.getByRole('heading', { name: 'Invite a user' }).click();
  await dialog.getByRole('button', { name: 'Send invitation' }).click();
  await expect(page.getByText('Invitation sent to lily.wang@abc-trading.com')).toBeVisible();
  await expect(page.getByRole('row', { name: /Lily Wang/ })).toContainText('Invitation pending');

  await page.goto('/mail');
  await page.getByRole('link', { name: /To lily.wang@abc-trading.com/ }).click();
  await page.getByRole('link', { name: 'Activate my account' }).click();
  await page.getByLabel(/^Create password/).fill('Taipei!2026pass');
  await page.getByLabel(/^Confirm password/).fill('Taipei!2026pass');
  await page.getByLabel('I agree to the Terms of use and Privacy notice.').check();
  await page.getByRole('button', { name: 'Activate account' }).click();
  await expect(page.getByText('1 scope assigned by Linh Tran')).toBeVisible();
  await page.getByRole('button', { name: 'Continue to the portal' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /^(Good (morning|afternoon|evening)|Welcome), Lily$/ })).toBeVisible();
  // A Customer User has no user administration.
  await page.goto('/admin/users');
  await expect(page.getByText('You don’t have access to this page')).toBeVisible();
});

test('Customer Admin revokes an invitation and changes scope access', async ({ page }) => {
  await signInAs(page, /Linh Tran/);
  await page.goto('/admin/users');
  await rowMenu(page, /Kevin Ho/, 'Revoke invitation');
  await page.getByRole('dialog', { name: 'Revoke invitation?' }).getByRole('button', { name: 'Revoke invitation' }).click();
  await expect(page.getByRole('row', { name: /Kevin Ho/ })).toHaveCount(0);

  await rowMenu(page, /Wei Chen/, 'Assign scopes');
  const d = page.getByRole('dialog', { name: 'Assign scope access' });
  await expect(d.getByText('2 of 4 scopes selected')).toBeVisible();
  await d.getByRole('checkbox', { name: /AI platform/ }).check();
  await d.getByRole('button', { name: 'Save access' }).click();
  await expect(page.getByRole('row', { name: /Wei Chen/ })).toContainText('3 scopes');
  await page.getByRole('link', { name: 'Wei Chen' }).click();
  await expect(page.getByText('Scope access: AI platform added')).toBeVisible();
});

test('SGS Admin creates a customer and its admin; the list shows "Admin invited"', async ({ page }) => {
  await signInAs(page, /Minh Nguyen/);
  await page.goto('/ops/customers');
  await page.getByRole('button', { name: 'Create customer' }).click();
  const d = page.getByRole('dialog', { name: 'Create customer' });
  await d.getByRole('button', { name: 'Create customer' }).click();
  await expect(d.getByText('Enter the company name.')).toBeVisible();
  await d.getByLabel(/^Company name/).fill('Kaohsiung Logistics Ltd.');
  await d.getByLabel(/^Country/).click();
  await page.getByRole('option', { name: 'Taiwan' }).click();
  await d.getByRole('button', { name: 'Create customer' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Kaohsiung Logistics Ltd.' })).toBeVisible();
  await expect(page.getByText('No Customer Admin yet')).toBeVisible();
  await page.getByRole('button', { name: 'Create admin' }).first().click();
  const a = page.getByRole('dialog', { name: 'Create Customer Admin' });
  await a.getByLabel(/^Email/).fill('jin.huang@kl-logistics.tw');
  await a.getByLabel(/^Full name/).fill('Jin Huang');
  await a.getByRole('button', { name: 'Send invitation' }).click();
  await expect(page.getByText('Invitation sent to jin.huang@kl-logistics.tw')).toBeVisible();
  await page.goto('/ops/customers');
  await expect(page.getByRole('row', { name: /Kaohsiung Logistics/ })).toContainText('Admin invited');
});

test('SGS Admin of another affiliate never sees SGS Taiwan customers', async ({ page }) => {
  await signInAs(page, /Lan Tran/);
  await page.goto('/ops/customers');
  await expect(page.getByRole('row', { name: /Saigon Foods/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /ABC Trading/ })).toHaveCount(0);
  await page.goto('/ops/customers/t-abc');
  await expect(page.getByText('This customer doesn’t exist')).toBeVisible();
});
