// Scopes and their frameworks (UC-SCP-001…006, UC-USR-006, designs/05 Scopes*, ScopeDetail, LinkFramework,
// ChangeTier, AssignUsers). Customer Admin manages; Customer Users and Viewers read the scopes assigned to them.
// The customer chooses the tier (D10, design-questions Q11); it can't change while an audit is running.
import { visibleScopeIds } from '../access';
import { coverage, workspaceRequirements } from '../coverage';
import { inTier } from '../catalog';
import { SCOPE_TYPE_US, fwVersion, tierName, wsTitle } from '../labels2';
import { getDb, mutate } from '../store';
import type { MockDb, Scope, ScopeType, Session, Workspace } from '../types';
import { audit, copy, MockApiError, newId, notify, now, today, wait } from './core';

export interface WorkspaceRow {
  id: string; title: string; fw: string; frameworkId: string; tier?: string; tierLabel: string; tiered: boolean;
  scopeId: string; scopeName: string; scopeType: string; status: Workspace['status']; lockedBy?: string;
  provided: number; total: number; percent: number;
}
export interface ScopeRow extends Scope { typeLabel: string; belongsTo: string; frameworks: string[]; users: number; coverage: number | null }
export interface ScopeDetail extends ScopeRow {
  contains: string[]; workspaces: WorkspaceRow[];
  members: { id: string; name: string; role: string; grantedAt?: string }[];
  candidates: { id: string; name: string; email: string; status: string; selected: boolean }[];
  locked: boolean; canManage: boolean;
}

export function workspaceRow(db: MockDb, w: Workspace): WorkspaceRow {
  const f = db.frameworks.find((x) => x.id === w.frameworkId)!;
  const sc = db.scopes.find((x) => x.id === w.scopeId)!;
  const c = coverage(db, w);
  return { id: w.id, title: wsTitle(f, w), fw: fwVersion(f), frameworkId: f.id, tier: w.tier, tierLabel: tierName(f, w.tier), tiered: f.tiers.length > 0, scopeId: sc.id, scopeName: sc.name, scopeType: SCOPE_TYPE_US[sc.type], status: w.status, lockedBy: w.lockedByRequestId, ...c };
}

function scopeRow(db: MockDb, sc: Scope): ScopeRow {
  const ws = db.workspaces.filter((w) => w.scopeId === sc.id);
  const covs = ws.map((w) => coverage(db, w));
  const total = covs.reduce((a, c) => a + c.total, 0);
  const users = db.users.filter((u) => u.tenantId === sc.tenantId && u.status !== 'deactivated' && (u.role === 'customer_admin' || db.userScopes.some((x) => x.userId === u.id && x.scopeId === sc.id))).length;
  return {
    ...sc, typeLabel: SCOPE_TYPE_US[sc.type],
    belongsTo: [sc.parentOrgScopeId, sc.parentProductScopeId].filter(Boolean).map((id) => db.scopes.find((x) => x.id === id)!.name).join(', ') || '—',
    frameworks: ws.map((w) => { const f = db.frameworks.find((x) => x.id === w.frameworkId)!; return wsTitle(f, w); }),
    users, coverage: total ? Math.round((covs.reduce((a, c) => a + c.provided, 0) / total) * 100) : null,
  };
}

const canManage = (s: Session) => s.user.role === 'customer_admin';
function scopeOf(db: MockDb, s: Session, id: string): Scope {
  const sc = db.scopes.find((x) => x.id === id);
  if (!sc || sc.tenantId !== s.user.tenantId || !visibleScopeIds(db, s).has(id)) throw new MockApiError(404, 'Scope not found');
  return sc;
}

export async function listScopeRows(s: Session): Promise<ScopeRow[]> {
  await wait();
  const db = getDb();
  if (s.portal !== 'customer') throw new MockApiError(403, 'Customers only');
  const ids = visibleScopeIds(db, s);
  return copy(db.scopes.filter((x) => ids.has(x.id)).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((x) => scopeRow(db, x)));
}

