'use client';
import { translate } from '@/i18n/locale';
// designs/06 MvpDetailSubmitted / Progress / Completed / Rejected; 07 IsDetail*. UC-SRQ-003/004/010.
// Withdraw (D4) sits in the header menu while SGS has not started; an open information request (D3)
// shows the answer panel on top. Copy promising email is replaced by in-portal notifications (Q12).
import { Button, Card, EmptyState, InlineNotification, OverflowMenu, Skeleton } from '@sgs/graphite';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SR_STATUS } from '@/mock/labels';
import { DELIVERY_LABEL, SR_META } from '@/mock/requestMeta';
import { fmtRange, getRequest, requestAgain, type RequestView } from '@/mock/api/requests';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { AsideBox, Facts, Timeline } from '@/ui/bits';
import { fmtDate } from '@/ui/format';
import { DetailLayout } from '@/ui/layout';
import { NotFound } from '@/shell/NotAllowed';
import { HelpBox, Note, PersonBox, RespondPanel, SgsDocs, SupportTags } from './parts';
import { WithdrawModal } from './modals';
import type { ConsultingCategory } from './config';

const HEADER: Record<string, string> = { submitted: 'Submitted · waiting for SGS', information_requested: 'Action required · SGS needs information', in_progress: 'In progress' };

export function CustomerConsultingDetail({ id, category }: { id: string; category: ConsultingCategory }) {
  const { session } = usePersona();
  const router = useRouter();
  const q = useMockQuery(() => getRequest(session, id), [session.user.id, id]);
  const [withdraw, setWithdraw] = useState(false);
  if (q.error) return <NotFound what="request" />;
  const r = q.data;
  if (!r) return <Skeleton lines={10} />;
  if (r.category !== category) { router.replace(`/service-requests/${SR_META[r.category].slug}/${r.id}`); return null; }
  const ga = category === 'gap_analysis';
  const st = SR_STATUS[r.status];
  const status = { status: st[0], label: HEADER[r.status] ?? st[1], shortLabel: st[1] };
  const menu = r.can.withdraw ? <OverflowMenu size="md" label="Request actions" items={[{ label: 'Withdraw request', danger: true, onClick: () => setWithdraw(true) }]} /> : undefined;
  const scope = r.scopeName ?? '—';
  const again = async () => { const d = await requestAgain(session, r.id); router.push(`/service-requests/${SR_META[category].slug}/new?draft=${d}&step=2`); };
  const facts = requestFacts(r, ga);
  const submittedSub = `Submitted ${fmtDate(r.submittedAt)} by ${r.requester?.name}`;
  const inProgress = r.status === 'in_progress' || r.previousStatus === 'in_progress';

  const aside = (
    <>
      <div className="title-medium">{translate("SGS Requests & Communications")}</div>
      {r.status === 'submitted' ? <InlineNotification kind="info" title="SGS is reviewing your request">{translate("SGS will accept or decline it and let you know in the portal.")}</InlineNotification> : null}
      {r.status === 'information_requested' ? <InlineNotification kind="warning" title="SGS is waiting for you">{translate("Answer the question on this page. Nothing moves until you reply.")}</InlineNotification> : null}
      {r.status === 'withdrawn' ? <InlineNotification kind="info" title={`Withdrawn on ${fmtDate(r.withdrawnAt)}`}>SGS stopped reviewing this request.{r.withdrawReason ? ` Reason: ${r.withdrawReason}.` : ''}</InlineNotification> : null}
      {r.status === 'completed' ? <InlineNotification kind="success" title={`Completed on ${fmtDate(r.completedAt)}`}>{ga ? 'The report is final. Consultant access to your workspace has ended.' : 'Deliverables stay available here. Consultant access to your workspace has ended.'}</InlineNotification> : null}
      {r.assignee && r.status !== 'rejected' ? <PersonBox title="Your SGS consultant" person={r.assignee} /> : null}
      {r.assignee && inProgress && r.workspaceLabel ? (
        <AsideBox title="Workspace access"><span className="body-small muted">{r.assignee.name} can view and download evidence in your {r.workspaceLabel} workspace until {ga ? 'the report is delivered' : 'the request is completed'}.{ga ? '' : ' They can’t change your evidence.'} Every view and download is recorded.</span></AsideBox>
      ) : null}
      <HelpBox />
    </>
  );

  const common = { backHref: `/service-requests/${SR_META[category].slug}`, aside, header: { title: `${r.id} · ${r.frameworkLabel}`, subtitle: `${SR_META[category].label} · ${scope.replace(' · ', ', ')}`, status, actions: menu } };
  const history = (n: number) => <div data-section="hist" className="card-extend"><Card number={n} title="History" extend><Timeline steps={r.timeline} /></Card></div>;

  let body: React.ReactNode;
  let sections: { id: string; label: string; status?: 'complete' }[];
  if (r.status === 'rejected') {
    sections = [{ id: 'ov', label: ga ? 'Decision' : 'Status' }, { id: 'rq', label: 'Request' }, { id: 'hist', label: 'History' }];
    body = (<>
      <div data-section="ov"><Card number={1} title={ga ? 'Decision' : 'Status'} subtitle={`Rejected by SGS on ${fmtDate(r.rejectedAt)}`}>
        <InlineNotification kind="error" title={`Reason: ${r.rejectReason}`}>{r.rejectMessage}</InlineNotification>
        {r.can.requestAgain ? <div><Button size="md" icon="add" iconPosition="left" onClick={again}>{translate("Request again")}</Button></div> : null}
      </Card></div>
      <div data-section="rq"><Card number={2} title="Request" subtitle={submittedSub}><Facts items={facts} /></Card></div>
      {history(3)}
    </>);
  } else if (ga) {
    const done = r.status === 'completed';
    sections = done ? [{ id: 'rep', label: 'Report', status: 'complete' }, { id: 'ov', label: 'Overview', status: 'complete' }, { id: 'hist', label: 'History' }] : [{ id: 'ov', label: 'Overview', status: 'complete' }, { id: 'rep', label: 'Report' }, { id: 'hist', label: 'History' }];
    const report = (n: number) => (
      <div data-section="rep"><Card number={n} title="Report" subtitle={done ? `Delivered ${fmtDate(r.completedAt)} by ${r.assignee?.name}` : undefined}>
        {done ? <><SgsDocs docs={r.documents} kinds={['report', 'attachment']} />{r.closingNote ? <Note label={`Note from ${r.assignee?.name}`}>{r.closingNote}</Note> : null}</>
          : inProgress ? <EmptyState size="sm" title="Report in preparation" body={`${r.assignee?.name} uploads the report when the gap analysis is finished. You’ll be notified in the portal.`} />
          : <EmptyState size="sm" title="No report yet" body="The report from your SGS consultant appears here when the gap analysis is completed." />}
      </Card></div>
    );
    const overview = (n: number) => (
      <div data-section="ov"><Card number={n} title="Overview" subtitle={done ? undefined : r.approvedAt ? `Submitted ${fmtDate(r.submittedAt)} · approved ${fmtDate(r.approvedAt)}` : submittedSub}><Facts items={facts} /></Card></div>
    );
    body = done ? <>{report(1)}{overview(2)}{history(3)}</> : <>{overview(1)}{report(2)}{history(3)}</>;
  } else {
    const hasDel = r.approvedAt || r.status === 'completed';
    sections = [{ id: 'st', label: 'Status' }, { id: 'rq', label: 'Request' }, ...(hasDel ? [{ id: 'del', label: 'Deliverables' }] : []), { id: 'hist', label: 'History' }];
    const deliverables = r.documents.filter((d) => d.kind === 'deliverable' || d.kind === 'closing');
    body = (<>
      <div data-section="st"><Card number={1} title="Status" subtitle={r.status === 'completed' ? `Completed ${fmtDate(r.completedAt)} by ${r.assignee?.name}` : r.approvedAt ? `In progress since ${fmtDate(r.approvedAt)}` : submittedSub}>
        {r.status === 'completed' && r.closingNote ? <Note label={`Closing summary from ${r.assignee?.name}`}>{r.closingNote}</Note>
          : r.approvedAt ? <Facts items={[['SGS consultant', r.assignee?.name ?? '—'], ['Period', fmtRange(r.periodFrom, r.periodTo)], ['Deliverables shared', deliverables.length ? `${deliverables.length} · latest on ${fmtDate(deliverables[0].uploadedAt)}` : 'None yet'], ...(r.sgsMessage ? [['Message from SGS', r.sgsMessage] as [string, string]] : [])]} />
          : <p className="body-medium muted" style={{ margin: 0 }}>{translate("SGS reviews the request and assigns a consultant.")}</p>}
      </Card></div>
      <div data-section="rq"><Card number={2} title="Request" subtitle={submittedSub}><Facts items={facts} /></Card></div>
      {hasDel ? <div data-section="del"><Card number={3} title="Deliverables" subtitle="Review and approve these documents, then upload the approved version to your workspace as evidence.">
        {deliverables.length ? <SgsDocs docs={r.documents} kinds={['deliverable', 'closing']} verb="Shared" /> : <EmptyState size="sm" title="No deliverables yet" body={`${r.assignee?.name} shares documents here as the work goes on.`} />}
      </Card></div> : null}
      {history(hasDel ? 4 : 3)}
    </>);
  }
  return (
    <DetailLayout {...common} sections={[...(r.openInfo ? [{ id: 'info', label: 'Action required' }] : []), ...sections]}>
      {r.openInfo ? <RespondPanel session={session} request={r} /> : null}
      {body}
      <WithdrawModal session={session} request={r} open={withdraw} onClose={() => setWithdraw(false)} />
    </DetailLayout>
  );
}

