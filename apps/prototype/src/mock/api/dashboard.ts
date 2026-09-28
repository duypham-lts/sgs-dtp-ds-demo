// Home dashboards (designs/12-dashboard): one read model per audience, computed from the mock data so every
// number and every item follows the demo flows. Nothing here writes.
// - Customer Admin / Customer User / Customer Viewer: Main, CustomerUserHome, CustomerHomeEmpty
// - SGS Admin / SGS User: SgsAdminHome · SGS Consultant: ConsultantHome · SGS Auditor/Certification: AuditorHome
import { canReadWorkspace, canSeeRequest, visibleScopeIds, visibleTenantIds } from '../access';
import { requirementStatuses, validity, workspaceRequirements } from '../coverage';
import { SR_STATUS_EN } from '../labels';
import { consultantHref, customerHref, opsHref, SR_META } from '../requestMeta';
import { getDb } from '../store';
import { ROLE_LABEL, type MockDb, type Review, type ServiceRequest, type Session, type Workspace } from '../types';
import { FINDING_LABEL } from './audit';
import { workspaceRow } from './scopes';
import { copy, MockApiError, today, wait } from './core';

type Tone = 'completed' | 'under-review' | 'needs-description' | 'missing-info' | 'rejected' | 'draft' | 'info';
export interface Tile { value: number; label: string; sub: string; href: string }
export interface AttentionItem { id: string; tag: [Tone, string]; title: string; sub: string; cta: string; href: string }

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const day = (iso: string) => { const [, m, d] = iso.slice(0, 10).split('-').map(Number); return `${String(d).padStart(2, '0')} ${MON[m - 1]}`; };
const date = (iso: string) => `${day(iso)} ${iso.slice(0, 4)}`;
const range = (a?: string, b?: string) => {
  if (!a || !b) return '—';
  return a.slice(0, 7) === b.slice(0, 7) ? `${Number(a.slice(8, 10))} – ${Number(b.slice(8, 10))} ${MON[Number(b.slice(5, 7)) - 1]}` : `${day(a)} – ${day(b)}`;
};
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b.slice(0, 10)) - Date.parse(a.slice(0, 10))) / 86_400_000);
const waiting = (iso: string) => { const n = daysBetween(iso, today()); return n <= 0 ? 'Today' : n === 1 ? '1 day' : `${n} days`; };
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const nameOf = (db: MockDb, id?: string) => db.users.find((u) => u.id === id)?.displayName ?? '—';
const shortOrg = (name: string) => name.replace(/ (Co\., Ltd\.|Inc\.|JSC|LLC)$/, '');

