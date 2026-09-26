// Service requests, shared by Gap Analysis (designs/06 Mvp*), Implementation Support (07) and, later,
// Certification / Training (08, 09). UC-SRQ-001…010. Statuses and transitions: docs/prototype-plan.md §3.1,
// decisions D3 (information requested), D4 (withdraw), D8 (SGS Admin and SGS User triage), D9 (consultant completes).
import { canSeeRequest, visibleScopeIds } from '../access';
import { coverage } from '../coverage';
import { CONSULTING_FRAMEWORKS, SR_META, canWithdrawStatus, consultantHref, customerHref, opsHref } from '../requestMeta';
import { SCOPE_TYPE_US } from '../labels2';
import { getDb, mutate } from '../store';
import { ROLE_LABEL, type AppUser, type Delivery, type InfoRequest, type MockDb, type ServiceRequest, type Session, type SrCategory, type SrDocument, type SrStatus } from '../types';
import { audit, copy, MockApiError, newId, notify, now, today, wait } from './core';

export interface Person { id: string; name: string; email: string; title?: string; role: string }
export interface TimelineItem { title: string; meta?: string; state: 'done' | 'current' | 'todo' | 'error' }
export interface RequestRow extends ServiceRequest { scopeName?: string; customerName: string; assigneeName?: string; frameworkLabel: string; deliverables: number }
export interface RequestView extends RequestRow {
  scopeType?: string; workspaceLabel?: string; workspaceStats?: { requirements: number; documents: number };
  requester?: Person; contact?: Person; assignee?: Person; approver?: Person; rejecter?: Person; customerAdmin?: Person;
  documents: SrDocument[]; infoRequests: (InfoRequest & { askedByName: string; answeredByName?: string })[]; openInfo?: InfoRequest & { askedByName: string; askedByRole: string };
  timeline: TimelineItem[];
  can: { withdraw: boolean; triage: boolean; requestInfo: boolean; respond: boolean; complete: boolean; share: boolean; openWorkspace: boolean; requestAgain: boolean };
}

const person = (db: MockDb, id?: string): Person | undefined => {
  const u = db.users.find((x) => x.id === id);
  return u ? { id: u.id, name: u.displayName, email: u.email, title: u.title, role: ROLE_LABEL[u.role] } : undefined;
};
const isTriage = (s: Session) => s.user.role === 'sgs_admin' || s.user.role === 'sgs_user';
const CONSULTING = new Set<SrCategory>(['gap_analysis', 'implementation_support']);

function row(db: MockDb, r: ServiceRequest): RequestRow {
  return {
    ...r, scopeName: db.scopes.find((x) => x.id === r.scopeId)?.name, customerName: db.tenants.find((t) => t.id === r.tenantId)!.name,
    assigneeName: db.users.find((u) => u.id === r.assigneeId)?.displayName, frameworkLabel: r.serviceFramework ?? r.title.split(' · ')[1] ?? r.title,
    deliverables: db.srDocuments.filter((x) => x.requestId === r.id && x.kind === 'deliverable').length,
  };
}

function getReq(db: MockDb, s: Session, id: string): ServiceRequest {
  const r = db.serviceRequests.find((x) => x.id === id);
  if (!r || !canSeeRequest(db, s, r)) throw new MockApiError(404, 'Request not found');
  return r;
}

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const f = (iso?: string) => { if (!iso) return ''; const [y, m, dd] = iso.slice(0, 10).split('-').map(Number); return `${String(dd).padStart(2, '0')} ${MON[m - 1]} ${y}`; };
export function fmtRange(a?: string, b?: string): string {
  if (!a || !b) return '—';
  const [ya, ma, da] = a.split('-').map(Number), [yb, mb, db] = b.split('-').map(Number);
  if (ya === yb && ma === mb) return `${da} – ${db} ${MON[mb - 1]} ${yb}`;
  return `${f(a)} – ${f(b)}`;
}