export async function getScope(s: Session, id: string): Promise<ScopeDetail> {
  await wait();
  const db = getDb();
  const sc = scopeOf(db, s, id);
  const ws = db.workspaces.filter((w) => w.scopeId === id);
  const tenantUsers = db.users.filter((u) => u.tenantId === sc.tenantId);
  const assigned = new Map(db.userScopes.filter((x) => x.scopeId === id).map((x) => [x.userId, x.grantedAt]));
  return copy({
    ...scopeRow(db, sc),
    contains: db.scopes.filter((x) => x.parentOrgScopeId === id || x.parentProductScopeId === id).map((x) => `${x.name} (${x.type})`),
    workspaces: ws.map((w) => workspaceRow(db, w)),
    members: [
      ...tenantUsers.filter((u) => u.role === 'customer_admin').map((u) => ({ id: u.id, name: u.displayName, role: 'Customer Admin · sees every scope' })),
      ...tenantUsers.filter((u) => u.role !== 'customer_admin' && assigned.has(u.id) && u.status !== 'deactivated').map((u) => ({ id: u.id, name: u.displayName, role: u.role === 'customer_viewer' ? 'Customer Viewer' : 'Customer User', grantedAt: assigned.get(u.id) })),
    ],
    candidates: tenantUsers.filter((u) => u.role !== 'customer_admin').map((u) => ({ id: u.id, name: u.displayName, email: u.email, status: u.status, selected: assigned.has(u.id) })),
    locked: ws.some((w) => w.status === 'audit_in_progress'), canManage: canManage(s),
  });
}

export interface ScopeInput { type: ScopeType; name: string; parentOrgScopeId?: string; parentProductScopeId?: string; description: string; outOfScope: string }

function checkScope(db: MockDb, s: Session, input: ScopeInput, id?: string) {
  if (!canManage(s)) throw new MockApiError(403, 'Only a Customer Admin can manage scopes');
  if (db.scopes.some((x) => x.tenantId === s.user.tenantId && x.id !== id && x.name.trim().toLowerCase() === input.name.trim().toLowerCase())) throw new MockApiError(409, 'A scope with this name already exists.');
}

export async function createScope(s: Session, input: ScopeInput): Promise<Scope> {
  await wait();
  let sc!: Scope;
  mutate((db) => {
    checkScope(db, s, input);
    sc = { id: newId('s'), tenantId: s.user.tenantId!, type: input.type, name: input.name.trim(), description: input.description.trim(), outOfScope: input.outOfScope.trim() || undefined,
      parentOrgScopeId: input.type === 'system' ? input.parentOrgScopeId || undefined : undefined, parentProductScopeId: input.type === 'system' ? input.parentProductScopeId || undefined : undefined, status: 'active', createdAt: today() };
    db.scopes.push(sc);
    audit(db, s, { tenantId: sc.tenantId, action: 'Created scope', category: 'scopes', objectType: 'Scope', objectId: sc.id, objectLabel: sc.name, newValue: { type: sc.type, name: sc.name } });
  });
  return copy(sc);
}

/** UC-SCP-004. Blocked while an audit reviews a workspace of the scope (designs/05 ChangeTierLocked). */
export async function updateScope(s: Session, id: string, input: ScopeInput): Promise<void> {
  await wait();
  mutate((db) => {
    const sc = scopeOf(db, s, id);
    checkScope(db, s, input, id);
    if (db.workspaces.some((w) => w.scopeId === id && w.status === 'audit_in_progress')) throw new MockApiError(423, 'The scope can’t be edited while an audit is running.');
    const before = { name: sc.name, description: sc.description, outOfScope: sc.outOfScope };
    Object.assign(sc, { name: input.name.trim(), description: input.description.trim(), outOfScope: input.outOfScope.trim() || undefined,
      parentOrgScopeId: sc.type === 'system' ? input.parentOrgScopeId || undefined : undefined, parentProductScopeId: sc.type === 'system' ? input.parentProductScopeId || undefined : undefined });
    audit(db, s, { tenantId: sc.tenantId, action: 'Edited scope', category: 'scopes', objectType: 'Scope', objectId: id, objectLabel: sc.name, previousValue: before, newValue: { name: sc.name, description: sc.description, outOfScope: sc.outOfScope } });
  });
}

/** designs/05 AssignUsers: who (besides Customer Admins) can work in the scope. */
export async function setScopeUsers(s: Session, scopeId: string, userIds: string[]): Promise<void> {
  await wait();
  mutate((db) => {
    const sc = scopeOf(db, s, scopeId);
    if (!canManage(s)) throw new MockApiError(403, 'Only a Customer Admin can assign users');
    const before = db.userScopes.filter((x) => x.scopeId === scopeId).map((x) => x.userId);
    const name = (id: string) => db.users.find((u) => u.id === id)!.displayName;
    db.userScopes = db.userScopes.filter((x) => x.scopeId !== scopeId || userIds.includes(x.userId));
    for (const uid of userIds.filter((u) => !before.includes(u))) {
      db.userScopes.push({ userId: uid, scopeId, tenantId: sc.tenantId, grantedBy: s.user.id, grantedAt: today() });
      notify(db, { recipientUserId: uid, tenantId: sc.tenantId, type: 'user', tone: 'info', title: `You can now work on ${sc.name}`, ref: 'Scopes', href: `/scopes/${scopeId}` });
    }
    audit(db, s, { tenantId: sc.tenantId, action: 'Changed scope users', category: 'scopes', objectType: 'Scope', objectId: scopeId, objectLabel: sc.name, previousValue: { users: before.map(name) }, newValue: { users: userIds.map(name) } });
  });
}

