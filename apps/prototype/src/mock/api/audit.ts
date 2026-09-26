// Audit review (UC-REV-001…016, designs/08). One review per certification request; one item per requirement
// of the workspace tier. While the review runs, the workspace is locked: customers add files only through a
// response to the auditor. Internal notes and a finding's internal note are never returned to a customer.
import { canSeeRequest, visibleScopeIds } from '../access';
import { workspaceRequirements } from '../coverage';
import { getDb, mutate } from '../store';
import { type Clarification, type Evidence, type Finding, type FindingClass, type MockDb, type Requirement, type Review, type ReviewItem, type ReviewItemStatus, type Session } from '../types';
import { audit, copy, MockApiError, newId, notify, now, today, wait } from './core';
import { evidenceRow, type EvidenceRow } from './evidence';

export const FINDING_LABEL: Record<FindingClass, string> = { major: 'Major nonconformity', minor: 'Minor nonconformity', observation: 'Observation', ofi: 'Opportunity for improvement' };
export const FINDING_OPTIONS = [
  { value: 'major', label: 'Major nonconformity', description: 'Requirement not met · blocks certification' },
  { value: 'minor', label: 'Minor nonconformity', description: 'Partly met · corrective action needed' },
  { value: 'observation', label: 'Observation', description: 'Risk of a future nonconformity · no response needed' },
  { value: 'ofi', label: 'Opportunity for improvement', description: 'Suggestion · no response needed' },
];
/** One set of labels for both portals (design-questions Q13); "Closed with finding" is final, so green (Q14). */
export const ITEM_LABEL: Record<ReviewItemStatus, ['draft' | 'completed' | 'needs-description' | 'missing-info' | 'under-review', string]> = {
  not_reviewed: ['draft', 'Not reviewed'], accepted: ['completed', 'Accepted'], clarification_requested: ['needs-description', 'Clarification requested'],
  finding_raised: ['missing-info', 'Finding raised'], response_submitted: ['under-review', 'Response submitted'], closed_with_finding: ['completed', 'Closed with finding'],
};

export interface FindingView extends Omit<Finding, 'internalNote'> { internalNote?: string; requirementCode: string; requirementTitle: string; overdue: boolean; raisedByName: string; files: EvidenceRow[] }
export interface ClarificationView extends Clarification { requirementCode: string; requirementTitle: string; overdue: boolean; askedByName: string; answeredByName?: string; fileRows: EvidenceRow[] }
export interface ItemView extends ReviewItem { requirement: Requirement; clarifications: ClarificationView[]; findings: FindingView[]; evidence: EvidenceRow[] }
export interface ReviewView extends Review {
  requestTitle: string; customerName: string; scopeName: string; workspaceTitle: string; frameworkShort: string; tierLabel?: string; auditorName: string; auditorEmail: string;
  items: ItemView[]; counts: { total: number; reviewed: number; accepted: number; waiting: number; findings: number; openFindings: number; cwf: number; needYou: number; overdue: number };
  state: 'in_review' | 'waiting' | 'ready' | 'closed'; notes: { id: string; author: string; at: string; body: string }[];
  isAuditor: boolean; canAct: boolean;
}

const FINAL = new Set<ReviewItemStatus>(['accepted', 'closed_with_finding']);
const isCustomer = (s: Session) => s.portal === 'customer';

function reviewOf(db: MockDb, s: Session, id: string): Review {
  const r = db.reviews.find((x) => x.id === id);
  if (!r) throw new MockApiError(404, 'Review not found');
  const req = db.serviceRequests.find((x) => x.id === r.requestId)!;
  if (!canSeeRequest(db, s, req)) throw new MockApiError(404, 'Review not found');
  if (isCustomer(s) && !visibleScopeIds(db, s).has(req.scopeId!)) throw new MockApiError(404, 'Review not found');
  return r;
}

