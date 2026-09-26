// One entry per design board that the prototype implements, grouped by module (see harness.ts).
// `steps` drive the page into the designed state through real interaction; `note` records accepted
// differences (sample data, decisions, design-questions).
import type { Page } from '@playwright/test';
import type { VisualCase } from './harness';

const fill = (page: Page, label: RegExp, value: string) => page.getByLabel(label).first().fill(value);
const click = (page: Page, name: string | RegExp) => page.getByRole('button', { name }).first().click();

async function wrongPasswords(page: Page, email: string, times: number) {
  await fill(page, /^Email/, email);
  for (let i = 0; i < times; i++) {
    await fill(page, /^Password/, 'wrongpass1');
    await click(page, 'Sign in');
    await page.waitForTimeout(50);
  }
}

const auth: VisualCase[] = [
  { module: '01-authentication', board: 'Main', path: '/login', persona: null },
  { module: '01-authentication', board: 'CustomerLoginWrongPassword', path: '/login', persona: null,
    steps: (p) => wrongPasswords(p, 'linh.tran@abc-trading.com', 1) },
  { module: '01-authentication', board: 'CustomerLoginLocked', path: '/login', persona: null,
    steps: async (p) => { await wrongPasswords(p, 'linh.tran@abc-trading.com', 5); await fill(p, /^Password/, 'password123'); } },
  { module: '01-authentication', board: 'CustomerLoginInactive', path: '/login', persona: null,
    steps: async (p) => { await fill(p, /^Email/, 'amy.chou@abc-trading.com'); await fill(p, /^Password/, 'password123'); await click(p, 'Sign in'); },
    note: 'Seed: deactivated account is Amy Chou (design shows Linh Tran’s email).' },
  { module: '01-authentication', board: 'SgsLogin', path: '/ops/login', persona: null },
  { module: '01-authentication', board: 'SgsLoginWrongPassword', path: '/ops/login', persona: null,
    steps: (p) => wrongPasswords(p, 'minh.nguyen@sgs.com', 1) },
  { module: '01-authentication', board: 'SgsLoginLocked', path: '/ops/login', persona: null,
    steps: async (p) => { await wrongPasswords(p, 'minh.nguyen@sgs.com', 5); await fill(p, /^Password/, 'password123'); } },
  { module: '01-authentication', board: 'SgsLoginInactive', path: '/ops/login', persona: null,
    steps: async (p) => { await fill(p, /^Email/, 'peter.wang@sgs.com'); await fill(p, /^Password/, 'password123'); await click(p, 'Sign in'); },
    note: 'Seed: deactivated SGS account is Peter Wang (mock only; design shows Minh Nguyen’s email).' },
  { module: '01-authentication', board: 'InviteEmail', path: '/mail/em-kevin', persona: null,
    note: 'Seed: invitation for Kevin Ho (design: Wei Chen, who is already active in the seed).' },
  { module: '01-authentication', board: 'Activate', path: '/activate?token=inv-kevin', persona: null, note: 'Seed: Kevin Ho instead of Wei Chen.' },
  { module: '01-authentication', board: 'ActivatePassword', path: '/activate?token=inv-kevin', persona: null,
    steps: async (p) => { await fill(p, /^Create password/, 'Taipei2026pass'); await p.getByLabel('I agree to the Terms of use and Privacy notice.').check(); },
    note: 'Seed: Kevin Ho instead of Wei Chen.' },
  { module: '01-authentication', board: 'ActivateMismatch', path: '/activate?token=inv-kevin', persona: null,
    steps: async (p) => {
      await fill(p, /^Create password/, 'Taipei!2026pass'); await fill(p, /^Confirm password/, 'Taipei!2026pas');
      await p.getByLabel('I agree to the Terms of use and Privacy notice.').check(); await click(p, 'Activate account');
    }, note: 'Seed: Kevin Ho instead of Wei Chen.' },
  { module: '01-authentication', board: 'ActivateSuccess', path: '/activate?token=inv-kevin', persona: null,
    steps: async (p) => {
      await fill(p, /^Create password/, 'Taipei!2026pass'); await fill(p, /^Confirm password/, 'Taipei!2026pass');
      await p.getByLabel('I agree to the Terms of use and Privacy notice.').check(); await click(p, 'Activate account');
      await p.getByText('Your account is ready').waitFor();
    }, note: 'Seed: Kevin Ho has 1 scope (design: 2 scopes).' },
  { module: '01-authentication', board: 'ActivateExpired', path: '/activate?token=inv-jason', persona: null },
  { module: '01-authentication', board: 'ActivateUsed', path: '/activate?token=inv-wei', persona: null, note: 'Seed: Wei Chen activated 21 Sep 2026 (design: 25 Sep).' },
  { module: '01-authentication', board: 'SgsActivate', path: '/ops/activate?token=inv-tom', persona: null, note: 'Seed: Tom Hsu (mock only) instead of Anna Lee, who is active.' },
];

