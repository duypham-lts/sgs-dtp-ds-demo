// Certification requests and certificates (UC-SRQ-001/005/006, UC-CRT-001/003, designs/08 and 09, decisions D2).
// Two ways in: from a workspace (scope, framework and tier filled in) or from the service catalogue.
import { visibleScopeIds, visibleTenantIds } from '../access';
import { coverage } from '../coverage';
import { CERT_SERVICES } from '../catalog/services';
import { customerHref, opsHref } from '../requestMeta';
import { getDb, mutate } from '../store';
import type { Certification, MockDb, ServiceRequest, Session } from '../types';
import { audit, copy, MockApiError, newId, notify, now, wait } from './core';

function nextCr(db: MockDb): string {
  const n = Math.max(0, ...db.serviceRequests.filter((r) => r.id.startsWith('CR-2026-')).map((r) => Number(r.id.split('-')[2]))) + 1;
  return `CR-2026-${String(n).padStart(3, '0')}`;
}

/** Workspace of the scope for a catalogue standard (via the platform framework code), if there is one. */
export function certWorkspace(db: MockDb, scopeId: string, std: string) {
  const code = CERT_SERVICES.find((x) => x.std === std)?.code;
  if (!code) return undefined;
  return db.workspaces.filter((w) => w.scopeId === scopeId).map((w) => ({ w, f: db.frameworks.find((f) => f.id === w.frameworkId)! })).find((x) => x.f.code === code);
}

export interface CertRequestInput { scopeId: string; std: string; workspaceId?: string; certType: ServiceRequest['certType']; preferredPeriod: string; message: string; files: { fileName: string; sizeBytes: number }[] }

export async function createCertRequest(s: Session, input: CertRequestInput): Promise<string> {
  await wait();
  if (s.user.role !== 'customer_admin' && s.user.role !== 'customer_user') throw new MockApiError(403, 'Your role can’t request services');
  let id = '';
  mutate((db) => {
    if (!visibleScopeIds(db, s).has(input.scopeId)) throw new MockApiError(403, 'Scope not assigned to you');
    if (!input.preferredPeriod) throw new MockApiError(422, 'Choose the preferred audit period.');
    const link = input.workspaceId ? (() => { const w = db.workspaces.find((x) => x.id === input.workspaceId)!; return { w, f: db.frameworks.find((f) => f.id === w.frameworkId)! }; })() : certWorkspace(db, input.scopeId, input.std);
    if (link && db.serviceRequests.some((r) => r.category === 'certification' && r.workspaceId === link.w.id && !['rejected', 'withdrawn', 'certificate_issued'].includes(r.status)))
      throw new MockApiError(409, 'This workspace already has an open certification request.');
    id = nextCr(db);
    const fwLabel = link ? `${link.f.shortName} · ${link.f.version}` : input.std;
    const r: ServiceRequest = {
      id, tenantId: s.user.tenantId!, category: 'certification', status: 'submitted', title: `${input.certType} · ${fwLabel}`, scopeId: input.scopeId, frameworkId: link?.f.id, workspaceId: link?.w.id,
      serviceFramework: input.std, serviceFrameworkVersion: fwLabel, requesterId: s.user.id, contactUserId: s.user.id, submittedAt: now(), updatedAt: now(), createdAt: now(),
      certType: input.certType, preferredPeriod: input.preferredPeriod, message: input.message.trim() || undefined,
    };
    db.serviceRequests.push(r);
    for (const f of input.files) db.srDocuments.push({ id: newId('doc'), requestId: id, kind: 'customer_shared', title: 'Shared with the request', fileName: f.fileName, sizeBytes: f.sizeBytes, source: 'customer', uploadedBy: s.user.id, uploadedAt: now() });
    const sc = db.scopes.find((x) => x.id === input.scopeId)!;
    audit(db, s, { tenantId: r.tenantId, action: 'Submitted service request', category: 'request', objectType: 'Service request', objectId: id, objectLabel: id, context: id, newValue: { category: 'Certification', framework: fwLabel, scope: sc.name, type: input.certType } });
    for (const u of db.users.filter((x) => x.affiliateId === s.affiliate.id && (x.role === 'sgs_admin' || x.role === 'sgs_user') && x.status === 'active'))
      notify(db, { recipientUserId: u.id, tenantId: r.tenantId, type: 'status', tone: 'info', title: 'New certification request', body: `${s.tenant?.name} · ${fwLabel} · ${sc.name}`, ref: id, href: opsHref('certification', id) });
  });
  return id;
}

