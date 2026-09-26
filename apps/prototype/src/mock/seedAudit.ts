// Audit reviews and certificates of the seed (designs/08). Default scenario: the review of CR-2026-015 is
// running, 40 of 61 items reviewed (35 accepted; R.1.1.4 clarification overdue; R.5.3.4 answered; F-002
// observation closed; F-003 minor and F-004 major open). CR-2026-012 was reviewed and closed. The scenarios
// "Audit closed" and "Certificate issued" finish CR-2026-015 the way the designs show.
import { inTier } from './catalog';
import { registerScenario } from './scenarios';
import type { Certification, Evidence, MockDb } from './types';

const R15 = 'rv-cr015', R12 = 'rv-cr012';

function items(db: MockDb, reviewId: string, workspaceId: string, status: (code: string, i: number) => MockDb['reviewItems'][number]['status']) {
  const ws = db.workspaces.find((w) => w.id === workspaceId)!;
  const fw = db.frameworks.find((f) => f.id === ws.frameworkId)!;
  const reqs = db.requirements.filter((r) => r.frameworkId === fw.id && inTier(fw, r, ws.tier)).sort((a, b) => a.sortOrder - b.sortOrder);
  reqs.forEach((r, i) => db.reviewItems.push({ id: `${reviewId}:${r.code}`, reviewId, requirementId: r.id, status: status(r.code, i) }));
}
const evOf = (db: MockDb, ws: string, file: string) => db.evidence.find((e) => e.workspaceId === ws && db.evidenceVersions.some((v) => v.evidenceId === e.id && v.fileName === file))!;

