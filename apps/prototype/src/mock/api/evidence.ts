// Workspaces and evidence (UC-EVD-003…013/016, designs/05 Workspace, UploadEvidence, LinkEvidence,
// EvidenceDetail, EvidenceLibrary, Documents). Files belong to one workspace; linking doesn't copy the
// file; a new version updates every requirement that uses it. Nothing can change while an audit review
// locks the workspace (designs/08). Every change writes an AUDIT_EVENT.
import { canReadWorkspace, canWriteEvidence } from '../access';
import { requirementStatuses, validity, workspaceRequirements, type ReqStatus, type Validity } from '../coverage';

import { getDb, mutate } from '../store';
import type { Evidence, EvidenceVersion, ExpectedEvidence, Framework, MockDb, Requirement, Scope, Session, Workspace } from '../types';
import { audit, copy, MockApiError, newId, now, wait } from './core';
import { workspaceRow, type WorkspaceRow } from './scopes';

export const SCAN_MS = 2000;

export interface EvidenceRow {
  id: string; name: string; fileName: string; sizeBytes: number; workspaceId: string; workspaceLabel: string;
  usedFor: string[]; validFrom?: string; validUntil?: string; validity: Validity; scanState: Evidence['scanState'];
  uploadedBy: string; uploadedAt: string; review: Evidence['review']; version: number;
}
export interface RequirementView extends Requirement {
  status: ReqStatus; ownerId?: string;
  items: (ExpectedEvidence & { evidence: EvidenceRow[] })[];
}
export interface WorkspaceDetail extends WorkspaceRow {
  framework: Framework; scope: Scope; workspace: Workspace;
  requirements: (Requirement & { status: ReqStatus })[];
  groups: { code: string; title: string; progress: number }[];
  canWrite: boolean; owners: { id: string; name: string }[];
}

function ws(db: MockDb, s: Session, id: string): Workspace {
  const w = db.workspaces.find((x) => x.id === id);
  if (!w || !canReadWorkspace(db, s, w)) throw new MockApiError(404, 'Workspace not found');
  return w;
}
function assertWritable(db: MockDb, s: Session, w: Workspace) {
  if (!canWriteEvidence(s)) throw new MockApiError(403, 'Your role can’t change evidence');
  if (w.status === 'audit_in_progress') throw new MockApiError(423, `This workspace is locked while audit ${w.lockedByRequestId ?? ''} reviews it.`.replace('  ', ' '));
}
const label = (db: MockDb, w: Workspace) => {
  const f = db.frameworks.find((x) => x.id === w.frameworkId)!;
  const sc = db.scopes.find((x) => x.id === w.scopeId)!;
  return `${f.shortName} · ${f.version} · ${sc.name.replace(/ · Taipei$/, '')}`;
};

export function evidenceRow(db: MockDb, e: Evidence): EvidenceRow {
  const v = db.evidenceVersions.filter((x) => x.evidenceId === e.id).sort((a, b) => b.versionNo - a.versionNo)[0];
  const w = db.workspaces.find((x) => x.id === e.workspaceId)!;
  const codes = db.evidenceMappings.filter((m) => m.evidenceId === e.id).map((m) => db.requirements.find((r) => r.id === m.requirementId)!)
    .sort((a, b) => a.sortOrder - b.sortOrder).map((r) => r.code);
  return {
    id: e.id, name: e.name, fileName: v.fileName, sizeBytes: v.sizeBytes, workspaceId: w.id, workspaceLabel: label(db, w), usedFor: [...new Set(codes)],
    validFrom: e.validFrom, validUntil: e.validUntil, validity: validity(e), scanState: e.scanState,
    uploadedBy: db.users.find((u) => u.id === v.uploadedBy)?.displayName ?? '—', uploadedAt: v.uploadedAt, review: e.review, version: e.currentVersion,
  };
}

export async function listWorkspaces(s: Session): Promise<WorkspaceRow[]> {
  await wait();
  const db = getDb();
  return copy(db.workspaces.filter((w) => canReadWorkspace(db, s, w)).sort((a, b) => a.createdAt.localeCompare(b.createdAt) * -1).map((w) => workspaceRow(db, w)));
}

