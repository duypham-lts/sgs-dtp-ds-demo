'use client';
import { translate } from '@/i18n/locale';
// designs/08 AudMyAudits, AudRequest (+ AudStartReview), AudReview (+ modals), AudFindings. UC-REV-001…016.
import { Breadcrumb, Button, Card, CommentThread, DataTable, DocumentItem, PageHeader, RequirementNavigator, Skeleton, StatusTag, Tabs, Tag, type TableColumn } from '@sgs/graphite';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getDb } from '@/mock';
import { coverage } from '@/mock/coverage';
import { acceptItem, addNote, FINDING_LABEL, getReviewByRequest, ITEM_LABEL, type ClarificationView, type FindingView, type ItemView, type ReviewView } from '@/mock/api/audit';
import { getRequest, listRequests } from '@/mock/api/requests';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { AsideBox, Facts, TwoLine } from '@/ui/bits';
import { useFakeDownload } from '@/ui/download';
import { fmtDate, fmtUs, fsize } from '@/ui/format';
import { DetailLayout, ListLayout } from '@/ui/layout';
import { useSidebar } from '@/shell/ShellContext';
import { useSnackbar } from '@/ui/snackbar';
import { NotAllowed, NotFound } from '@/shell/NotAllowed';
import { Link } from '@sgs/graphite';
import { ChangeDueDateModal, ClarificationModal, CloseReviewModal, EvaluateAnswerDrawer, EvaluateDrawer, RaiseFindingModal, StartReviewModal } from './auditorModals';

const REVIEW_STATE: Record<ReviewView['state'], ['under-review' | 'needs-description' | 'completed', string]> = { in_review: ['under-review', 'In review'], waiting: ['needs-description', 'Waiting for customer'], ready: ['completed', 'Ready to close'], closed: ['completed', 'Closed'] };
export const RN_LABELS = Object.fromEntries(Object.entries({ none: ITEM_LABEL.not_reviewed, acc: ITEM_LABEL.accepted, clar: ITEM_LABEL.clarification_requested, find: ITEM_LABEL.finding_raised, resp: ITEM_LABEL.response_submitted, cwf: ITEM_LABEL.closed_with_finding }));
export const RN_KEY: Record<string, string> = { not_reviewed: 'none', accepted: 'acc', clarification_requested: 'clar', finding_raised: 'find', response_submitted: 'resp', closed_with_finding: 'cwf' };
export function reviewGroups(items: ItemView[]) {
  const groups: { id: string; code: string; title: string; progress: number; children: { id: string; code: string; title: string; status: string }[] }[] = [];
  for (const i of items) {
    let g = groups.find((x) => x.id === i.requirement.groupCode);
    if (!g) { g = { id: i.requirement.groupCode, code: i.requirement.groupCode, title: i.requirement.groupTitle, progress: 0, children: [] }; groups.push(g); }
    g.children.push({ id: i.requirement.code, code: i.requirement.code, title: i.requirement.title, status: RN_KEY[i.status] });
  }
  groups.forEach((g) => { g.progress = Math.round((g.children.filter((c) => c.status !== 'none').length / g.children.length) * 100); });
  return groups;
}

