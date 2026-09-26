// Framework management (UC-FWK-001/002/009/013, designs/04). SGS Admin imports, activates and discards;
// other SGS roles read. Customers only see active versions (module 05, LinkFramework).
// Import is simulated: the prototype cannot read Excel files, so the checker looks at the file name.
// A name with "bcm" gives the errors of designs/04 FwErrors; any other .xlsx is treated as the sample file
// of designs/04 (Appendix 10, amended version).
import { getDb, mutate } from '../store';
import { inTier } from '../catalog';
import type { ExpectedEvidence, Framework, MockDb, Requirement, Session } from '../types';
import { audit, copy, MockApiError, now, wait } from './core';

export interface TierRow { code: string; label: string; rank: number; added: number; total: number }
export interface FrameworkSummary extends Framework { importedByName?: string; activatedByName?: string }
export interface FrameworkDetail extends FrameworkSummary {
  tierRows: TierRow[]; counts: { groups: number; measures: number; requirements: number; evidence: number };
  requirements: Requirement[]; evidence: ExpectedEvidence[]; versions: FrameworkSummary[];
}
export interface ImportError { sheet: string; row: number; column: string; problem: string }
export type ImportResult = { ok: true; frameworkId: string } | { ok: false; fileName: string; errors: ImportError[] };

const isSgs = (s: Session) => s.portal === 'sgs-ops';
const assertAdmin = (s: Session) => { if (s.user.role !== 'sgs_admin') throw new MockApiError(403, 'Only an SGS Admin can manage frameworks'); };

function summary(db: MockDb, f: Framework): FrameworkSummary {
  return { ...f, importedByName: db.users.find((u) => u.id === f.importedBy)?.displayName, activatedByName: db.users.find((u) => u.id === f.activatedBy)?.displayName };
}

export function tierRows(f: Framework): TierRow[] {
  return f.tiers.map((t, i) => ({ code: t.code, label: t.label, rank: t.rank, total: t.total, added: t.total - (i ? f.tiers[i - 1].total : 0) }));
}

export async function listFrameworks(s: Session): Promise<FrameworkSummary[]> {
  await wait();
  const db = getDb();
  const rows = db.frameworks.filter((f) => f.status !== 'discarded' && (isSgs(s) || f.status === 'active'));
  // Drafts first, then by code and newest version.
  return copy(rows.map((f) => summary(db, f)).sort((a, b) => (a.status === 'draft' ? -1 : 0) - (b.status === 'draft' ? -1 : 0) || a.code.localeCompare(b.code) || b.updatedAt.localeCompare(a.updatedAt)));
}

export async function getFramework(s: Session, id: string): Promise<FrameworkDetail> {
  await wait();
  const db = getDb();
  const f = db.frameworks.find((x) => x.id === id && x.status !== 'discarded');
  if (!f || (!isSgs(s) && f.status !== 'active')) throw new MockApiError(404, 'Framework not found');
  const requirements = db.requirements.filter((r) => r.frameworkId === id).sort((a, b) => a.sortOrder - b.sortOrder);
  const ids = new Set(requirements.map((r) => r.id));
  const evidence = db.expectedEvidence.filter((e) => ids.has(e.requirementId));
  return copy({
    ...summary(db, f), tierRows: tierRows(f), requirements, evidence,
    counts: { groups: new Set(requirements.map((r) => r.groupCode)).size, measures: new Set(requirements.map((r) => r.measureCode).filter(Boolean)).size, requirements: requirements.length, evidence: evidence.length },
    versions: db.frameworks.filter((x) => x.code === f.code && x.status !== 'discarded').map((x) => summary(db, x)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  });
}

/** Requirements of a framework for one tier (all when the framework has no tiers). */
export function requirementsFor(db: MockDb, frameworkId: string, tier?: string): Requirement[] {
  const f = db.frameworks.find((x) => x.id === frameworkId)!;
  return db.requirements.filter((r) => r.frameworkId === frameworkId && inTier(f, r, tier)).sort((a, b) => a.sortOrder - b.sortOrder);
}

const BCM_ERRORS: ImportError[] = [
  { sheet: 'Requirements', row: 24, column: 'parent_requirement_code', problem: '“8.9” does not exist in this sheet.' },
  { sheet: 'Requirements', row: 41, column: 'requirement_code', problem: '“R.8.4.2” is used twice (rows 40 and 41).' },
  { sheet: 'Expected_Evidence', row: 12, column: 'requirement_code', problem: '“8.4” is a grouping row. Evidence must point to an assessable requirement.' },
];

/** "Check file": validates everything first; nothing is saved when there is an error (UC-FWK-009). */
export async function checkImportFile(s: Session, file: { name: string; size: number }): Promise<ImportResult> {
  await wait();
  assertAdmin(s);
  if (!/\.xlsx$/i.test(file.name)) return { ok: false, fileName: file.name, errors: [{ sheet: '—', row: 0, column: '—', problem: 'Only Excel (.xlsx) files made from the template can be imported.' }] };
  if (/bcm/i.test(file.name)) return { ok: false, fileName: file.name, errors: BCM_ERRORS };
  let id = 'fw-a10-amended';
  let error: ImportError | undefined;
  mutate((db) => {
    const f = db.frameworks.find((x) => x.id === id)!;
    if (f.status === 'active') { error = { sheet: 'Framework', row: 2, column: 'framework_version', problem: `“${f.versionFull}” is already active. Use a new version name to import changes.` }; return; }
    // Re-importing replaces the draft (or brings back a discarded one).
    Object.assign(f, { status: 'draft', sourceFile: file.name, importedBy: s.user.id, updatedAt: now() });
    audit(db, s, { tenantId: null, action: 'Imported framework draft', category: 'frameworks', objectType: 'Framework', objectId: f.id, objectLabel: `${f.shortName} · ${f.version}`, context: file.name });
    id = f.id;
  });
  return error ? { ok: false, fileName: file.name, errors: [error] } : { ok: true, frameworkId: id };
}

export async function activateFramework(s: Session, id: string): Promise<void> {
  await wait();
  assertAdmin(s);
  mutate((db) => {
    const f = db.frameworks.find((x) => x.id === id);
    if (!f || f.status !== 'draft') throw new MockApiError(409, 'Only a draft can be activated');
    Object.assign(f, { status: 'active', activatedAt: now(), activatedBy: s.user.id, updatedAt: now() });
    audit(db, s, { tenantId: null, action: 'Activated framework', category: 'frameworks', objectType: 'Framework', objectId: id, objectLabel: `${f.shortName} · ${f.version}`, previousValue: { status: 'draft' }, newValue: { status: 'active' } });
  });
}

export async function discardDraft(s: Session, id: string): Promise<void> {
  await wait();
  assertAdmin(s);
  mutate((db) => {
    const f = db.frameworks.find((x) => x.id === id);
    if (!f || f.status !== 'draft') throw new MockApiError(409, 'Only a draft can be discarded');
    f.status = 'discarded';
    f.updatedAt = now();
    audit(db, s, { tenantId: null, action: 'Discarded framework draft', category: 'frameworks', objectType: 'Framework', objectId: id, objectLabel: `${f.shortName} · ${f.version}` });
  });
}