function build(db: MockDb, s: Session, r: Review): ReviewView {
  const req = db.serviceRequests.find((x) => x.id === r.requestId)!;
  const ws = db.workspaces.find((w) => w.id === r.workspaceId)!;
  const fw = db.frameworks.find((f) => f.id === ws.frameworkId)!;
  const sc = db.scopes.find((x) => x.id === ws.scopeId)!;
  const auditor = db.users.find((u) => u.id === r.auditorId)!;
  const name = (id?: string) => db.users.find((u) => u.id === id)?.displayName ?? '—';
  const ev = (ids: string[]) => ids.map((id) => db.evidence.find((e) => e.id === id)).filter(Boolean).map((e) => evidenceRow(db, e as Evidence));
  const t = today();
  const items: ItemView[] = db.reviewItems.filter((x) => x.reviewId === r.id).map((x) => {
    const q = db.requirements.find((y) => y.id === x.requirementId)!;
    return {
      ...x, requirement: q,
      clarifications: db.clarifications.filter((c) => c.itemId === x.id).sort((a, b) => a.askedAt.localeCompare(b.askedAt)).map((c) => ({
        ...c, requirementCode: q.code, requirementTitle: q.title, overdue: !c.answeredAt && c.dueOn < t, askedByName: name(c.askedBy), answeredByName: c.answeredBy ? name(c.answeredBy) : undefined, fileRows: ev(c.files ?? []),
      })),
      findings: db.findings.filter((f) => f.itemId === x.id).map((f) => ({
        ...f, internalNote: isCustomer(s) ? undefined : f.internalNote, requirementCode: q.code, requirementTitle: q.title,
        overdue: f.status === 'open' && !!f.dueOn && f.dueOn < t, raisedByName: name(f.raisedBy), files: ev(f.actions.flatMap((a) => a.files)),
      })),
      evidence: db.evidenceMappings.filter((m) => m.workspaceId === ws.id && m.requirementId === q.id).map((m) => evidenceRow(db, db.evidence.find((e) => e.id === m.evidenceId)!)),
    };
  }).sort((a, b) => a.requirement.sortOrder - b.requirement.sortOrder);
  const findings = items.flatMap((i) => i.findings);
  const openClar = items.flatMap((i) => i.clarifications).filter((c) => !c.answeredAt);
  const openFind = findings.filter((f) => f.status !== 'closed');
  const needYou = openClar.length + findings.filter((f) => f.status === 'open' && f.correctiveRequired).length;
  const reviewed = items.filter((i) => i.status !== 'not_reviewed').length;
  const ready = items.every((i) => FINAL.has(i.status)) && !openFind.length;
  const isAuditor = s.user.id === r.auditorId;
  return {
    ...r, requestTitle: req.id, customerName: db.tenants.find((x) => x.id === r.tenantId)!.name, scopeName: sc.name,
    workspaceTitle: `${fw.shortName} · ${fw.version}${fw.tiers.length ? ` · ${fw.tiers.find((x) => x.code === ws.tier)?.label}` : ''}`, frameworkShort: `${fw.shortName} · ${fw.version}`,
    tierLabel: fw.tiers.find((x) => x.code === ws.tier)?.label, auditorName: auditor.displayName, auditorEmail: auditor.email, items,
    counts: { total: items.length, reviewed, accepted: items.filter((i) => i.status === 'accepted').length, waiting: items.filter((i) => i.status === 'clarification_requested' || (i.status === 'finding_raised')).length,
      findings: findings.length, openFindings: openFind.length, cwf: items.filter((i) => i.status === 'closed_with_finding').length, needYou,
      overdue: openClar.filter((c) => c.overdue).length + findings.filter((f) => f.overdue).length },
    state: r.closedAt ? 'closed' : ready ? 'ready' : needYou ? 'waiting' : 'in_review',
    notes: isCustomer(s) ? [] : db.reviewNotes.filter((n) => n.reviewId === r.id).sort((a, b) => a.at.localeCompare(b.at)).map((n) => ({ id: n.id, author: name(n.authorId), at: n.at, body: n.body })),
    isAuditor, canAct: isAuditor && !r.closedAt,
  };
}

