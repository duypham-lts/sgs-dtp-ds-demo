// User management (UC-USR-001/002/003/006, designs/03-user-management).
// Customer Admin manages Customer Users of their own tenant; SGS Admin manages SGS users of the affiliate
// and sees customer users read-only. Every change writes an AUDIT_EVENT.
import { visibleUserIds } from '../access';
import { getDb, mutate } from '../store';
import { ROLE_LABEL, portalOf, type AppUser, type AuditEvent, type MockDb, type Role, type Session, type SgsRole } from '../types';
import { SCOPE_TYPE_LABEL } from '../labels';
import { audit, copy, MockApiError, newId, notify, now, today, wait } from './core';

export const INVITATION_DAYS = 7;

export interface ScopeAccessRow { scopeId: string; name: string; type: string; frameworks: string; grantedAt?: string }
export interface UserRow extends AppUser { scopeCount: number | 'all'; orgName: string }
export interface UserDetail extends UserRow {
  inviterName?: string; scopes: ScopeAccessRow[]; tenantScopeCount: number; history: { title: string; meta: string; at: string }[];
  assignments: { requestId: string; label: string; customer: string; status: string }[];
}

function frameworksOf(db: MockDb, scopeId: string): string {
  const names = db.workspaces.filter((w) => w.scopeId === scopeId).map((w) => db.frameworks.find((f) => f.id === w.frameworkId)!.shortName);
  return [...new Set(names)].join(', ');
}

export function scopeOptionsFor(db: MockDb, tenantId: string) {
  return db.scopes.filter((s) => s.tenantId === tenantId).map((s) => {
    const fw = frameworksOf(db, s.id);
    return { value: s.id, label: s.name, description: `${SCOPE_TYPE_LABEL[s.type]} scope${fw ? ` · ${fw}` : ''}`, frameworks: fw, type: SCOPE_TYPE_LABEL[s.type], meta: s.description };
  });
}

function row(db: MockDb, u: AppUser): UserRow {
  const org = u.tenantId ? db.tenants.find((t) => t.id === u.tenantId)!.name : db.affiliates.find((a) => a.id === u.affiliateId)!.name;
  return { ...u, password: undefined, scopeCount: u.role === 'customer_admin' ? 'all' : db.userScopes.filter((x) => x.userId === u.id).length, orgName: org };
}

const HISTORY: Record<string, (e: AuditEvent) => string> = {
  'Invited user': () => 'Invitation sent',
  'Resent invitation': () => 'Invitation sent again',
  'Activated account': () => 'Account activated',
  'Changed scope access': (e) => `Scope access: ${e.context ?? 'changed'}`,
};

export async function listUsersFor(s: Session, scope: 'tenant' | 'sgs' | 'customers'): Promise<UserRow[]> {
  await wait();
  const db = getDb();
  const ids = visibleUserIds(db, s);
  return copy(db.users.filter((u) => ids.has(u.id) && (scope === 'tenant' ? u.tenantId === s.user.tenantId : scope === 'sgs' ? u.tenantId === null : u.tenantId !== null)).map((u) => row(db, u)));
}

export async function getUserDetail(s: Session, id: string): Promise<UserDetail> {
  await wait();
  const db = getDb();
  if (!visibleUserIds(db, s).has(id)) throw new MockApiError(404, 'User not found');
  const u = db.users.find((x) => x.id === id)!;
  const inviter = db.users.find((x) => x.id === u.invitedBy);
  const all = u.tenantId ? scopeOptionsFor(db, u.tenantId) : [];
  const granted = db.userScopes.filter((x) => x.userId === u.id);
  const scopes: ScopeAccessRow[] = (u.role === 'customer_admin' ? all.map((o) => ({ ...o, grantedAt: undefined })) : all.filter((o) => granted.some((g) => g.scopeId === o.value)).map((o) => ({ ...o, grantedAt: granted.find((g) => g.scopeId === o.value)!.grantedAt })))
    .map((o) => ({ scopeId: o.value, name: o.label, type: o.type, frameworks: o.frameworks || '—', grantedAt: o.grantedAt }));
  const history = db.auditEvents.filter((e) => e.objectType === 'User' && e.objectId === u.id && HISTORY[e.action])
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
    .map((e) => ({ title: HISTORY[e.action](e), meta: db.users.find((x) => x.id === e.actorId)?.displayName ?? 'System', at: e.occurredAt }));
  const assignments = db.serviceRequests.filter((r) => r.assigneeId === u.id && !['completed', 'rejected', 'withdrawn', 'certificate_issued'].includes(r.status))
    .map((r) => ({ requestId: r.id, label: `${r.id} · ${r.category === 'gap_analysis' ? 'Gap Analysis' : r.category === 'implementation_support' ? 'Implementation Support' : r.category === 'certification' ? 'Certification' : 'Training'}`, customer: db.tenants.find((t) => t.id === r.tenantId)!.name, status: r.status }));
  return copy({ ...row(db, u), inviterName: inviter?.displayName, scopes, tenantScopeCount: all.length, history, assignments });
}