const pick = async (page: Page, label: RegExp, option: string | RegExp) => {
  await page.getByLabel(label).first().click();
  await page.getByRole('option', { name: option }).first().click();
};
const rowMenu = async (page: Page, row: RegExp, item: string) => {
  await page.getByRole('row', { name: row }).getByRole('button').last().click();
  await page.getByRole('menuitem', { name: item }).click();
};
const NAV_03 = 'Sidebar/TopBar follow Q17/Q18 (no Workspace access, no Communications).';

const users: VisualCase[] = [
  { module: '03-user-management', board: 'Main', path: '/admin/users', note: `${NAV_03} Seed adds Iris Huang (Viewer, mock only).` },
  { module: '03-user-management', board: 'CaInvite', path: '/admin/users', note: NAV_03,
    steps: async (p) => { await click(p, 'Invite user'); await fill(p, /^Email/, 'kevin.ho@abc-trading.com'); await fill(p, /^Full name/, 'Kevin Ho');
      await pick(p, /^Scope access/, /Head office · Taipei/); await p.getByRole('heading', { name: 'Invite a user' }).click(); } },
  { module: '03-user-management', board: 'CaUserPending', path: '/admin/users/u-kevin', note: NAV_03 },
  { module: '03-user-management', board: 'CaRevoke', path: '/admin/users', note: NAV_03, steps: (p) => rowMenu(p, /Kevin Ho/, 'Revoke invitation') },
  { module: '03-user-management', board: 'CaUserDetail', path: '/admin/users/u-wei', note: `${NAV_03} Seed: Wei Chen’s second scope is Customer data platform (design: Plant · Taichung).` },
  { module: '03-user-management', board: 'CaAssignScopes', path: '/admin/users', note: NAV_03, steps: (p) => rowMenu(p, /Wei Chen/, 'Assign scopes') },
  { module: '03-user-management', board: 'CaUsersEmpty', path: '/admin/users', persona: 'u-daniel', note: `${NAV_03} Formosa Chips (only its admin) instead of ABC Trading.` },
  { module: '03-user-management', board: 'SgsUsers', path: '/ops/admin/users', persona: 'u-minh', note: 'Seed has more SGS users; Wei Lin is active (see seed).' },
  { module: '03-user-management', board: 'SgsInviteSgs', path: '/ops/admin/users', persona: 'u-minh',
    steps: async (p) => { await click(p, 'Invite SGS user'); await fill(p, /^Email/, 'wei.lin@sgs.com'); await fill(p, /^Full name/, 'Wei Lin'); await pick(p, /^Role/, /^SGS Consultant/); } },
  { module: '03-user-management', board: 'SgsUserDetail', path: '/ops/admin/users/u-anna', persona: 'u-minh', note: 'Seed: Anna Lee’s assignments are ABC requests (one consultant per customer).' },
  { module: '03-user-management', board: 'TenantList', path: '/ops/customers', persona: 'u-minh' },
  { module: '03-user-management', board: 'TenantCreate', path: '/ops/customers', persona: 'u-minh',
    steps: async (p) => { await click(p, 'Create customer'); await fill(p, /^Company name/, 'Riyadh Imports LLC'); await pick(p, /^Country/, 'Saudi Arabia'); } },
  { module: '03-user-management', board: 'TenantNew', path: '/ops/customers/t-riyadh', persona: 'u-minh', note: 'Copy: the customer sets the tier (Q11).' },
  { module: '03-user-management', board: 'TenantCreateAdmin', path: '/ops/customers/t-riyadh', persona: 'u-minh',
    steps: async (p) => { await click(p, 'Create admin'); await fill(p, /^Email/, 'omar.haddad@riyadh-imports.sa'); await fill(p, /^Full name/, 'Omar Haddad'); } },
  { module: '03-user-management', board: 'TenantDetail', path: '/ops/customers/t-abc', persona: 'u-minh' },
  { module: '03-user-management', board: 'TenantEdit', path: '/ops/customers/t-abc', persona: 'u-minh', steps: (p) => click(p, 'Edit') },
  { module: '03-user-management', board: 'TenantScopes', path: '/ops/customers/t-abc/scopes', persona: 'u-minh' },
];