export async function getWorkspace(s: Session, id: string): Promise<WorkspaceDetail> {
  await wait();
  const db = getDb();
  const w = ws(db, s, id);
  const f = db.frameworks.find((x) => x.id === w.frameworkId)!;
  const st = requirementStatuses(db, w);
  const reqs = workspaceRequirements(db, w).map((r) => ({ ...r, status: st.get(r.id)! }));
  const groups = [...new Set(reqs.map((r) => r.groupCode))].map((code) => {
    const g = reqs.filter((r) => r.groupCode === code);
    return { code, title: g[0].groupTitle, progress: Math.round((g.filter((r) => r.status === 'provided').length / g.length) * 100) };
  });
  const people = db.users.filter((u) => u.tenantId === w.tenantId && u.status === 'active' && (u.role === 'customer_admin' || (u.role === 'customer_user' && db.userScopes.some((x) => x.userId === u.id && x.scopeId === w.scopeId))));
  return copy({
    ...workspaceRow(db, w), framework: f, scope: db.scopes.find((x) => x.id === w.scopeId)!, workspace: w, requirements: reqs, groups,
    canWrite: canWriteEvidence(s) && w.status !== 'audit_in_progress', owners: people.map((u) => ({ id: u.id, name: u.displayName })),
  });
}

export async function getRequirementView(s: Session, workspaceId: string, code: string): Promise<RequirementView> {
  await wait();
  const db = getDb();
  const w = ws(db, s, workspaceId);
  const r = workspaceRequirements(db, w).find((x) => x.code === code);
  if (!r) throw new MockApiError(404, 'Requirement not in this workspace');
  const maps = db.evidenceMappings.filter((m) => m.workspaceId === w.id && m.requirementId === r.id);
  return copy({
    ...r, status: requirementStatuses(db, w).get(r.id)!,
    ownerId: db.requirementOwners.find((o) => o.workspaceId === w.id && o.requirementId === r.id)?.ownerUserId,
    items: db.expectedEvidence.filter((x) => x.requirementId === r.id).map((it) => ({
      ...it, evidence: maps.filter((m) => m.expectedEvidenceId === it.id).map((m) => evidenceRow(db, db.evidence.find((e) => e.id === m.evidenceId)!)),
    })),
  });
}

export async function listEvidence(s: Session, filter: { workspaceId?: string } = {}): Promise<EvidenceRow[]> {
  await wait();
  const db = getDb();
  const readable = new Set(db.workspaces.filter((w) => canReadWorkspace(db, s, w)).map((w) => w.id));
  return copy(db.evidence.filter((e) => readable.has(e.workspaceId) && (!filter.workspaceId || e.workspaceId === filter.workspaceId))
    .map((e) => evidenceRow(db, e)).sort((a, b) => a.workspaceLabel.localeCompare(b.workspaceLabel) || a.uploadedAt.localeCompare(b.uploadedAt) * -1));
}

export interface EvidenceDetail extends EvidenceRow {
  workspaceTitle: string; usedForRows: { requirementId: string; code: string; requirement: string; expected: string }[];
  versions: (EvidenceVersion & { by: string })[]; locked: boolean; canWrite: boolean;
}
export async function getEvidence(s: Session, id: string): Promise<EvidenceDetail> {
  await wait();
  const db = getDb();
  const e = db.evidence.find((x) => x.id === id);
  if (!e) throw new MockApiError(404, 'Evidence not found');
  const w = ws(db, s, e.workspaceId);
  const f = db.frameworks.find((x) => x.id === w.frameworkId)!;
  const sc = db.scopes.find((x) => x.id === w.scopeId)!;
  const rows = db.evidenceMappings.filter((m) => m.evidenceId === id).map((m) => {
    const r = db.requirements.find((x) => x.id === m.requirementId)!;
    const it = db.expectedEvidence.find((x) => x.id === m.expectedEvidenceId)!;
    return { requirementId: r.id, code: r.code, requirement: `${r.code} ${r.title}`, expected: `${it.code} ${it.name}`, sort: r.sortOrder };
  }).sort((a, b) => a.sort - b.sort).map(({ sort: _s, ...x }) => x);
  return copy({
    ...evidenceRow(db, e), workspaceTitle: `${f.shortName} · ${f.version} · ${sc.name}`, usedForRows: rows,
    versions: db.evidenceVersions.filter((v) => v.evidenceId === id).sort((a, b) => b.versionNo - a.versionNo).map((v) => ({ ...v, by: db.users.find((u) => u.id === v.uploadedBy)?.displayName ?? '—' })),
    locked: w.status === 'audit_in_progress', canWrite: canWriteEvidence(s) && w.status !== 'audit_in_progress',
  });
}

