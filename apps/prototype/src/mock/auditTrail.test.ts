import { describe, expect, it } from 'vitest';
import { __resetForTests, getDb } from './store';
import { sessionFor, setLatency } from './api/core';
import { addNote } from './api/audit';
import { categoryOf, getAuditEvent, listAuditEvents } from './api/auditTrail';

setLatency(0);

describe('audit trail (UC-AUD-002/004, designs/10)', () => {
  it('SGS Admin sees every tenant of the affiliate; Customer Admin only the own tenant', async () => {
    __resetForTests('audit');
    const sgs = await listAuditEvents(sessionFor('u-minh'));
    expect(new Set(sgs.map((r) => r.customerName))).toEqual(new Set(['ABC Trading Co., Ltd.', 'Formosa Chips Inc.', 'Lotus Cosmetics JSC']));
    const abc = await listAuditEvents(sessionFor('u-linh'));
    expect(abc.length).toBeGreaterThan(0);
    expect(abc.every((r) => r.tenantId === 't-abc')).toBe(true);
  });
  it('other roles cannot read it', async () => {
    __resetForTests('audit');
    for (const u of ['u-wei', 'u-grace', 'u-anna', 'u-david']) await expect(listAuditEvents(sessionFor(u))).rejects.toThrow();
  });
  it('internal review notes are recorded but hidden from the customer', async () => {
    __resetForTests('audit');
    await addNote(sessionFor('u-david'), 'rv-cr015', 'Check the backup test with IT on site.');
    const e = getDb().auditEvents.find((x) => x.action === 'Added internal note')!;
    expect(e).toBeDefined();
    expect((await listAuditEvents(sessionFor('u-minh'))).some((r) => r.id === e.id)).toBe(true);
    expect((await listAuditEvents(sessionFor('u-linh'))).some((r) => r.id === e.id)).toBe(false);
    await expect(getAuditEvent(sessionFor('u-linh'), e.id)).rejects.toThrow();
  });
  it('consultant actions are flagged as consultant activity and the detail lists the change', async () => {
    __resetForTests('audit');
    const e = getDb().auditEvents.find((x) => x.action === 'Uploaded final report')!;
    expect(categoryOf(e)).toBe('consultant');
    const d = await getAuditEvent(sessionFor('u-minh'), e.id);
    expect(d.facts.find(([k]) => k === 'Correlation ID')?.[1]).toBe('c7f3-91ab-2e04');
    expect(d.changes.map((c) => c.field)).toEqual(['Report file', 'Checksum (SHA-256)', 'Visible to customer']);
    const c = await getAuditEvent(sessionFor('u-linh'), e.id);
    expect(c.facts.some(([k]) => k === 'Correlation ID' || k === 'Customer')).toBe(false);
  });
});