function timeline(db: MockDb, r: ServiceRequest, customer: boolean): TimelineItem[] {
  const name = (id?: string) => db.users.find((u) => u.id === id)?.displayName ?? 'SGS';
  const items: TimelineItem[] = [{ title: 'Submitted', meta: `${f(r.submittedAt)} · ${name(r.requesterId)}`, state: 'done' }];
  if (r.status === 'rejected') return [...items, { title: 'Rejected', meta: `${f(r.rejectedAt)} · ${customer ? 'SGS admin' : name(r.rejectedBy)}`, state: 'error' }];
  if (r.status === 'withdrawn') return [...items, { title: 'Withdrawn', meta: `${f(r.withdrawnAt)} · ${name(r.requesterId)}`, state: 'error' }];
  if (r.category === 'certification' || r.category === 'training') return certTimeline(db, r, items, name, customer);
  const info = db.infoRequests.filter((x) => x.requestId === r.id).sort((a, b) => a.askedAt.localeCompare(b.askedAt));
  const infoItems = (after?: string, before?: string) => info.filter((x) => (!after || x.askedAt >= after) && (!before || x.askedAt < before)).flatMap((x) => [
    { title: 'SGS asked for more information', meta: `${f(x.askedAt)} · ${name(x.askedBy)}`, state: x.answeredAt ? 'done' : 'current' } as TimelineItem,
    ...(x.answeredAt ? [{ title: 'Information sent', meta: `${f(x.answeredAt)} · ${name(x.answeredBy)}`, state: 'done' } as TimelineItem] : []),
  ]);
  items.push(...infoItems(undefined, r.approvedAt));
  const approved = !!r.approvedAt;
  items.push(approved
    ? { title: `Approved · consultant ${name(r.assigneeId)} assigned`, meta: `${f(r.approvedAt)}${r.status === 'in_progress' && customer ? ' · consultant can read the workspace from now on' : ''}`, state: 'done' }
    : { title: 'SGS reviews the request', meta: r.status === 'information_requested' ? 'Waiting for your answer' : 'You’ll be notified in the portal when SGS accepts or declines your request', state: r.status === 'information_requested' ? 'todo' : 'current' });
  if (approved) items.push(...infoItems(r.approvedAt));
  const done = r.status === 'completed';
  if (r.category === 'gap_analysis') {
    if (!approved) items.push({ title: 'Consultant assigned · In progress', state: 'todo' });
    else if (r.delivery !== 'remote') items.push({ title: 'On-site visit', meta: fmtRange(r.periodFrom, r.periodTo), state: done || (r.periodTo && r.periodTo < today()) ? 'done' : 'current' });
    items.push({ title: 'Report delivered · Completed', meta: done ? `${f(r.completedAt)} · consultant access ended` : undefined, state: done ? 'done' : 'todo' });
  } else {
    const n = db.srDocuments.filter((x) => x.requestId === r.id && x.kind === 'deliverable').length;
    if (!approved) items.push({ title: 'Consultant assigned · In progress', state: 'todo' });
    else items.push({ title: n ? `${n} deliverable${n === 1 ? '' : 's'} shared` : 'Deliverables shared', meta: n ? `latest on ${f(db.srDocuments.filter((x) => x.requestId === r.id && x.kind === 'deliverable').map((x) => x.uploadedAt).sort().pop())}` : undefined, state: done ? 'done' : n ? 'current' : 'todo' });
    items.push({ title: 'Completed', meta: done ? `${f(r.completedAt)} · consultant access ended` : undefined, state: done ? 'done' : 'todo' });
  }
  return items;
}