const upload = (page: Page, name: string, kb: number) =>
  page.locator('input[type=file]').first().setInputFiles({ name, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.alloc(kb * 1000) });
const FW = { persona: 'u-minh' };
const NAV_SGS = 'Sidebar: unified SGS nav adds Certifications (plan §2.2).';

const frameworks: VisualCase[] = [
  { module: '04-framework-management', board: 'Main', path: '/ops/frameworks', ...FW, note: `${NAV_SGS} Seed also lists ISO/IEC 27701 and ISO 22301 (linked to scopes in 03/05).` },
  { module: '04-framework-management', board: 'FwImport', path: '/ops/frameworks', ...FW, note: NAV_SGS,
    steps: async (p) => { await click(p, 'Import framework'); await upload(p, 'SGS_DTP_Framework_Import_Appendix10.xlsx', 184); } },
  { module: '04-framework-management', board: 'FwErrors', path: '/ops/frameworks', ...FW, note: NAV_SGS,
    steps: async (p) => { await click(p, 'Import framework'); await upload(p, 'bcm-2019.xlsx', 90); await click(p, 'Check file'); await p.getByText('3 errors in bcm-2019.xlsx').waitFor(); } },
  { module: '04-framework-management', board: 'FwPreview', path: '/ops/frameworks/fw-a10-amended', ...FW, note: `${NAV_SGS} Copy: the customer chooses the tier (Q11).` },
  { module: '04-framework-management', board: 'FwActivate', path: '/ops/frameworks/fw-a10-amended', ...FW, note: 'Copy: the customer chooses the tier (Q11).',
    steps: (p) => click(p, 'Activate') },
  { module: '04-framework-management', board: 'FwDetail', path: '/ops/frameworks/fw-a10-2022', ...FW, note: 'Tiers table: 44 / 17 / 15 = 76 (design: 18 / 79 with 76 requirements).' },
  { module: '04-framework-management', board: 'FwRequirements', path: '/ops/frameworks/fw-a10-2022/requirements', ...FW },
];

const M5 = '05-scope-workspace-evidence';
const PREP = { scenario: 'preparation' as const };
const NAV_05 = 'Unified customer nav (Reviews, Certifications; plan §2.2, Q17).';
const cardPick = (page: Page, title: string) => page.locator('label.radio-card', { hasText: title }).first().click();

const scopes: VisualCase[] = [
  { module: M5, board: 'ScopesEmpty', path: '/scopes', persona: 'u-quang', note: `${NAV_05} Saigon Foods (mock) instead of ABC Trading.` },
  { module: M5, board: 'Main', path: '/scopes', note: NAV_05 },
  { module: M5, board: 'ScopeCreate', path: '/scopes', note: `${NAV_05} Widths 552/268 (Q4).`, steps: async (p) => {
    await click(p, 'Create scope'); await cardPick(p, 'System'); await fill(p, /^Name/, 'Customer data platform');
    await pick(p, /^Belongs to organisation/, 'Head office · Taipei'); await pick(p, /^Belongs to product/, 'Retail loyalty app');
    await fill(p, /^What is in scope/, 'CRM and loyalty database, APIs for the retail app, hosting in Hsinchu data centre.'); } },
  { module: M5, board: 'ScopeDetail', path: '/scopes/s-hq', note: `${NAV_05} Q19: Change tier column only for tiered frameworks.` },
  { module: M5, board: 'AssignUsers', path: '/scopes/s-hq', note: NAV_05, steps: (p) => click(p, 'Assign users') },
  { module: M5, board: 'LinkFramework', path: '/scopes/s-ai', note: `${NAV_05} Background is AI platform (Customer data platform already has Appendix 10).`, steps: async (p) => {
    await click(p, 'Link framework'); await pick(p, /^Framework/, /Appendix 10/); await cardPick(p, 'Medium'); } },
  { module: M5, board: 'ChangeTier', path: '/scopes/s-cdp', ...PREP, note: NAV_05, steps: async (p) => { await click(p, 'Change tier'); await cardPick(p, 'High'); } },
  { module: M5, board: 'ChangeTierLocked', path: '/scopes/s-cdp', note: NAV_05, steps: (p) => click(p, 'Change tier') },
  { module: M5, board: 'Workspaces', path: '/workspaces', persona: 'u-wei', ...PREP, note: NAV_05 },
  { module: M5, board: 'Workspace', path: '/workspaces/ws-a10-cdp?req=R.1.1.1', persona: 'u-wei', ...PREP, note: `${NAV_05} Owner select (D6, no design).` },
  { module: M5, board: 'UploadEvidence', path: '/workspaces/ws-a10-cdp?req=R.1.1.3', persona: 'u-wei', ...PREP, note: 'Dates left empty.', steps: async (p) => {
    await click(p, 'Upload evidence'); await upload(p, 'ad-inactive-accounts.png', 412); await fill(p, /^Name/, 'AD inactive account policy – screenshot');
    await pick(p, /^Also use for/, /R\.1\.1\.4/); await p.getByRole('heading', { name: 'Upload evidence' }).click(); } },
  { module: M5, board: 'LinkEvidence', path: '/workspaces/ws-a10-cdp?req=R.1.1.3', persona: 'u-wei', ...PREP, note: 'Opened on R.1.1.3 so the files are not linked yet.', steps: async (p) => {
    await click(p, 'Link existing evidence'); await p.getByRole('checkbox', { name: /Access control policy/ }).check(); } },
  { module: M5, board: 'EvidenceDetail', path: '/workspaces/ws-a10-cdp?req=R.1.1.1&evidence=ev-1', persona: 'u-wei', ...PREP },
  { module: M5, board: 'EvidenceLibrary', path: '/documents?workspace=ws-a10-cdp', persona: 'u-wei', ...PREP, note: 'Seed has more (generated) evidence per workspace.' },
  { module: M5, board: 'Documents', path: '/documents', persona: 'u-wei', ...PREP, note: 'Seed has more (generated) evidence per workspace.' },
];

