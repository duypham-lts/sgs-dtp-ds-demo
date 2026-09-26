// Audit trail (UC-AUD-001/002/004, designs/10): read-only view over AUDIT_EVENT.
// SGS Admin sees every event of the affiliate; Customer Admin sees the events of the own tenant, minus
// SGS-internal ones (internal review notes). Events are append-only: there is no write API here apart
// from the read-access records (UC-AUD-001 "consultant activity").
import { ROLE_LABEL, type AuditEvent, type MockDb, type Session } from '../types';
import { getDb, mutate } from '../store';
import { audit, copy, MockApiError, now, wait } from './core';

/** Action groups of the filter and the tag under the action (designs/10). */
export const AUDIT_CATEGORY = {
  access: ['Access', 'neutral'], users: ['Users', 'neutral'], config: ['Configuration', 'neutral'], evidence: ['Evidence', 'info'], review: ['Review', 'info'],
  request: ['Service request', 'info'], consultant: ['Consultant activity', 'required'], cert: ['Certificate', 'neutral'], system: ['System', 'neutral'],
} as const;
export type AuditCategory = keyof typeof AUDIT_CATEGORY;

const GROUP: Record<string, AuditCategory> = {
  auth: 'access', users: 'users', customers: 'users', frameworks: 'config', scopes: 'config', evidence: 'evidence', review: 'review', internal: 'review',
  request: 'request', gap_analysis: 'request', implementation_support: 'request', certification: 'request', training: 'request', certificate: 'cert', system: 'system',
};
export function categoryOf(e: AuditEvent): AuditCategory {
  // Everything an SGS consultant does on customer data is flagged, whatever the object (designs/10).
  return e.actorRole === 'sgs_consultant' ? 'consultant' : (GROUP[e.category] ?? 'system');
}

export interface AuditRow {
  id: string; occurredAt: string; who: string; whoSub: string; action: string; cat: AuditCategory; objectType: string; objectLabel: string;
  tenantId: string | null; customerName: string; context: string;
}
export interface AuditDetail extends AuditRow { facts: [string, string][]; changes: { field: string; before: string; after: string }[] }

function canSee(db: MockDb, s: Session, e: AuditEvent): boolean {
  if (s.user.role === 'sgs_admin') return e.affiliateId === s.user.affiliateId;
  if (s.user.role === 'customer_admin') return e.tenantId === s.user.tenantId && e.category !== 'internal';
  return false;
}
function guard(s: Session) {
  if (s.user.role !== 'sgs_admin' && s.user.role !== 'customer_admin') throw new MockApiError(403, 'Only SGS Admin or Customer Admin can see the audit trail');
}
const shortRole = (e: AuditEvent) => (e.actorRole === 'system' ? 'Automatic' : e.actorRole === 'sgs_auditor' ? 'SGS Auditor' : ROLE_LABEL[e.actorRole]);

function row(db: MockDb, e: AuditEvent): AuditRow {
  const u = db.users.find((x) => x.id === e.actorId);
  return {
    id: e.id, occurredAt: e.occurredAt, who: e.actorRole === 'system' ? 'System' : (u?.displayName ?? 'Unknown user'), whoSub: shortRole(e), action: e.action, cat: categoryOf(e),
    objectType: e.objectType, objectLabel: e.objectLabel, tenantId: e.tenantId, customerName: db.tenants.find((t) => t.id === e.tenantId)?.name ?? '—', context: e.context ?? '',
  };
}

export async function listAuditEvents(s: Session): Promise<AuditRow[]> {
  await wait();
  guard(s);
  const db = getDb();
  return copy(db.auditEvents.filter((e) => canSee(db, s, e)).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).map((e) => row(db, e)));
}

const show = (v: unknown): string => (v === null || v === undefined || v === '' ? '—' : Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v));
const label = (k: string) => (/^[a-z]/.test(k) ? k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1').toLowerCase() : k);

export async function getAuditEvent(s: Session, id: string): Promise<AuditDetail> {
  await wait();
  guard(s);
  const db = getDb();
  const e = db.auditEvents.find((x) => x.id === id);
  if (!e || !canSee(db, s, e)) throw new MockApiError(404, 'Event not found');
  const r = row(db, e);
  const u = db.users.find((x) => x.id === e.actorId);
  const who = e.actorRole === 'system' ? 'System · automatic' : [r.who, ROLE_LABEL[e.actorRole as keyof typeof ROLE_LABEL], s.portal === 'sgs-ops' ? u?.email : undefined].filter(Boolean).join(' · ');
  const facts: [string, string][] = [['Who', who], ['Action', e.action], ['Object', `${e.objectType} · ${e.objectLabel}`]];
  if (s.portal === 'sgs-ops') facts.push(['Customer', r.customerName]);
  const req = db.serviceRequests.find((x) => x.id === e.context);
  const reqd = db.requirements.find((x) => x.code === e.context);
  if (req) facts.push(['Context', [req.id, req.title.split(' · ')[0], [req.serviceFramework, db.scopes.find((x) => x.id === req.scopeId)?.name.split(' · ')[0]].filter(Boolean).join(', ')].filter(Boolean).join(' · ')]);
  else if (reqd) facts.push(['Requirement', `${reqd.code} ${reqd.title}`]);
  else if (e.context) facts.push(['Context', e.context]);
  const ev = e.objectType === 'Evidence' ? db.evidence.find((x) => x.id === e.objectId) : undefined;
  const ws = ev && db.workspaces.find((w) => w.id === ev.workspaceId);
  if (ws) facts.push(['Workspace', `${db.frameworks.find((f) => f.id === ws.frameworkId)?.shortName ?? ''} · ${db.scopes.find((x) => x.id === ws.scopeId)?.name.replace(' · ', ', ') ?? ''}`]);
  facts.push(['Source', e.source]);
  if (s.portal === 'sgs-ops') facts.push(['Correlation ID', e.correlationId ?? `${e.id.replace(/[^a-z0-9]/gi, '').slice(-4).padStart(4, '0')}-${e.occurredAt.slice(11, 16).replace(':', '')}`]);
  const keys = [...new Set([...Object.keys(e.previousValue ?? {}), ...Object.keys(e.newValue ?? {})])];
  const changes = keys.map((k) => ({ field: label(k), before: show(e.previousValue?.[k]), after: show(e.newValue?.[k]) }));
  return copy({ ...r, facts, changes });
}

/**
 * Read access by SGS staff to customer data (UC-AUD-001: consultant activity, designs/10). Opening the same
 * workspace again within the same minute is one event.
 */
export function logReadAccess(s: Session, e: { tenantId: string; action: string; objectType: string; objectId: string; objectLabel: string; context?: string; category: string }) {
  if (s.portal !== 'sgs-ops') return;
  mutate((db) => {
    const last = db.auditEvents.find((x) => x.actorId === s.user.id && x.action === e.action && x.objectId === e.objectId);
    if (last && new Date(now()).getTime() - new Date(last.occurredAt).getTime() < 60_000) return;
    audit(db, s, e);
  });
}
