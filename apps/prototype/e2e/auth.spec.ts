// Module 01 (UC-AUTH-001, -002, -005): sign-in states and activation, driven like a user would.
import { expect, test, type Page } from '@playwright/test';

const email = (p: Page) => p.getByLabel(/^Email/);
const password = (p: Page) => p.getByLabel(/^Password/);
const signInBtn = (p: Page) => p.getByRole('button', { name: 'Sign in' });

test('customer signs in, the error clears on edit, and wrong portal accounts are refused', async ({ page }) => {
  await page.goto('/login');
  await email(page).fill('linh.tran@abc-trading.com');
  await password(page).fill('nope');
  await signInBtn(page).click();
  await expect(page.getByText('Incorrect email or password.')).toBeVisible();
  await password(page).fill('Demo-Password-01');
  await expect(page.getByText('Incorrect email or password.')).toHaveCount(0);
  await signInBtn(page).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1, name: /^(Good (morning|afternoon|evening)|Welcome), Linh$/ })).toBeVisible();

  // An SGS account cannot sign in to the Customer Portal.
  await page.getByRole('button', { name: 'Account: Linh Tran' }).click();
  await page.locator('.gr-top__acct-links').getByRole('link', { name: 'Sign out' }).click();
  await email(page).fill('minh.nguyen@sgs.com');
  await password(page).fill('Demo-Password-01');
  await signInBtn(page).click();
  await expect(page.getByText('Incorrect email or password.')).toBeVisible();
});

test('five failed attempts lock sign-in; a deactivated account is told so', async ({ page }) => {
  await page.goto('/ops/login');
  await email(page).fill('minh.nguyen@sgs.com');
  for (let i = 0; i < 5; i++) { await password(page).fill(`wrong${i}`); await signInBtn(page).click(); }
  await expect(page.getByText('Sign-in is temporarily locked')).toBeVisible();
  await password(page).fill('Demo-Password-01');
  await expect(signInBtn(page)).toBeDisabled();

  await page.goto('/ops/login');
  await email(page).fill('peter.wang@sgs.com');
  await password(page).fill('Demo-Password-01');
  await signInBtn(page).click();
  await expect(page.getByText('Your account is not active')).toBeVisible();
});

test('an invited user activates from the invitation email and lands in the portal', async ({ page }) => {
  await page.goto('/mail');
  await page.getByRole('link', { name: /Linh Tran invited you to ABC Trading/ }).click();
  await page.getByRole('link', { name: 'Activate my account' }).click();
  await expect(page.getByRole('heading', { name: 'Activate your account' })).toBeVisible();
  const activate = page.getByRole('button', { name: 'Activate account' });
  await expect(activate).toBeDisabled();
  await page.getByLabel(/^Create password/).fill('Taipei2026pass');
  await expect(page.getByText('At least one symbol (not met)')).toBeAttached();
  await page.getByLabel(/^Create password/).fill('Taipei!2026pass');
  await page.getByLabel(/^Confirm password/).fill('Taipei!2026pas');
  await page.getByLabel('I agree to the Terms of use and Privacy notice.').check();
  await activate.click();
  await expect(page.getByText('Passwords don’t match.')).toBeVisible();
  await page.getByLabel(/^Confirm password/).fill('Taipei!2026pass');
  await expect(page.getByText('Passwords don’t match.')).toHaveCount(0);
  await activate.click();
  await expect(page.getByRole('heading', { name: 'Your account is ready' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to the portal' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /^(Good (morning|afternoon|evening)|Welcome), Kevin$/ })).toBeVisible();

  // The link now says the account is active.
  await page.goto('/activate?token=inv-kevin');
  await expect(page.getByRole('heading', { name: 'This account is already active' })).toBeVisible();
});

test('an expired invitation can ask the inviter for a new one', async ({ page }) => {
  await page.goto('/activate?token=inv-jason');
  await expect(page.getByRole('heading', { name: 'This invitation link has expired' })).toBeVisible();
  await page.getByRole('button', { name: 'Ask for a new invitation' }).click();
  await expect(page.getByText('We let Linh Tran know.')).toBeVisible();
});