export async function getReview(s: Session, id: string): Promise<ReviewView> { await wait(); const db = getDb(); return copy(build(db, s, reviewOf(db, s, id))); }
export async function getReviewByRequest(s: Session, requestId: string): Promise<ReviewView | undefined> {
  await wait();
  const db = getDb();
  const r = db.reviews.filter((x) => x.requestId === requestId).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  return r ? copy(build(db, s, reviewOf(db, s, r.id))) : undefined;
}
/** The review running (or last closed) on a workspace, for the customer's workspace page. */
export function reviewOfWorkspace(db: MockDb, workspaceId: string): Review | undefined {
  return db.reviews.filter((x) => x.workspaceId === workspaceId).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
}
export async function getWorkspaceReview(s: Session, workspaceId: string): Promise<ReviewView | undefined> {
  await wait();
  const db = getDb();
  const r = reviewOfWorkspace(db, workspaceId);
  return r ? copy(build(db, s, reviewOf(db, s, r.id))) : undefined;
}

export async function listReviews(s: Session): Promise<ReviewView[]> {
  await wait();
  const db = getDb();
  const out: ReviewView[] = [];
  for (const r of db.reviews) { try { out.push(build(db, s, reviewOf(db, s, r.id))); } catch { /* not visible */ } }
  return copy(out.sort((a, b) => b.startedAt.localeCompare(a.startedAt)));
}

/* ---------- Auditor ---------- */

function mine(db: MockDb, s: Session, reviewId: string): Review {
  const r = reviewOf(db, s, reviewId);
  if (r.auditorId !== s.user.id) throw new MockApiError(403, 'Only the assigned auditor can do this');
  if (r.closedAt) throw new MockApiError(409, 'The review is closed');
  return r;
}
const itemOf = (db: MockDb, id: string) => { const x = db.reviewItems.find((i) => i.id === id); if (!x) throw new MockApiError(404, 'Item not found'); return x; };
const code = (db: MockDb, x: ReviewItem) => db.requirements.find((r) => r.id === x.requirementId)!.code;
const customers = (db: MockDb, r: Review) => { const req = db.serviceRequests.find((x) => x.id === r.requestId)!; return [...new Set([req.requesterId, req.contactUserId].filter(Boolean) as string[])]; };
const reviewHref = (r: Review) => `/reviews/${r.id}`;

export async function startReview(s: Session, requestId: string): Promise<string> {
  await wait();
  let id = '';
  mutate((db) => {
    const req = db.serviceRequests.find((x) => x.id === requestId);
    if (!req || req.assigneeId !== s.user.id || s.user.role !== 'sgs_auditor') throw new MockApiError(403, 'Only the assigned auditor can start the review');
    if (req.status !== 'assigned') throw new MockApiError(409, 'The review can only start once, when the request is assigned');
    const ws = db.workspaces.find((w) => w.id === req.workspaceId);
    if (!ws) throw new MockApiError(422, 'The request has no workspace to review');
    const r: Review = { id: newId('rv'), requestId, workspaceId: ws.id, tenantId: req.tenantId, auditorId: s.user.id, tier: ws.tier, startedAt: now() };
    db.reviews.push(r);
    for (const q of workspaceRequirements(db, ws)) db.reviewItems.push({ id: `${r.id}:${q.code}`, reviewId: r.id, requirementId: q.id, status: 'not_reviewed' });
    Object.assign(ws, { status: 'audit_in_progress', lockedByRequestId: requestId });
    db.evidence.filter((e) => e.workspaceId === ws.id).forEach((e) => { e.review = 'in_review'; });
    Object.assign(req, { status: 'in_progress', updatedAt: now() });
    audit(db, s, { tenantId: req.tenantId, action: 'Started audit review', category: 'review', objectType: 'Review', objectId: r.id, objectLabel: requestId, context: requestId, newValue: { items: db.reviewItems.filter((x) => x.reviewId === r.id).length } });
    for (const uid of customers(db, r)) notify(db, { recipientUserId: uid, tenantId: req.tenantId, type: 'review', tone: 'info', title: 'Audit review started', body: `${s.user.displayName} is reviewing your workspace. It is locked until the review closes.`, ref: requestId, href: reviewHref(r) });
    id = r.id;
  });
  return id;
}