export function requestFacts(r: RequestView, ga: boolean): [string, React.ReactNode][] {
  const out: [string, React.ReactNode][] = [['Framework', r.serviceFrameworkVersion ?? r.frameworkLabel], ['Scope', r.scopeName ?? '—']];
  if (ga) {
    if (r.approvedAt) out.push([r.delivery === 'remote' ? 'Remote' : 'On site', `${fmtRange(r.periodFrom, r.periodTo)}${r.siteLabel ? ` · ${r.siteLabel}` : ''}`], ['SGS consultant', r.assignee?.name ?? '—']);
    else out.push(['Delivery', r.delivery ? DELIVERY_LABEL[r.delivery] : '—'], ['Earliest start', fmtDate(r.earliestStart)]);
    if (r.approvedAt && r.sgsMessage && r.status !== 'completed') out.push(['Message from SGS', r.sgsMessage]);
    else if (r.goal) out.push(['Goal', r.goal]);
  } else {
    out.push(r.approvedAt || r.status === 'rejected' ? ['Preferred period', fmtRange(r.preferredStart, r.preferredEnd)] : ['Period', fmtRange(r.preferredStart, r.preferredEnd)], ['Delivery', r.delivery ? DELIVERY_LABEL[r.delivery] : '—']);
    if (r.status !== 'rejected') out.push(['Support needed', <SupportTags key="t" items={r.supportNeeded} />]);
  }
  return out;
}
