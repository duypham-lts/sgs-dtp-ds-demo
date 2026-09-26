// Shared lists used by the shell and several modules: tenants, scopes, users, requests, notifications.
import { canSeeRequest, visibleScopeIds, visibleTenantIds, visibleUserIds } from '../access';
import { getDb, mutate } from '../store';
import type { AppUser, Notification, Scope, ServiceRequest, Session, SrCategory, Tenant } from '../types';
import { copy, MockApiError, wait } from './core';

export async function listTenants(s: Session): Promise<Tenant[]> {
  await wait();
  const ids = visibleTenantIds(getDb(), s);
  return copy(getDb().tenants.filter((t) => ids.has(t.id)));
}

export async function listScopes(s: Session): Promise<Scope[]> {
  await wait();
  const ids = visibleScopeIds(getDb(), s);
  return copy(getDb().scopes.filter((x) => ids.has(x.id)));
}

export async function listUsers(s: Session): Promise<AppUser[]> {
  await wait();
  const ids = visibleUserIds(getDb(), s);
  return copy(getDb().users.filter((u) => ids.has(u.id)));
}

export async function listServiceRequests(s: Session, filter: { category?: SrCategory } = {}): Promise<ServiceRequest[]> {
  await wait();
  const db = getDb();
  return copy(db.serviceRequests.filter((r) => canSeeRequest(db, s, r) && (!filter.category || r.category === filter.category)));
}

export async function listNotifications(s: Session): Promise<Notification[]> {
  await wait();
  return copy(getDb().notifications.filter((n) => n.recipientUserId === s.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function markNotificationRead(s: Session, id: string): Promise<void> {
  await wait();
  mutate((db) => {
    const n = db.notifications.find((x) => x.id === id && x.recipientUserId === s.user.id);
    if (!n) throw new MockApiError(404, 'Notification not found');
    n.readAt ??= new Date().toISOString();
  });
}

export async function markAllNotificationsRead(s: Session): Promise<void> {
  await wait();
  const now = new Date().toISOString();
  mutate((db) => { db.notifications.forEach((n) => { if (n.recipientUserId === s.user.id) n.readAt ??= now; }); });
}