export function auditorOptions(db: MockDb, s: Session) {
  return db.users.filter((u) => u.role === 'sgs_auditor' && u.status === 'active' && u.affiliateId === s.user.affiliateId).map((u) => {
    const open = db.serviceRequests.filter((r) => r.category === 'certification' && r.assigneeId === u.id && (r.status === 'assigned' || r.status === 'in_progress')).length;
    return { value: u.id, label: u.displayName, description: `SGS Auditor/Certification · ${open} open audit${open === 1 ? '' : 's'}` };
  });
}

export async function assignAuditor(s: Session, id: string, input: { auditorId: string; message: string }): Promise<void> {
  await wait();
  mutate((db) => {
    const r = db.serviceRequests.find((x) => x.id === id);
    if (!r || !visibleTenantIds(db, s).has(r.tenantId)) throw new MockApiError(404, 'Request not found');
    if (s.user.role !== 'sgs_admin' && s.user.role !== 'sgs_user') throw new MockApiError(403, 'Only SGS Admin or SGS User can assign');
    if (r.status !== 'submitted') throw new MockApiError(409, 'This request is not waiting for an auditor');
    if (!input.auditorId) throw new MockApiError(422, 'Choose an auditor.');
    const u = db.users.find((x) => x.id === input.auditorId)!;
    Object.assign(r, { status: 'assigned', assigneeId: u.id, approvedAt: now(), approvedBy: s.user.id, sgsMessage: input.message.trim() || undefined, updatedAt: now() });
    audit(db, s, { tenantId: r.tenantId, action: 'Assigned auditor', category: 'request', objectType: 'Service request', objectId: id, objectLabel: id, context: id, previousValue: { status: 'submitted' }, newValue: { status: 'assigned', auditor: u.displayName } });
    for (const uid of new Set([r.requesterId, r.contactUserId].filter(Boolean) as string[])) notify(db, { recipientUserId: uid, tenantId: r.tenantId, type: 'status', tone: 'success', title: 'Auditor assigned', body: `${u.displayName} will run the audit for ${id}.`, ref: id, href: customerHref('certification', id) });
    notify(db, { recipientUserId: u.id, tenantId: r.tenantId, type: 'assignment', tone: 'info', title: `You were assigned ${id}`, body: `${db.tenants.find((t) => t.id === r.tenantId)!.name} · ${r.serviceFrameworkVersion}`, ref: id, href: `/ops/audits/${id}` });
  });
}

export interface CertificationRow extends Certification { customerName: string; scopeName: string; status: 'active' | 'expired' }
function certRow(db: MockDb, c: Certification): CertificationRow {
  return { ...c, customerName: db.tenants.find((t) => t.id === c.tenantId)!.name, scopeName: db.scopes.find((x) => x.id === c.scopeId)?.name ?? '—', status: c.validTo < now().slice(0, 10) ? 'expired' : 'active' };
}

export async function listCertifications(s: Session): Promise<CertificationRow[]> {
  await wait();
  const db = getDb();
  const tenants = visibleTenantIds(db, s);
  const scopes = s.portal === 'customer' ? visibleScopeIds(db, s) : undefined;
  if (s.user.role === 'sgs_consultant' || s.user.role === 'sgs_auditor') return [];
  return copy(db.certifications.filter((c) => tenants.has(c.tenantId) && (!scopes || scopes.has(c.scopeId))).sort((a, b) => b.certificateDate.localeCompare(a.certificateDate)).map((c) => certRow(db, c)));
}

