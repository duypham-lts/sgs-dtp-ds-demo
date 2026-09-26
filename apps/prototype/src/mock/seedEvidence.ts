// Evidence of the seeded workspaces. Files named in designs/05 are placed as drawn (Access control
// policy, pen test report expiring soon, expired vulnerability scan, an unlinked diagram…); the rest is
// generated so that each workspace reaches the coverage of the designs (e.g. 38 of 61 for Appendix 10 ·
// Customer data platform, 74 of 116 for ISO/IEC 27001 · Head office). Deterministic: same seed every time.
import { inTier } from './catalog';
import type { Evidence, EvidenceMapping, EvidenceVersion, MockDb, RequirementOwner } from './types';

interface Named {
  name: string; file: string; kb: number; by: string; at: string; validFrom?: string; validUntil?: string; codes: string[];
  older?: [string, string, string][]; // earlier versions: [file, by, at]
}
interface Plan { workspaceId: string; provided: number; named: Named[]; missing?: string[]; partial?: string[]; uploaders: string[]; owners?: Record<string, string> }

const PLANS: Plan[] = [
  { workspaceId: 'ws-a10-cdp', provided: 38, uploaders: ['u-wei', 'u-linh', 'u-kevin'], missing: ['R.1.1.3', 'R.1.3.1'], partial: ['R.7.1.1'],
    owners: { 'R.1.1.1': 'u-wei', 'R.1.1.3': 'u-wei', 'R.1.1.4': 'u-linh' },
    named: [
      { name: 'Access control policy', file: 'access-control-policy-v3.pdf', kb: 1200, by: 'u-wei', at: '2026-09-12T10:00:00+08:00', validFrom: '2026-09-12', validUntil: '2027-09-12', codes: ['R.1.1.1', 'R.1.2.1'],
        older: [['access-control-policy.docx', 'u-linh', '2025-11-10T09:00:00+08:00'], ['access-control-policy-v2.pdf', 'u-wei', '2026-02-03T09:00:00+08:00']] },
      { name: 'Penetration test report 2025', file: 'pentest-2025.pdf', kb: 3400, by: 'u-linh', at: '2025-10-30T15:00:00+08:00', validFrom: '2025-10-30', validUntil: '2026-10-30', codes: ['R.5.4.2'] },
      { name: 'Backup job log', file: 'backup-log-2026-08.csv', kb: 88, by: 'u-kevin', at: '2026-09-01T09:30:00+08:00', codes: ['R.3.1.2'] },
      { name: 'Vulnerability scan Q1', file: 'vuln-scan-2026Q1.pdf', kb: 920, by: 'u-wei', at: '2026-04-02T11:00:00+08:00', validFrom: '2026-04-01', validUntil: '2026-07-31', codes: ['R.5.4.1'] },
      { name: 'Old network diagram', file: 'network-2024.vsdx', kb: 640, by: 'u-mei', at: '2025-03-14T14:00:00+08:00', codes: [] },
      { name: 'Account review minutes Q2', file: 'account-review-2026Q2.docx', kb: 64, by: 'u-linh', at: '2026-07-02T16:00:00+08:00', validFrom: '2026-04-01', validUntil: '2026-06-30', codes: ['R.1.1.4'] },
      { name: 'Backup procedure', file: 'backup-procedure-v2.pdf', kb: 640, by: 'u-kevin', at: '2026-08-02T10:00:00+08:00', codes: ['R.3.1.3'] },
      { name: 'Source code scan report', file: 'sast-report-2026-08.pdf', kb: 820, by: 'u-wei', at: '2026-08-28T10:00:00+08:00', codes: ['R.5.3.4'] },
      { name: 'Log export hashing note', file: 'log-integrity-2026.pdf', kb: 120, by: 'u-wei', at: '2026-08-20T10:00:00+08:00', codes: ['R.2.6.2'] },
      { name: 'IAM configuration export', file: 'iam-config-2026-09.json', kb: 36, by: 'u-wei', at: '2026-09-15T10:00:00+08:00', codes: ['R.4.1.1'] },
      { name: 'Temporary account review', file: 'temp-accounts-2026-09.xlsx', kb: 48, by: 'u-wei', at: '2026-09-10T10:00:00+08:00', codes: ['R.1.1.2'] },
      { name: 'Log retention policy', file: 'log-retention-policy.pdf', kb: 410, by: 'u-linh', at: '2026-08-20T10:00:00+08:00', validUntil: '2027-08-20', codes: ['R.2.1.1'] },
      { name: 'TLS configuration report', file: 'tls-config-2026.pdf', kb: 220, by: 'u-kevin', at: '2026-09-05T10:00:00+08:00', codes: ['R.6.1.1'] },
    ] },
  { workspaceId: 'ws-27001-hq', provided: 74, uploaders: ['u-linh', 'u-wei', 'u-mei'], missing: [],
    named: [
      { name: 'Information security policy', file: 'isms-policy-v4.pdf', kb: 820, by: 'u-linh', at: '2026-01-15T10:00:00+08:00', validFrom: '2026-01-15', validUntil: '2027-01-15', codes: ['A.5.1'] },
      { name: 'Access control policy', file: 'access-control-policy-v3.pdf', kb: 1200, by: 'u-wei', at: '2026-09-12T10:05:00+08:00', validFrom: '2026-09-12', validUntil: '2027-09-12', codes: ['A.5.15', 'A.5.18'] },
      { name: 'Security awareness records 2025', file: 'awareness-2025.xlsx', kb: 150, by: 'u-mei', at: '2026-01-05T10:00:00+08:00', validUntil: '2025-12-31', codes: ['A.6.3'] },
    ] },
  { workspaceId: 'ws-22301-hq', provided: 6, uploaders: ['u-linh', 'u-mei'],
    named: [{ name: 'Business impact analysis', file: 'bia-2026.docx', kb: 300, by: 'u-linh', at: '2025-10-15T10:00:00+08:00', validUntil: '2026-10-15', codes: ['8.2'] }] },
  { workspaceId: 'ws-27701-cdp', provided: 16, uploaders: ['u-wei', 'u-linh'], named: [] },
  { workspaceId: 'ws-27701-loyalty', provided: 12, uploaders: ['u-linh'], named: [] },
  { workspaceId: 'ws-42001-ai', provided: 8, uploaders: ['u-linh'], named: [] },
  { workspaceId: 'ws-tisax-fab', provided: 50, uploaders: ['u-daniel'], named: [] },
];

