import { beforeEach, describe, expect, it } from 'vitest';
import { api, sessionFor, MockApiError } from '@/mock';
import { setLatency } from './api/core';
import { canReadWorkspace } from './access';
import { getDb } from './store';
import { __resetForTests } from './store';

beforeEach(() => { __resetForTests(); setLatency(0); });

const ids = <T extends { id: string }>(xs: T[]) => xs.map((x) => x.id).sort();

describe('sessions', () => {
  it('resolves portal, tenant and affiliate from the user', () => {
    const s = sessionFor('u-linh');
    expect(s.portal).toBe('customer');
    expect(s.tenant?.name).toBe('ABC Trading Co., Ltd.');
    expect(s.affiliate.name).toBe('SGS Taiwan');
    expect(sessionFor('u-anna').portal).toBe('sgs-ops');
  });

  it('refuses users who are not active (invited, expired, deactivated)', () => {
    for (const id of ['u-kevin', 'u-jason', 'u-amy', 'u-ha']) {
      expect(() => sessionFor(id)).toThrow(MockApiError);
    }
  });
});

describe('tenant and affiliate boundaries (UC-ROL-001, UC-ACC-001)', () => {
  it('customers see only their own tenant', async () => {
    expect(ids(await api.listTenants(sessionFor('u-linh')))).toEqual(['t-abc']);
    expect(ids(await api.listTenants(sessionFor('u-daniel')))).toEqual(['t-formosa']);
  });

  it('SGS Admin and SGS User see the customers of their affiliate only', async () => {
    const tw = ids(await api.listTenants(sessionFor('u-minh')));
    expect(tw).toEqual(['t-abc', 't-formosa', 't-lotus', 't-riyadh']);
    expect(tw).not.toContain('t-saigon');
    expect(ids(await api.listTenants(sessionFor('u-lan')))).toEqual(['t-saigon']);
    expect(ids(await api.listTenants(sessionFor('u-grace')))).toEqual(tw);
  });

  it('consultants see only customers assigned to them', async () => {
    expect(ids(await api.listTenants(sessionFor('u-anna')))).toEqual(['t-abc', 't-formosa']);
    expect(ids(await api.listTenants(sessionFor('u-minhtran')))).toEqual([]);
  });

  it('auditors see a customer only through a request assigned to them', async () => {
    expect(ids(await api.listTenants(sessionFor('u-david')))).toEqual(['t-abc', 't-formosa']);
    expect(ids(await api.listTenants(sessionFor('u-kai')))).toEqual(['t-formosa']); // CR-2026-004
  });
});

describe('scope access (UC-USR-006, UC-SCP-001)', () => {
  it('Customer Admin sees every scope of the tenant', async () => {
    expect((await api.listScopes(sessionFor('u-linh'))).length).toBe(4);
  });

  it('Customer User and Viewer see only assigned scopes', async () => {
    expect(ids(await api.listScopes(sessionFor('u-wei')))).toEqual(['s-cdp', 's-hq']);
    expect(ids(await api.listScopes(sessionFor('u-iris')))).toEqual(['s-hq']);
  });

  it('a consultant sees only the scopes of their assigned requests', async () => {
    expect(ids(await api.listScopes(sessionFor('u-anna')))).toEqual(['s-ai', 's-fab', 's-hq']);
  });
});

describe('service requests (UC-SRQ-002)', () => {
  it('consultants see only consulting requests assigned to them', async () => {
    const rs = await api.listServiceRequests(sessionFor('u-anna'));
    expect(ids(rs)).toEqual(['GA-2026-002', 'GA-2026-004', 'GA-2026-006', 'IS-2026-003']);
  });

  it('auditors see only certification requests assigned to them', async () => {
    expect(ids(await api.listServiceRequests(sessionFor('u-david')))).toEqual(['CR-2026-012', 'CR-2026-015', 'CR-2026-017']);
  });

  it('a Customer User does not see requests on scopes they cannot access', async () => {
    const rs = await api.listServiceRequests(sessionFor('u-wei'));
    expect(rs.map((r) => r.id)).not.toContain('GA-2026-004'); // AI platform scope
    expect(rs.map((r) => r.id)).toContain('TR-2026-021'); // training has no scope
  });

  it('SGS never sees another affiliate’s requests', async () => {
    const rs = await api.listServiceRequests(sessionFor('u-minh'));
    expect(rs.every((r) => r.tenantId !== 't-saigon')).toBe(true);
  });
});

describe('notifications (UC-NTF-002)', () => {
  it('lists only the recipient’s notifications, newest first, and marks them read', async () => {
    const s = sessionFor('u-linh');
    const ns = await api.listNotifications(s);
    expect(ns.every((n) => n.recipientUserId === 'u-linh')).toBe(true);
    expect(ns[0].createdAt >= ns[ns.length - 1].createdAt).toBe(true);
    await api.markAllNotificationsRead(s);
    expect((await api.listNotifications(s)).every((n) => n.readAt)).toBe(true);
  });

  it('cannot mark someone else’s notification', async () => {
    await expect(api.markNotificationRead(sessionFor('u-wei'), 'n-1')).rejects.toThrow(MockApiError);
  });
});

describe('workspace access of SGS staff (UC-EVD-020, UC-REV-003)', () => {
  const ws = (id: string) => getDb().workspaces.find((w) => w.id === id)!;
  it('an auditor reads a workspace only while the audit of their request runs', () => {
    const s = sessionFor('u-david');
    expect(canReadWorkspace(getDb(), s, ws('ws-a10-cdp'))).toBe(true);      // CR-2026-015 in progress
    expect(canReadWorkspace(getDb(), s, ws('ws-27001-hq'))).toBe(false);    // CR-2026-012 audit completed
    expect(canReadWorkspace(getDb(), s, ws('ws-tisax-fab'))).toBe(false);   // CR-2026-017 only assigned
  });
  it('a consultant reads a workspace only while the request is in progress; SGS Admin never', () => {
    expect(canReadWorkspace(getDb(), sessionFor('u-anna'), ws('ws-27001-hq'))).toBe(true);   // IS-2026-003 in progress
    expect(canReadWorkspace(getDb(), sessionFor('u-weilin'), ws('ws-27001-hq'))).toBe(false); // IS-2026-001 completed
    expect(canReadWorkspace(getDb(), sessionFor('u-minh'), ws('ws-27001-hq'))).toBe(false);
  });
});
