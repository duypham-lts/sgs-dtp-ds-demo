import { expect, test, type Page } from '@playwright/test';

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

test('/_components renders every Graphite demo without errors', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/_components');
  await expect(page.getByRole('heading', { level: 1, name: 'Graphite components' })).toBeVisible();
  const cards = page.locator('article.sc__card');
  await expect(cards).toHaveCount(54); // 48 component previews + Icon + Logo + 4 page templates
  for (const name of ['Button', 'DataTable', 'TopBar', 'AppSidebar', 'RequirementNavigator', 'NotificationCenter', 'DocumentItem', 'Icon']) {
    await expect(page.locator(`article#${name} .sc__frame, article#${name} .sc__page`)).not.toBeEmpty();
  }
  // Theme switch re-renders the demos under another data-theme.
  await page.getByLabel('SGS Operations').check();
  await expect(page.locator('article#Button .sc__frame')).toHaveAttribute('data-theme', 'sgs-ops');
  expect(errors).toEqual([]);
});

async function demoSignIn(page: Page, name: RegExp) {
  await page.getByRole('button', { name: /Demo/ }).click();
  await page.getByRole('dialog', { name: 'Demo: switch persona' }).getByRole('button', { name }).click();
}

test('demo switcher changes persona and portal', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/); // signed out by default
  await demoSignIn(page, /Linh Tran/);
  await expect(page.getByRole('heading', { level: 1, name: /^(Good (morning|afternoon|evening)|Welcome), Linh$/ })).toBeVisible();
  await expect(page.locator('[data-theme="customer"].shell')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Customer Portal' }).getByRole('link', { name: 'Users' })).toBeVisible();

  await page.getByRole('button', { name: /Demo/ }).click();
  await page.getByRole('dialog', { name: 'Demo: switch persona' }).getByRole('button', { name: /Anna Lee/ }).click();
  await expect(page).toHaveURL(/\/ops$/);
  await expect(page.locator('[data-theme="sgs-ops"].shell')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: /^(Good (morning|afternoon|evening)|Welcome), Anna$/ })).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'SGS Operations' });
  await expect(nav.getByRole('button', { name: 'My assignments' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Customers' })).toHaveCount(0);

  // A Customer User has no Administration section.
  await page.getByRole('button', { name: /Demo/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: /Wei Chen/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('navigation', { name: 'Customer Portal' }).getByRole('link', { name: 'Users' })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('customer persona cannot use the SGS portal', async ({ page }) => {
  await page.goto('/login');
  await demoSignIn(page, /Linh Tran/);
  await page.goto('/ops');
  await expect(page.getByText('This page belongs to the Operations Console')).toBeVisible();
});

test('Sign out uses TopBar onSignOut and needs a new sign-in (UC-AUTH-002)', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/login');
  await demoSignIn(page, /Linh Tran/);
  await page.getByRole('button', { name: 'Account: Linh Tran' }).click();
  const menu = page.locator('.gr-top__acct-links');
  await expect(menu.getByRole('link')).toHaveText(['Settings', 'Sign out']);
  await menu.getByRole('link', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Demo/ })).toContainText('Signed out');
  // Portal pages send a signed-out visitor back to /login, also after a reload.
  await page.goto('/scopes');
  await expect(page).toHaveURL(/\/login$/);
  expect(errors).toEqual([]);
});

test('opening a notification saves its read state (UC-NTF-002)', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/login');
  await page.getByRole('button', { name: /Demo/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Demo: switch persona' });
  await dialog.getByRole('button', { name: 'Reset: audit in progress' }).click();
  await page.getByRole('button', { name: /Demo/ }).click();
  await dialog.getByRole('button', { name: /Linh Tran/ }).click();

  const bell = page.locator('.gr-top__bell');
  const unreadCount = async () => Number((await bell.getAttribute('aria-label'))?.match(/(\d+) unread/)?.[1] ?? 0);
  await expect(bell).toHaveAttribute('aria-label', /unread/);
  const before = await unreadCount();

  await bell.click();
  const first = page.locator('.gr-ntf__item.is-unread').first();
  const href = await first.getAttribute('href');
  await first.click();
  await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
  await expect.poll(unreadCount).toBe(before - 1);

  // Survives a reload: the state lives in the mock server, not only in NotificationCenter.
  await page.reload();
  await expect.poll(unreadCount).toBe(before - 1);

  await bell.click();
  await page.getByRole('button', { name: 'Mark all as read' }).click();
  await page.reload();
  await expect(bell).toHaveAttribute('aria-label', 'Notifications');
  expect(errors).toEqual([]);
});