function certTimeline(db: MockDb, r: ServiceRequest, items: TimelineItem[], name: (id?: string) => string, customer: boolean): TimelineItem[] {
  const training = r.category === 'training';
  const who = training ? 'SGS contact' : 'auditor';
  if (!r.approvedAt) return [...items, { title: training ? 'SGS assigns a contact' : 'SGS assigns an auditor', meta: training ? 'You’ll get an email when this happens' : 'You’ll be notified in the portal when this happens', state: 'current' }];
  items.push({ title: `Assigned to ${who} ${name(r.assigneeId)}`, meta: `${f(r.approvedAt)} · ${customer ? 'SGS' : name(r.approvedBy)}`, state: 'done' });
  if (training) return items;
  const rv = db.reviews.filter((x) => x.requestId === r.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  items.push(rv ? { title: 'Audit review started · workspace locked', meta: `${f(rv.startedAt)} · ${name(rv.auditorId)}`, state: 'done' } : { title: 'Audit review starts', meta: 'The workspace is locked while the auditor reviews it', state: 'current' });
  items.push(rv?.closedAt ? { title: 'Audit review closed · workspace unlocked', meta: `${f(rv.closedAt)} · ${name(rv.auditorId)}`, state: 'done' } : { title: 'Audit review closed', state: rv ? 'current' : 'todo' });
  const cert = db.certifications.find((c) => c.requestId === r.id);
  items.push(cert ? { title: `Certificate ${cert.number} issued`, meta: `${f(cert.certificateDate)} · valid until ${f(cert.validTo)}`, state: 'done' } : { title: 'Certificate decision by SGS', state: rv?.closedAt ? 'current' : 'todo' });
  return items;
}

function view(db: MockDb, s: Session, r: ServiceRequest): RequestView {
  const ws = db.workspaces.find((w) => w.id === r.workspaceId);
  const sc = db.scopes.find((x) => x.id === r.scopeId);
  const f2 = ws && db.frameworks.find((x) => x.id === ws.frameworkId);
  const customer = s.portal === 'customer';
  const writer = s.user.role === 'customer_admin' || s.user.role === 'customer_user';
  const mine = s.user.role === 'sgs_consultant' && r.assigneeId === s.user.id;
  const auditor = s.user.role === 'sgs_auditor' && r.assigneeId === s.user.id;
  const info = db.infoRequests.filter((x) => x.requestId === r.id).sort((a, b) => a.askedAt.localeCompare(b.askedAt));
  const open = info.find((x) => !x.answeredAt);
  const name = (id?: string) => db.users.find((u) => u.id === id)?.displayName ?? '—';
  const inProgress = r.status === 'in_progress' || (r.status === 'information_requested' && r.previousStatus === 'in_progress');
  return {
    ...row(db, r), scopeType: sc ? SCOPE_TYPE_US[sc.type] : undefined,
    workspaceLabel: ws && f2 ? `${f2.shortName} · ${sc!.name.replace(/ · Taipei$/, '')}` : undefined,
    workspaceStats: ws ? { requirements: coverage(db, ws).total, documents: db.evidence.filter((e) => e.workspaceId === ws.id).length } : undefined,
    requester: person(db, r.requesterId), contact: person(db, r.contactUserId), assignee: person(db, r.assigneeId), approver: person(db, r.approvedBy), rejecter: person(db, r.rejectedBy),
    customerAdmin: person(db, db.users.find((u) => u.tenantId === r.tenantId && u.role === 'customer_admin')?.id),
    documents: db.srDocuments.filter((x) => x.requestId === r.id && (!customer || x.source === 'sgs' || x.kind === 'customer_shared')).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    infoRequests: info.map((x) => ({ ...x, askedByName: name(x.askedBy), answeredByName: x.answeredBy ? name(x.answeredBy) : undefined })),
    openInfo: open ? { ...open, askedByName: name(open.askedBy), askedByRole: ROLE_LABEL[db.users.find((u) => u.id === open.askedBy)!.role] } : undefined,
    timeline: timeline(db, r, customer),
    can: {
      withdraw: customer && writer && canWithdrawStatus(r.category, r.status, r.previousStatus),
      triage: isTriage(s) && r.status === 'submitted',
      requestInfo: (isTriage(s) && r.status === 'submitted') || ((mine || auditor) && r.status === 'in_progress'),
      respond: customer && writer && r.status === 'information_requested',
      complete: mine && r.status === 'in_progress',
      share: mine && r.category === 'implementation_support' && r.status === 'in_progress',
      openWorkspace: (mine || auditor) && inProgress && !!ws,
      requestAgain: customer && writer && r.status === 'rejected',
    },
  };
}

/* ---------- Queries ---------- */

export async function listRequests(s: Session, category?: SrCategory, opts: { includeDrafts?: boolean } = {}): Promise<RequestRow[]> {
  await wait();
  const db = getDb();
  return copy(db.serviceRequests.filter((r) => (!category || r.category === category) && canSeeRequest(db, s, r) && (r.status !== 'draft' || (opts.includeDrafts && r.requesterId === s.user.id)))
    .sort((a, b) => (b.submittedAt ?? b.updatedAt).localeCompare(a.submittedAt ?? a.updatedAt)).map((r) => row(db, r)));
}

export async function getRequest(s: Session, id: string): Promise<RequestView> {
  await wait();
  const db = getDb();
  return copy(view(db, s, getReq(db, s, id)));
}

/** Consultants of the affiliate with their open consulting work (designs/06 MvpAdminApprove). */
export function consultantOptions(db: MockDb, s: Session) {
  return db.users.filter((u) => u.role === 'sgs_consultant' && u.status === 'active' && u.affiliateId === s.user.affiliateId).map((u) => ({ value: u.id, label: u.displayName, description: u.title ?? 'Consultant' }));
}

/* ---------- Customer: drafts and submission (UC-SRQ-001) ---------- */

export interface ConsultingDraft {
  serviceFramework?: string; scopeId?: string; goal?: string; delivery?: Delivery; earliestStart?: string; contactUserId?: string;
  supportNeeded?: string[]; preferredStart?: string; preferredEnd?: string; consentWorkspace?: boolean; attested?: boolean;
  sharedFiles?: { fileName: string; sizeBytes: number }[];
}

function nextId(db: MockDb, category: SrCategory): string {
  const p = SR_META[category].prefix, y = today().slice(0, 4);
  const n = Math.max(0, ...db.serviceRequests.filter((r) => r.id.startsWith(`${p}-${y}-`)).map((r) => Number(r.id.split('-')[2]))) + 1;
  return `${p}-${y}-${String(n).padStart(3, '0')}`;
}

/** The workspace the consultant will read: the scope's workspace of the chosen framework, if there is one. */
export function linkedWorkspace(db: MockDb, scopeId?: string, serviceFramework?: string) {
  const code = CONSULTING_FRAMEWORKS.find((x) => x.value === serviceFramework)?.code;
  if (!scopeId || !code) return undefined;
  return db.workspaces.filter((w) => w.scopeId === scopeId).map((w) => ({ w, f: db.frameworks.find((x) => x.id === w.frameworkId)! })).find((x) => x.f.code === code);
}

function applyDraft(db: MockDb, r: ServiceRequest, input: ConsultingDraft) {
  Object.assign(r, input);
  const link = linkedWorkspace(db, r.scopeId, r.serviceFramework);
  r.workspaceId = link?.w.id;
  r.frameworkId = link?.f.id;
  r.serviceFrameworkVersion = link ? `${link.f.shortName}:${link.f.version}` : r.serviceFramework;
  r.title = `${SR_META[r.category].label} · ${r.serviceFramework ?? '—'}`;
  r.updatedAt = now();
}

export async function saveDraft(s: Session, category: SrCategory, id: string | undefined, input: ConsultingDraft): Promise<string> {
  await wait();
  if (s.user.role !== 'customer_admin' && s.user.role !== 'customer_user') throw new MockApiError(403, 'Your role can’t request services');
  let rid = id ?? '';
  mutate((db) => {
    if (input.scopeId && !visibleScopeIds(db, s).has(input.scopeId)) throw new MockApiError(403, 'Scope not assigned to you');
    let r = id ? db.serviceRequests.find((x) => x.id === id && x.status === 'draft' && x.requesterId === s.user.id) : undefined;
    if (!r) {
      r = { id: nextId(db, category), tenantId: s.user.tenantId!, category, status: 'draft', title: SR_META[category].label, requesterId: s.user.id, updatedAt: now(), createdAt: now(), contactUserId: s.user.id };
      db.serviceRequests.push(r);
    }
    applyDraft(db, r, input);
    rid = r.id;
  });
  return rid;
}

export async function discardRequestDraft(s: Session, id: string): Promise<void> {
  await wait();
  mutate((db) => { db.serviceRequests = db.serviceRequests.filter((r) => !(r.id === id && r.status === 'draft' && r.requesterId === s.user.id)); });
}

export async function getDraft(s: Session, id: string): Promise<ServiceRequest | undefined> {
  await wait();
  return copy(getDb().serviceRequests.find((r) => r.id === id && r.status === 'draft' && r.requesterId === s.user.id));
}

function sgsStaff(db: MockDb, affiliateId: string): AppUser[] {
  return db.users.filter((u) => u.affiliateId === affiliateId && (u.role === 'sgs_admin' || u.role === 'sgs_user') && u.status === 'active');
}

export async function submitDraft(s: Session, id: string): Promise<void> {
  await wait();
  mutate((db) => {
    const r = db.serviceRequests.find((x) => x.id === id && x.status === 'draft' && x.requesterId === s.user.id);
    if (!r) throw new MockApiError(404, 'Draft not found');
    const missing: string[] = [];
    if (!r.serviceFramework) missing.push('framework');
    if (!r.scopeId) missing.push('scope');
    if (!r.goal?.trim()) missing.push('goal');
    if (!r.delivery) missing.push('delivery');
    if (r.category === 'gap_analysis' && !r.earliestStart) missing.push('earliest start');
    if (r.category === 'implementation_support' && (!r.preferredStart || !r.preferredEnd || !r.supportNeeded?.length)) missing.push('period or support');
    if (!r.consentWorkspace || !r.attested) missing.push('confirmations');
    if (missing.length) throw new MockApiError(422, `Missing: ${missing.join(', ')}`);
    r.status = 'submitted';
    r.submittedAt = now();
    r.updatedAt = now();
    const meta = SR_META[r.category];
    const sc = db.scopes.find((x) => x.id === r.scopeId)!;
    audit(db, s, { tenantId: r.tenantId, action: 'Submitted service request', category: 'request', objectType: 'Service request', objectId: r.id, objectLabel: r.id, context: r.id, newValue: { category: meta.label, framework: r.serviceFramework, scope: sc.name } });
    for (const u of sgsStaff(db, s.affiliate.id)) notify(db, { recipientUserId: u.id, tenantId: r.tenantId, type: 'status', tone: 'info', title: `New ${meta.noun}`, body: `${s.tenant?.name} · ${r.serviceFramework} · ${sc.name}`, ref: r.id, href: opsHref(r.category, r.id) });
  });
}

/** "Request again" on a rejected request: a new draft with the same answers (designs/06 MvpDetailRejected). */
export async function requestAgain(s: Session, id: string): Promise<string> {
  await wait();
  const db = getDb();
  const r = getReq(db, s, id);
  if (r.status !== 'rejected') throw new MockApiError(409, 'Only a rejected request can be requested again');
  const newId2 = await saveDraft(s, r.category, undefined, { serviceFramework: r.serviceFramework, scopeId: r.scopeId, goal: r.goal, delivery: r.delivery, earliestStart: undefined, contactUserId: r.contactUserId, supportNeeded: r.supportNeeded });
  mutate((db2) => { const x = db2.serviceRequests.find((y) => y.id === newId2)!; x.copiedFrom = id; });
  return newId2;
}

/* ---------- Customer: withdraw and respond (D3, D4) ---------- */

export async function withdrawRequest(s: Session, id: string, input: { reason?: string; comment?: string }): Promise<void> {
  await wait();
  mutate((db) => {
    const r = getReq(db, s, id);
    if (s.user.role !== 'customer_admin' && s.user.role !== 'customer_user') throw new MockApiError(403, 'Your role can’t withdraw requests');
    if (!canWithdrawStatus(r.category, r.status, r.previousStatus)) throw new MockApiError(409, 'SGS has started work on this request, so it can’t be withdrawn.');
    const before = r.status;
    Object.assign(r, { status: 'withdrawn', withdrawReason: input.reason || undefined, withdrawComment: input.comment?.trim() || undefined, withdrawnAt: now(), updatedAt: now() });
    db.infoRequests.filter((x) => x.requestId === id && !x.answeredAt).forEach((x) => { x.answeredAt = now(); x.answer = '(withdrawn)'; x.answeredBy = s.user.id; });
    audit(db, s, { tenantId: r.tenantId, action: 'Withdrew service request', category: 'request', objectType: 'Service request', objectId: r.id, objectLabel: r.id, context: r.id, previousValue: { status: before }, newValue: { status: 'withdrawn', reason: input.reason } });
    const to = r.assigneeId ? [r.assigneeId] : sgsStaff(db, s.affiliate.id).map((u) => u.id);
    for (const uid of to) notify(db, { recipientUserId: uid, tenantId: r.tenantId, type: 'status', tone: 'info', title: `${r.id} was withdrawn`, body: input.reason, ref: r.id, href: opsHref(r.category, r.id) });
  });
}

export async function respondToInfo(s: Session, id: string, input: { answer: string; files: { fileName: string; sizeBytes: number }[] }): Promise<void> {
  await wait();
  mutate((db) => {
    const r = getReq(db, s, id);
    if (r.status !== 'information_requested') throw new MockApiError(409, 'SGS isn’t waiting for information');
    if (!input.answer.trim()) throw new MockApiError(422, 'Write your answer.');
    const q = db.infoRequests.find((x) => x.requestId === id && !x.answeredAt)!;
    Object.assign(q, { answer: input.answer.trim(), answeredBy: s.user.id, answeredAt: now(), files: input.files });
    r.status = r.previousStatus ?? 'submitted';
    r.previousStatus = undefined;
    r.updatedAt = now();
    for (const file of input.files) db.srDocuments.push({ id: newId('doc'), requestId: id, kind: 'customer_shared', title: 'Shared with the answer', fileName: file.fileName, sizeBytes: file.sizeBytes, source: 'customer', uploadedBy: s.user.id, uploadedAt: now() });
    audit(db, s, { tenantId: r.tenantId, action: 'Responded to information request', category: 'request', objectType: 'Service request', objectId: r.id, objectLabel: r.id, context: r.id, newValue: { files: input.files.map((x) => x.fileName) } });
    const asker = db.users.find((u) => u.id === q.askedBy)!;
    notify(db, { recipientUserId: asker.id, tenantId: r.tenantId, type: 'status', tone: 'info', title: `${s.tenant?.name} answered on ${r.id}`, body: input.answer.slice(0, 80), ref: r.id, href: asker.role === 'sgs_consultant' ? consultantHref(r.category, r.id) : opsHref(r.category, r.id) });
  });
}

/* ---------- SGS: triage (UC-SRQ-005/006, D8) ---------- */

export async function approveAndAssign(s: Session, id: string, input: { consultantId: string; from: string; to: string; message: string }): Promise<void> {
  await wait();
  mutate((db) => {
    const r = getReq(db, s, id);
    if (!isTriage(s)) throw new MockApiError(403, 'Only SGS Admin or SGS User can approve requests');
    if (r.status !== 'submitted') throw new MockApiError(409, 'This request is not waiting for review');
    if (!CONSULTING.has(r.category)) throw new MockApiError(422, 'Use Assign for certification and training');
    if (!input.consultantId) throw new MockApiError(422, 'Choose a consultant.');
    // UC-ACC-006: at most one active consultant per customer.
    const other = db.serviceRequests.find((x) => x.tenantId === r.tenantId && x.id !== r.id && CONSULTING.has(x.category) && (x.status === 'in_progress' || (x.status === 'information_requested' && x.previousStatus === 'in_progress')) && x.assigneeId && x.assigneeId !== input.consultantId);
    if (other) throw new MockApiError(409, `${db.users.find((u) => u.id === other.assigneeId)!.displayName} is already the active consultant for ${db.tenants.find((t) => t.id === r.tenantId)!.name} (${other.id}). A customer has one active consultant at a time.`);
    Object.assign(r, { status: 'in_progress', assigneeId: input.consultantId, approvedAt: now(), approvedBy: s.user.id, periodFrom: input.from, periodTo: input.to, sgsMessage: input.message.trim() || undefined, updatedAt: now() });
    if (!db.sgsAssignments.some((a) => a.userId === input.consultantId && a.tenantId === r.tenantId && a.isActive)) db.sgsAssignments.push({ id: newId('as'), affiliateId: s.affiliate.id, userId: input.consultantId, tenantId: r.tenantId, roleContext: 'sgs_consultant', validFrom: today(), isActive: true });
    const cname = db.users.find((u) => u.id === input.consultantId)!.displayName;
    audit(db, s, { tenantId: r.tenantId, action: 'Approved and assigned consultant', category: 'request', objectType: 'Service request', objectId: r.id, objectLabel: r.id, context: r.id, previousValue: { status: 'submitted' }, newValue: { status: 'in_progress', consultant: cname, from: input.from, to: input.to } });
    for (const uid of new Set([r.requesterId, r.contactUserId].filter(Boolean) as string[])) notify(db, { recipientUserId: uid, tenantId: r.tenantId, type: 'status', tone: 'success', title: 'Consultant assigned', body: `${cname} will run your ${SR_META[r.category].noun} ${r.id}.`, ref: r.id, href: customerHref(r.category, r.id) });
    notify(db, { recipientUserId: input.consultantId, tenantId: r.tenantId, type: 'assignment', tone: 'info', title: `You were assigned ${r.id}`, body: `${db.tenants.find((t) => t.id === r.tenantId)!.name} · ${r.serviceFramework} · ${db.scopes.find((x) => x.id === r.scopeId)?.name ?? ''}`, ref: r.id, href: consultantHref(r.category, r.id) });
  });
}

export async function rejectRequest(s: Session, id: string, input: { reason: string; message: string }): Promise<void> {
  await wait();
  mutate((db) => {
    const r = getReq(db, s, id);
    if (!isTriage(s)) throw new MockApiError(403, 'Only SGS Admin or SGS User can reject requests');
    if (r.status !== 'submitted') throw new MockApiError(409, 'This request is not waiting for review');
    if (!input.reason || !input.message.trim()) throw new MockApiError(422, 'Reason and message are required.');
    Object.assign(r, { status: 'rejected', rejectReason: input.reason, rejectMessage: input.message.trim(), rejectedAt: now(), rejectedBy: s.user.id, updatedAt: now() });
    audit(db, s, { tenantId: r.tenantId, action: 'Rejected service request', category: 'request', objectType: 'Service request', objectId: r.id, objectLabel: r.id, context: r.id, previousValue: { status: 'submitted' }, newValue: { status: 'rejected', reason: input.reason } });
    for (const uid of new Set([r.requesterId, r.contactUserId].filter(Boolean) as string[])) notify(db, { recipientUserId: uid, tenantId: r.tenantId, type: 'status', tone: 'error', title: `${r.id} was rejected`, body: `Reason: ${input.reason}`, ref: r.id, href: customerHref(r.category, r.id) });
  });
}

/** D3: SGS (triage staff while submitted; the assigned consultant or auditor while in progress). */
export async function requestInformation(s: Session, id: string, input: { question: string; dueOn?: string }): Promise<void> {
  await wait();
  mutate((db) => {
    const r = getReq(db, s, id);
    const ok = (isTriage(s) && r.status === 'submitted') || (r.assigneeId === s.user.id && r.status === 'in_progress');
    if (!ok) throw new MockApiError(403, 'You can’t ask for information on this request now');
    if (!input.question.trim()) throw new MockApiError(422, 'Write what you need.');
    db.infoRequests.push({ id: newId('info'), requestId: id, question: input.question.trim(), askedBy: s.user.id, askedAt: now(), dueOn: input.dueOn || undefined });
    r.previousStatus = r.status as SrStatus;
    r.status = 'information_requested';
    r.updatedAt = now();
    audit(db, s, { tenantId: r.tenantId, action: 'Requested information', category: 'request', objectType: 'Service request', objectId: r.id, objectLabel: r.id, context: r.id, newValue: { question: input.question.trim() } });
    for (const uid of new Set([r.requesterId, r.contactUserId].filter(Boolean) as string[])) notify(db, { recipientUserId: uid, tenantId: r.tenantId, type: 'status', tone: 'warning', title: `SGS needs information on ${r.id}`, body: input.question.slice(0, 90), ref: r.id, href: customerHref(r.category, r.id) });
  });
}

/* ---------- Consultant: deliver and complete (UC-SRQ-007, D9) ---------- */

const assertMine = (s: Session, r: ServiceRequest) => { if (s.user.role !== 'sgs_consultant' || r.assigneeId !== s.user.id) throw new MockApiError(403, 'Only the assigned consultant can do this'); if (r.status !== 'in_progress') throw new MockApiError(409, 'The request is not in progress'); };

/** Gap Analysis: uploading the final report completes the request; workspace access ends. */
export async function uploadReportAndComplete(s: Session, id: string, input: { report: { fileName: string; sizeBytes: number }; attachments: { fileName: string; sizeBytes: number }[]; note: string }): Promise<void> {
  await wait();
  mutate((db) => {
    const r = getReq(db, s, id);
    assertMine(s, r);
    const at = now();
    db.srDocuments.push({ id: newId('doc'), requestId: id, kind: 'report', title: 'Gap Analysis Report', fileName: `${id} – Gap Analysis Report.pdf`, sizeBytes: input.report.sizeBytes, source: 'sgs', uploadedBy: s.user.id, uploadedAt: at, note: input.report.fileName });
    input.attachments.forEach((a) => db.srDocuments.push({ id: newId('doc'), requestId: id, kind: 'attachment', title: 'Attachment', fileName: a.fileName, sizeBytes: a.sizeBytes, source: 'sgs', uploadedBy: s.user.id, uploadedAt: at }));
    complete(db, s, r, input.note);
  });
}

export async function shareDeliverable(s: Session, id: string, input: { title: string; file: { fileName: string; sizeBytes: number }; note: string }): Promise<void> {
  await wait();
  mutate((db) => {
    const r = getReq(db, s, id);
    assertMine(s, r);
    if (!input.title.trim()) throw new MockApiError(422, 'Enter a title.');
    const ext = input.file.fileName.includes('.') ? input.file.fileName.slice(input.file.fileName.lastIndexOf('.')) : '';
    db.srDocuments.push({ id: newId('doc'), requestId: id, kind: 'deliverable', title: input.title.trim(), fileName: `${id} – ${input.title.trim()}${ext}`, sizeBytes: input.file.sizeBytes, source: 'sgs', uploadedBy: s.user.id, uploadedAt: now(), note: input.note.trim() || undefined });
    r.updatedAt = now();
    audit(db, s, { tenantId: r.tenantId, action: 'Shared deliverable', category: 'request', objectType: 'Service request', objectId: r.id, objectLabel: r.id, context: r.id, newValue: { title: input.title.trim() } });
    for (const uid of new Set([r.requesterId, r.contactUserId].filter(Boolean) as string[])) notify(db, { recipientUserId: uid, tenantId: r.tenantId, type: 'document', tone: 'info', title: `New deliverable on ${r.id}`, body: input.title.trim(), ref: r.id, href: customerHref(r.category, r.id) });
  });
}

export async function completeSupport(s: Session, id: string, input: { summary: string; file?: { fileName: string; sizeBytes: number } }): Promise<void> {
  await wait();
  mutate((db) => {
    const r = getReq(db, s, id);
    assertMine(s, r);
    if (input.file) db.srDocuments.push({ id: newId('doc'), requestId: id, kind: 'closing', title: 'Closing summary', fileName: `${id} – ${input.file.fileName}`, sizeBytes: input.file.sizeBytes, source: 'sgs', uploadedBy: s.user.id, uploadedAt: now() });
    complete(db, s, r, input.summary);
  });
}

function complete(db: MockDb, s: Session, r: ServiceRequest, note: string) {
  Object.assign(r, { status: 'completed', completedAt: now(), completedBy: s.user.id, closingNote: note.trim() || undefined, updatedAt: now() });
  // Consultant access to the workspace ends when the request is completed (design-questions Q15).
  const stillActive = db.serviceRequests.some((x) => x.id !== r.id && x.tenantId === r.tenantId && x.assigneeId === s.user.id && x.status === 'in_progress');
  if (!stillActive) db.sgsAssignments.filter((a) => a.userId === s.user.id && a.tenantId === r.tenantId && a.isActive).forEach((a) => { a.isActive = false; a.validTo = today(); });
  audit(db, s, { tenantId: r.tenantId, action: 'Completed service request', category: 'request', objectType: 'Service request', objectId: r.id, objectLabel: r.id, context: r.id, previousValue: { status: 'in_progress' }, newValue: { status: 'completed' } });
  for (const uid of new Set([r.requesterId, r.contactUserId].filter(Boolean) as string[])) notify(db, { recipientUserId: uid, tenantId: r.tenantId, type: 'status', tone: 'success', title: r.category === 'gap_analysis' ? 'Gap analysis report delivered' : `${r.id} is completed`, body: `${s.user.displayName} completed ${r.id}.`, ref: r.id, href: customerHref(r.category, r.id) });
}


/* ---------- Internal notes on a request (designs/11 rules, decisions D7) ---------- */

export interface NoteView { id: string; author: string; roleLabel: string; at: string; body: string }
const SGS_STAFF = new Set(['sgs_admin', 'sgs_user', 'sgs_consultant', 'sgs_auditor']);

/** SGS only. Customers never receive internal notes, not even an empty list. */
export async function listRequestNotes(s: Session, requestId: string): Promise<NoteView[]> {
  await wait();
  const db = getDb();
  if (!SGS_STAFF.has(s.user.role)) throw new MockApiError(403, 'Internal notes are for SGS only');
  getReq(db, s, requestId);
  return copy(db.srNotes.filter((n) => n.requestId === requestId).sort((a, b) => a.at.localeCompare(b.at)).map((n) => {
    const u = db.users.find((x) => x.id === n.authorId);
    return { id: n.id, author: u?.displayName ?? 'Unknown user', roleLabel: u ? ROLE_LABEL[u.role].replace(/^SGS /, '') : '', at: n.at, body: n.body };
  }));
}

/** Who may add a note: SGS staff who can see the request, while it is still open (designs/11 States: "sealed"). */
export const notesOpen = (status: ServiceRequest['status']) => !['completed', 'rejected', 'withdrawn', 'certificate_issued'].includes(status);

export async function addRequestNote(s: Session, requestId: string, body: string): Promise<void> {
  await wait();
  mutate((db) => {
    if (!SGS_STAFF.has(s.user.role)) throw new MockApiError(403, 'Internal notes are for SGS only');
    const r = getReq(db, s, requestId);
    if (!notesOpen(r.status)) throw new MockApiError(409, 'This request is closed. Notes are read only.');
    if (!body.trim()) throw new MockApiError(422, 'Write a note.');
    db.srNotes.push({ id: newId('sn'), requestId, authorId: s.user.id, at: now(), body: body.trim(), visibility: 'internal' });
    audit(db, s, { tenantId: r.tenantId, action: 'Added internal note', category: 'internal', objectType: 'Service request', objectId: r.id, objectLabel: r.id, context: r.id });
  });
}
