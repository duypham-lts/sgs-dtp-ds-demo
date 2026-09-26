// Evidence coverage (docs/prototype-plan.md §3.3). Per requirement of the workspace tier:
// - Provided: every mandatory expected-evidence item has at least one linked file that is scanned and valid;
// - Partial: something is linked, but a mandatory item only has expired or still-scanning files;
// - Missing: nothing linked.
// Coverage = provided ÷ requirements of the tier. It is preparation progress, never a compliance decision.
import { inTier } from './catalog';
import { TODAY } from './seed';
import type { Evidence, MockDb, Requirement, Workspace } from './types';

export type ReqStatus = 'missing' | 'partial' | 'provided';
export const REQ_STATUS_LABEL: Record<ReqStatus, ['missing-info' | 'needs-description' | 'completed', string]> = {
  missing: ['missing-info', 'Missing'], partial: ['needs-description', 'Partial'], provided: ['completed', 'Provided'],
};

/** Valid / Expires soon / Expired (designs/05 Documents). */
// TODO(docs/prototype-plan.md §3.3): "soon" is not defined; designs/05 shows 35 days as "Expires soon", so 60 days.
export const EXPIRES_SOON_DAYS = 60;
export type Validity = 'ok' | 'soon' | 'exp';
export function validity(e: Pick<Evidence, 'validUntil'>): Validity {
  if (!e.validUntil) return 'ok';
  if (e.validUntil < TODAY) return 'exp';
  const days = (Date.parse(e.validUntil) - Date.parse(TODAY)) / 86_400_000;
  return days <= EXPIRES_SOON_DAYS ? 'soon' : 'ok';
}
const usable = (e: Evidence) => e.scanState === 'clean' && validity(e) !== 'exp';

export function workspaceRequirements(db: MockDb, ws: Workspace): Requirement[] {
  const fw = db.frameworks.find((f) => f.id === ws.frameworkId)!;
  return db.requirements.filter((r) => r.frameworkId === fw.id && inTier(fw, r, ws.tier)).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function requirementStatuses(db: MockDb, ws: Workspace): Map<string, ReqStatus> {
  const out = new Map<string, ReqStatus>();
  const maps = db.evidenceMappings.filter((m) => m.workspaceId === ws.id);
  const evidence = new Map(db.evidence.filter((e) => e.workspaceId === ws.id).map((e) => [e.id, e]));
  for (const r of workspaceRequirements(db, ws)) {
    const items = db.expectedEvidence.filter((x) => x.requirementId === r.id && x.mandatory);
    const linked = maps.filter((m) => m.requirementId === r.id);
    if (!linked.length) { out.set(r.id, 'missing'); continue; }
    const ok = items.every((it) => linked.some((m) => m.expectedEvidenceId === it.id && evidence.get(m.evidenceId) && usable(evidence.get(m.evidenceId)!)));
    out.set(r.id, ok ? 'provided' : 'partial');
  }
  return out;
}

export interface Coverage { provided: number; total: number; percent: number }
export function coverage(db: MockDb, ws: Workspace): Coverage {
  const st = requirementStatuses(db, ws);
  const provided = [...st.values()].filter((v) => v === 'provided').length;
  const total = st.size;
  return { provided, total, percent: total ? Math.round((provided / total) * 100) : 0 };
}