export async function acceptItem(s: Session, itemId: string): Promise<void> {
  await wait();
  mutate((db) => {
    const x = itemOf(db, itemId);
    const r = mine(db, s, x.reviewId);
    if (db.findings.some((f) => f.itemId === itemId && f.status !== 'closed')) throw new MockApiError(409, 'Close the open finding first');
    Object.assign(x, { status: 'accepted', decidedAt: now(), decidedBy: s.user.id });
    db.evidenceMappings.filter((m) => m.requirementId === x.requirementId && m.workspaceId === r.workspaceId).forEach((m) => { const e = db.evidence.find((y) => y.id === m.evidenceId); if (e) e.review = 'accepted'; });
    audit(db, s, { tenantId: r.tenantId, action: 'Accepted review item', category: 'review', objectType: 'Review item', objectId: itemId, objectLabel: code(db, x), context: r.requestId });
  });
}

export async function requestClarification(s: Session, itemId: string, input: { question: string; expect: 'answer_files' | 'answer'; dueOn: string }): Promise<void> {
  await wait();
  mutate((db) => {
    const x = itemOf(db, itemId);
    const r = mine(db, s, x.reviewId);
    if (!input.question.trim() || !input.dueOn) throw new MockApiError(422, 'Question and due date are required.');
    db.clarifications.push({ id: newId('cl'), itemId, question: input.question.trim(), expect: input.expect, dueOn: input.dueOn, askedAt: now(), askedBy: s.user.id });
    Object.assign(x, { status: 'clarification_requested', decidedAt: now(), decidedBy: s.user.id });
    audit(db, s, { tenantId: r.tenantId, action: 'Requested clarification', category: 'review', objectType: 'Review item', objectId: itemId, objectLabel: code(db, x), context: r.requestId, newValue: { question: input.question.trim(), due: input.dueOn } });
    for (const uid of customers(db, r)) notify(db, { recipientUserId: uid, tenantId: r.tenantId, type: 'review', tone: 'warning', title: `Clarification requested on ${code(db, x)}`, body: `Respond by ${input.dueOn}.`, ref: r.requestId, href: reviewHref(r) });
  });
}

export async function raiseFinding(s: Session, itemId: string, input: { classification: FindingClass; text: string; relatedEvidenceIds: string[]; correctiveRequired: boolean; dueOn?: string; internalNote?: string }): Promise<string> {
  await wait();
  let fcode = '';
  mutate((db) => {
    const x = itemOf(db, itemId);
    const r = mine(db, s, x.reviewId);
    if (!input.text.trim()) throw new MockApiError(422, 'Describe the finding.');
    const needs = input.correctiveRequired && (input.classification === 'major' || input.classification === 'minor');
    if (needs && !input.dueOn) throw new MockApiError(422, 'Choose a due date.');
    const n = db.findings.filter((f) => f.reviewId === r.id).map((f) => Number(f.code.slice(2))).reduce((a, b) => Math.max(a, b), 1) + 1;
    fcode = `F-${String(n).padStart(3, '0')}`;
    db.findings.push({ id: newId('fd'), code: fcode, reviewId: r.id, itemId, classification: input.classification, text: input.text.trim(), relatedEvidenceIds: input.relatedEvidenceIds, correctiveRequired: needs,
      dueOn: needs ? input.dueOn : undefined, internalNote: input.internalNote?.trim() || undefined, status: needs ? 'open' : 'closed', raisedAt: now(), raisedBy: s.user.id, closedAt: needs ? undefined : now(), actions: [], dueChanges: [] });
    // Observations, OFIs and findings without a corrective action close at once (docs/prototype-plan.md §3.4).
    Object.assign(x, { status: needs ? 'finding_raised' : 'closed_with_finding', decidedAt: now(), decidedBy: s.user.id });
    audit(db, s, { tenantId: r.tenantId, action: 'Raised finding', category: 'review', objectType: 'Finding', objectId: fcode, objectLabel: `${fcode} · ${code(db, x)}`, context: r.requestId, newValue: { classification: FINDING_LABEL[input.classification], due: input.dueOn } });
    if (input.internalNote?.trim()) db.reviewNotes.push({ id: newId('nt'), reviewId: r.id, authorId: s.user.id, at: now(), body: `${fcode}: ${input.internalNote.trim()}` });
    for (const uid of customers(db, r)) notify(db, { recipientUserId: uid, tenantId: r.tenantId, type: 'review', tone: needs ? 'warning' : 'info', title: `${FINDING_LABEL[input.classification]} on ${code(db, x)}`, body: needs ? `Corrective action due ${input.dueOn}.` : 'No response needed.', ref: r.requestId, href: reviewHref(r) });
  });
  return fcode;
}