/** Greeting of the dashboards, by the hour of the demo clock. */
export function greeting(nowIso: string): string {
  const h = Number(nowIso.slice(11, 13));
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

/* ---------------- Customer ---------------- */

/** Certification progress of a workspace (designs/12 "Certification progress" stepper). */
export type Stage = 0 | 1 | 2 | 3;
export const STAGES = ['Preparing', 'Requested', 'In audit', 'Certified'] as const;
const OPEN_CERT = new Set(['submitted', 'information_requested', 'assigned']);
function stageOf(db: MockDb, w: Workspace): Stage {
  const reqs = db.serviceRequests.filter((r) => r.category === 'certification' && r.workspaceId === w.id);
  if (w.status === 'audit_in_progress' || reqs.some((r) => r.status === 'in_progress')) return 2;
  if (reqs.some((r) => OPEN_CERT.has(r.status))) return 1;
  const t = today();
  if (db.certifications.some((c) => c.scopeId === w.scopeId && c.frameworkId === w.frameworkId && c.validTo >= t)) return 3;
  return 0;
}

export interface CustomerDashboard {
  kind: 'customer'; empty: boolean; greetingName: string; orgName: string; limited: boolean;
  tiles: Tile[]; attention: AttentionItem[];
  next?: { title: string; body: string; href: string; cta: string };
  groups?: { workspaceId: string; title: string; href: string; items: { code: string; title: string; progress: number }[] };
  workspaces: { id: string; title: string; scope: string; percent: number; provided: number; total: number; stage: Stage; href: string }[];
  requests: { id: string; service: string; status: [Tone, string]; href: string }[];
}

const OPEN_SR = new Set(['submitted', 'information_requested', 'assigned', 'in_progress', 'audit_completed']);
const serviceLabel = (r: ServiceRequest) => `${SR_META[r.category].label} · ${r.category === 'training' ? `${r.courseStd ?? ''} ${(r.course ?? '').replace(/ Training Course$/, '')}`.trim() : r.serviceFramework ?? r.title.split(' · ').pop()}`;
const srStatus = (r: ServiceRequest): [Tone, string] => {
  if (r.category === 'certification' && r.status === 'in_progress') return ['under-review', 'Audit in progress'];
  const row = SR_STATUS_EN[r.status];
  return [row[0], row[1]];
};

export async function getCustomerDashboard(s: Session): Promise<CustomerDashboard> {
  await wait();
  if (s.portal !== 'customer') throw new MockApiError(403, 'Customer dashboard');
  const db = getDb();
  const t = today();
  const scopes = visibleScopeIds(db, s);
  const tenant = db.tenants.find((x) => x.id === s.user.tenantId)!;
  const canWrite = s.user.role === 'customer_admin' || s.user.role === 'customer_user';
  const admin = s.user.role === 'customer_admin';

  const wss = db.workspaces.filter((w) => w.tenantId === tenant.id && canReadWorkspace(db, s, w));
  const rows = wss.map((w) => ({ w, row: workspaceRow(db, w), stage: stageOf(db, w) }));
  const reviews = db.reviews.filter((r) => r.tenantId === tenant.id && !r.closedAt && scopes.has(db.workspaces.find((w) => w.id === r.workspaceId)!.scopeId));
  const requests = db.serviceRequests.filter((r) => canSeeRequest(db, s, r) && r.status !== 'draft');
  const openRequests = requests.filter((r) => OPEN_SR.has(r.status)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const certs = db.certifications.filter((c) => c.tenantId === tenant.id && c.validTo >= t && scopes.has(c.scopeId)).sort((a, b) => a.validTo.localeCompare(b.validTo));

  // Needs your attention: review items first (they have audit due dates), then SGS questions, expiring evidence, invitations.
  const attention: (AttentionItem & { rank: number; due: string })[] = [];
  for (const rv of reviews) {
    const req = rv.requestId;
    const items = db.reviewItems.filter((x) => x.reviewId === rv.id);
    for (const x of items) {
      const q = db.requirements.find((y) => y.id === x.requirementId)!;
      for (const f of db.findings.filter((y) => y.itemId === x.id && y.status === 'open' && y.correctiveRequired))
        attention.push({ id: f.id, rank: 0, due: f.dueOn ?? '9999', tag: ['missing-info', 'Finding'], title: `Submit corrective action · ${q.code} ${q.title}`, sub: `Audit ${req} · ${FINDING_LABEL[f.classification]}${f.dueOn ? ` · ${f.dueOn < t ? 'overdue since' : 'due'} ${day(f.dueOn)}` : ''}`, cta: canWrite ? 'Respond' : 'Open', href: `/reviews/${rv.id}` });
      for (const c of db.clarifications.filter((y) => y.itemId === x.id && !y.answeredAt))
        attention.push({ id: c.id, rank: 0, due: c.dueOn, tag: ['needs-description', 'Clarification'], title: `Answer the auditor · ${q.code} ${q.title}`, sub: `Audit ${req} · ${c.dueOn < t ? 'overdue since' : 'due'} ${day(c.dueOn)}`, cta: canWrite ? 'Respond' : 'Open', href: `/reviews/${rv.id}` });
    }
  }
  for (const r of requests.filter((x) => x.status === 'information_requested')) {
    const ir = db.infoRequests.filter((x) => x.requestId === r.id && !x.answeredAt).sort((a, b) => b.askedAt.localeCompare(a.askedAt))[0];
    attention.push({ id: `ir-${r.id}`, rank: 1, due: ir?.dueOn ?? '9999', tag: ['missing-info', 'Action required'], title: `Answer SGS · ${r.id}`, sub: `${SR_META[r.category].label}${ir ? ` · ${ir.question.length > 70 ? `${ir.question.slice(0, 70)}…` : ir.question}` : ''}`, cta: canWrite ? 'Respond' : 'Open', href: customerHref(r.category, r.id) });
  }
  for (const { w, row } of rows) {
    const reqIds = new Set(workspaceRequirements(db, w).map((q) => q.id));
    for (const e of db.evidence.filter((x) => x.workspaceId === w.id && x.validUntil)) {
      const v = validity(e);
      if (v === 'ok') continue;
      const m = db.evidenceMappings.find((x) => x.evidenceId === e.id && reqIds.has(x.requirementId));
      const code = m ? db.requirements.find((q) => q.id === m.requirementId)!.code : undefined;
      attention.push({ id: e.id, rank: 2, due: e.validUntil!, tag: v === 'exp' ? ['missing-info', 'Expired'] : ['needs-description', 'Expires soon'], title: `${e.name} ${v === 'exp' ? 'expired on' : 'expires on'} ${date(e.validUntil!)}`,
        sub: [row.title.split(' · ').slice(0, 1).join(''), row.scopeName, code].filter(Boolean).join(' · '), cta: canWrite && w.status !== 'audit_in_progress' ? 'Upload new version' : 'Open',
        href: `/workspaces/${w.id}?${code ? `req=${encodeURIComponent(code)}&` : ''}evidence=${e.id}` });
    }
  }
  if (admin) {
    for (const u of db.users.filter((x) => x.tenantId === tenant.id && (x.status === 'invited' || x.status === 'expired'))) {
      const n = db.userScopes.filter((x) => x.userId === u.id).length;
      attention.push({ id: u.id, rank: 3, due: u.invitedAt ?? '9999', tag: u.status === 'expired' ? ['draft', 'Expired'] : ['under-review', 'Pending'], title: u.status === 'expired' ? `${u.displayName}’s invitation expired` : `${u.displayName} hasn’t activated the account yet`,
        sub: `Invited ${u.invitedAt ? date(u.invitedAt) : '—'} · ${u.role === 'customer_admin' ? 'all scopes' : plural(n, 'scope')}`, cta: 'Resend', href: `/admin/users/${u.id}` });
    }
  }
  attention.sort((a, b) => a.rank - b.rank || a.due.localeCompare(b.due));

  // Suggested next step: the preparing workspace furthest behind, else one ready to be certified.
  const preparing = rows.filter((x) => x.stage === 0 && x.w.status !== 'audit_in_progress').sort((a, b) => a.row.percent - b.row.percent);
  let next: CustomerDashboard['next'];
  const behind = preparing.find((x) => x.row.percent < 100);
  if (behind) {
    const st = requirementStatuses(db, behind.w);
    const reqs = workspaceRequirements(db, behind.w);
    const byGroup = new Map<string, { title: string; missing: number }>();
    for (const q of reqs) if (st.get(q.id) !== 'provided') { const g = byGroup.get(q.groupCode) ?? { title: q.groupTitle, missing: 0 }; g.missing += 1; byGroup.set(q.groupCode, g); }
    const first = [...byGroup.values()].sort((a, b) => b.missing - a.missing)[0];
    const missing = behind.row.total - behind.row.provided;
    next = { title: `${behind.row.fw.split(' · ')[0]} · ${behind.row.scopeName.replace(/ · Taipei$/, '')} is at ${behind.row.percent}%`, cta: 'Open workspace', href: `/workspaces/${behind.w.id}`,
      body: `${plural(missing, 'requirement')} still ${missing === 1 ? 'needs its' : 'need their'} mandatory evidence.${first ? ` Start with the ${first.title} requirements.` : ''}` };
  } else if (preparing.length) {
    const x = preparing[0];
    next = { title: `${x.row.title} · ${x.row.scopeName} has all mandatory evidence`, cta: 'Open workspace', href: `/workspaces/${x.w.id}`, body: 'When you are ready, request certification from the workspace. SGS auditors decide on compliance.' };
  }

  // Coverage by control group: the workspace in audit, else the one requested, else the most advanced one in preparation.
  const focus = rows.find((x) => x.stage === 2) ?? rows.find((x) => x.stage === 1) ?? [...preparing].sort((a, b) => b.row.percent - a.row.percent)[0];
  let groups: CustomerDashboard['groups'];
  if (focus) {
    const st = requirementStatuses(db, focus.w);
    const reqs = workspaceRequirements(db, focus.w);
    const codes = [...new Set(reqs.map((q) => q.groupCode))];
    groups = { workspaceId: focus.w.id, title: `${focus.row.title} · ${focus.row.scopeName}`, href: `/workspaces/${focus.w.id}`,
      items: codes.map((code) => { const g = reqs.filter((q) => q.groupCode === code); return { code, title: g[0].groupTitle, progress: Math.round((g.filter((q) => st.get(q.id) === 'provided').length / g.length) * 100) }; }) };
  }

  const count = (st: Stage) => rows.filter((x) => x.stage === st).length;
  const wsSub = [[2, 'in audit'], [1, 'requested'], [3, 'certified'], [0, 'preparing']].filter(([st]) => count(st as Stage)).map(([st, l]) => `${count(st as Stage)} ${l}`).join(' · ') || 'None yet';
  const needYou = attention.filter((a) => a.rank === 0);
  const auditIds = [...new Set(reviews.filter((rv) => needYou.some((a) => a.href === `/reviews/${rv.id}`)).map((rv) => rv.requestId))];
  const tiles: Tile[] = [
    { value: needYou.length, label: 'Review items to answer', sub: auditIds.length ? `Audit ${auditIds.join(', ')}` : 'Nothing waiting on you', href: needYou[0]?.href ?? '/reviews' },
    { value: rows.length, label: 'Workspaces', sub: wsSub, href: '/workspaces' },
    { value: openRequests.length, label: 'Service requests in progress', sub: (['gap_analysis', 'implementation_support', 'certification', 'training'] as const).filter((c) => openRequests.some((r) => r.category === c)).map((c) => SR_META[c].label).join(', ') || 'None open', href: '/service-requests' },
    { value: certs.length, label: certs.length === 1 ? 'Active certificate' : 'Active certificates', sub: certs[0] ? `${certs[0].frameworkLabel.split(/[:·]/)[0].trim()} · valid to ${date(certs[0].validTo)}` : 'None yet', href: '/certifications' },
  ];

  return copy({
    kind: 'customer', empty: admin && !db.scopes.some((x) => x.tenantId === tenant.id), greetingName: s.user.displayName.split(' ')[0], orgName: tenant.name,
    limited: s.user.role !== 'customer_admin', tiles, attention: attention.map(({ rank: _r, due: _d, ...a }) => a), next, groups,
    workspaces: rows.sort((a, b) => b.stage - a.stage || b.row.percent - a.row.percent).map(({ w, row, stage }) => ({ id: w.id, title: row.title, scope: row.scopeName, percent: row.percent, provided: row.provided, total: row.total, stage, href: `/workspaces/${w.id}` })),
    requests: openRequests.slice(0, 5).map((r) => ({ id: r.id, service: serviceLabel(r), status: srStatus(r), href: customerHref(r.category, r.id) })),
  });
}

/* ---------------- SGS Admin / SGS User ---------------- */

export interface SgsDashboard {
  kind: 'sgs'; tiles: Tile[];
  workload: { id: string; name: string; role: string; audits: number; consulting: number; training: number }[];
  onboarding: { id: string; name: string; since: string; tag: [Tone, string]; href: string }[];
  triage: { id: string; customer: string; service: string; waiting: string; cta: string; href: string }[];
  audits: { id: string; customer: string; workspace: string; auditor: string; reviewed: string; status: [Tone, string]; href: string }[];
}

function reviewState(db: MockDb, rv: Review) {
  const items = db.reviewItems.filter((x) => x.reviewId === rv.id);
  const ids = new Set(items.map((x) => x.id));
  const openClar = db.clarifications.filter((c) => ids.has(c.itemId) && !c.answeredAt).length;
  const findings = db.findings.filter((f) => f.reviewId === rv.id);
  const waitingOnCustomer = openClar + findings.filter((f) => f.status === 'open' && f.correctiveRequired).length;
  const toEvaluate = items.filter((x) => x.status === 'response_submitted').length + findings.filter((f) => f.status === 'response_submitted').length;
  const reviewed = items.filter((x) => x.status !== 'not_reviewed').length;
  const ready = items.length > 0 && items.every((x) => x.status === 'accepted' || x.status === 'closed_with_finding') && !findings.some((f) => f.status !== 'closed');
  return { total: items.length, reviewed, waitingOnCustomer, toEvaluate, ready, findings };
}
function workspaceLabel(db: MockDb, r: ServiceRequest, withTier = false) {
  const w = db.workspaces.find((x) => x.id === r.workspaceId);
  if (!w) return `${r.serviceFramework ?? ''}${r.scopeId ? ` · ${db.scopes.find((x) => x.id === r.scopeId)?.name ?? ''}` : ''}`;
  const f = db.frameworks.find((x) => x.id === w.frameworkId)!;
  const tier = f.tiers.find((x) => x.code === w.tier)?.label;
  return [f.shortName, db.scopes.find((x) => x.id === w.scopeId)!.name.replace(/ · Taipei$/, ''), withTier ? tier : undefined].filter(Boolean).join(' · ');
}

export async function getSgsDashboard(s: Session): Promise<SgsDashboard> {
  await wait();
  if (s.user.role !== 'sgs_admin' && s.user.role !== 'sgs_user') throw new MockApiError(403, 'SGS Admin or SGS User only');
  const db = getDb();
  const t = today();
  const tenantIds = visibleTenantIds(db, s);
  const tenants = db.tenants.filter((x) => tenantIds.has(x.id));
  const reqs = db.serviceRequests.filter((r) => tenantIds.has(r.tenantId) && r.status !== 'draft');
  const cust = (id: string) => db.tenants.find((x) => x.id === id)!.name;

  const submitted = reqs.filter((r) => r.status === 'submitted').sort((a, b) => (a.submittedAt ?? '').localeCompare(b.submittedAt ?? ''));
  const audits = reqs.filter((r) => r.category === 'certification' && ['assigned', 'in_progress', 'audit_completed'].includes(r.status));
  const openAudits = audits.filter((r) => r.status !== 'audit_completed');
  const ready = audits.filter((r) => r.status === 'audit_completed');
  const rvOf = (r: ServiceRequest) => db.reviews.filter((x) => x.requestId === r.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  const waitingOnCustomer = openAudits.filter((r) => { const rv = rvOf(r); return rv && !rv.closedAt && reviewState(db, rv).waitingOnCustomer > 0; }).length;

  const admins = (tid: string) => db.users.filter((u) => u.tenantId === tid && u.role === 'customer_admin' && u.status !== 'deactivated');
  const noActiveAdmin = tenants.filter((x) => !admins(x.id).some((u) => u.status === 'active'));
  const onboarding: SgsDashboard['onboarding'] = [];
  for (const x of [...tenants].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const a = admins(x.id);
    const active = a.find((u) => u.status === 'active');
    const invited = a.find((u) => u.status === 'invited' || u.status === 'expired');
    const hasScope = db.scopes.some((sc) => sc.tenantId === x.id);
    const created = daysBetween(x.createdAt, t);
    if (!a.length) onboarding.push({ id: x.id, name: x.name, since: created <= 0 ? 'Created today' : `Created ${date(x.createdAt)}`, tag: ['draft', 'No Customer Admin'], href: `/ops/customers/${x.id}` });
    else if (!active && invited) onboarding.push({ id: x.id, name: x.name, since: `Admin invited ${invited.invitedAt ? day(invited.invitedAt) : ''}`.trim(), tag: ['under-review', 'Admin not activated'], href: `/ops/customers/${x.id}` });
    else if (active && !hasScope) onboarding.push({ id: x.id, name: x.name, since: `Admin active since ${active.activatedAt ? day(active.activatedAt) : '—'}`, tag: ['needs-description', 'No scope yet'], href: `/ops/customers/${x.id}` });
  }

  const staff = db.users.filter((u) => u.affiliateId === s.user.affiliateId && u.status === 'active' && ['sgs_auditor', 'sgs_consultant', 'sgs_user'].includes(u.role));
  const workload = staff.map((u) => ({
    id: u.id, name: u.displayName, role: u.role === 'sgs_user' ? (u.title ?? ROLE_LABEL[u.role]) : ROLE_LABEL[u.role],
    audits: reqs.filter((r) => r.category === 'certification' && r.assigneeId === u.id && (r.status === 'assigned' || r.status === 'in_progress')).length,
    consulting: reqs.filter((r) => (r.category === 'gap_analysis' || r.category === 'implementation_support') && r.assigneeId === u.id && ['assigned', 'in_progress', 'information_requested'].includes(r.status)).length,
    training: reqs.filter((r) => r.category === 'training' && r.assigneeId === u.id && r.status === 'assigned').length,
  })).filter((x) => x.audits + x.consulting + x.training > 0 || db.users.find((u) => u.id === x.id)!.role !== 'sgs_user')
    .sort((a, b) => (b.audits + b.consulting + b.training) - (a.audits + a.consulting + a.training) || a.name.localeCompare(b.name));

  const oldest = submitted[0]?.submittedAt;
  const tiles: Tile[] = [
    { value: tenants.length, label: 'Active customers', sub: noActiveAdmin.length ? `${noActiveAdmin.length} without a Customer Admin yet` : 'All have a Customer Admin', href: '/ops/customers' },
    { value: submitted.length, label: 'Requests to triage', sub: oldest ? `Oldest waiting ${waiting(oldest) === 'Today' ? 'since today' : waiting(oldest)}` : 'Nothing waiting', href: '/ops/requests' },
    { value: openAudits.length, label: 'Audits open', sub: waitingOnCustomer ? `${waitingOnCustomer} waiting for the customer` : 'None waiting for the customer', href: '/ops/requests/certification?tab=run' },
    { value: ready.length, label: 'Ready for certificate', sub: ready.length ? `Audit closed · ${ready.map((r) => r.id).join(', ')}` : '—', href: '/ops/requests/certification?tab=cert' },
  ];
  const CTA: Record<string, string> = { certification: 'Assign auditor', training: 'Assign', gap_analysis: 'Review', implementation_support: 'Review' };
  return copy({
    kind: 'sgs', tiles, workload, onboarding,
    triage: submitted.map((r) => ({ id: r.id, customer: cust(r.tenantId), service: serviceLabel(r), waiting: waiting(r.submittedAt ?? r.updatedAt), cta: CTA[r.category], href: opsHref(r.category, r.id) })),
    audits: audits.map((r) => {
      const rv = rvOf(r);
      const st = rv && !rv.closedAt ? reviewState(db, rv) : undefined;
      const status: [Tone, string] = r.status === 'audit_completed' ? ['completed', 'Ready for certificate'] : r.status === 'assigned' ? ['info', 'Assigned'] : st?.ready ? ['completed', 'Ready to close'] : st?.waitingOnCustomer ? ['needs-description', 'Waiting for customer'] : ['under-review', 'In review'];
      const all = rv ? db.reviewItems.filter((x) => x.reviewId === rv.id) : [];
      return { id: r.id, customer: cust(r.tenantId), workspace: workspaceLabel(db, r), auditor: nameOf(db, r.assigneeId), reviewed: all.length ? `${all.filter((x) => x.status !== 'not_reviewed').length} / ${all.length}` : '—', status, href: opsHref('certification', r.id) };
    }),
  });
}

/* ---------------- SGS Consultant ---------------- */

export interface ConsultantDashboard {
  kind: 'consultant'; tiles: Tile[]; next: AttentionItem[];
  coming: { id: string; month: string; day: string; title: string; sub: string; href: string }[];
  assignments: { id: string; customer: string; workspace: string; dates: string; status: [Tone, string]; href: string }[];
}

export async function getConsultantDashboard(s: Session): Promise<ConsultantDashboard> {
  await wait();
  if (s.user.role !== 'sgs_consultant') throw new MockApiError(403, 'SGS Consultant only');
  const db = getDb();
  const t = today();
  const mine = db.serviceRequests.filter((r) => r.assigneeId === s.user.id && (r.category === 'gap_analysis' || r.category === 'implementation_support'));
  const active = mine.filter((r) => ['assigned', 'in_progress', 'information_requested'].includes(r.status)).sort((a, b) => (a.periodFrom ?? '9').localeCompare(b.periodFrom ?? '9'));
  const docs = (id: string, kind: string) => db.srDocuments.filter((d) => d.requestId === id && d.kind === kind).length;
  const reportDue = active.filter((r) => r.category === 'gap_analysis' && r.status === 'in_progress' && !docs(r.id, 'report'));
  const done = mine.filter((r) => r.status === 'completed' && (r.completedAt ?? '').slice(0, 4) === t.slice(0, 4));
  const cust = (r: ServiceRequest) => db.tenants.find((x) => x.id === r.tenantId)!.name;
  const n = (c: string) => active.filter((r) => r.category === c).length;

  const next: (AttentionItem & { rank: number })[] = [];
  for (const r of active.filter((x) => x.status === 'in_progress')) {
    if (r.category === 'gap_analysis') {
      if (docs(r.id, 'report')) continue;
      const visit = r.periodTo ? (r.periodTo < t ? `visit finished ${day(r.periodTo)}` : `on site ${range(r.periodFrom, r.periodTo)}`) : 'dates not agreed yet';
      next.push({ id: r.id, rank: r.periodTo && r.periodTo < t ? 0 : 2, tag: ['info', 'Report due'], title: `Upload the final report · ${r.id}`, sub: `${cust(r)} · ${visit}`, cta: 'Upload report', href: `${consultantHref(r.category, r.id)}?action=report` });
    } else {
      const shared = docs(r.id, 'deliverable');
      next.push({ id: r.id, rank: 1, tag: ['info', 'In progress'], title: `Share the next deliverable · ${r.id}`, sub: `${shortOrg(cust(r))} · ${shared ? `${plural(shared, 'deliverable')} shared so far` : 'nothing shared yet'}`, cta: 'Share deliverable', href: `${consultantHref(r.category, r.id)}?action=share` });
    }
  }
  for (const r of active.filter((x) => x.status === 'information_requested'))
    next.push({ id: r.id, rank: 3, tag: ['missing-info', 'Waiting for customer'], title: `Customer is answering your question · ${r.id}`, sub: `${cust(r)} · the request continues when they reply`, cta: 'Open', href: consultantHref(r.category, r.id) });

  next.sort((a, b) => a.rank - b.rank);
  const coming: (ConsultantDashboard['coming'][number] & { at: string })[] = [];
  for (const r of active) {
    const fw = r.serviceFramework ?? '';
    if (r.category === 'gap_analysis' && r.periodFrom && r.periodFrom >= t)
      coming.push({ id: `${r.id}-visit`, at: r.periodFrom, month: MON[Number(r.periodFrom.slice(5, 7)) - 1].toUpperCase(), day: String(Number(r.periodFrom.slice(8, 10))), title: `On site · ${shortOrg(cust(r))}`, sub: `${r.id} · ${fw} · ${range(r.periodFrom, r.periodTo)}`, href: consultantHref(r.category, r.id) });
    if (r.category === 'implementation_support' && r.periodTo && r.periodTo >= t)
      coming.push({ id: `${r.id}-end`, at: r.periodTo, month: MON[Number(r.periodTo.slice(5, 7)) - 1].toUpperCase(), day: String(Number(r.periodTo.slice(8, 10))), title: `Support period ends · ${shortOrg(cust(r))}`, sub: `${r.id} · ${fw}`, href: consultantHref(r.category, r.id) });
  }
  coming.sort((a, b) => a.at.localeCompare(b.at));

  return copy({
    kind: 'consultant',
    tiles: [
      { value: active.length, label: 'Assignments in progress', sub: `Gap Analysis ${n('gap_analysis')} · Implementation Support ${n('implementation_support')}`, href: '/ops/my-assignments/gap-analysis' },
      { value: reportDue.length, label: reportDue.length === 1 ? 'Report to upload' : 'Reports to upload', sub: reportDue.map((r) => r.id).join(', ') || '—', href: reportDue[0] ? `${consultantHref(reportDue[0].category, reportDue[0].id)}?action=report` : '/ops/my-assignments/gap-analysis' },
      { value: done.length, label: 'Completed this year', sub: 'Workspace access ended', href: '/ops/my-assignments/gap-analysis?tab=done' },
    ],
    next: next.map(({ rank: _r, ...x }) => x), coming: coming.map(({ at: _a, ...x }) => x),
    assignments: active.map((r) => ({ id: r.id, customer: cust(r), workspace: [SR_META[r.category].label, r.serviceFramework, db.scopes.find((x) => x.id === r.scopeId)?.name.replace(/ · Taipei$/, '')].filter(Boolean).join(' · '),
      dates: r.periodFrom && r.periodTo ? (r.category === 'gap_analysis' ? `On site ${range(r.periodFrom, r.periodTo)} ${r.periodTo.slice(0, 4)}` : `${date(r.periodFrom)} – ${date(r.periodTo)}`) : '—', status: srStatus(r), href: consultantHref(r.category, r.id) })),
  });
}

/* ---------------- SGS Auditor/Certification ---------------- */

export interface AuditorDashboard {
  kind: 'auditor'; tiles: Tile[]; attention: AttentionItem[];
  findings: { label: string; sub: string; value: number }[];
  audits: { id: string; customer: string; workspace: string; reviewed: string; toEvaluate: string; status: [Tone, string]; href: string }[];
}

export async function getAuditorDashboard(s: Session): Promise<AuditorDashboard> {
  await wait();
  if (s.user.role !== 'sgs_auditor') throw new MockApiError(403, 'SGS Auditor/Certification only');
  const db = getDb();
  const mine = db.serviceRequests.filter((r) => r.category === 'certification' && r.assigneeId === s.user.id && (r.status === 'assigned' || r.status === 'in_progress'));
  const cust = (r: ServiceRequest) => db.tenants.find((x) => x.id === r.tenantId)!.name;
  const reviews = db.reviews.filter((rv) => rv.auditorId === s.user.id && !rv.closedAt);
  const states = new Map(reviews.map((rv) => [rv.id, reviewState(db, rv)]));

  const attention: (AttentionItem & { at: string })[] = [];
  for (const rv of reviews) {
    const href = (code: string) => `/ops/audits/${rv.requestId}/review?item=${encodeURIComponent(code)}`;
    for (const f of db.findings.filter((x) => x.reviewId === rv.id && x.status === 'response_submitted')) {
      const a = f.actions[f.actions.length - 1];
      const code = db.requirements.find((q) => q.id === db.reviewItems.find((x) => x.id === f.itemId)!.requirementId)!.code;
      attention.push({ id: f.id, at: a?.submittedAt ?? f.raisedAt, tag: ['under-review', 'Response submitted'], title: `Evaluate corrective action · ${f.code} ${code}`, sub: `${rv.requestId} · ${nameOf(db, a?.submittedBy)} · submitted ${day(a?.submittedAt ?? f.raisedAt)}`, cta: 'Evaluate', href: href(code) });
    }
    for (const x of db.reviewItems.filter((y) => y.reviewId === rv.id && y.status === 'response_submitted')) {
      const c = db.clarifications.filter((y) => y.itemId === x.id && y.answeredAt).sort((a, b) => b.answeredAt!.localeCompare(a.answeredAt!))[0];
      if (!c) continue;
      const q = db.requirements.find((y) => y.id === x.requirementId)!;
      attention.push({ id: c.id, at: c.answeredAt!, tag: ['under-review', 'Response submitted'], title: `Evaluate answer · ${q.code} ${q.title}`, sub: `${rv.requestId} · ${nameOf(db, c.answeredBy)} · answered ${day(c.answeredAt!)}`, cta: 'Evaluate', href: href(q.code) });
    }
    if (states.get(rv.id)!.ready)
      attention.push({ id: `close-${rv.id}`, at: '0', tag: ['completed', 'Ready to close'], title: `Close the audit review · ${rv.requestId}`, sub: `${db.tenants.find((x) => x.id === rv.tenantId)!.name} · every item has a conclusion`, cta: 'Close review', href: `/ops/audits/${rv.requestId}/review` });
  }
  attention.sort((a, b) => b.at.localeCompare(a.at));
  for (const r of mine.filter((x) => x.status === 'assigned')) {
    const f = db.frameworks.find((x) => x.id === r.frameworkId);
    attention.push({ id: r.id, at: '', tag: ['info', 'Assigned'], title: `Start the audit review · ${r.id} ${f?.shortName ?? r.serviceFramework ?? ''}`.trim(), sub: `${cust(r)} · ${r.periodFrom ? `on site ${range(r.periodFrom, r.periodTo)}` : `preferred ${r.preferredPeriod ?? '—'}`}`, cta: 'Open request', href: `/ops/audits/${r.id}` });
  }

  const all = [...states.values()];
  const findings = all.flatMap((x) => x.findings);
  const open = findings.filter((f) => f.status !== 'closed');
  const first = reviews[0] && states.get(reviews[0].id)!;
  const readyCount = all.filter((x) => x.ready).length;
  const toEvaluate = all.reduce((a, x) => a + x.toEvaluate, 0);
  const minorToEval = open.filter((f) => f.classification === 'minor' && f.status === 'response_submitted').length;
  return copy({
    kind: 'auditor',
    tiles: [
      { value: toEvaluate, label: 'Responses to evaluate', sub: toEvaluate ? 'Customers have answered' : 'Nothing to evaluate', href: attention.find((a) => a.cta === 'Evaluate')?.href ?? '/ops/audits' },
      { value: reviews.length, label: reviews.length === 1 ? 'Review in progress' : 'Reviews in progress', sub: first ? `${first.reviewed} of ${first.total} reviewed` : '—', href: reviews[0] ? `/ops/audits/${reviews[0].requestId}/review` : '/ops/audits' },
      { value: mine.filter((r) => r.status === 'assigned').length, label: 'Assigned, not started', sub: 'Start when document review begins', href: '/ops/audits' },
      { value: readyCount, label: 'Ready to close', sub: readyCount ? reviews.filter((rv) => states.get(rv.id)!.ready).map((rv) => rv.requestId).join(', ') : '—', href: '/ops/audits' },
    ],
    attention: attention.map(({ at: _a, ...x }) => x),
    findings: [
      { label: 'Major nonconformity', sub: 'Blocks the certificate until closed', value: open.filter((f) => f.classification === 'major').length },
      { label: 'Minor nonconformity', sub: minorToEval ? `${minorToEval} with a corrective action to evaluate` : 'Corrective action required', value: open.filter((f) => f.classification === 'minor').length },
      { label: 'Waiting for the customer', sub: 'Clarifications and findings not answered yet', value: all.reduce((a, x) => a + x.waitingOnCustomer, 0) },
    ],
    audits: mine.map((r) => {
      const rv = reviews.find((x) => x.requestId === r.id);
      const st = rv ? states.get(rv.id)! : undefined;
      const status: [Tone, string] = !st ? ['info', 'Assigned · not started'] : st.ready ? ['completed', 'Ready to close'] : st.waitingOnCustomer ? ['needs-description', 'Waiting for customer'] : ['under-review', 'In review'];
      return { id: r.id, customer: cust(r), workspace: workspaceLabel(db, r, true), reviewed: st ? `${st.reviewed} / ${st.total}` : '—', toEvaluate: st?.toEvaluate ? String(st.toEvaluate) : '—', status, href: `/ops/audits/${r.id}` };
    }),
  });
}