export function MyAuditsPage() {
  const { session } = usePersona();
  const q = useMockQuery(() => listRequests(session, 'certification'), [session.user.id]);
  const reviews = useMockQuery(async () => { const rows = await listRequests(session, 'certification'); const out: Record<string, ReviewView | undefined> = {}; for (const r of rows) out[r.id] = await getReviewByRequest(session, r.id); return out; }, [session.user.id]);
  if (session.user.role !== 'sgs_auditor') return <NotAllowed what="audits" />;
  const rows = (q.data ?? []).map((r) => ({ ...r, review: reviews.data?.[r.id] }));
  type Row = (typeof rows)[number];
  const stateOf = (r: Row) => (r.status === 'assigned' ? 'assigned' : r.review ? r.review.state : 'closed');
  const ST: Record<string, ['info' | 'under-review' | 'needs-description' | 'completed', string]> = { assigned: ['info', 'Assigned'], in_review: ['under-review', 'In review'], waiting: ['needs-description', 'Waiting for customer'], ready: ['completed', 'Ready to close'], closed: ['completed', 'Closed'] };
  const cols: TableColumn<Row>[] = [
    { key: 'id', header: 'Request', width: 130, render: (r) => <a href={`/ops/audits/${r.id}`} className="gr-link" style={{ fontWeight: 500 }}>{r.id}</a> },
    { key: 'customerName', header: 'Customer · workspace', render: (r) => <TwoLine top={r.customerName} sub={[r.serviceFrameworkVersion, r.scopeName, r.review?.tierLabel].filter(Boolean).join(' · ')} /> },
    { key: 'prog', header: 'Reviewed', align: 'end', width: 120, render: (r) => (r.review ? `${r.review.counts.reviewed} / ${r.review.counts.total}` : '—') },
    { key: 'open', header: 'Open items', width: 150, render: (r) => (r.review ? (r.review.closedAt ? '0' : `${r.review.counts.needYou + r.review.items.filter((i) => i.status === 'response_submitted').length}${r.review.counts.overdue ? ` · ${r.review.counts.overdue} overdue` : ''}`) : '—') },
    { key: 'status', header: 'Status', width: 200, render: (r) => <StatusTag status={ST[stateOf(r)][0]} size="sm" label={ST[stateOf(r)][1]} /> },
  ];
  const t = (f: (r: Row) => boolean) => <DataTable<Row> columns={cols} rows={rows.filter(f)} layout="table" paginate={false} getRowId={(r) => r.id} loading={q.loading && !q.data} />;
  const a = rows.filter((r) => r.status === 'assigned'), rv = rows.filter((r) => r.status === 'in_progress'), c = rows.filter((r) => ['audit_completed', 'certificate_issued'].includes(r.status));
  return (
    <ListLayout crumbs={[{ label: 'My audits' }]} title="My audits" description="Certification requests assigned to you. You can see a workspace only while its request is assigned to you.">
      <section className="gr-card gr-card--extend docs-card">
        <Tabs label="Audit status" defaultTab="r" tabs={[
          { id: 'a', label: 'Assigned', badge: a.length, content: t((r) => r.status === 'assigned') },
          { id: 'r', label: 'In review', badge: rv.length, content: t((r) => r.status === 'in_progress') },
          { id: 'c', label: 'Closed', badge: c.length, content: t((r) => ['audit_completed', 'certificate_issued'].includes(r.status)) },
        ]} />
      </section>
    </ListLayout>
  );
}

export function AuditRequestPage({ id }: { id: string }) {
  const { session } = usePersona();
  const router = useRouter();
  const q = useMockQuery(() => getRequest(session, id), [session.user.id, id]);
  const [start, setStart] = useState(false);
  if (session.user.role !== 'sgs_auditor') return <NotAllowed what="audits" />;
  if (q.error) return <NotFound what="audit" />;
  const r = q.data;
  if (!r) return <Skeleton lines={8} />;
  if (r.status !== 'assigned') { router.replace(`/ops/audits/${id}/review`); return null; }
  const db = getDb();
  const ws = db.workspaces.find((w) => w.id === r.workspaceId);
  const fw = ws && db.frameworks.find((f) => f.id === ws.frameworkId);
  const tier = fw?.tiers.find((t) => t.code === ws?.tier)?.label;
  return (
    <DetailLayout backHref="/ops/audits" sections={[{ id: 'st', label: 'Request' }, { id: 'bf', label: 'Before you start' }]}
      header={{ title: `${r.id} · ${r.frameworkLabel}`, subtitle: `${r.customerName} · ${r.scopeName} · ${r.certType?.toLowerCase()}`, status: { status: 'info', label: 'Assigned to you', shortLabel: 'Assigned' },
        actions: ws ? <Button size="md" onClick={() => setStart(true)}>{translate("Start audit review")}</Button> : undefined }}
      aside={<>
        <div className="title-medium">{translate("Customer")}</div>
        <AsideBox title={r.customerName}>
          <span className="body-small muted">Contact: {r.contact?.name ?? r.requester?.name}{r.contactTitle ? ` · ${r.contactTitle}` : ''}</span>
          {(r.contact ?? r.requester) ? <Link href={`mailto:${(r.contact ?? r.requester)!.email}`}>{(r.contact ?? r.requester)!.email}</Link> : null}
        </AsideBox>
      </>}>
      <div data-section="st"><Card number={1} title="Request" subtitle={`Submitted ${fmtDate(r.submittedAt)} by ${r.requester?.name}`}>
        <Facts items={[['Workspace', `${r.serviceFrameworkVersion} · ${r.scopeName}`], ['Tier', tier ?? 'No tiers'], ['Requirements', String(r.workspaceStats?.requirements ?? '—')],
          ['Evidence coverage', ws ? `${coverage(db, ws).percent}% (customer view)` : '—'], ['Preferred period', r.preferredPeriod ?? '—'], ['Message', r.message ?? '—']]} />
      </Card></div>
      <div data-section="bf" className="card-extend"><Card number={2} title="Before you start" extend>
        <ul className="body-medium plain-list">
          <li>{translate("Agree the audit dates and contract with the customer outside the platform.")}</li>
          <li>{translate("Starting the review creates one item per requirement and locks the workspace.")}</li>
        </ul>
      </Card></div>
      <StartReviewModal session={session} request={r} open={start} onClose={() => setStart(false)} onStarted={() => router.push(`/ops/audits/${id}/review`)} />
    </DetailLayout>
  );
}
function EvidenceList({ files }: { files: FindingView['files'] }) {
  const download = useFakeDownload();
  return <>{files.map((f) => <DocumentItem key={f.id} docType={f.name} fileName={f.fileName} dateLabel={`Uploaded ${fmtUs(f.uploadedAt)} by ${f.uploadedBy}`} size={fsize(f.sizeBytes)} actions={[{ type: 'view', label: `View ${f.fileName}`, onClick: () => download(f.fileName) }, { type: 'download', label: `Download ${f.fileName}`, onClick: () => download(f.fileName) }]} />)}</>;
}