export async function evaluateCorrective(s: Session, findingId: string, input: { decision: 'accepted' | 'not_accepted'; comment: string }): Promise<void> {
  await wait();
  mutate((db) => {
    const f = db.findings.find((x) => x.id === findingId);
    if (!f) throw new MockApiError(404, 'Finding not found');
    const r = mine(db, s, f.reviewId);
    const a = f.actions[f.actions.length - 1];
    if (!a || a.decision) throw new MockApiError(409, 'There is no corrective action to evaluate');
    if (input.decision === 'not_accepted' && !input.comment.trim()) throw new MockApiError(422, 'Tell the customer what is missing.');
    Object.assign(a, { decision: input.decision, comment: input.comment.trim() || undefined, decidedAt: now() });
    const x = itemOf(db, f.itemId);
    if (input.decision === 'accepted') {
      Object.assign(f, { status: 'closed', closedAt: now() });
      Object.assign(x, { status: 'closed_with_finding', decidedAt: now(), decidedBy: s.user.id });
      a.files.forEach((id) => { const e = db.evidence.find((y) => y.id === id); if (e) e.review = 'accepted'; });
    } else {
      f.status = 'open';
      x.status = 'finding_raised';
    }
    audit(db, s, { tenantId: r.tenantId, action: input.decision === 'accepted' ? 'Accepted corrective action' : 'Did not accept corrective action', category: 'review', objectType: 'Finding', objectId: f.code, objectLabel: `${f.code} · ${code(db, x)}`, context: r.requestId });
    for (const uid of customers(db, r)) notify(db, { recipientUserId: uid, tenantId: r.tenantId, type: 'review', tone: input.decision === 'accepted' ? 'success' : 'error', title: input.decision === 'accepted' ? `${f.code} closed` : `${f.code}: corrective action not accepted`, body: input.comment.trim() || undefined, ref: r.requestId, href: reviewHref(r) });
  });
}

/** designs/08 AudEvaluateClarification: accept the requirement, ask a follow-up, or raise a finding instead (the modal follows). */
export async function evaluateAnswer(s: Session, itemId: string, input: { next: 'accept' | 'followup'; message: string; dueOn?: string }): Promise<void> {
  if (input.next === 'accept') return acceptItem(s, itemId);
  if (!input.message.trim()) throw new MockApiError(422, 'Write the follow-up question.');
  const due = input.dueOn ?? addDays(today(), 7);
  return requestClarification(s, itemId, { question: input.message, expect: 'answer_files', dueOn: due });
}
function addDays(iso: string, n: number) { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }

export async function changeDueDate(s: Session, findingId: string, input: { dueOn: string; reason: string }): Promise<void> {
  await wait();
  mutate((db) => {
    const f = db.findings.find((x) => x.id === findingId);
    if (!f) throw new MockApiError(404, 'Finding not found');
    const r = mine(db, s, f.reviewId);
    if (!input.dueOn || !input.reason.trim()) throw new MockApiError(422, 'New date and reason are required.');
    f.dueChanges.push({ from: f.dueOn ?? '', to: input.dueOn, reason: input.reason.trim(), at: now() });
    const before = f.dueOn;
    f.dueOn = input.dueOn;
    audit(db, s, { tenantId: r.tenantId, action: 'Changed finding due date', category: 'review', objectType: 'Finding', objectId: f.code, objectLabel: f.code, context: r.requestId, previousValue: { due: before }, newValue: { due: input.dueOn, reason: input.reason.trim() } });
    for (const uid of customers(db, r)) notify(db, { recipientUserId: uid, tenantId: r.tenantId, type: 'review', tone: 'info', title: `New due date for ${f.code}: ${input.dueOn}`, body: input.reason.trim(), ref: r.requestId, href: reviewHref(r) });
  });
}

