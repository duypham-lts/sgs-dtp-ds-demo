// Mock API core. Every call takes the session and applies the access boundaries, like the real API will.
// Calls are async with a small latency so loading states are exercised. Each domain has its own file in
// this folder; they share the helpers below (clock, errors, audit events, notifications).
import { getDb } from '../store';
import { TODAY } from '../seed';
import { portalOf, type AppUser, type AuditEvent, type MockDb, type Notification, type Role, type Session } from '../types';

// Latency can be set per browser (localStorage 'dtp-latency'), e.g. 0 for the screenshot comparison.
let latencyMs = (() => {
  try { const v = typeof window !== 'undefined' ? window.localStorage.getItem('dtp-latency') : null; return v === null ? 120 : Number(v); } catch { return 120; }
})();
export function setLatency(ms: number) { latencyMs = ms; }
export const wait = () => new Promise<void>((r) => setTimeout(r, latencyMs));
export const copy = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export class MockApiError extends Error {
  constructor(public status: 400 | 401 | 403 | 404 | 409 | 422 | 423, message: string) { super(message); }
}

/** Mock clock: the demo always runs on TODAY (the date of the design sample data), at the real time of day, Taipei time. */
export function now(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${TODAY}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}+08:00`;
}
export const today = () => TODAY;

let seq = 0;
export function newId(prefix: string): string { seq += 1; return `${prefix}-${Date.now().toString(36)}${seq}`; }

/** Append an AUDIT_EVENT (every write to a sensitive object does this, CLAUDE.md). */
export function audit(db: MockDb, s: Session | null, e: Omit<AuditEvent, 'id' | 'occurredAt' | 'affiliateId' | 'actorId' | 'actorRole' | 'source'> & { affiliateId?: string; source?: AuditEvent['source'] }): void {
  db.auditEvents.unshift({
    id: newId('ae'), occurredAt: now(),
    affiliateId: e.affiliateId ?? s?.affiliate.id ?? 'aff-tw',
    actorId: s?.user.id ?? null, actorRole: (s?.user.role ?? 'system') as Role | 'system',
    source: e.source ?? (s ? (s.portal === 'customer' ? 'Customer Portal' : 'SGS Operations Console') : 'System'),
    ...e,
  });
}

/** Create an in-app notification (UC-NTF-001; email is Phase 2, docs/decisions.md D11). */
export function notify(db: MockDb, n: Omit<Notification, 'id' | 'createdAt'>): void {
  db.notifications.unshift({ id: newId('n'), createdAt: now(), ...n });
}


/** Resolve a session for a user id (the demo "sign in as"). Only active users can have a session. */
export function sessionFor(userId: string): Session {
  const db = getDb();
  const user: AppUser | undefined = db.users.find((u) => u.id === userId);
  if (!user) throw new MockApiError(404, 'Unknown user');
  if (user.status !== 'active') throw new MockApiError(403, 'Your account is not active');
  const tenant = user.tenantId ? db.tenants.find((t) => t.id === user.tenantId) ?? null : null;
  const affiliate = db.affiliates.find((a) => a.id === user.affiliateId)!;
  return { user: copy(user), portal: portalOf(user.role), tenant: tenant && copy(tenant), affiliate: copy(affiliate) };
}

/** Demo personas: every active user, grouped by portal and organisation. */
export function listPersonas(): { user: AppUser; org: string }[] {
  const db = getDb();
  return db.users
    .filter((u) => u.status === 'active')
    .map((u) => ({
      user: copy(u),
      org: u.tenantId ? db.tenants.find((t) => t.id === u.tenantId)!.name : db.affiliates.find((a) => a.id === u.affiliateId)!.name,
    }));
}