export function seedAudit(db: MockDb) {
  // CR-2026-012: closed review, every item accepted.
  db.reviews.push({ id: R12, requestId: 'CR-2026-012', workspaceId: 'ws-27001-hq', tenantId: 't-abc', auditorId: 'u-david', startedAt: '2026-08-03T09:00:00+08:00', closedAt: '2026-09-08T17:00:00+08:00', reportFileName: 'CR-2026-012 – Audit Report.pdf', reportSizeBytes: 2100000 });
  items(db, R12, 'ws-27001-hq', () => 'accepted');
  db.workspaces.find((w) => w.id === 'ws-27001-hq')!.auditedAt = '2026-09-08';

  // CR-2026-015: running review.
  db.reviews.push({ id: R15, requestId: 'CR-2026-015', workspaceId: 'ws-a10-cdp', tenantId: 't-abc', auditorId: 'u-david', tier: 'M', startedAt: '2026-09-10T09:00:00+08:00' });
  const special: Record<string, MockDb['reviewItems'][number]['status']> = {
    'R.1.1.4': 'clarification_requested', 'R.5.3.4': 'response_submitted', 'R.3.1.3': 'finding_raised', 'R.4.1.2': 'finding_raised', 'R.2.6.2': 'closed_with_finding',
  };
  const provided = new Set(db.evidenceMappings.filter((m) => m.workspaceId === 'ws-a10-cdp').map((m) => m.requirementId.split(':')[1]));
  let accepted = 0;
  items(db, R15, 'ws-a10-cdp', (code) => {
    if (special[code]) return special[code];
    if (accepted < 35 && provided.has(code) && code !== 'R.1.1.3') { accepted += 1; return 'accepted'; }
    return 'not_reviewed';
  });
  db.reviewItems.filter((x) => x.reviewId === R15 && x.status !== 'not_reviewed').forEach((x) => { x.decidedAt = '2026-09-12T10:00:00+08:00'; x.decidedBy = 'u-david'; });
  db.clarifications.push(
    { id: 'cl-1', itemId: `${R15}:R.1.1.4`, question: 'Please add the Q3 account review minutes; only Q1 and Q2 are in the workspace.', expect: 'answer_files', dueOn: '2026-09-24', askedAt: '2026-09-12T10:00:00+08:00', askedBy: 'u-david' },
    { id: 'cl-2', itemId: `${R15}:R.5.3.4`, question: 'Which tool produced the scan report?', expect: 'answer', dueOn: '2026-09-20', askedAt: '2026-09-12T10:10:00+08:00', askedBy: 'u-david', answer: 'SonarQube 10.4, run in our CI pipeline on every merge to main.', answeredBy: 'u-wei', answeredAt: '2026-09-18T15:00:00+08:00', files: [] },
  );
  const backup = evOf(db, 'ws-a10-cdp', 'backup-procedure-v2.pdf');
  const iam = evOf(db, 'ws-a10-cdp', 'iam-config-2026-09.json');
  db.findings.push(
    { id: 'fd-2', code: 'F-002', reviewId: R15, itemId: `${R15}:R.2.6.2`, classification: 'observation', text: 'Consider hashing exported logs; not required for this tier.', relatedEvidenceIds: [], correctiveRequired: false, status: 'closed', raisedAt: '2026-09-11T14:00:00+08:00', raisedBy: 'u-david', closedAt: '2026-09-11T14:00:00+08:00', actions: [], dueChanges: [] },
    { id: 'fd-3', code: 'F-003', reviewId: R15, itemId: `${R15}:R.3.1.3`, classification: 'minor', text: 'A backup procedure exists, but there is no record of a restore test in the last 12 months.', relatedEvidenceIds: [backup.id], correctiveRequired: true, dueOn: '2026-10-15', status: 'open', raisedAt: '2026-09-12T10:04:00+08:00', raisedBy: 'u-david', actions: [], dueChanges: [] },
    { id: 'fd-4', code: 'F-004', reviewId: R15, itemId: `${R15}:R.4.1.2`, classification: 'major', text: 'MFA is not enforced for administrator access to the CRM database. The IAM export shows password-only login for 4 admin accounts.', relatedEvidenceIds: [iam.id], correctiveRequired: true, dueOn: '2026-10-05', status: 'open', raisedAt: '2026-09-14T11:00:00+08:00', raisedBy: 'u-david', actions: [], dueChanges: [] },
  );
  db.reviewNotes.push(
    { id: 'nt-1', reviewId: R15, authorId: 'u-david', at: '2026-09-12T10:04:00+08:00', body: 'Backup procedure v2 reviewed. No restore test in the last 12 months — raised F-003 (minor).' },
    { id: 'nt-2', reviewId: R15, authorId: 'u-david', at: '2026-09-12T10:06:00+08:00', body: 'Check the Hsinchu DR site on day 2 of the visit.' },
  );
  // Evidence under review is locked as submitted; accepted items mark their files accepted.
  const acc = new Set(db.reviewItems.filter((x) => x.reviewId === R15 && x.status === 'accepted').map((x) => x.requirementId));
  db.evidence.filter((e) => e.workspaceId === 'ws-a10-cdp').forEach((e) => {
    const reqs = db.evidenceMappings.filter((m) => m.evidenceId === e.id).map((m) => m.requirementId);
    e.review = reqs.length && reqs.every((r) => acc.has(r)) ? 'accepted' : 'in_review';
  });
  db.evidence.filter((e) => e.workspaceId === 'ws-27001-hq').forEach((e) => { e.review = 'accepted'; });

  db.certifications.push(
    { id: 'cert-0877', number: 'TW25/0877', tenantId: 't-abc', affiliateId: 'aff-tw', scopeId: 's-hq', frameworkLabel: 'ISO/IEC 27001:2022', frameworkId: 'fw-27001-2022', accreditation: 'TAF', certificateDate: '2025-01-21', validTo: '2028-01-20',
      certificateScope: 'The information security management system for trading, logistics and customer service operations at the Taipei head office.', sites: ['No. 1, Section 5, Xinyi Rd, Xinyi District, Taipei, TW'], contractNumber: 'TW/TPE/2024/0877', certifiedBy: 'SGS Taiwan Ltd.', createdAt: '2025-01-21' },
    { id: 'cert-0391', number: 'TW24/0391', tenantId: 't-abc', affiliateId: 'aff-tw', scopeId: 's-hq', frameworkLabel: 'ISO 22301:2019', frameworkId: 'fw-22301', accreditation: 'TAF', certificateDate: '2024-03-04', validTo: '2027-03-03',
      certificateScope: 'Business continuity management for the Taipei head office and its data centre.', sites: ['No. 1, Section 5, Xinyi Rd, Xinyi District, Taipei, TW'], contractNumber: 'TW/TPE/2024/0391', certifiedBy: 'SGS Taiwan Ltd.', createdAt: '2024-03-04' },
    { id: 'cert-0870', number: 'TW26/0870', tenantId: 't-formosa', affiliateId: 'aff-tw', scopeId: 's-fab', frameworkLabel: 'ISO/IEC 27017 · 2015', requestId: 'CR-2026-004', accreditation: 'TAF', certificateDate: '2026-08-30', validTo: '2029-08-29',
      certificateScope: 'Information security controls for the cloud services supporting the Hsinchu fab.', sites: ['Hsinchu Science Park, Hsinchu, TW'], contractNumber: 'TW/HSC/2026/0104', certifiedBy: 'SGS Taiwan Ltd.', createdBy: 'u-grace', createdAt: '2026-08-30' },
  );
}

/* ---------- Scenarios (docs/decisions.md D13) ---------- */

function dropReview(db: MockDb, id: string) {
  const items = new Set(db.reviewItems.filter((x) => x.reviewId === id).map((x) => x.id));
  db.reviews = db.reviews.filter((r) => r.id !== id);
  db.reviewItems = db.reviewItems.filter((x) => x.reviewId !== id);
  db.clarifications = db.clarifications.filter((c) => !items.has(c.itemId));
  db.findings = db.findings.filter((f) => f.reviewId !== id);
  db.reviewNotes = db.reviewNotes.filter((n) => n.reviewId !== id);
}

registerScenario('preparation', (db) => {
  dropReview(db, R15);
  db.evidence.filter((e) => e.workspaceId === 'ws-a10-cdp').forEach((e) => { e.review = 'not_reviewed'; });
});