/** Virus scan: new files are "Scanning for viruses…" and become "Scanned · clean" a moment later. */
function scheduleScan(id: string) {
  setTimeout(() => mutate((db) => { const e = db.evidence.find((x) => x.id === id); if (e) e.scanState = 'clean'; }), SCAN_MS);
}

export interface UploadInput {
  workspaceId: string; requirementCode: string; alsoCodes: string[]; name: string; fileName: string; sizeBytes: number; validFrom?: string; validUntil?: string;
}
export async function uploadEvidence(s: Session, input: UploadInput): Promise<{ evidenceId: string; mapped: number }> {
  await wait();
  let result = { evidenceId: '', mapped: 0 };
  mutate((db) => {
    const w = ws(db, s, input.workspaceId);
    assertWritable(db, s, w);
    if (!input.name.trim()) throw new MockApiError(422, 'Enter a name.');
    if (input.validFrom && input.validUntil && input.validUntil < input.validFrom) throw new MockApiError(422, 'Valid until must be after valid from.');
    const reqs = workspaceRequirements(db, w);
    const codes = [...new Set([input.requirementCode, ...input.alsoCodes])];
    const e: Evidence = { id: newId('ev'), tenantId: w.tenantId, workspaceId: w.id, name: input.name.trim(), currentVersion: 1, validFrom: input.validFrom || undefined, validUntil: input.validUntil || undefined, scanState: 'scanning', review: 'not_reviewed', createdBy: s.user.id, createdAt: now() };
    db.evidence.push(e);
    db.evidenceVersions.push({ id: `${e.id}-v1`, evidenceId: e.id, versionNo: 1, fileName: input.fileName, sizeBytes: input.sizeBytes, uploadedBy: s.user.id, uploadedAt: now() });
    for (const code of codes) {
      const r = reqs.find((x) => x.code === code);
      if (!r) continue;
      const it = db.expectedEvidence.find((x) => x.requirementId === r.id && x.mandatory) ?? db.expectedEvidence.find((x) => x.requirementId === r.id)!;
      db.evidenceMappings.push({ id: newId('map'), evidenceId: e.id, workspaceId: w.id, requirementId: r.id, expectedEvidenceId: it.id, linkedBy: s.user.id, linkedAt: now() });
    }
    audit(db, s, { tenantId: w.tenantId, action: 'Uploaded evidence', category: 'evidence', objectType: 'Evidence', objectId: e.id, objectLabel: e.name, context: codes.join(', '), newValue: { file: input.fileName, requirements: codes } });
    result = { evidenceId: e.id, mapped: codes.length };
  });
  scheduleScan(result.evidenceId);
  return result;
}

export async function linkEvidence(s: Session, workspaceId: string, requirementCode: string, evidenceIds: string[]): Promise<void> {
  await wait();
  mutate((db) => {
    const w = ws(db, s, workspaceId);
    assertWritable(db, s, w);
    const r = workspaceRequirements(db, w).find((x) => x.code === requirementCode)!;
    const it = db.expectedEvidence.find((x) => x.requirementId === r.id && x.mandatory)!;
    for (const id of evidenceIds) {
      const e = db.evidence.find((x) => x.id === id && x.workspaceId === w.id);
      if (!e) throw new MockApiError(422, 'Only evidence of this workspace can be linked.');
      if (db.evidenceMappings.some((m) => m.evidenceId === id && m.requirementId === r.id)) continue;
      db.evidenceMappings.push({ id: newId('map'), evidenceId: id, workspaceId: w.id, requirementId: r.id, expectedEvidenceId: it.id, linkedBy: s.user.id, linkedAt: now() });
      audit(db, s, { tenantId: w.tenantId, action: 'Linked evidence', category: 'evidence', objectType: 'Evidence', objectId: id, objectLabel: e.name, context: r.code });
    }
  });
}