export interface CertificateInput { number: string; accreditation: Certification['accreditation']; certificateDate: string; validTo: string; certificateScope: string; sites: string; contractNumber: string }
export async function createCertificate(s: Session, requestId: string, input: CertificateInput): Promise<string> {
  await wait();
  let id = '';
  mutate((db) => {
    const r = db.serviceRequests.find((x) => x.id === requestId);
    if (!r || !visibleTenantIds(db, s).has(r.tenantId)) throw new MockApiError(404, 'Request not found');
    if (s.user.role !== 'sgs_admin' && s.user.role !== 'sgs_user') throw new MockApiError(403, 'Only SGS Admin or SGS User can create certificates');
    if (r.status !== 'audit_completed') throw new MockApiError(409, 'The audit review must be closed first');
    if (db.certifications.some((c) => c.number.trim().toLowerCase() === input.number.trim().toLowerCase())) throw new MockApiError(409, 'This certificate number is already used.');
    if (input.validTo <= input.certificateDate) throw new MockApiError(422, 'Valid to must be after the certificate date.');
    const ws = db.workspaces.find((w) => w.id === r.workspaceId);
    const fw = ws && db.frameworks.find((f) => f.id === ws.frameworkId);
    const c: Certification = { id: newId('cert'), number: input.number.trim(), tenantId: r.tenantId, affiliateId: s.affiliate.id, scopeId: r.scopeId!, frameworkLabel: r.serviceFrameworkVersion ?? r.serviceFramework ?? '', frameworkId: fw?.id, tier: ws?.tier, requestId,
      accreditation: input.accreditation, certificateDate: input.certificateDate, validTo: input.validTo, certificateScope: input.certificateScope.trim(), sites: input.sites.split('\n').map((x) => x.trim()).filter(Boolean),
      contractNumber: input.contractNumber.trim() || undefined, certifiedBy: s.affiliate.legalName, createdBy: s.user.id, createdAt: now() };
    db.certifications.unshift(c);
    Object.assign(r, { status: 'certificate_issued', updatedAt: now() });
    audit(db, s, { tenantId: r.tenantId, action: 'Created certification record', category: 'certificate', objectType: 'Certificate', objectId: c.id, objectLabel: c.number, context: requestId, newValue: { number: c.number, validTo: c.validTo } });
    for (const uid of new Set([r.requesterId, r.contactUserId].filter(Boolean) as string[])) notify(db, { recipientUserId: uid, tenantId: r.tenantId, type: 'certificate', tone: 'success', title: `Certificate ${c.number} issued`, body: `Valid until ${c.validTo}.`, ref: requestId, href: `/certifications?cert=${c.id}` });
    id = c.id;
  });
  return id;
}

/** Summary for the certification modal opened from a workspace (designs/08 Main). */
export function workspaceCertSummary(db: MockDb, workspaceId: string) {
  const w = db.workspaces.find((x) => x.id === workspaceId)!;
  const f = db.frameworks.find((x) => x.id === w.frameworkId)!;
  return { std: CERT_SERVICES.find((x) => x.code === f.code)?.std ?? f.shortName, scopeId: w.scopeId, total: coverage(db, w).total, tier: f.tiers.find((t) => t.code === w.tier)?.label };
}

/* ---------- Training (designs/09 Train*, UC-TRN-009, UC-SRQ-001/005/006) ---------- */