function prng(seed: number) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const EXT = ['pdf', 'pdf', 'docx', 'xlsx', 'png'];

export function seedEvidence(db: Pick<MockDb, 'workspaces' | 'frameworks' | 'requirements' | 'expectedEvidence' | 'evidence' | 'evidenceVersions' | 'evidenceMappings' | 'requirementOwners'>) {
  let n = 0;
  for (const plan of PLANS) {
    const ws = db.workspaces.find((w) => w.id === plan.workspaceId);
    if (!ws) continue;
    const fw = db.frameworks.find((f) => f.id === ws.frameworkId)!;
    const reqs = db.requirements.filter((r) => r.frameworkId === fw.id && inTier(fw, r, ws.tier)).sort((a, b) => a.sortOrder - b.sortOrder);
    const byCode = new Map(reqs.map((r) => [r.code, r]));
    const eeOf = (reqId: string) => db.expectedEvidence.find((e) => e.requirementId === reqId)!;
    const status = new Map<string, 'provided' | 'partial'>();
    const add = (ev: Named, forceExpired = false) => {
      n += 1;
      const id = `ev-${n}`;
      const validUntil = forceExpired ? '2026-06-30' : ev.validUntil;
      db.evidence.push({ id, tenantId: ws.tenantId, workspaceId: ws.id, name: ev.name, currentVersion: (ev.older?.length ?? 0) + 1, validFrom: ev.validFrom, validUntil, scanState: 'clean', review: 'not_reviewed', createdBy: ev.older?.[0]?.[1] ?? ev.by, createdAt: ev.older?.[0]?.[2] ?? ev.at } satisfies Evidence);
      [...(ev.older ?? []), [ev.file, ev.by, ev.at] as [string, string, string]].forEach(([file, by, at], i) =>
        db.evidenceVersions.push({ id: `${id}-v${i + 1}`, evidenceId: id, versionNo: i + 1, fileName: file, sizeBytes: ev.kb * 1000, uploadedBy: by, uploadedAt: at } satisfies EvidenceVersion));
      for (const code of ev.codes) {
        const r = byCode.get(code);
        if (!r) continue; // requirement outside the tier of this workspace
        db.evidenceMappings.push({ id: `${id}-m-${code}`, evidenceId: id, workspaceId: ws.id, requirementId: r.id, expectedEvidenceId: eeOf(r.id).id, linkedBy: ev.by, linkedAt: ev.at } satisfies EvidenceMapping);
        const expired = !!validUntil && validUntil < '2026-09-25';
        if (!expired) status.set(code, 'provided');
        else if (status.get(code) !== 'provided') status.set(code, 'partial');
      }
    };
    plan.named.forEach((ev) => add(ev));
    const rnd = prng(plan.workspaceId.length * 7919 + plan.provided);
    const taken = new Set([...(plan.missing ?? []), ...(plan.partial ?? []), ...status.keys()]);
    const eeName = (code: string) => eeOf(byCode.get(code)!.id).name;
    const gen = (code: string, expired: boolean) => {
      const at = `2026-0${1 + Math.floor(rnd() * 8)}-${String(1 + Math.floor(rnd() * 27)).padStart(2, '0')}T10:00:00+08:00`;
      add({ name: eeName(code), file: `${slug(eeName(code))}.${EXT[Math.floor(rnd() * EXT.length)]}`, kb: 40 + Math.floor(rnd() * 2000), by: plan.uploaders[Math.floor(rnd() * plan.uploaders.length)], at,
        validUntil: rnd() < 0.5 ? `2027-${at.slice(5, 10)}` : undefined, codes: [code] }, expired);
    };
    (plan.partial ?? []).forEach((code) => byCode.has(code) && gen(code, true));
    const pool = reqs.map((r) => r.code).filter((c) => !taken.has(c));
    let provided = [...status.values()].filter((v) => v === 'provided').length;
    while (provided < plan.provided && pool.length) {
      const code = pool.splice(Math.floor(rnd() * pool.length), 1)[0];
      gen(code, false);
      provided += 1;
    }
    for (const [code, owner] of Object.entries(plan.owners ?? {})) {
      const r = byCode.get(code);
      if (r) db.requirementOwners.push({ workspaceId: ws.id, requirementId: r.id, ownerUserId: owner, setBy: 'u-linh', setAt: '2026-09-01T09:00:00+08:00' } satisfies RequirementOwner);
    }
  }
}