export function AuditReviewPage({ requestId }: { requestId: string }) {
  useSidebar('collapsed');
  const { session } = usePersona();
  const router = useRouter();
  const params = useSearchParams();
  const snack = useSnackbar();
  const q = useMockQuery(() => getReviewByRequest(session, requestId), [session.user.id, requestId]);
  const [modal, setModal] = useState<{ kind: 'clar' | 'finding' | 'close' } | { kind: 'eval'; finding: FindingView } | { kind: 'answer'; c: ClarificationView } | { kind: 'due'; finding: FindingView }>();
  const rv = q.data;
  const groups = useMemo(() => (rv ? reviewGroups(rv.items) : []), [rv]);
  if (session.user.role !== 'sgs_auditor' && session.portal !== 'sgs-ops') return <NotAllowed what="audits" />;
  if (q.error) return <NotFound what="review" />;
  if (!rv && q.data === undefined && !q.loading) return <NotFound what="review" />;
  if (!rv) return <Skeleton lines={10} />;
  const code = params.get('item') ?? rv.items.find((i) => i.status === 'response_submitted')?.requirement.code ?? rv.items[0].requirement.code;
  const item = rv.items.find((i) => i.requirement.code === code) ?? rv.items[0];
  const setItem = (c: string) => router.replace(`/ops/audits/${requestId}/review?item=${c}`, { scroll: false });
  const act = rv.canAct;
  const st = REVIEW_STATE[rv.state];
  const tierOf = item.requirement.minTier ? getDb().frameworks.find((f) => f.id === item.requirement.frameworkId)?.tiers.find((t) => t.code === item.requirement.minTier)?.label : undefined;
  const openFinding = item.findings.find((f) => f.status !== 'closed');
  const pendingAnswer = item.clarifications.find((c) => c.answeredAt && item.status === 'response_submitted');
  const lastClar = item.clarifications[item.clarifications.length - 1];
  const statusLabel = rv.closedAt ? `Closed · ${rv.counts.total} of ${rv.counts.total} reviewed` : `${st[1]} · ${rv.counts.reviewed} of ${rv.counts.total} reviewed`;
  const correctiveFiles = item.findings.flatMap((f) => f.files);
  const lockedDate = fmtDate(rv.startedAt);
  return (
    <>
      <PageHeader title={`Audit review · ${rv.workspaceTitle}`} subtitle={`${rv.requestTitle} · ${rv.customerName} · ${rv.scopeName}`} onBack={() => router.push('/ops/audits')}
        status={{ status: st[0], label: statusLabel, shortLabel: st[1].split(' ')[0] }}
        actions={<div className="btn-row"><a href={`/ops/audits/${requestId}/findings`} className="gr-btn gr-btn--tertiary gr-btn--md">Findings ({rv.counts.findings})</a>
          {act ? <Button size="md" disabled={rv.state !== 'ready'} onClick={() => setModal({ kind: 'close' })}>{translate("Close review")}</Button> : null}</div>} />
      <div className="review-grid">
        <div className="ws-grid__nav">
          <RequirementNavigator label="Review items" groups={groups} defaultExpanded={[item.requirement.groupCode]} selected={item.requirement.code} onSelect={setItem} statusLabels={RN_LABELS}
            filterOptions={[{ value: 'all', label: 'All' }, { value: 'none', label: 'Not reviewed' }, { value: 'resp', label: 'Response submitted' }, { value: 'clar', label: 'Clarification' }, { value: 'find', label: 'Finding' }, { value: 'acc', label: 'Accepted' }]}
            framework={{ name: rv.workspaceTitle, progress: Math.round((rv.counts.reviewed / rv.counts.total) * 100), caption: `${rv.counts.reviewed} of ${rv.counts.total} reviewed · ${rv.counts.accepted} accepted · ${rv.counts.needYou} waiting for customer` }} />
        </div>
        <div className="ws-grid__main">
          <section className="gr-card">
            <Breadcrumb items={[{ label: `${item.requirement.groupCode} ${item.requirement.groupTitle}`, href: '#' }, ...(item.requirement.measureCode ? [{ label: `${item.requirement.measureCode} ${item.requirement.measureTitle}`, href: '#' }] : []), { label: item.requirement.code }]} />
            <div className="req-body__head" style={{ gap: 16 }}>
              <div className="two-line" style={{ gap: 4 }}><span className="body-small muted">{item.requirement.code}{tierOf ? ` · from ${tierOf}` : ''}</span><h2 className="headline-small" style={{ margin: 0 }}>{item.requirement.title}</h2></div>
              <StatusTag status={ITEM_LABEL[item.status][0]} label={ITEM_LABEL[item.status][1]} size="sm" />
            </div>
            <p className="body-medium" style={{ margin: 0 }}>{item.requirement.statement}</p>
            {act && item.status !== 'closed_with_finding' ? (
              <div className="btn-row" style={{ gap: 8 }}>
                <Button size="md" disabled={!!openFinding || item.status === 'accepted'} onClick={async () => { await acceptItem(session, item.id); snack(`${item.requirement.code} accepted`); }}>{translate("Accept")}</Button>
                <Button variant="secondary" size="md" disabled={!!openFinding} onClick={() => setModal({ kind: 'clar' })}>{translate("Request clarification")}</Button>
                <Button variant="secondary" size="md" disabled={!!openFinding} onClick={() => setModal({ kind: 'finding' })}>{translate("Raise finding")}</Button>
              </div>
            ) : null}
          </section>
          {item.findings.map((f) => (
            <section key={f.id} className="gr-card">
              <div className="gr-card__head">
                <div><h2 className="gr-card__title">Finding {f.code} · {FINDING_LABEL[f.classification]}</h2>
                  <p className="gr-card__sub">{f.status === 'response_submitted' ? `Corrective action submitted on ${fmtDate(f.actions[f.actions.length - 1]?.submittedAt)} · due ${fmtDate(f.dueOn).slice(0, 6)}` : f.status === 'closed' ? `Closed ${fmtDate(f.closedAt)}` : `Raised ${fmtDate(f.raisedAt)} by ${f.raisedByName}${f.dueOn ? ` · due ${fmtDate(f.dueOn)}${f.overdue ? ' · overdue' : ''}` : ''}`}</p></div>
                {act && f.status === 'response_submitted' ? <Button size="sm" onClick={() => setModal({ kind: 'eval', finding: f })}>{translate("Evaluate")}</Button>
                  : act && f.status === 'open' && f.dueOn ? <Button variant="tertiary" size="sm" onClick={() => setModal({ kind: 'due', finding: f })}>{translate("Change due date")}</Button> : null}
              </div>
              <span className="body-medium">{f.text}</span>
              {f.internalNote ? <span className="body-small muted">Internal note: {f.internalNote}</span> : null}
            </section>
          ))}
          {lastClar ? (
            <section className="gr-card">
              <div className="gr-card__head">
                <div><h2 className="gr-card__title">{translate("Clarification")}</h2><p className="gr-card__sub">Asked {fmtDate(lastClar.askedAt)} · {lastClar.answeredAt ? `answered ${fmtDate(lastClar.answeredAt)} by ${lastClar.answeredByName}` : `due ${fmtDate(lastClar.dueOn)}${lastClar.overdue ? ' · overdue' : ''}`}</p></div>
                {act && pendingAnswer && !openFinding ? <Button size="sm" onClick={() => setModal({ kind: 'answer', c: pendingAnswer })}>{translate("Evaluate answer")}</Button> : null}
              </div>
              <span className="body-medium">{lastClar.question}</span>
              {lastClar.answer ? <div className="note-box"><span className="body-small muted">{translate("Answer")}</span><span className="body-medium">{lastClar.answer}</span></div> : null}
            </section>
          ) : null}
          <section className="gr-card gr-card--extend">
            <div className="gr-card__head"><div className="gr-card__heading"><div><h2 className="gr-card__title">{translate("Evidence")}</h2><p className="gr-card__sub">{rv.closedAt ? 'As reviewed' : `Locked · as submitted on ${lockedDate}`}</p></div></div></div>
            {item.evidence.length || correctiveFiles.length ? <EvidenceList files={[...item.evidence.filter((e) => !correctiveFiles.some((c) => c.id === e.id)), ...correctiveFiles]} /> : <p className="body-medium muted" style={{ margin: 0 }}>{translate("No evidence for this requirement.")}</p>}
          </section>
        </div>
        <div className="review-grid__notes">
          <CommentThread title="Internal notes" currentUser={session.user.displayName} currentRole="sgs" readOnly={!act} placeholder="Add a note — only SGS can see it"
            emptyTitle="No internal notes yet" emptyBody="Notes here are never shown to the customer."
            messages={rv.notes.map((n) => ({ id: n.id, author: n.author, role: 'sgs' as const, roleLabel: 'Auditor', internal: true, time: `${fmtDate(n.at).slice(0, 6)}, ${n.at.slice(11, 16)}`, body: n.body }))}
            onSend={async (text) => { await addNote(session, rv.id, text); }} />
        </div>
      </div>
      <ClarificationModal session={session} item={modal?.kind === 'clar' ? item : undefined} onClose={() => setModal(undefined)} />
      <RaiseFindingModal session={session} item={modal?.kind === 'finding' ? item : undefined} onClose={() => setModal(undefined)} />
      <EvaluateDrawer session={session} finding={modal?.kind === 'eval' ? modal.finding : undefined} onClose={() => setModal(undefined)} />
      <EvaluateAnswerDrawer session={session} item={item} clarification={modal?.kind === 'answer' ? modal.c : undefined} onClose={() => setModal(undefined)} onRaiseFinding={() => setModal({ kind: 'finding' })} />
      <ChangeDueDateModal session={session} finding={modal?.kind === 'due' ? modal.finding : undefined} onClose={() => setModal(undefined)} />
      <CloseReviewModal session={session} review={rv} open={modal?.kind === 'close'} onClose={() => setModal(undefined)} />
    </>
  );
}