const SEED_SR = 'Seed dates are moved before 25 Sep 2026; one active consultant per customer (Anna Lee).';
function consulting(module: string, p: { list: string; empty: string; w1: string; w2: string; sub: string; prog: string; done: string; rej: string; queue: string; review: string; approve: string; reject: string; asg: string; cdet: string; cons: string; ws: string; ended: string; endedId: string; endedPersona: string; wsId: string; slug: string; ga: boolean; extra: VisualCase[] }): VisualCase[] {
  const c = `/service-requests/${p.slug}`, o = `/ops/requests/${p.slug}`, m = `/ops/my-assignments/${p.slug}`;
  const openReview = async (page: Page, btn: string) => { await click(page, btn); };
  return [
    { module, board: p.empty, path: c, persona: 'u-quang', note: `${NAV_05} Saigon Foods (mock, no requests).` },
    { module, board: p.list, path: c, note: `${NAV_05} ${SEED_SR}` },
    { module, board: p.w1, path: `${c}/new`, note: NAV_05, steps: async (page) => {
      if (p.ga) await cardPick(page, 'ISO/IEC 27001'); else await pick(page, /^Framework/, 'ISO/IEC 27001');
      await pick(page, /^Scope/, 'Head office · Taipei'); } },
    { module, board: p.w2, path: `${c}/new`, note: NAV_05, steps: async (page) => {
      if (p.ga) await cardPick(page, 'ISO/IEC 27001'); else await pick(page, /^Framework/, 'ISO/IEC 27001');
      await pick(page, /^Scope/, 'Head office · Taipei'); await click(page, 'Next');
      if (!p.ga) { await page.getByLabel(/^Policies and procedures/).check(); await page.getByLabel(/^Prepare evidence/).check(); } } },
    { module, board: p.sub, path: `${c}/${p.sub === 'MvpDetailSubmitted' ? 'GA-2026-005' : 'IS-2026-004'}`, note: `${NAV_05} Copy: notified in the portal (Q12).` },
    { module, board: p.prog, path: `${c}/${p.ga ? 'GA-2026-004' : 'IS-2026-003'}`, note: `${NAV_05} ${SEED_SR}` },
    { module, board: p.done, path: `${c}/${p.ga ? 'GA-2026-002' : 'IS-2026-001'}`, note: `${NAV_05} ${SEED_SR}` },
    { module, board: p.rej, path: `${c}/${p.ga ? 'GA-2026-001' : 'IS-2025-009'}`, note: `${NAV_05} Scope is Head office (Plant · Taichung removed).` },
    { module, board: p.queue, path: o, persona: 'u-minh', note: `${NAV_SGS} ${SEED_SR}` },
    { module, board: p.review, path: `${o}/${p.ga ? 'GA-2026-005' : 'IS-2026-004'}`, persona: 'u-minh', note: `${NAV_SGS} Adds "Request information" (D3).` },
    { module, board: p.approve, path: `${o}/${p.ga ? 'GA-2026-005' : 'IS-2026-004'}`, persona: 'u-minh', note: NAV_SGS, steps: async (page) => { await openReview(page, 'Approve & assign'); await pick(page, /^Consultant/, 'Anna Lee'); } },
    { module, board: p.reject, path: `${o}/${p.ga ? 'GA-2026-005' : 'IS-2026-004'}`, persona: 'u-minh', note: NAV_SGS, steps: (page) => openReview(page, 'Reject') },
    { module, board: p.asg, path: m, persona: 'u-anna', note: `Consultant nav. ${SEED_SR}` },
    { module, board: p.cdet, path: `${m}/${p.wsId}`, persona: 'u-anna', note: 'Adds "Request information" (D3).' },
    ...p.extra,
    { module, board: p.ws, path: `${m}/${p.wsId}/workspace`, persona: 'u-anna', note: 'No customer self-assessment block (UC-ASM, Phase 2). Sample requirement list.' },
    { module, board: p.ended, path: `${m}/${p.endedId}/workspace`, persona: p.endedPersona, note: 'Access ends when the request is completed (Q15).' },
  ];
}
const M6 = '06-gap-analysis', M7 = '07-implementation-support';
const ga = consulting(M6, { slug: 'gap-analysis', ga: true, list: 'MvpList', empty: 'MvpListEmpty', w1: 'MvpWizard1', w2: 'MvpWizard2', sub: 'MvpDetailSubmitted', prog: 'MvpDetailProgress', done: 'MvpDetailCompleted', rej: 'MvpDetailRejected',
  queue: 'MvpAdminQueue', review: 'MvpAdminReview', approve: 'MvpAdminApprove', reject: 'MvpAdminReject', asg: 'MvpConsAssignments', cdet: 'MvpConsDetail', cons: '', ws: 'MvpConsWorkspace', ended: 'MvpConsWorkspaceEnded', wsId: 'GA-2026-006', endedId: 'GA-2026-002', endedPersona: 'u-anna',
  extra: [{ module: M6, board: 'MvpConsUpload', path: '/ops/my-assignments/gap-analysis/GA-2026-006', persona: 'u-anna', steps: async (page) => {
    await page.getByRole('button', { name: 'Upload report' }).first().click(); await upload(page, 'Formosa-TISAX-gap-report-final.pdf', 3120);
    await page.getByLabel(/^This report is final/).check(); } }] });
