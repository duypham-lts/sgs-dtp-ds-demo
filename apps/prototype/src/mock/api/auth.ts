// Sign-in, sign-out and account activation (UC-AUTH-001, UC-AUTH-002, UC-AUTH-005). In production this is
// Entra External ID; the mock keeps the rules the designs show (designs/01-authentication):
// - wrong email or password: one field error, never saying which one was wrong;
// - 5 failed attempts lock sign-in for 15 minutes (docs/prototype-plan.md §3.7);
// - a deactivated account gets "Your account is not active";
// - each portal only accepts its own accounts.
import { getDb, mutate } from '../store';
import { ROLE_LABEL, type AppUser, type MockEmail, type Portal } from '../types';
import { portalOf } from '../types';
import { audit, copy, MockApiError, notify, now, sessionFor, wait } from './core';

export const MAX_FAILED_SIGN_INS = 5;
export const LOCK_MINUTES = 15;

export type SignInResult =
  | { ok: true; userId: string }
  | { ok: false; reason: 'invalid' | 'locked' | 'inactive' };

export async function signIn(portal: Portal, email: string, password: string): Promise<SignInResult> {
  await wait();
  let result: SignInResult = { ok: false, reason: 'invalid' };
  mutate((db) => {
    const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && portalOf(u.role) === portal);
    if (!user || !user.password) return; // unknown, other portal, or never activated
    if (user.lockedUntil && Date.parse(user.lockedUntil) > Date.now()) { result = { ok: false, reason: 'locked' }; return; }
    if (user.password !== password) {
      user.failedSignIns = (user.failedSignIns ?? 0) + 1;
      if (user.failedSignIns >= MAX_FAILED_SIGN_INS) {
        user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString();
        user.failedSignIns = 0;
        audit(db, null, { tenantId: user.tenantId, affiliateId: user.affiliateId, action: 'Sign-in locked after failed attempts', category: 'auth', objectType: 'User', objectId: user.id, objectLabel: user.displayName });
        result = { ok: false, reason: 'locked' };
      }
      return;
    }
    if (user.status === 'deactivated') { result = { ok: false, reason: 'inactive' }; return; }
    user.failedSignIns = 0;
    user.lockedUntil = undefined;
    user.lastSignInAt = now();
    result = { ok: true, userId: user.id };
    audit(db, sessionFor(user.id), { tenantId: user.tenantId, action: 'Signed in', category: 'auth', objectType: 'User', objectId: user.id, objectLabel: user.displayName });
  });
  return result;
}

/** Remaining lock time for an email in a portal, so a reload keeps the locked state (designs/01 *Locked). */
export function lockedUntil(portal: Portal, email: string): string | undefined {
  const u = getDb().users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && portalOf(x.role) === portal);
  return u?.lockedUntil && Date.parse(u.lockedUntil) > Date.now() ? u.lockedUntil : undefined;
}

export function recordSignOut(userId: string, reason: 'user' | 'timeout'): void {
  mutate((db) => {
    const s = sessionFor(userId);
    audit(db, reason === 'user' ? s : null, { tenantId: s.user.tenantId, affiliateId: s.affiliate.id, action: reason === 'user' ? 'Signed out' : 'Signed out after inactivity', category: 'auth', objectType: 'User', objectId: userId, objectLabel: s.user.displayName });
  });
}

/* ---------- Password rules (designs/01 Activate: five rules, shown live) ---------- */