/** Every item final and every finding closed, review still open ("Ready to close"). */
function finishItems(db: MockDb) {
  const add = (name: string, file: string, kb: number): Evidence => {
    const e: Evidence = { id: `ev-cr-${file}`, tenantId: 't-abc', workspaceId: 'ws-a10-cdp', name, currentVersion: 1, scanState: 'clean', review: 'accepted', createdBy: 'u-kevin', createdAt: '2026-09-17T10:00:00+08:00' };
    db.evidence.push(e);
    db.evidenceVersions.push({ id: `${e.id}-v1`, evidenceId: e.id, versionNo: 1, fileName: file, sizeBytes: kb * 1000, uploadedBy: 'u-kevin', uploadedAt: '2026-09-17T10:00:00+08:00' });
    const req = db.requirements.find((r) => r.frameworkId === 'fw-a10-2022' && r.code === 'R.3.1.3')!;
    db.evidenceMappings.push({ id: `${e.id}-m`, evidenceId: e.id, workspaceId: 'ws-a10-cdp', requirementId: req.id, expectedEvidenceId: db.expectedEvidence.find((x) => x.requirementId === req.id)!.id, linkedBy: 'u-kevin', linkedAt: '2026-09-17T10:00:00+08:00' });
    return e;
  };
  const e1 = add('Restore test report', 'restore-test-2026-09.pdf', 540), e2 = add('Backup procedure', 'backup-procedure-v3.pdf', 610);
  db.reviewItems.filter((x) => x.reviewId === R15).forEach((x) => {
    x.status = ['R.3.1.3', 'R.4.1.2', 'R.2.6.2'].includes(x.requirementId.split(':')[1]) ? 'closed_with_finding' : 'accepted';
    x.decidedAt ??= '2026-09-19T10:00:00+08:00'; x.decidedBy = 'u-david';
  });
  const cl = db.clarifications.find((c) => c.id === 'cl-1')!;
  Object.assign(cl, { answer: 'Q3 minutes attached. The review was held on 15 Sep 2026.', answeredBy: 'u-wei', answeredAt: '2026-09-16T11:00:00+08:00', files: [] });
  const f3 = db.findings.find((f) => f.id === 'fd-3')!, f4 = db.findings.find((f) => f.id === 'fd-4')!;
  f3.actions.push({ id: 'ca-1', actionTaken: 'Full restore of the CRM database tested on 16 Sep 2026. The backup procedure now requires a restore test every 6 months.', completedOn: '2026-09-16', files: [e1.id, e2.id], note: 'Test results are on pages 3–5.', submittedAt: '2026-09-17T10:00:00+08:00', submittedBy: 'u-kevin', decision: 'accepted', decidedAt: '2026-09-19T10:00:00+08:00' });
  f4.actions.push({ id: 'ca-2', actionTaken: 'MFA enforced for all administrator accounts of the CRM database through the identity provider.', completedOn: '2026-09-18', files: [], submittedAt: '2026-09-18T15:00:00+08:00', submittedBy: 'u-wei', decision: 'accepted', decidedAt: '2026-09-20T10:00:00+08:00' });
  for (const f of [f3, f4]) { f.status = 'closed'; f.closedAt = f.actions[0].decidedAt; }
  db.evidence.filter((e) => e.workspaceId === 'ws-a10-cdp').forEach((e) => { e.review = 'accepted'; });
}

function closeReview(db: MockDb) {
  const at = '2026-09-22T16:00:00+08:00';
  finishItems(db);
  Object.assign(db.reviews.find((r) => r.id === R15)!, { closedAt: at, reportFileName: 'CR-2026-015 – Audit Report.pdf', reportSizeBytes: 1900000 });
  Object.assign(db.serviceRequests.find((r) => r.id === 'CR-2026-015')!, { status: 'audit_completed', updatedAt: at });
  Object.assign(db.workspaces.find((w) => w.id === 'ws-a10-cdp')!, { status: 'audited', lockedByRequestId: undefined, auditedAt: at.slice(0, 10) });
}

registerScenario('ready', finishItems);

registerScenario('audited', closeReview);
registerScenario('certified', (db) => {
  closeReview(db);
  const cert: Certification = { id: 'cert-1142', number: 'TW26/1142', tenantId: 't-abc', affiliateId: 'aff-tw', scopeId: 's-cdp', frameworkLabel: 'Appendix 10 · 2022', frameworkId: 'fw-a10-2022', tier: 'M', requestId: 'CR-2026-015',
    accreditation: 'TAF', certificateDate: '2026-09-24', validTo: '2029-09-23', certificateScope: 'Operation and maintenance of the customer data platform, including the CRM and loyalty database and the APIs for the retail app.',
    sites: ['No. 1, Section 5, Xinyi Rd, Xinyi District, Taipei, TW', 'Hsinchu Science Park data centre, Hsinchu, TW'], contractNumber: 'TW/TPE/2026/0311', certifiedBy: 'SGS Taiwan Ltd.', createdBy: 'u-grace', createdAt: '2026-09-24' };
  db.certifications.unshift(cert);
  Object.assign(db.serviceRequests.find((r) => r.id === 'CR-2026-015')!, { status: 'certificate_issued', updatedAt: '2026-09-24T10:00:00+08:00' });
});
