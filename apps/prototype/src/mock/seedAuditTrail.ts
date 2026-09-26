// Seeded AUDIT_EVENT rows for designs/10 (Main, CaActivity), placed on the seed timeline (TODAY = 25 Sep 2026).
// The design dates 26–30 Sep are after the demo date, so events keep their order but move before TODAY.
// Deviations from the design data (docs/design-questions.md Q30):
// - GA-2026-005 is still Submitted in 06, so "Approved and assigned consultant" is on GA-2026-004;
// - the deliverable of IS-2026-003 is shared by Anna Lee (its consultant in 07), not Wei Lin;
// - Lotus has no active user, so the failed sign-in is Wei Chen's (ABC);
// - the auditor's request for changes is on CR-2026-015 (David Wu audits ABC in 08), not Formosa.
import type { AuditEvent, MockDb } from './types';

type Seed = Omit<AuditEvent, 'id' | 'affiliateId'> & { correlationId?: string };

export function seedAuditTrail(db: MockDb) {
  const ev = (name: RegExp, ws: string) => db.evidence.find((e) => e.workspaceId === ws && name.test(e.name));
  const inv = ev(/asset|inventory/i, 'ws-27001-hq');
  const invLabel = inv ? (db.evidenceVersions.find((v) => v.evidenceId === inv.id && v.versionNo === inv.currentVersion)?.fileName ?? inv.name) : 'asset-inventory-2026.xlsx';
  const cert = db.certifications.find((c) => c.tenantId === 't-abc');
  const rows: Seed[] = [
    { occurredAt: '2026-09-24T16:42:00+08:00', tenantId: 't-abc', actorId: null, actorRole: 'system', action: 'Status changed to Completed', category: 'request', objectType: 'Service request', objectId: 'GA-2026-002', objectLabel: 'GA-2026-002', context: 'GA-2026-002', source: 'System', previousValue: { status: 'In progress' }, newValue: { status: 'Completed' } },
    { occurredAt: '2026-09-24T16:40:00+08:00', tenantId: 't-abc', actorId: 'u-anna', actorRole: 'sgs_consultant', action: 'Uploaded final report', category: 'request', objectType: 'Document', objectId: 'doc-ga2-rep', objectLabel: 'GA-2026-002 – Gap Analysis Report.pdf', context: 'GA-2026-002', source: 'SGS Operations Console',
      previousValue: { 'Report file': null, 'Checksum (SHA-256)': null, 'Visible to customer': 'No' }, newValue: { 'Report file': 'GA-2026-002 – Gap Analysis Report.pdf', 'Checksum (SHA-256)': '3b9e…c20f', 'Visible to customer': 'Yes' }, correlationId: 'c7f3-91ab-2e04' },
    { occurredAt: '2026-09-23T10:15:00+08:00', tenantId: 't-abc', actorId: 'u-anna', actorRole: 'sgs_consultant', action: 'Downloaded evidence', category: 'evidence', objectType: 'Evidence', objectId: inv?.id ?? 'ev-asset-inventory', objectLabel: invLabel, context: 'GA-2026-002', source: 'SGS Operations Console' },
    { occurredAt: '2026-09-23T10:12:00+08:00', tenantId: 't-abc', actorId: 'u-anna', actorRole: 'sgs_consultant', action: 'Opened workspace (read only)', category: 'evidence', objectType: 'Workspace', objectId: 'ws-27001-hq', objectLabel: 'ISO/IEC 27001 · Head office', context: 'GA-2026-002', source: 'SGS Operations Console' },
    { occurredAt: '2026-09-22T14:03:00+08:00', tenantId: 't-abc', actorId: 'u-linh', actorRole: 'customer_admin', action: 'Uploaded evidence', category: 'evidence', objectType: 'Evidence', objectId: inv?.id ?? 'ev-asset-inventory', objectLabel: invLabel, context: 'A.5.9', source: 'Customer Portal', newValue: { version: inv?.currentVersion ?? 1 } },
    { occurredAt: '2026-09-22T14:03:30+08:00', tenantId: 't-abc', actorId: null, actorRole: 'system', action: 'Virus scan passed', category: 'evidence', objectType: 'Evidence', objectId: inv?.id ?? 'ev-asset-inventory', objectLabel: invLabel, context: 'A.5.9', source: 'System', previousValue: { scan: 'Scanning' }, newValue: { scan: 'Clean' } },
    { occurredAt: '2026-09-12T10:00:00+08:00', tenantId: 't-abc', actorId: 'u-anna', actorRole: 'sgs_consultant', action: 'Shared deliverable', category: 'request', objectType: 'Document', objectId: 'doc-is3-2', objectLabel: 'IS-2026-003 – Supplier security clauses.docx', context: 'IS-2026-003', source: 'SGS Operations Console', newValue: { 'Visible to customer': 'Yes' } },
    { occurredAt: '2026-09-24T09:31:00+08:00', tenantId: 't-abc', actorId: 'u-wei', actorRole: 'customer_user', action: 'Sign-in failed (wrong password)', category: 'auth', objectType: 'Account', objectId: 'u-wei', objectLabel: 'wei.chen@abc-trading.com', source: 'Customer Portal', newValue: { attempt: 1 } },
    { occurredAt: '2026-09-23T15:44:00+08:00', tenantId: 't-abc', actorId: 'u-david', actorRole: 'sgs_auditor', action: 'Requested clarification', category: 'review', objectType: 'Review item', objectId: 'R.1.1.4', objectLabel: 'R.1.1.4', context: 'CR-2026-015', source: 'SGS Operations Console', previousValue: { status: 'Not reviewed' }, newValue: { status: 'Clarification requested', due: '24 Sep 2026' } },
    { occurredAt: '2026-09-04T11:00:00+08:00', tenantId: 't-abc', actorId: 'u-minh', actorRole: 'sgs_admin', action: 'Approved and assigned consultant', category: 'request', objectType: 'Service request', objectId: 'GA-2026-004', objectLabel: 'GA-2026-004', context: 'GA-2026-004', source: 'SGS Operations Console', previousValue: { status: 'Submitted' }, newValue: { status: 'In progress', consultant: 'Anna Lee' } },
    { occurredAt: '2026-09-20T09:00:00+08:00', tenantId: 't-formosa', actorId: 'u-daniel', actorRole: 'customer_admin', action: 'Activated framework', category: 'scopes', objectType: 'Scope', objectId: 's-fab', objectLabel: 'TISAX · Hsinchu fab', source: 'Customer Portal', newValue: { framework: 'TISAX' } },
    ...(cert ? [{ occurredAt: '2026-09-18T13:10:00+08:00', tenantId: 't-abc', actorId: null, actorRole: 'system' as const, action: 'Surveillance reminder sent', category: 'certificate', objectType: 'Certificate', objectId: cert.id, objectLabel: cert.number, source: 'System' as const }] : []),
  ];
  // designs/10 CaActivityDetail: the v3 → v4 replacement of the ISMS policy (seed ae-1), with the full change.
  const isms = ev(/^Information security policy$/, 'ws-27001-hq');
  const ae1 = db.auditEvents.find((x) => x.id === 'ae-1');
  if (ae1) Object.assign(ae1, {
    action: 'Replaced evidence with a new version', objectId: isms?.id ?? ae1.objectId,
    previousValue: { version: 3, file: 'isms-policy-v3.pdf (2.4 MB)', reviewStatus: 'Accepted', validFrom: '15 Jan 2026' },
    newValue: { version: 4, file: 'isms-policy-v4.pdf (2.6 MB)', reviewStatus: 'Under review', validFrom: '24 Sep 2026' },
  });
  rows.forEach((r, i) => db.auditEvents.push({ id: `ae-t${i + 1}`, affiliateId: 'aff-tw', ...r }));
  db.auditEvents.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}