/** The mapping goes; the file stays in the library ("Not linked" tab). */
export async function unlinkEvidence(s: Session, evidenceId: string, requirementId: string): Promise<{ code: string }> {
  await wait();
  let code = '';
  mutate((db) => {
    const e = db.evidence.find((x) => x.id === evidenceId);
    if (!e) throw new MockApiError(404, 'Evidence not found');
    const w = ws(db, s, e.workspaceId);
    assertWritable(db, s, w);
    code = db.requirements.find((r) => r.id === requirementId)!.code;
    db.evidenceMappings = db.evidenceMappings.filter((m) => !(m.evidenceId === evidenceId && m.requirementId === requirementId));
    audit(db, s, { tenantId: w.tenantId, action: 'Removed evidence mapping', category: 'evidence', objectType: 'Evidence', objectId: evidenceId, objectLabel: e.name, context: code });
  });
  return { code };
}

export async function uploadNewVersion(s: Session, evidenceId: string, file: { name: string; size: number }): Promise<{ version: number; requirements: number }> {
  await wait();
  let out = { version: 0, requirements: 0 };
  mutate((db) => {
    const e = db.evidence.find((x) => x.id === evidenceId);
    if (!e) throw new MockApiError(404, 'Evidence not found');
    const w = ws(db, s, e.workspaceId);
    assertWritable(db, s, w);
    const prev = e.currentVersion;
    const prevFile = db.evidenceVersions.find((v) => v.evidenceId === e.id && v.versionNo === prev);
    const prevReview = e.review;
    e.currentVersion += 1;
    e.scanState = 'scanning';
    // A new version needs a new SGS review (docs/prototype-plan.md §3.3).
    if (e.review === 'accepted') e.review = 'under_review';
    db.evidenceVersions.push({ id: `${e.id}-v${e.currentVersion}`, evidenceId: e.id, versionNo: e.currentVersion, fileName: file.name, sizeBytes: file.size, uploadedBy: s.user.id, uploadedAt: now() });
    const req = db.evidenceMappings.filter((m) => m.evidenceId === e.id).map((m) => db.requirements.find((r) => r.id === m.requirementId)?.code)[0];
    const REVIEW: Record<string, string> = { accepted: 'Accepted', under_review: 'Under review', not_reviewed: 'Not reviewed', in_review: 'In review' };
    const fz = (n: number) => `${(n / 1_000_000).toFixed(1)} MB`;
    audit(db, s, { tenantId: w.tenantId, action: 'Replaced evidence with a new version', category: 'evidence', objectType: 'Evidence', objectId: e.id, objectLabel: e.name, context: req,
      previousValue: { version: prev, file: prevFile ? `${prevFile.fileName} (${fz(prevFile.sizeBytes)})` : undefined, reviewStatus: REVIEW[prevReview] ?? prevReview },
      newValue: { version: e.currentVersion, file: `${file.name} (${fz(file.size)})`, reviewStatus: REVIEW[e.review] ?? e.review } });
    out = { version: e.currentVersion, requirements: db.evidenceMappings.filter((m) => m.evidenceId === e.id).length };
  });
  scheduleScan(evidenceId);
  return out;
}

/** D6 / UC-EVD-016: Customer Admin sets who owns a requirement in a workspace. */
export async function setRequirementOwner(s: Session, workspaceId: string, requirementCode: string, ownerId: string | null): Promise<void> {
  await wait();
  mutate((db) => {
    const w = ws(db, s, workspaceId);
    if (s.user.role !== 'customer_admin') throw new MockApiError(403, 'Only a Customer Admin can set owners');
    const r = workspaceRequirements(db, w).find((x) => x.code === requirementCode)!;
    const before = db.requirementOwners.find((o) => o.workspaceId === w.id && o.requirementId === r.id)?.ownerUserId;
    db.requirementOwners = db.requirementOwners.filter((o) => !(o.workspaceId === w.id && o.requirementId === r.id));
    if (ownerId) db.requirementOwners.push({ workspaceId: w.id, requirementId: r.id, ownerUserId: ownerId, setBy: s.user.id, setAt: now() });
    const name = (id?: string) => (id ? db.users.find((u) => u.id === id)?.displayName : 'Nobody');
    audit(db, s, { tenantId: w.tenantId, action: 'Changed requirement owner', category: 'evidence', objectType: 'Requirement', objectId: r.id, objectLabel: r.code, previousValue: { owner: name(before) }, newValue: { owner: name(ownerId ?? undefined) } });
  });
}