const is = consulting(M7, { slug: 'implementation-support', ga: false, list: 'Main', empty: 'IsListEmpty', w1: 'IsWizard1', w2: 'IsWizard2', sub: 'IsDetailSubmitted', prog: 'IsDetailProgress', done: 'IsDetailCompleted', rej: 'IsDetailRejected',
  queue: 'IsAdminQueue', review: 'IsAdminReview', approve: 'IsAdminApprove', reject: 'IsAdminReject', asg: 'IsConsAssignments', cdet: 'IsConsDetail', cons: '', ws: 'IsConsWorkspace', ended: 'IsConsWorkspaceEnded', wsId: 'IS-2026-003', endedId: 'IS-2026-001', endedPersona: 'u-weilin',
  extra: [
    { module: M7, board: 'IsConsDeliverable', path: '/ops/my-assignments/implementation-support/IS-2026-003', persona: 'u-anna', steps: async (page) => {
      await page.getByRole('button', { name: 'Share deliverable' }).first().click(); await fill(page, /^Title/, 'Access control policy v2'); await upload(page, 'access-control-policy-v2.docx', 164);
      await fill(page, /^Note to the customer/, 'Covers A.5.15 – A.5.18. Review section 4 with IT before you approve it internally.'); } },
    { module: M7, board: 'IsConsComplete', path: '/ops/my-assignments/implementation-support/IS-2026-003', persona: 'u-anna', steps: async (page) => {
      await click(page, 'Complete request'); await fill(page, /^Closing summary/, 'The 10 Not met gaps are closed and the core policies are approved. Next: 3 months of records, then the certification audit.');
      await page.getByLabel(/^The work is finished/).check(); } },
  ] });