export async function addNote(s: Session, reviewId: string, body: string): Promise<void> {
  await wait();
  mutate((db) => {
    const r = reviewOf(db, s, reviewId);
    if (s.portal !== 'sgs-ops') throw new MockApiError(403, 'Internal notes are for SGS only');
    if (!body.trim()) return;
    db.reviewNotes.push({ id: newId('nt'), reviewId: r.id, authorId: s.user.id, at: now(), body: body.trim() });
    // SGS-internal: never shown in the customer activity log (UC-AUD-004).
    audit(db, s, { tenantId: r.tenantId, action: 'Added internal note', category: 'internal', objectType: 'Review', objectId: r.id, objectLabel: r.requestId, context: r.requestId });
  });
}

export async function closeReview(s: Session, reviewId: string, input: { report?: { fileName: string; sizeBytes: number }; confirmed: boolean }): Promise<void> {
  await wait();
  mutate((db) => {
    const r = mine(db, s, reviewId);
    const v = build(db, s, r);
    if (v.state !== 'ready') throw new MockApiError(409, 'Every item must be final and no finding open before the review can close.');
    if (!input.confirmed) throw new MockApiError(422, 'Confirm the review is complete.');
    Object.assign(r, { closedAt: now(), reportFileName: input.report ? `${r.requestId} – Audit Report.pdf` : undefined, reportSizeBytes: input.report?.sizeBytes });
    const req = db.serviceRequests.find((x) => x.id === r.requestId)!;
    Object.assign(req, { status: 'audit_completed', updatedAt: now() });
    Object.assign(db.workspaces.find((w) => w.id === r.workspaceId)!, { status: 'audited', lockedByRequestId: undefined, auditedAt: today() });
    audit(db, s, { tenantId: r.tenantId, action: 'Closed audit review', category: 'review', objectType: 'Review', objectId: r.id, objectLabel: r.requestId, context: r.requestId, newValue: { accepted: v.counts.accepted, closedWithFinding: v.counts.cwf } });
    for (const uid of customers(db, r)) notify(db, { recipientUserId: uid, tenantId: r.tenantId, type: 'review', tone: 'success', title: 'Audit review closed', body: 'Your workspace is unlocked. SGS now decides on the certificate.', ref: r.requestId, href: `/service-requests/certification/${r.requestId}` });
    for (const u of db.users.filter((x) => x.affiliateId === s.affiliate.id && (x.role === 'sgs_user' || x.role === 'sgs_admin') && x.status === 'active')) notify(db, { recipientUserId: u.id, tenantId: r.tenantId, type: 'certificate', tone: 'info', title: `${r.requestId} is ready for a certificate`, body: `${db.tenants.find((t) => t.id === r.tenantId)!.name} · audit closed by ${s.user.displayName}`, ref: r.requestId, href: '/ops/requests/certification?tab=cert' });
  });
}

/* ---------- Customer ---------- */

function customerReview(db: MockDb, s: Session, reviewId: string): Review {
  const r = reviewOf(db, s, reviewId);
  if (s.user.role !== 'customer_admin' && s.user.role !== 'customer_user') throw new MockApiError(403, 'Your role can’t respond to the auditor');
  if (r.closedAt) throw new MockApiError(409, 'The review is closed');
  return r;
}

