// Customer accounts (UC-ACC-001…005/007, designs/03 Tenant*). SGS Admin creates and edits customers of
// the own affiliate; SGS User can view them. Scopes and tiers are managed by the customer (D10).
import { visibleTenantIds } from '../access';
import { getDb, mutate } from '../store';
import { SCOPE_TYPE_LABEL } from '../labels';
import type { AppUser, MockDb, Session, Tenant } from '../types';
import { audit, copy, MockApiError, newId, now, wait } from './core';

export interface TenantRow extends Tenant { admin?: AppUser; users: number; scopes: number; creatorName?: string; lastSignIn?: { at: string; name: string } }
export interface TenantScopeRow { id: string; name: string; type: string; belongsTo: string; frameworks: string[]; tiers: string[]; users: number; createdAt: string }
export interface TenantDetail extends TenantRow { members: AppUser[]; frameworkCount: number; scopeRows: TenantScopeRow[]; affiliateName: string }

function summary(db: MockDb, t: Tenant): TenantRow {
  const members = db.users.filter((u) => u.tenantId === t.id);
  const last = members.filter((u) => u.lastSignInAt).sort((a, b) => b.lastSignInAt!.localeCompare(a.lastSignInAt!))[0];
  return {
    ...t,
    admin: members.find((u) => u.role === 'customer_admin'),
    users: members.length,
    scopes: db.scopes.filter((s) => s.tenantId === t.id).length,
    creatorName: db.users.find((u) => u.id === t.createdBy)?.displayName,
    lastSignIn: last ? { at: last.lastSignInAt!, name: last.displayName } : undefined,
  };
}

const canManage = (s: Session) => s.user.role === 'sgs_admin';

export async function listCustomers(s: Session): Promise<TenantRow[]> {
  await wait();
  const db = getDb();
  if (!s.user.role.startsWith('sgs_')) throw new MockApiError(403, 'SGS only');
  const ids = visibleTenantIds(db, s);
  return copy(db.tenants.filter((t) => ids.has(t.id)).map((t) => summary(db, t)).sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
}

export async function getCustomer(s: Session, id: string): Promise<TenantDetail> {
  await wait();
  const db = getDb();
  if (!s.user.role.startsWith('sgs_') || !visibleTenantIds(db, s).has(id)) throw new MockApiError(404, 'Customer not found');
  const t = db.tenants.find((x) => x.id === id)!;
  const scopes = db.scopes.filter((x) => x.tenantId === id);
  const scopeRows: TenantScopeRow[] = scopes.map((sc) => {
    const ws = db.workspaces.filter((w) => w.scopeId === sc.id);
    return {
      id: sc.id, name: sc.name, type: SCOPE_TYPE_LABEL[sc.type] === 'Organisation' ? 'Organization' : SCOPE_TYPE_LABEL[sc.type],
      belongsTo: [sc.parentOrgScopeId, sc.parentProductScopeId].filter(Boolean).map((p) => db.scopes.find((x) => x.id === p)!.name).join('; ') || '—',
      frameworks: ws.map((w) => { const f = db.frameworks.find((x) => x.id === w.frameworkId)!; return `${f.shortName} · ${f.version}`; }),
      tiers: ws.map((w) => { const f = db.frameworks.find((x) => x.id === w.frameworkId)!; return f.tiers.length ? f.tiers.find((x) => x.code === w.tier)?.label ?? '—' : 'No tiers'; }),
      users: db.users.filter((u) => u.tenantId === id && (u.role === 'customer_admin' || db.userScopes.some((x) => x.userId === u.id && x.scopeId === sc.id))).length,
      createdAt: sc.createdAt,
    };
  });
  return copy({
    ...summary(db, t), members: db.users.filter((u) => u.tenantId === id).map((u) => ({ ...u, password: undefined })),
    frameworkCount: db.workspaces.filter((w) => w.tenantId === id).length, scopeRows,
    affiliateName: db.affiliates.find((a) => a.id === t.affiliateId)!.name,
  });
}

export async function createCustomer(s: Session, input: { name: string; country: string; note: string }): Promise<Tenant> {
  await wait();
  if (!canManage(s)) throw new MockApiError(403, 'Only an SGS Admin can create customers');
  let t!: Tenant;
  mutate((db) => {
    if (db.tenants.some((x) => x.affiliateId === s.user.affiliateId && x.name.trim().toLowerCase() === input.name.trim().toLowerCase())) throw new MockApiError(409, 'A customer with this name already exists.');
    t = { id: newId('t'), affiliateId: s.user.affiliateId, name: input.name.trim(), country: input.country, status: 'no_admin', internalNote: input.note.trim() || undefined, createdAt: now().slice(0, 10), createdBy: s.user.id };
    db.tenants.push(t);
    audit(db, s, { tenantId: t.id, action: 'Created customer', category: 'customers', objectType: 'Customer', objectId: t.id, objectLabel: t.name, newValue: { name: t.name, country: t.country } });
  });
  return copy(t);
}

export async function updateCustomer(s: Session, id: string, input: { name: string; country: string; note: string }): Promise<void> {
  await wait();
  if (!canManage(s)) throw new MockApiError(403, 'Only an SGS Admin can edit customers');
  mutate((db) => {
    const t = db.tenants.find((x) => x.id === id && x.affiliateId === s.user.affiliateId);
    if (!t) throw new MockApiError(404, 'Customer not found');
    const before = { name: t.name, country: t.country, internalNote: t.internalNote };
    Object.assign(t, { name: input.name.trim(), country: input.country, internalNote: input.note.trim() || undefined });
    audit(db, s, { tenantId: id, action: 'Edited customer', category: 'customers', objectType: 'Customer', objectId: id, objectLabel: t.name, previousValue: before, newValue: { name: t.name, country: t.country, internalNote: t.internalNote } });
  });
}