/** Real sign-in / sign-out through the UI, for boards that need several people to act first. */
async function loginAs(page: Page, email: string) {
  const sgs = email.endsWith('@sgs.com');
  await page.goto(sgs ? '/ops/login' : '/login');
  await fill(page, /^Email/, email); await fill(page, /^Password/, 'password123'); await click(page, 'Sign in');
  await page.waitForURL(sgs ? /\/ops$/ : /\/$/);
}
async function signOut(page: Page) {
  await page.getByRole('button', { name: /^Account:/ }).click();
  await page.locator('.gr-top__acct-links').getByRole('link', { name: 'Sign out' }).click();
  await page.waitForURL(/login/);
}
async function customerSubmitsCorrective(page: Page) {
  await loginAs(page, 'wei.chen@abc-trading.com');
  await page.goto('/workspaces/ws-a10-cdp?req=R.3.1.3');
  await click(page, 'Submit corrective action');
  await fill(page, /^Action taken/, 'Full restore of the CRM database tested on 16 Sep 2026. The backup procedure now requires a restore test every 6 months.');
  await page.getByLabel(/^Completed on/).first().click(); await page.locator('.gr-cal__day:not([disabled])').last().click();
  await page.locator('.gr-modal input[type=file], [role=dialog] input[type=file]').first().setInputFiles([
    { name: 'restore-test-2026-09.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(540000) }, { name: 'backup-procedure-v3.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(610000) }]);
  await fill(page, /^Note for the auditor/, 'Test results are on pages 3–5.');
  await page.getByRole('dialog').getByRole('button', { name: 'Submit', exact: true }).click(); await page.getByText('Corrective action submitted for F-003').waitFor();
  await signOut(page);
}
const M8 = '08-certification-audit-review', M9 = '09-certification-training', M10 = '10-audit-trail';
const SEED_08 = 'Audit dates moved to Sep 2026 (demo date 25 Sep 2026).';
const cert: VisualCase[] = [
  { module: M8, board: 'Main', path: '/workspaces/ws-42001-ai', note: `${NAV_05} ISO/IEC 42001 · AI platform (Customer data platform already has CR-2026-015). Header also keeps "Evidence library".`, steps: async (p) => { await click(p, 'Request certification'); await pick(p, /^Preferred audit period/, 'November 2026'); } },
  { module: M8, board: 'ReqAssigned', path: '/service-requests/certification/CR-2026-015', ...PREP, note: `${NAV_05} ${SEED_08}` },
  { module: M8, board: 'ReqInProgress', path: '/service-requests/certification/CR-2026-015', note: `${NAV_05} ${SEED_08}` },
  { module: M8, board: 'WorkspaceLocked', path: '/workspaces/ws-a10-cdp?req=R.3.1.3', persona: 'u-wei', note: `${NAV_05} ${SEED_08}` },
  { module: M8, board: 'ReviewFeedback', path: '/reviews/rv-cr015', persona: 'u-wei', note: `${NAV_05} The seed has R.1.1.4 overdue, so the overdue banner shows (= ReviewOverdue).` },
  { module: M8, board: 'RespondClarification', path: '/reviews/rv-cr015', persona: 'u-wei', note: NAV_05, steps: async (p) => {
    await click(p, 'Respond'); await fill(p, /^Your answer/, 'Q3 minutes attached. The review was held on 30 Sep 2026.'); await upload(p, 'account-review-2026Q3.pdf', 188); } },
  { module: M8, board: 'SubmitCorrectiveAction', path: '/workspaces/ws-a10-cdp?req=R.3.1.3', persona: 'u-wei', note: NAV_05, steps: async (p) => {
    await click(p, 'Submit corrective action'); await fill(p, /^Action taken/, 'Full restore of the CRM database tested on 16 Sep 2026. The backup procedure now requires a restore test every 6 months.');
    await p.locator('[role=dialog] input[type=file]').first().setInputFiles([{ name: 'restore-test-2026-12.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(540000) }, { name: 'backup-procedure-v3.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(610000) }]);
    await fill(p, /^Note for the auditor/, 'Test results are on pages 3–5.'); } },
  { module: M8, board: 'ReqCompleted', path: '/service-requests/certification/CR-2026-015', scenario: 'audited', note: `${NAV_05} ${SEED_08}` },
  { module: M8, board: 'ReqCertIssued', path: '/service-requests/certification/CR-2026-015', scenario: 'certified', note: `${NAV_05} ${SEED_08}` },
  { module: M8, board: 'Certifications', path: '/certifications', scenario: 'certified', note: `${NAV_05} Certificate dates moved to Sep 2026.` },
  { module: M8, board: 'Reviews', path: '/reviews', persona: 'u-wei', note: NAV_05 },
  { module: M8, board: 'WorkspaceAfterReview', path: '/workspaces/ws-a10-cdp?req=R.3.1.3', persona: 'u-wei', scenario: 'audited', note: `${NAV_05} ${SEED_08}` },
  { module: M8, board: 'CorrectiveNotAccepted', path: '/login', persona: null, note: `${NAV_05} Reached by real actions: customer submits, auditor does not accept.`, steps: async (p) => {
    await customerSubmitsCorrective(p);
    await loginAs(p, 'david.wu@sgs.com'); await p.goto('/ops/audits/CR-2026-015/review?item=R.3.1.3'); await click(p, 'Evaluate');
    await p.getByLabel('Not accepted — send back to the customer').check(); await fill(p, /^Comment to the customer/, 'The restore test report has no sign-off by the system owner. Please add the signed report.');
    await click(p, 'Save decision'); await p.getByText('F-003 sent back to the customer').waitFor(); await signOut(p);
    await loginAs(p, 'wei.chen@abc-trading.com'); await p.goto('/workspaces/ws-a10-cdp?req=R.3.1.3'); } },
  { module: M8, board: 'ReviewOverdue', path: '/reviews/rv-cr015', persona: 'u-wei', note: NAV_05 },
  { module: M8, board: 'SgsCertRequests', path: '/ops/requests/certification', persona: 'u-minh', note: `${NAV_SGS} Seed requests differ (one auditor, ABC recertification).` },
  { module: M8, board: 'SgsAssignAuditor', path: '/ops/requests/certification', persona: 'u-minh', note: NAV_SGS, steps: async (p) => { await rowMenu(p, /CR-2026-018/, 'Assign auditor'); await pick(p, /^Auditor/, 'David Wu'); } },
  { module: M8, board: 'SgsCreateCert', path: '/ops/requests/certification?tab=cert', persona: 'u-minh', note: `${NAV_SGS} Dates left empty.`, steps: async (p) => {
    await rowMenu(p, /CR-2026-012/, 'Create certification record'); await fill(p, /^Certificate number/, 'TW26/1150'); await pick(p, /^Accreditation/, 'TAF');
    await fill(p, /^Certificate scope/, 'The information security management system for trading, logistics and customer service operations at the Taipei head office.');
    await fill(p, /^Certified sites/, 'No. 1, Section 5, Xinyi Rd, Xinyi District, Taipei, TW'); await fill(p, /^Contract number/, 'TW/TPE/2026/0208'); } },
  { module: M8, board: 'SgsCertifications', path: '/ops/certifications', persona: 'u-minh', scenario: 'certified', note: NAV_SGS },
  { module: M8, board: 'AudMyAudits', path: '/ops/audits', persona: 'u-david', note: 'Auditor nav.' },
  { module: M8, board: 'AudRequest', path: '/ops/audits/CR-2026-017', persona: 'u-david' },
  { module: M8, board: 'AudStartReview', path: '/ops/audits/CR-2026-017', persona: 'u-david', steps: (p) => click(p, 'Start audit review') },
  { module: M8, board: 'AudReview', path: '/login', persona: null, note: 'Reached by real actions: the customer submits the corrective action first.', steps: async (p) => {
    await customerSubmitsCorrective(p); await loginAs(p, 'david.wu@sgs.com'); await p.goto('/ops/audits/CR-2026-015/review?item=R.3.1.3'); } },
  { module: M8, board: 'AudClarification', path: '/ops/audits/CR-2026-015/review?item=R.1.1.4', persona: 'u-david', steps: async (p) => {
    await click(p, 'Request clarification'); await fill(p, /^Question for the customer/, 'Please add the Q3 account review minutes; only Q1 and Q2 are in the workspace.'); } },
  { module: M8, board: 'AudRaiseFinding', path: '/ops/audits/CR-2026-015/review?item=R.3.2.2', persona: 'u-david', note: 'Opened on R.3.2.2 (R.4.1.2 already has F-004).', steps: async (p) => {
    await click(p, 'Raise finding'); await pick(p, /^Classification/, 'Major nonconformity');
    await fill(p, /^Finding/, 'MFA is not enforced for administrator access to the CRM database. The IAM export shows password-only login for 4 admin accounts.'); } },
  { module: M8, board: 'AudEvaluate', path: '/login', persona: null, note: 'Reached by real actions.', steps: async (p) => {
    await customerSubmitsCorrective(p); await loginAs(p, 'david.wu@sgs.com'); await p.goto('/ops/audits/CR-2026-015/review?item=R.3.1.3'); await click(p, 'Evaluate'); } },
  { module: M8, board: 'AudFindings', path: '/ops/audits/CR-2026-015/findings', persona: 'u-david' },
  { module: M8, board: 'AudCloseReview', path: '/ops/audits/CR-2026-015/review', persona: 'u-david', scenario: 'ready', steps: async (p) => {
    await click(p, 'Close review'); await upload(p, 'CR-2026-015-audit-report.pdf', 1990); await p.getByLabel(/^The review is complete/).check(); } },
  { module: M8, board: 'AudEvaluateClarification', path: '/ops/audits/CR-2026-015/review?item=R.5.3.4', persona: 'u-david', note: 'Answer of R.5.3.4 (design: R.1.1.4). Textarea 552 (Q5).', steps: (p) => click(p, 'Evaluate answer') },
  { module: M8, board: 'AudChangeDueDate', path: '/ops/audits/CR-2026-015/review?item=R.4.1.2', persona: 'u-david', steps: async (p) => {
    await click(p, 'Change due date'); await fill(p, /^Reason/, 'Agreed on the call of 12 Dec: MFA roll-out to admin accounts needs a change window.'); } },
  { module: M9, board: 'Main', path: '/service-requests/certification', note: `${NAV_05} Copy: "SGS auditor" (08) instead of "SGS contact".` },
  { module: M9, board: 'CertRequest', path: '/service-requests/certification', note: NAV_05, steps: async (p) => {
    await p.getByRole('row', { name: /ISO\/IEC 27001/ }).getByRole('button', { name: 'Request' }).click(); await pick(p, /^Scope/, 'Head office · Taipei'); await pick(p, /^Preferred audit period/, 'Q1 2027'); } },
  { module: M9, board: 'CertDetail', path: '/service-requests/certification/CR-2026-018', note: `${NAV_05} Seed: CR-2026-018 recertification ISO 22301 (CR-2026-012 is audit completed, D2).` },
  { module: M9, board: 'CertDetailAssigned', path: '/service-requests/certification/CR-2026-017', persona: 'u-daniel', note: `${NAV_05} Formosa CR-2026-017 (08 flow, D2).` },
  { module: M9, board: 'CertAdminQueue', path: '/ops/requests/certification', persona: 'u-minh', note: `${NAV_SGS} Merged with 08 tabs (D2).` },
  { module: M9, board: 'CertAdminAssign', path: '/ops/requests/certification', persona: 'u-minh', note: `${NAV_SGS} 08 SgsAssignAuditor (D2).`, steps: async (p) => { await rowMenu(p, /CR-2026-018/, 'Assign auditor'); await pick(p, /^Auditor/, 'David Wu'); } },
  { module: M9, board: 'AdminReject', path: '/ops/requests/certification', persona: 'u-minh', note: `${NAV_SGS} One reason list for all categories.`, steps: (p) => rowMenu(p, /CR-2026-018/, 'Reject') },
  { module: M9, board: 'TrainList', path: '/service-requests/training', note: NAV_05 },
  { module: M9, board: 'TrainRequest', path: '/service-requests/training', note: `${NAV_05} Fields start empty (design shows sample values filled in).`, steps: async (p) => {
    await p.getByRole('row', { name: /Lead Auditor Training Course ISO\/IEC 27001/ }).getByRole('button', { name: 'Request' }).click();
    await fill(p, /^Participants/, '6'); await pick(p, /^Format/, 'Public class'); await pick(p, /^Preferred month/, 'November 2026'); await pick(p, /^Language/, '繁體中文'); } },
  { module: M9, board: 'TrainDetail', path: '/service-requests/training/TR-2026-021', note: NAV_05 },
  { module: M9, board: 'TrainAdminQueue', path: '/ops/requests/training', persona: 'u-minh', note: `${NAV_SGS} Rejected tab shows TR-2026-009 (rejected in TrainList, 0 in this board, Q29).` },
  { module: M9, board: 'TrainAdminAssign', path: '/ops/requests/training', persona: 'u-minh', note: `${NAV_SGS} Placeholder copy about training, not an audit (Q16).`, steps: async (p) => { await rowMenu(p, /TR-2026-021/, 'Assign'); await pick(p, /^Assign to/, 'Mei Chang'); } },
  { module: M10, board: 'Main', path: '/ops/audit-logs', persona: 'u-minh', note: `${NAV_SGS} Seed timeline: design events 26–30 Sep moved before 25 Sep; some objects differ (Q30).` },
  { module: M10, board: 'SgsAuditConsultant', path: '/ops/audit-logs', persona: 'u-minh', note: `${NAV_SGS} Q30.`, steps: (p) => pick(p, /^Action/, 'Consultant activity') },
  { module: M10, board: 'SgsAuditDetail', path: '/ops/audit-logs', persona: 'u-minh', note: NAV_SGS, steps: (p) => rowMenu(p, /Uploaded final report/, 'View details') },
  { module: M10, board: 'CaActivity', path: '/audit-logs', note: `${NAV_05} Q30.` },
  { module: M10, board: 'CaActivityDetail', path: '/audit-logs', note: NAV_05, steps: (p) => rowMenu(p, /Replaced evidence/, 'View details') },
];

export const cases: VisualCase[] = [...auth, ...users, ...frameworks, ...scopes, ...ga, ...is, ...cert];