export interface PasswordRule { id: string; label: string; ok: boolean }
export function passwordRules(password: string, email: string): PasswordRule[] {
  const local = email.split('@')[0]?.toLowerCase() ?? '';
  return [
    { id: 'len', label: 'At least 12 characters', ok: password.length >= 12 },
    { id: 'case', label: 'Upper- and lower-case letters', ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { id: 'num', label: 'At least one number', ok: /\d/.test(password) },
    { id: 'sym', label: 'At least one symbol', ok: /[^A-Za-z0-9]/.test(password) },
    { id: 'email', label: 'Not your email address', ok: password.length > 0 && !password.toLowerCase().includes(email.toLowerCase()) && (local.length < 3 || !password.toLowerCase().includes(local)) },
  ];
}

/* ---------- Invitations ---------- */

export interface Invitation {
  state: 'valid' | 'expired' | 'used' | 'unknown';
  portal: Portal; email: string; name: string; role: string; orgName: string; affiliateName: string;
  inviterName: string; inviterRole: string; scopeCount: number; activatedAt?: string; expiresAt?: string;
}

function inviterOf(u: AppUser): AppUser | undefined { return getDb().users.find((x) => x.id === u.invitedBy); }

export async function getInvitation(token: string): Promise<Invitation> {
  await wait();
  const db = getDb();
  const u = db.users.find((x) => x.invitationToken === token);
  if (!u) return { state: 'unknown', portal: 'customer', email: '', name: '', role: '', orgName: '', affiliateName: '', inviterName: '', inviterRole: '', scopeCount: 0 };
  const inviter = inviterOf(u);
  const tenant = u.tenantId ? db.tenants.find((t) => t.id === u.tenantId) : undefined;
  const affiliate = db.affiliates.find((a) => a.id === u.affiliateId)!;
  const expired = u.status === 'expired' || (u.status === 'invited' && !!u.invitationExpiresAt && u.invitationExpiresAt < now().slice(0, 10));
  return copy({
    state: u.status === 'active' || u.status === 'deactivated' ? 'used' : expired ? 'expired' : 'valid',
    portal: portalOf(u.role), email: u.email, name: u.displayName, role: ROLE_LABEL[u.role],
    orgName: tenant?.name ?? affiliate.name, affiliateName: affiliate.name,
    inviterName: inviter?.displayName ?? 'SGS', inviterRole: inviter ? ROLE_LABEL[inviter.role] : 'SGS Admin',
    scopeCount: u.role === 'customer_admin' ? db.scopes.filter((s) => s.tenantId === u.tenantId).length : db.userScopes.filter((x) => x.userId === u.id).length,
    activatedAt: u.activatedAt, expiresAt: u.invitationExpiresAt,
  } satisfies Invitation);
}

export async function activateAccount(token: string, input: { fullName: string; password: string }): Promise<{ userId: string }> {
  await wait();
  let userId = '';
  mutate((db) => {
    const u = db.users.find((x) => x.invitationToken === token);
    if (!u) throw new MockApiError(404, 'Unknown invitation');
    if (u.status !== 'invited') throw new MockApiError(409, u.status === 'expired' ? 'This invitation link has expired' : 'This account is already active');
    if (!input.fullName.trim()) throw new MockApiError(422, 'Enter your full name.');
    if (passwordRules(input.password, u.email).some((r) => !r.ok)) throw new MockApiError(422, 'The password does not meet the rules.');
    Object.assign(u, { status: 'active', displayName: input.fullName.trim(), password: input.password, activatedAt: now(), lastSignInAt: now() });
    // The first Customer Admin activating makes the customer account active (designs/03 TenantList).
    const tenant = u.tenantId ? db.tenants.find((t) => t.id === u.tenantId) : undefined;
    if (tenant && u.role === 'customer_admin' && tenant.status === 'admin_invited') tenant.status = 'active';
    const s = sessionFor(u.id);
    audit(db, s, { tenantId: u.tenantId, action: 'Activated account', category: 'users', objectType: 'User', objectId: u.id, objectLabel: u.displayName });
    if (u.invitedBy) notify(db, { recipientUserId: u.invitedBy, tenantId: u.tenantId, type: 'user', tone: 'info', title: `${u.displayName} activated their account`, ref: 'Users', href: portalOf(u.role) === 'customer' && u.role !== 'customer_admin' ? `/admin/users/${u.id}` : `/ops/admin/users/${u.id}` });
    userId = u.id;
  });
  return { userId };
}

/** "Ask for a new invitation" on an expired link (designs/01 ActivateExpired). No UC covers this button
 * (docs/decisions.md G1); the prototype tells the inviter in the portal so they can resend. */
export async function askForNewInvitation(token: string): Promise<{ inviterName: string }> {
  await wait();
  let inviterName = 'your administrator';
  mutate((db) => {
    const u = db.users.find((x) => x.invitationToken === token);
    if (!u || !u.invitedBy) return;
    const inviter = db.users.find((x) => x.id === u.invitedBy);
    if (!inviter) return;
    inviterName = inviter.displayName;
    notify(db, { recipientUserId: inviter.id, tenantId: u.tenantId, type: 'user', tone: 'warning', title: `${u.displayName} asked for a new invitation`, body: 'Their invitation link has expired.', ref: 'Users', href: portalOf(inviter.role) === 'customer' ? `/admin/users/${u.id}` : `/ops/admin/users/${u.id}` });
  });
  return { inviterName };
}

/* ---------- Demo mailbox (invitation emails only) ---------- */

export function listEmails(): MockEmail[] { return copy(getDb().emails); }
export function getEmail(id: string): MockEmail | undefined { return copy(getDb().emails.find((e) => e.id === id)); }