/** Files sent with a response go into the workspace under the requirement (designs/08 RespondClarification). */
function addResponseFiles(db: MockDb, s: Session, r: Review, requirementId: string, files: { fileName: string; sizeBytes: number; title?: string }[], label: string): string[] {
  const ee = db.expectedEvidence.find((x) => x.requirementId === requirementId)!;
  return files.map((f) => {
    const e: Evidence = { id: newId('ev'), tenantId: r.tenantId, workspaceId: r.workspaceId, name: f.title ?? `${label} · ${f.fileName.replace(/\.[^.]+$/, '')}`, currentVersion: 1, scanState: 'clean', review: 'in_review', createdBy: s.user.id, createdAt: now() };
    db.evidence.push(e);
    db.evidenceVersions.push({ id: `${e.id}-v1`, evidenceId: e.id, versionNo: 1, fileName: f.fileName, sizeBytes: f.sizeBytes, uploadedBy: s.user.id, uploadedAt: now() });
    db.evidenceMappings.push({ id: newId('map'), evidenceId: e.id, workspaceId: r.workspaceId, requirementId, expectedEvidenceId: ee.id, linkedBy: s.user.id, linkedAt: now() });
    return e.id;
  });
}

export async function respondClarification(s: Session, clarificationId: string, input: { answer: string; files: { fileName: string; sizeBytes: number }[] }): Promise<void> {
  await wait();
  mutate((db) => {
    const c = db.clarifications.find((x) => x.id === clarificationId);
    if (!c || c.answeredAt) throw new MockApiError(409, 'Nothing to answer');
    const x = itemOf(db, c.itemId);
    const r = customerReview(db, s, x.reviewId);
    if (!input.answer.trim()) throw new MockApiError(422, 'Write your answer.');
    const files = addResponseFiles(db, s, r, x.requirementId, input.files, 'Response');
    Object.assign(c, { answer: input.answer.trim(), answeredBy: s.user.id, answeredAt: now(), files });
    x.status = 'response_submitted';
    audit(db, s, { tenantId: r.tenantId, action: 'Responded to clarification', category: 'review', objectType: 'Review item', objectId: x.id, objectLabel: code(db, x), context: r.requestId, newValue: { files: input.files.map((f) => f.fileName) } });
    notify(db, { recipientUserId: r.auditorId, tenantId: r.tenantId, type: 'review', tone: 'info', title: `Response submitted on ${code(db, x)}`, body: `${s.user.displayName} answered your clarification.`, ref: r.requestId, href: `/ops/audits/${r.requestId}/review?item=${code(db, x)}` });
  });
}

export async function submitCorrectiveAction(s: Session, findingId: string, input: { actionTaken: string; completedOn: string; files: { fileName: string; sizeBytes: number }[]; note: string }): Promise<void> {
  await wait();
  mutate((db) => {
    const f = db.findings.find((x) => x.id === findingId);
    if (!f || f.status !== 'open' || !f.correctiveRequired) throw new MockApiError(409, 'This finding does not need a corrective action now');
    const x = itemOf(db, f.itemId);
    const r = customerReview(db, s, f.reviewId);
    if (!input.actionTaken.trim() || !input.completedOn || !input.files.length) throw new MockApiError(422, 'Action taken, completion date and evidence are required.');
    const files = addResponseFiles(db, s, r, x.requirementId, input.files, `Corrective action · ${f.code}`);
    f.actions.push({ id: newId('ca'), actionTaken: input.actionTaken.trim(), completedOn: input.completedOn, files, note: input.note.trim() || undefined, submittedAt: now(), submittedBy: s.user.id });
    f.status = 'response_submitted';
    x.status = 'response_submitted';
    audit(db, s, { tenantId: r.tenantId, action: 'Submitted corrective action', category: 'review', objectType: 'Finding', objectId: f.code, objectLabel: `${f.code} · ${code(db, x)}`, context: r.requestId, newValue: { files: input.files.map((y) => y.fileName) } });
    notify(db, { recipientUserId: r.auditorId, tenantId: r.tenantId, type: 'review', tone: 'info', title: `Response submitted on ${code(db, x)}`, body: `${s.user.displayName} submitted a corrective action for ${f.code}.`, ref: r.requestId, href: `/ops/audits/${r.requestId}/review?item=${code(db, x)}` });
  });
}