export function AuditFindingsPage({ requestId }: { requestId: string }) {
  useSidebar('collapsed');
  const { session } = usePersona();
  const router = useRouter();
  const q = useMockQuery(() => getReviewByRequest(session, requestId), [session.user.id, requestId]);
  const rv = q.data;
  if (q.error) return <NotFound what="review" />;
  if (!rv) return <Skeleton lines={8} />;
  const rows = rv.items.flatMap((i) => i.findings).sort((a, b) => b.code.localeCompare(a.code));
  const ST: Record<string, ['missing-info' | 'under-review' | 'completed', string]> = { open: ['missing-info', 'Open'], response_submitted: ['under-review', 'Response submitted'], closed: ['completed', 'Closed'] };
  const st = REVIEW_STATE[rv.state];
  const cols: TableColumn<FindingView>[] = [
    { key: 'code', header: 'Finding', width: 90, render: (r) => <span style={{ fontWeight: 500 }}>{r.code}</span> },
    { key: 'req', header: 'Requirement', render: (r) => <span className="two-line"><a href={`/ops/audits/${requestId}/review?item=${r.requirementCode}`} className="gr-link">{r.requirementCode}</a><span className="body-small two-line__sub">{r.requirementTitle}</span></span> },
    { key: 'cl', header: 'Classification', width: 200, render: (r) => FINDING_LABEL[r.classification] },
    { key: 'due', header: 'Due', width: 150, render: (r) => (r.overdue ? <Tag tone="required">{`${fmtDate(r.dueOn)} · overdue`}</Tag> : r.dueOn ? fmtDate(r.dueOn) : '—') },
    { key: 'status', header: 'Status', width: 180, render: (r) => <StatusTag status={ST[r.status][0]} size="sm" label={ST[r.status][1]} /> },
  ];
  return (
    <>
      <PageHeader title={`Findings · ${rv.requestTitle}`} subtitle={`Audit review · ${rv.frameworkShort} · ${rv.scopeName}`} onBack={() => router.push(`/ops/audits/${requestId}/review`)} status={{ status: st[0], label: `${st[1]} · ${rv.counts.reviewed} of ${rv.counts.total} reviewed`, shortLabel: st[1] }} />
      <section className="gr-card gr-card--extend docs-card">
        <DataTable<FindingView> title={`${rows.length} finding${rows.length === 1 ? '' : 's'}`} columns={cols} rows={rows} layout="table" paginate={false} getRowId={(r) => r.id}
          emptyState={{ title: 'No findings', body: 'Findings you raise during the review are listed here.' }} />
      </section>
    </>
  );
}