export interface TrainingInput { courseId: string; participants: number; format: NonNullable<ServiceRequest['format']>; preferredMonth: string; language: NonNullable<ServiceRequest['language']>; message: string }
export async function createTrainingRequest(s: Session, input: TrainingInput): Promise<string> {
  await wait();
  if (s.user.role !== 'customer_admin' && s.user.role !== 'customer_user') throw new MockApiError(403, 'Your role can’t request services');
  const { TRAINING_COURSES, courseTitle } = await import('../catalog/services');
  const c = TRAINING_COURSES.find((x) => x.id === input.courseId);
  if (!c) throw new MockApiError(404, 'Course not found');
  if (!(input.participants >= 1)) throw new MockApiError(422, 'Enter the number of participants.');
  let id = '';
  mutate((db) => {
    const n = Math.max(0, ...db.serviceRequests.filter((r) => r.id.startsWith('TR-2026-')).map((r) => Number(r.id.split('-')[2]))) + 1;
    id = `TR-2026-${String(n).padStart(3, '0')}`;
    const title = `${courseTitle(c.std, c.course, true)} · ${input.participants} ${input.participants === 1 ? 'person' : 'people'}`;
    db.serviceRequests.push({ id, tenantId: s.user.tenantId!, category: 'training', status: 'submitted', title, requesterId: s.user.id, contactUserId: s.user.id, submittedAt: now(), updatedAt: now(), createdAt: now(),
      course: c.course, courseStd: c.std, courseCategory: c.cat, participants: input.participants, format: input.format, preferredMonth: input.preferredMonth, language: input.language, message: input.message.trim() || undefined });
    audit(db, s, { tenantId: s.user.tenantId, action: 'Submitted service request', category: 'request', objectType: 'Service request', objectId: id, objectLabel: id, context: id, newValue: { category: 'Training', course: title } });
    for (const u of db.users.filter((x) => x.affiliateId === s.affiliate.id && (x.role === 'sgs_admin' || x.role === 'sgs_user') && x.status === 'active'))
      notify(db, { recipientUserId: u.id, tenantId: s.user.tenantId, type: 'status', tone: 'info', title: 'New training request', body: `${s.tenant?.name} · ${title}`, ref: id, href: opsHref('training', id) });
  });
  return id;
}

/** SGS staff who can take a training request (SGS Academy coordinators first). */
export function trainingContactOptions(db: MockDb, s: Session) {
  return db.users.filter((u) => (u.role === 'sgs_user' || u.role === 'sgs_admin') && u.status === 'active' && u.affiliateId === s.user.affiliateId)
    .sort((a, b) => Number(/Academy/.test(b.title ?? '')) - Number(/Academy/.test(a.title ?? ''))).map((u) => ({ value: u.id, label: u.displayName, description: u.title ?? (u.role === 'sgs_admin' ? 'SGS Admin' : 'SGS User') }));
}

export async function assignTrainingContact(s: Session, id: string, input: { contactId: string; message: string }): Promise<void> {
  await wait();
  mutate((db) => {
    const r = db.serviceRequests.find((x) => x.id === id && x.category === 'training');
    if (!r || !visibleTenantIds(db, s).has(r.tenantId)) throw new MockApiError(404, 'Request not found');
    if (s.user.role !== 'sgs_admin' && s.user.role !== 'sgs_user') throw new MockApiError(403, 'Only SGS Admin or SGS User can assign');
    if (r.status !== 'submitted') throw new MockApiError(409, 'This request is not waiting for a contact');
    if (!input.contactId) throw new MockApiError(422, 'Choose who takes the request.');
    const u = db.users.find((x) => x.id === input.contactId)!;
    Object.assign(r, { status: 'assigned', assigneeId: u.id, approvedAt: now(), approvedBy: s.user.id, sgsMessage: input.message.trim() || undefined, updatedAt: now() });
    audit(db, s, { tenantId: r.tenantId, action: 'Assigned training contact', category: 'request', objectType: 'Service request', objectId: id, objectLabel: id, context: id, previousValue: { status: 'submitted' }, newValue: { status: 'assigned', contact: u.displayName } });
    for (const uid of new Set([r.requesterId, r.contactUserId].filter(Boolean) as string[])) notify(db, { recipientUserId: uid, tenantId: r.tenantId, type: 'status', tone: 'success', title: 'SGS contact assigned', body: `${u.displayName} will confirm dates and price for ${id}.`, ref: id, href: customerHref('training', id) });
    if (u.id !== s.user.id) notify(db, { recipientUserId: u.id, tenantId: r.tenantId, type: 'assignment', tone: 'info', title: `You were assigned ${id}`, body: `${db.tenants.find((t) => t.id === r.tenantId)!.name} · ${r.title}`, ref: id, href: opsHref('training', id) });
  });
}