/** Active frameworks the scope can link, grouped by code with their active versions (designs/05 LinkFramework). */
export function linkableFrameworks(db: MockDb, scopeId: string) {
  const linked = new Set(db.workspaces.filter((w) => w.scopeId === scopeId).map((w) => w.frameworkId));
  const active = db.frameworks.filter((f) => f.status === 'active');
  const codes = [...new Set(active.map((f) => f.code))];
  return codes.map((code) => {
    const versions = active.filter((f) => f.code === code).sort((a, b) => b.version.localeCompare(a.version));
    const f = versions[0];
    return { code, label: f.name.replace(/ (Information security management|AI management system|Privacy information management|Business continuity management)$/, ''), description: `${f.issuedBy}${f.tiers.length ? ` · tiers ${f.tiers.map((t) => t.label).join(' / ')}` : ''}`,
      versions: versions.map((v) => ({ id: v.id, label: fwVersion(v), linked: linked.has(v.id), tiers: v.tiers })) };
  });
}

export async function linkFramework(s: Session, scopeId: string, frameworkId: string, tier?: string): Promise<Workspace> {
  await wait();
  let ws!: Workspace;
  mutate((db) => {
    const sc = scopeOf(db, s, scopeId);
    if (!canManage(s)) throw new MockApiError(403, 'Only a Customer Admin can link frameworks');
    const f = db.frameworks.find((x) => x.id === frameworkId && x.status === 'active');
    if (!f) throw new MockApiError(404, 'Framework not found');
    if (db.workspaces.some((w) => w.scopeId === scopeId && w.frameworkId === frameworkId)) throw new MockApiError(409, `${fwVersion(f)} is already linked to this scope.`);
    if (f.tiers.length && !f.tiers.some((t) => t.code === tier)) throw new MockApiError(422, 'Choose the tier.');
    ws = { id: newId('ws'), tenantId: sc.tenantId, scopeId, frameworkId, tier: f.tiers.length ? tier : undefined, cycleLabel: today().slice(0, 4), status: 'preparing', createdBy: s.user.id, createdAt: today() };
    db.workspaces.push(ws);
    audit(db, s, { tenantId: sc.tenantId, action: 'Linked framework and created workspace', category: 'scopes', objectType: 'Scope', objectId: scopeId, objectLabel: sc.name, context: wsTitle(f, ws), newValue: { framework: fwVersion(f), tier: tier ? tierName(f, tier, false) : undefined } });
  });
  return copy(ws);
}

export function tierImpact(db: MockDb, workspaceId: string, tier: string) {
  const w = db.workspaces.find((x) => x.id === workspaceId)!;
  const f = db.frameworks.find((x) => x.id === w.frameworkId)!;
  const now1 = coverage(db, w);
  const next = { ...w, tier };
  const after = coverage(db, next);
  const cur = workspaceRequirements(db, w).length, nxt = db.requirements.filter((r) => r.frameworkId === f.id && inTier(f, r, tier)).length;
  return { from: now1.percent, to: after.percent, delta: nxt - cur };
}

export async function changeTier(s: Session, workspaceId: string, tier: string): Promise<void> {
  await wait();
  mutate((db) => {
    const w = db.workspaces.find((x) => x.id === workspaceId);
    if (!w || w.tenantId !== s.user.tenantId) throw new MockApiError(404, 'Workspace not found');
    if (!canManage(s)) throw new MockApiError(403, 'Only a Customer Admin can change the tier');
    if (w.status === 'audit_in_progress') throw new MockApiError(423, 'Tier can’t be changed during an audit');
    const f = db.frameworks.find((x) => x.id === w.frameworkId)!;
    const before = w.tier;
    w.tier = tier;
    audit(db, s, { tenantId: w.tenantId, action: 'Changed tier', category: 'scopes', objectType: 'Workspace', objectId: w.id, objectLabel: fwVersion(f), previousValue: { tier: tierName(f, before, false) }, newValue: { tier: tierName(f, tier, false) } });
  });
}