function assertAdminOf(db: MockDb, s: Session, u: AppUser) {
  if (s.user.role === 'customer_admin' && u.tenantId === s.user.tenantId && u.role !== 'customer_admin') return;
  if (s.user.role === 'sgs_admin' && u.affiliateId === s.user.affiliateId && (u.tenantId === null || u.role === 'customer_admin')) return;
  throw new MockApiError(403, 'You can’t manage this user');
}

function sendInvitation(db: MockDb, s: Session, u: AppUser) {
  u.invitationToken = newId('inv');
  u.invitationExpiresAt = addDays(today(), INVITATION_DAYS);
  u.invitedAt = now();
  u.invitedBy = s.user.id;
  const tenant = u.tenantId ? db.tenants.find((t) => t.id === u.tenantId) : undefined;
  const sgs = portalOf(u.role) === 'sgs-ops';
  const org = tenant?.name ?? s.affiliate.name;
  db.emails.unshift({
    id: newId('em'), kind: 'invitation', to: u.email, toName: u.displayName, userId: u.id, token: u.invitationToken,
    subject: sgs ? 'You’re invited to SGS Operations on the Digital Trust Platform' : `${s.user.role.startsWith('sgs') ? s.affiliate.name : s.user.displayName} invited you to ${org.replace(/ (Co\., Ltd\.|Inc\.|JSC|LLC)$/, '')} on the SGS Digital Trust Platform`,
    sentAt: now(), expiresAt: u.invitationExpiresAt, inviterName: s.user.displayName, inviterRole: ROLE_LABEL[s.user.role], orgName: org, portal: sgs ? 'sgs-ops' : 'customer',
  });
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkNewEmail(db: MockDb, email: string) {
  if (!EMAIL_RE.test(email.trim())) throw new MockApiError(422, 'Enter a valid email address, e.g. name@company.com.');
  if (db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) throw new MockApiError(409, 'This email already has an account on the platform.');
}

/** Customer Admin invites a Customer User (designs/03 CaInvite). */
export async function inviteCustomerUser(s: Session, input: { email: string; name: string; scopeIds: string[] }): Promise<UserRow> {
  await wait();
  if (s.user.role !== 'customer_admin') throw new MockApiError(403, 'Only a Customer Admin can invite users');
  let created!: AppUser;
  mutate((db) => {
    checkNewEmail(db, input.email);
    const email = input.email.trim();
    created = { id: newId('u'), affiliateId: s.user.affiliateId, tenantId: s.user.tenantId, email, displayName: input.name.trim() || email.split('@')[0], role: 'customer_user', status: 'invited' };
    db.users.push(created);
    for (const scopeId of input.scopeIds) db.userScopes.push({ userId: created.id, scopeId, tenantId: s.user.tenantId!, grantedBy: s.user.id, grantedAt: today() });
    sendInvitation(db, s, created);
    audit(db, s, { tenantId: s.user.tenantId, action: 'Invited user', category: 'users', objectType: 'User', objectId: created.id, objectLabel: created.displayName, newValue: { role: 'Customer User', scopes: input.scopeIds.map((id) => db.scopes.find((x) => x.id === id)!.name) } });
  });
  return copy(row(getDb(), created));
}

/** SGS Admin invites an SGS user of the own affiliate (designs/03 SgsInviteSgs). */
export async function inviteSgsUser(s: Session, input: { email: string; name: string; role: SgsRole }): Promise<UserRow> {
  await wait();
  if (s.user.role !== 'sgs_admin') throw new MockApiError(403, 'Only an SGS Admin can invite SGS users');
  let created!: AppUser;
  mutate((db) => {
    checkNewEmail(db, input.email);
    const email = input.email.trim();
    created = { id: newId('u'), affiliateId: s.user.affiliateId, tenantId: null, email, displayName: input.name.trim() || email.split('@')[0], role: input.role, status: 'invited' };
    db.users.push(created);
    sendInvitation(db, s, created);
    audit(db, s, { tenantId: null, action: 'Invited user', category: 'users', objectType: 'User', objectId: created.id, objectLabel: created.displayName, newValue: { role: ROLE_LABEL[input.role] } });
  });
  return copy(row(getDb(), created));
}

/** SGS Admin creates the one Customer Admin of a customer (designs/03 TenantCreateAdmin, UC-ACC-007). */
export async function createCustomerAdmin(s: Session, tenantId: string, input: { email: string; name: string }): Promise<UserRow> {
  await wait();
  if (s.user.role !== 'sgs_admin') throw new MockApiError(403, 'Only an SGS Admin can create a Customer Admin');
  let created!: AppUser;
  mutate((db) => {
    const t = db.tenants.find((x) => x.id === tenantId && x.affiliateId === s.user.affiliateId);
    if (!t) throw new MockApiError(404, 'Customer not found');
    if (db.users.some((u) => u.tenantId === tenantId && u.role === 'customer_admin')) throw new MockApiError(409, 'This customer already has a Customer Admin.');
    checkNewEmail(db, input.email);
    const email = input.email.trim();
    created = { id: newId('u'), affiliateId: t.affiliateId, tenantId, email, displayName: input.name.trim() || email.split('@')[0], role: 'customer_admin', status: 'invited' };
    db.users.push(created);
    t.status = 'admin_invited';
    sendInvitation(db, s, created);
    audit(db, s, { tenantId, action: 'Invited user', category: 'users', objectType: 'User', objectId: created.id, objectLabel: created.displayName, newValue: { role: 'Customer Admin', customer: t.name } });
  });
  return copy(row(getDb(), created));
}

export async function resendInvitation(s: Session, id: string): Promise<{ expiresAt: string }> {
  await wait();
  let expiresAt = '';
  mutate((db) => {
    const u = db.users.find((x) => x.id === id);
    if (!u || (u.status !== 'invited' && u.status !== 'expired')) throw new MockApiError(409, 'There is no pending invitation');
    assertAdminOf(db, s, u);
    u.status = 'invited';
    sendInvitation(db, s, u);
    expiresAt = u.invitationExpiresAt!;
    audit(db, s, { tenantId: u.tenantId, action: 'Resent invitation', category: 'users', objectType: 'User', objectId: u.id, objectLabel: u.displayName });
  });
  return { expiresAt };
}

/** The link stops working and the row disappears from the list (docs/prototype-plan.md §3.7). */
export async function revokeInvitation(s: Session, id: string): Promise<void> {
  await wait();
  mutate((db) => {
    const u = db.users.find((x) => x.id === id);
    if (!u || (u.status !== 'invited' && u.status !== 'expired')) throw new MockApiError(409, 'There is no pending invitation');
    assertAdminOf(db, s, u);
    db.users = db.users.filter((x) => x.id !== id);
    db.userScopes = db.userScopes.filter((x) => x.userId !== id);
    const t = u.tenantId ? db.tenants.find((x) => x.id === u.tenantId) : undefined;
    if (t && u.role === 'customer_admin' && t.status === 'admin_invited') t.status = 'no_admin';
    audit(db, s, { tenantId: u.tenantId, action: 'Revoked invitation', category: 'users', objectType: 'User', objectId: u.id, objectLabel: u.displayName, previousValue: { email: u.email } });
  });
}

/** Customer Admin sets the scopes a Customer User or Viewer can see (UC-USR-006, designs/03 CaAssignScopes). */
export async function setUserScopes(s: Session, id: string, scopeIds: string[]): Promise<void> {
  await wait();
  mutate((db) => {
    const u = db.users.find((x) => x.id === id);
    if (!u) throw new MockApiError(404, 'User not found');
    if (s.user.role !== 'customer_admin' || u.tenantId !== s.user.tenantId || u.role === 'customer_admin') throw new MockApiError(403, 'You can’t change the access of this user');
    const before = db.userScopes.filter((x) => x.userId === id).map((x) => x.scopeId);
    const name = (sid: string) => db.scopes.find((x) => x.id === sid)!.name;
    const added = scopeIds.filter((x) => !before.includes(x));
    const removed = before.filter((x) => !scopeIds.includes(x));
    if (!added.length && !removed.length) return;
    db.userScopes = db.userScopes.filter((x) => x.userId !== id || scopeIds.includes(x.scopeId));
    for (const scopeId of added) db.userScopes.push({ userId: id, scopeId, tenantId: u.tenantId!, grantedBy: s.user.id, grantedAt: today() });
    const context = [...added.map((x) => `${name(x)} added`), ...removed.map((x) => `${name(x)} removed`)].join(', ');
    audit(db, s, { tenantId: u.tenantId, action: 'Changed scope access', category: 'users', objectType: 'User', objectId: id, objectLabel: u.displayName, context, previousValue: { scopes: before.map(name) }, newValue: { scopes: scopeIds.map(name) } });
    if (u.status === 'active') notify(db, { recipientUserId: id, tenantId: u.tenantId, type: 'user', tone: 'info', title: 'Your scope access changed', body: context, ref: 'Scopes', href: '/scopes' });
  });
}

export function roleOf(id: string): Role | undefined { return getDb().users.find((u) => u.id === id)?.role; }
