'use client';
import { translate } from '@/i18n/locale';
// SGS side of consulting requests.
// - Admin/User (D8): designs/06 MvpAdminQueue, MvpAdminReview (+ Approve, Reject), 07 IsAdmin*.
// - Consultant (D9): 06 MvpConsAssignments, MvpConsDetail (+ MvpConsUpload), 07 IsConsAssignments, IsConsDetail
//   (+ IsConsDeliverable, IsConsComplete).
import { Button, Card, Checkbox, DataTable, DocumentItem, EmptyState, FileUpload, Modal, Skeleton, StatusTag, Tabs, Textarea, TextInput, type TableColumn } from '@sgs/graphite';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { MockApiError, type Session } from '@/mock';
import { SR_STATUS } from '@/mock/labels';
import { DELIVERY_LABEL, SR_META, consultantHref, opsHref } from '@/mock/requestMeta';
import { completeSupport, fmtRange, getRequest, listRequests, shareDeliverable, uploadReportAndComplete, type RequestRow, type RequestView } from '@/mock/api/requests';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { AsideBox, FieldError, Facts, TwoLine } from '@/ui/bits';
import { useFakeDownload } from '@/ui/download';
import { fmtDate, fmtUs, fsize } from '@/ui/format';
import { DetailLayout, ListLayout } from '@/ui/layout';
import { useSnackbar } from '@/ui/snackbar';
import { NotAllowed, NotFound } from '@/shell/NotAllowed';
import { CONSULTING_COPY, type ConsultingCategory } from './config';
import { ApproveModal, RejectModal, RequestInfoModal } from './modals';
import { PersonBox, SgsDocs, SupportTags } from './parts';
import { Link } from '@sgs/graphite';

const statusCol = <T extends RequestRow>(): TableColumn<T> => ({ key: 'status', header: 'Status', render: (r) => <StatusTag status={SR_STATUS[r.status][0]} size="sm" label={SR_STATUS[r.status][1]} /> });
const OPEN = new Set(['submitted', 'information_requested']);
const PROG = new Set(['in_progress']);

export function AdminQueue({ category }: { category: ConsultingCategory }) {
  const { session } = usePersona();
  const router = useRouter();
  const params = useSearchParams();
  const c = CONSULTING_COPY[category];
  const q = useMockQuery(() => listRequests(session, category), [session.user.id, category]);
  const [approve, setApprove] = useState<RequestView>();
  const [reject, setReject] = useState<RequestView>();
  if (session.user.role !== 'sgs_admin' && session.user.role !== 'sgs_user') return <NotAllowed what="request triage" />;
  const rows = q.data ?? [];
  const open = async (r: RequestRow, then?: 'approve' | 'reject') => {
    if (!then) { router.push(opsHref(category, r.id)); return; }
    const v = await getRequest(session, r.id);
    (then === 'approve' ? setApprove : setReject)(v);
  };
  const cols: TableColumn<RequestRow>[] = [
    { key: 'id', header: 'Request', sortable: true, width: 130, render: (r) => <a href={opsHref(category, r.id)} className="gr-link" style={{ fontWeight: 500 }}>{r.id}</a> },
    { key: 'customerName', header: 'Customer · scope', sortable: true, render: (r) => <TwoLine top={r.customerName} sub={r.scopeName} />, searchValue: (r) => `${r.id} ${r.customerName} ${r.scopeName}` },
    { key: 'frameworkLabel', header: 'Framework', sortable: true },
    { key: 'submittedAt', header: 'Submitted', sortable: true, sortValue: (r) => r.submittedAt, render: (r) => fmtDate(r.submittedAt) },
    { key: 'assigneeName', header: 'Consultant', render: (r) => r.assigneeName ?? '—' },
    statusCol(),
  ];
  const table = (list: RequestRow[], acts: (r: RequestRow) => { label: string; danger?: boolean; onClick: () => void }[]) =>
    <DataTable<RequestRow> columns={cols} rows={list} layout="table" searchable searchPlaceholder="Search requests or customers" rowActions={acts} getRowId={(r) => r.id} loading={q.loading && !q.data} />;
  const todo = rows.filter((r) => OPEN.has(r.status)), prog = rows.filter((r) => PROG.has(r.status)), closed = rows.filter((r) => !OPEN.has(r.status) && !PROG.has(r.status));
  return (
    <ListLayout crumbs={[{ label: 'Requests', href: '/ops/requests' }, { label: c.title }]} title={c.queueTitle} description="Approve and assign a consultant, or reject with a reason.">
      <section className="gr-card gr-card--extend docs-card">
        <Tabs label="Request status" defaultTab={params.get('tab') ?? 'todo'} tabs={[
          { id: 'todo', label: 'To review', badge: todo.length, content: table(todo, (r) => r.status === 'submitted'
            ? [{ label: 'Review', onClick: () => open(r) }, { label: 'Approve & assign', onClick: () => open(r, 'approve') }, { label: 'Reject', danger: true, onClick: () => open(r, 'reject') }]
            : [{ label: 'Open', onClick: () => open(r) }]) },
          { id: 'prog', label: 'In progress', badge: prog.length, content: table(prog, (r) => [{ label: 'Open', onClick: () => open(r) }]) },
          { id: 'closed', label: 'Closed', badge: closed.length, content: table(closed, (r) => [{ label: 'Open', onClick: () => open(r) }]) },
        ]} />
      </section>
      {approve ? <ApproveModal session={session} request={approve} category={category} open onClose={() => setApprove(undefined)} /> : null}
      {reject ? <RejectModal session={session} request={reject} open onClose={() => setReject(undefined)} /> : null}
    </ListLayout>
  );
}

function sgsFacts(r: RequestView, ga: boolean): [string, React.ReactNode][] {
  const out: [string, React.ReactNode][] = [['Framework', r.serviceFrameworkVersion ?? r.frameworkLabel], ['Scope', r.scopeName ?? '—']];
  if (ga) out.push(['Delivery', r.delivery ? DELIVERY_LABEL[r.delivery] : '—'], ['Earliest start', fmtDate(r.earliestStart)]);
  else out.push(['Preferred period', fmtRange(r.preferredStart, r.preferredEnd)], ['Delivery', r.delivery ? DELIVERY_LABEL[r.delivery] : '—']);
  out.push(['Contact', r.contact ? `${r.contact.name}${r.contactTitle ? ` · ${r.contactTitle}` : ''}` : '—'], ['Consent', r.consentWorkspace ? 'Consultant may read the workspace' : 'No workspace access']);
  if (!ga) out.push(['Support needed', <SupportTags key="t" items={r.supportNeeded} />]);
  out.push(['Goal', r.goal ?? '—']);
  return out;
}

export function AdminReview({ id, category }: { id: string; category: ConsultingCategory }) {
  const { session } = usePersona();
  const q = useMockQuery(() => getRequest(session, id), [session.user.id, id]);
  const [modal, setModal] = useState<'approve' | 'reject' | 'info'>();
  if (session.user.role !== 'sgs_admin' && session.user.role !== 'sgs_user') return <NotAllowed what="request triage" />;
  if (q.error) return <NotFound what="request" />;
  const r = q.data;
  if (!r) return <Skeleton lines={8} />;
  const ga = category === 'gap_analysis';
  const st = SR_STATUS[r.status];
  const facts = sgsFacts(r, ga);
  return (
    <DetailLayout backHref={`/ops/requests/${SR_META[category].slug}`} sidebar="expanded"
      sections={[{ id: 'rq', label: 'Request', status: 'complete' }, { id: 'ws', label: 'Workspace' }, ...(r.infoRequests.length ? [{ id: 'info', label: 'Information' }] : []), ...(r.approvedAt || r.rejectedAt || r.withdrawnAt ? [{ id: 'dec', label: 'Decision' }] : [])]}
      header={{ title: `${r.id} · ${r.frameworkLabel}`, subtitle: `${SR_META[category].label} · ${r.customerName} · submitted ${fmtDate(r.submittedAt)}`, status: { status: st[0], label: st[1], shortLabel: st[1] },
        actions: r.can.triage ? <div className="btn-row">
          <Button variant="ghost" size="md" onClick={() => setModal('info')}>{translate("Request information")}</Button>
          <Button variant="tertiary" size="md" onClick={() => setModal('reject')}>{translate("Reject")}</Button>
          <Button size="md" onClick={() => setModal('approve')}>{translate("Approve & assign")}</Button>
        </div> : undefined }}
      aside={<>
        <div className="title-medium">{translate("Customer")}</div>
        <AsideBox title={r.customerName}>
          <span className="body-small muted">SGS Taiwan · Customer admin {r.customerAdmin?.name ?? '—'}</span>
          {r.customerAdmin ? <Link href={`mailto:${r.customerAdmin.email}`}>{r.customerAdmin.email}</Link> : null}
        </AsideBox>
        {r.assignee ? <PersonBox title="Consultant" person={r.assignee} /> : null}
      </>}>
      <div data-section="rq"><Card number={1} title="Request" subtitle="What the customer asked for">
        <dl className="facts" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {facts.map(([k, v], i) => <div key={String(k)} style={i >= facts.length - (ga ? 1 : 2) ? { gridColumn: '1 / -1' } : undefined}><dt className="body-small facts__k">{k}</dt><dd className="body-medium facts__v">{v}</dd></div>)}
        </dl>
      </Card></div>
      <div data-section="ws" className={r.infoRequests.length || r.approvedAt || r.rejectedAt ? undefined : 'card-extend'}><Card number={2} title="Workspace" subtitle="Where the consultant will read evidence" extend={!(r.infoRequests.length || r.approvedAt || r.rejectedAt)}>
        <span className="body-medium">{r.workspaceLabel ? `${r.workspaceLabel} — ${r.workspaceStats?.requirements} requirements, ${r.workspaceStats?.documents} documents` : `No ${r.frameworkLabel} workspace on this scope. The consultant works from what the customer shares.`}</span>
        {r.documents.filter((d) => d.kind === 'customer_shared').map((d) => <DocumentItem key={d.id} docType={`Shared by customer · ${d.title}`} fileName={d.fileName} dateLabel={`Uploaded ${fmtUs(d.uploadedAt)}`} size={fsize(d.sizeBytes)} status="completed" statusLabel="Shared" />)}
      </Card></div>
      {r.infoRequests.length ? <div data-section="info"><Card number={3} title="Information requested" subtitle="Questions to the customer and their answers">
        {r.infoRequests.map((x) => (
          <div key={x.id} className="note-box">
            <span className="body-small muted">{x.askedByName} · {fmtDate(x.askedAt)}</span><span className="body-medium">{x.question}</span>
            {x.answeredAt ? <><span className="body-small muted" style={{ marginTop: 8 }}>Answer · {x.answeredByName} · {fmtDate(x.answeredAt)}</span><span className="body-medium">{x.answer}</span></> : <span className="body-small muted" style={{ marginTop: 8 }}>{translate("Waiting for the customer.")}</span>}
          </div>
        ))}
      </Card></div> : null}
      {r.approvedAt || r.rejectedAt || r.withdrawnAt ? <div data-section="dec" className="card-extend"><Card number={r.infoRequests.length ? 4 : 3} title="Decision" extend>
        {r.approvedAt ? <Facts items={[['Approved', `${fmtDate(r.approvedAt)} · ${r.approver?.name}`], ['Consultant', r.assignee?.name ?? '—'], [ga ? 'On site' : 'Period', fmtRange(r.periodFrom, r.periodTo)], ['Message', r.sgsMessage ?? '—']]} />
          : r.rejectedAt ? <Facts items={[['Rejected', `${fmtDate(r.rejectedAt)} · ${r.rejecter?.name}`], ['Reason', r.rejectReason ?? '—'], ['Message', r.rejectMessage ?? '—']]} />
          : <Facts items={[['Withdrawn by the customer', fmtDate(r.withdrawnAt)], ['Reason', r.withdrawReason ?? '—'], ['Comment', r.withdrawComment ?? '—']]} />}
      </Card></div> : null}
      <ApproveModal session={session} request={r} category={category} open={modal === 'approve'} onClose={() => setModal(undefined)} />
      <RejectModal session={session} request={r} open={modal === 'reject'} onClose={() => setModal(undefined)} />
      <RequestInfoModal session={session} request={r} open={modal === 'info'} onClose={() => setModal(undefined)} />
    </DetailLayout>
  );
}

export function ConsultantAssignments({ category }: { category: ConsultingCategory }) {
  const { session } = usePersona();
  const router = useRouter();
  const download = useFakeDownload();
  const c = CONSULTING_COPY[category];
  const q = useMockQuery(() => listRequests(session, category), [session.user.id, category]);
  if (session.user.role !== 'sgs_consultant') return <NotAllowed what="consultant assignments" />;
  const rows = q.data ?? [];
  const ga = category === 'gap_analysis';
  const cols: TableColumn<RequestRow>[] = [
    { key: 'id', header: 'Request', width: 130, render: (r) => <a href={consultantHref(category, r.id)} className="gr-link" style={{ fontWeight: 500 }}>{r.id}</a> },
    { key: 'customerName', header: 'Customer · scope', render: (r) => <TwoLine top={r.customerName} sub={r.scopeName} /> },
    { key: 'frameworkLabel', header: 'Framework' },
    { key: 'period', header: c.periodLabel, render: (r) => fmtRange(r.periodFrom, r.periodTo) },
    ...(ga ? [] : [{ key: 'del', header: 'Deliverables', align: 'end' as const, width: 120, render: (r: RequestRow) => String(r.deliverables) }]),
    statusCol(),
  ];
  const prog = rows.filter((r) => r.status === 'in_progress' || r.status === 'information_requested'), done = rows.filter((r) => r.status === 'completed');
  const t = (list: RequestRow[], acts: (r: RequestRow) => { label: string; onClick: () => void }[]) => <DataTable<RequestRow> columns={cols} rows={list} layout="table" paginate={false} rowActions={acts} getRowId={(r) => r.id} loading={q.loading && !q.data} />;
  return (
    <ListLayout crumbs={[{ label: 'My assignments', href: `/ops/my-assignments/${SR_META[category].slug}` }, { label: c.title }]} title="My assignments" description={c.consDescription}>
      <section className="gr-card gr-card--extend docs-card">
        <Tabs label="Assignment status" tabs={[
          { id: 'prog', label: 'In progress', badge: prog.length, content: t(prog, (r) => [
            { label: 'Open', onClick: () => router.push(consultantHref(category, r.id)) },
            ...(r.workspaceId ? [{ label: 'Open workspace', onClick: () => router.push(`${consultantHref(category, r.id)}/workspace`) }] : []),
            { label: ga ? 'Upload report' : 'Share deliverable', onClick: () => router.push(`${consultantHref(category, r.id)}?action=${ga ? 'report' : 'share'}`) }]) },
          { id: 'done', label: 'Completed', badge: done.length, content: t(done, (r) => [
            { label: 'Open', onClick: () => router.push(consultantHref(category, r.id)) },
            ...(ga ? [{ label: 'Download report', onClick: () => download(`${r.id} – Gap Analysis Report.pdf`) }] : [])]) },
        ]} />
      </section>
    </ListLayout>
  );
}

type Upload = { fileName: string; sizeBytes: number };
const filesOf = (l: FileList) => Array.from(l).map((f) => ({ fileName: f.name, sizeBytes: f.size }));

function UploadReportModal({ session, r, open, onClose }: { session: Session; r: RequestView; open: boolean; onClose: () => void }) {
  const snack = useSnackbar();
  const [report, setReport] = useState<Upload>();
  const [att, setAtt] = useState<Upload[]>([]);
  const [note, setNote] = useState('');
  const [final, setFinal] = useState(false);
  const [e, setE] = useState<{ report?: string; final?: string }>({});
  const close = () => { setReport(undefined); setAtt([]); setNote(''); setFinal(false); setE({}); onClose(); };
  return (
    <Modal open={open} size="fit" title="Upload report and complete" onClose={close}
      primaryAction={{ label: 'Complete request', onClick: async () => {
        const x: typeof e = {};
        if (!report) x.report = 'Upload the final report (PDF).';
        else if (!/\.pdf$/i.test(report.fileName)) x.report = 'The report must be a PDF file.';
        if (!final) x.final = 'Confirm the report is final.';
        setE(x);
        if (Object.keys(x).length) return;
        await uploadReportAndComplete(session, r.id, { report: report!, attachments: att, note });
        snack(`${r.id} completed. ${r.customerName} is notified and your workspace access has ended.`);
        close();
      } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <div>
          <FileUpload label="Final report" required multiple={false} accept=".pdf" hint={`PDF only · up to 20 MB · shown to the customer as “${r.id} – Gap Analysis Report.pdf”`}
            onFilesAdded={(l) => { setReport(filesOf(l)[0]); setE((x) => ({ ...x, report: undefined })); }} onRemove={() => setReport(undefined)} />
          <FieldError>{e.report}</FieldError>
        </div>
        <FileUpload label="Attachments (optional)" hint="e.g. detailed findings in Excel · up to 20 MB each" onFilesAdded={(l) => { const add = filesOf(l); setAtt((a) => [...a, ...add]); }} onRemove={(f) => setAtt((a) => a.filter((x) => x.fileName !== f.name))} />
        <Textarea label="Note to the customer (optional)" size="l" rows={2} placeholder="Two or three sentences shown above the report" value={note} onChange={(x) => setNote(x.target.value)} />
        <div><Checkbox label="This report is final. The customer is notified and my workspace access ends." checked={final} onChange={(x) => { setFinal(x.target.checked); setE((y) => ({ ...y, final: undefined })); }} /><FieldError>{e.final}</FieldError></div>
      </div>
    </Modal>
  );
}

function ShareModal({ session, r, open, onClose }: { session: Session; r: RequestView; open: boolean; onClose: () => void }) {
  const snack = useSnackbar();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<Upload>();
  const [note, setNote] = useState('');
  const [e, setE] = useState<{ title?: string; file?: string }>({});
  const close = () => { setTitle(''); setFile(undefined); setNote(''); setE({}); onClose(); };
  return (
    <Modal open={open} size="fit" title="Share a deliverable" onClose={close}
      primaryAction={{ label: 'Share with customer', onClick: async () => {
        const x: typeof e = {};
        if (!title.trim()) x.title = 'Enter a title.';
        if (!file) x.file = 'Choose the file to share.';
        setE(x);
        if (Object.keys(x).length) return;
        try { await shareDeliverable(session, r.id, { title, file: file!, note }); snack('Deliverable shared with the customer'); close(); }
        catch (err) { if (err instanceof MockApiError) setE({ title: err.message }); else throw err; }
      } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <TextInput label="Title" required size="l" value={title} error={e.title} onChange={(x) => { setTitle(x.target.value); setE((y) => ({ ...y, title: undefined })); }} />
        <div>
          <FileUpload label="File" required multiple={false} hint="Any document type · up to 20 MB · shared with the customer immediately" onFilesAdded={(l) => { setFile(filesOf(l)[0]); setE((y) => ({ ...y, file: undefined })); }} onRemove={() => setFile(undefined)} />
          <FieldError>{e.file}</FieldError>
        </div>
        <Textarea label="Note to the customer (optional)" size="l" rows={2} value={note} onChange={(x) => setNote(x.target.value)} />
      </div>
    </Modal>
  );
}

function CompleteModal({ session, r, open, onClose }: { session: Session; r: RequestView; open: boolean; onClose: () => void }) {
  const snack = useSnackbar();
  const [summary, setSummary] = useState('');
  const [file, setFile] = useState<Upload>();
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string>();
  const n = r.documents.filter((d) => d.kind === 'deliverable').length;
  const close = () => { setSummary(''); setFile(undefined); setOk(false); setErr(undefined); onClose(); };
  return (
    <Modal open={open} size="fit" title="Complete this request" onClose={close}
      primaryAction={{ label: 'Complete request', onClick: async () => {
        if (!ok) { setErr('Confirm the work is finished.'); return; }
        await completeSupport(session, r.id, { summary, file }); snack(`${r.id} completed. ${r.customerName} is notified and your workspace access has ended.`); close();
      } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <p className="body-medium muted" style={{ margin: 0 }}>{n} deliverable{n === 1 ? '' : 's'} shared. Completing notifies the customer and ends your workspace access. It can’t be undone.</p>
        <Textarea label="Closing summary for the customer (optional)" size="l" rows={3} value={summary} onChange={(x) => setSummary(x.target.value)} />
        <FileUpload label="Closing document (optional)" multiple={false} hint="e.g. a final summary PDF" onFilesAdded={(l) => setFile(filesOf(l)[0])} onRemove={() => setFile(undefined)} />
        <div><Checkbox label="The work is finished and all deliverables are shared." checked={ok} onChange={(x) => { setOk(x.target.checked); setErr(undefined); }} /><FieldError>{err}</FieldError></div>
      </div>
    </Modal>
  );
}

export function ConsultantDetail({ id, category }: { id: string; category: ConsultingCategory }) {
  const { session } = usePersona();
  const router = useRouter();
  const params = useSearchParams();
  const q = useMockQuery(() => getRequest(session, id), [session.user.id, id]);
  const [modal, setModal] = useState<'report' | 'share' | 'complete' | 'info' | undefined>((params.get('action') as 'report' | 'share') ?? undefined);
  if (session.user.role !== 'sgs_consultant') return <NotAllowed what="consultant assignments" />;
  if (q.error) return <NotFound what="assignment" />;
  const r = q.data;
  if (!r) return <Skeleton lines={8} />;
  const ga = category === 'gap_analysis';
  const st = SR_STATUS[r.status];
  const base = consultantHref(category, r.id);
  const actions = r.can.complete ? (ga
    ? <div className="btn-row"><Button variant="ghost" size="md" onClick={() => setModal('info')}>{translate("Request information")}</Button><Button size="md" icon="upload" iconPosition="left" onClick={() => setModal('report')}>{translate("Upload report")}</Button></div>
    : <div className="btn-row"><Button variant="ghost" size="md" onClick={() => setModal('info')}>{translate("Request information")}</Button><Button variant="secondary" size="md" icon="add" iconPosition="left" onClick={() => setModal('share')}>{translate("Share deliverable")}</Button><Button size="md" onClick={() => setModal('complete')}>{translate("Complete request")}</Button></div>) : undefined;
  const reqFacts: [string, React.ReactNode][] = ga
    ? [['Framework', r.serviceFrameworkVersion ?? r.frameworkLabel], ['Scope', r.scopeName ?? '—'], [r.delivery === 'remote' ? 'Remote' : 'On site', fmtRange(r.periodFrom, r.periodTo)], ['Customer contact', r.contact ? `${r.contact.name}${r.contactTitle ? ` · ${r.contactTitle}` : ''}` : '—'], ['Customer goal', r.goal ?? '—'], ...(r.sgsMessage ? [['Message from SGS admin', r.sgsMessage] as [string, string]] : [])]
    : [['Framework', r.serviceFrameworkVersion ?? r.frameworkLabel], ['Contact', r.contact?.name ?? '—'], ['Delivery', r.delivery ? DELIVERY_LABEL[r.delivery] : '—'], ['Support needed', <SupportTags key="t" items={r.supportNeeded} />], ['Customer goal', r.goal ?? '—']];
  const wide = (k: string) => ['Customer goal', 'Message from SGS admin', 'Support needed'].includes(k);
  const ended = r.status === 'completed';
  return (
    <DetailLayout backHref={`/ops/my-assignments/${SR_META[category].slug}`}
      sections={[{ id: 'rq', label: 'Request', status: 'complete' }, { id: 'ws', label: 'Workspace' }, { id: 'rep', label: ga ? 'Report' : 'Deliverables' }]}
      header={{ title: `${r.id} · ${r.frameworkLabel}`, subtitle: `${r.customerName} · ${(r.scopeName ?? '').replace(' · ', ', ')}${ga ? '' : ` · ${fmtRange(r.periodFrom, r.periodTo)}`}`, status: { status: st[0], label: st[1], shortLabel: st[1] }, actions }}
      aside={<>
        <div className="title-medium">{translate("Assignment")}</div>
        <AsideBox title="Customer"><span className="body-medium">{r.customerName}</span><span className="body-small muted">Contact: {r.contact?.name}</span>{r.contact ? <Link href={`mailto:${r.contact.email}`}>{r.contact.email}</Link> : null}</AsideBox>
        {r.approver ? <AsideBox title="SGS admin"><span className="body-medium">{r.approver.name}</span><Link href={`mailto:${r.approver.email}`}>{r.approver.email}</Link></AsideBox> : null}
      </>}>
      <div data-section="rq"><Card number={1} title="Request" subtitle={`Approved by ${r.approver?.name ?? 'SGS'} on ${fmtDate(r.approvedAt)}`}>
        <dl className="facts" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {reqFacts.map(([k, v]) => <div key={String(k)} style={wide(String(k)) ? { gridColumn: '1 / -1' } : undefined}><dt className="body-small facts__k">{k}</dt><dd className="body-medium facts__v">{v}</dd></div>)}
        </dl>
        {r.documents.filter((d) => d.kind === 'customer_shared').map((d) => <DocumentItem key={d.id} docType={`Shared by customer · ${d.title}`} fileName={d.fileName} dateLabel={`Uploaded ${fmtUs(d.uploadedAt)}`} size={fsize(d.sizeBytes)} status="completed" statusLabel="Shared" />)}
      </Card></div>
      <div data-section="ws"><Card number={2} title="Customer workspace" subtitle={ended ? 'Your access ended when the request was completed' : 'Read only · every view is recorded'}>
        <div className="btn-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="body-medium">{r.workspaceLabel ? `${r.workspaceLabel} — ${r.workspaceStats?.requirements} requirements, ${r.workspaceStats?.documents} documents` : 'No workspace linked to this request.'}</span>
          {r.workspaceLabel ? <Button variant="secondary" size="md" icon="launch" onClick={() => router.push(`${base}/workspace`)}>{translate("Open workspace")}</Button> : null}
        </div>
      </Card></div>
      <div data-section="rep" className="card-extend"><Card number={3} title={ga ? 'Report' : 'Deliverables'} extend
        subtitle={ga ? (ended ? `Delivered ${fmtDate(r.completedAt)}` : 'Upload the final report when the gap analysis is done') : 'Visible to the customer as soon as you share them'}>
        {ga ? (ended ? <SgsDocs docs={r.documents} kinds={['report', 'attachment']} />
          : <EmptyState size="sm" icon="upload" title="No report uploaded" body="Uploading the report completes the request: the customer is notified and your workspace access ends."
              action={r.can.complete ? <Button size="md" icon="upload" iconPosition="left" onClick={() => setModal('report')}>{translate("Upload report")}</Button> : undefined} />)
          : <>
              <SgsDocs docs={r.documents} kinds={['deliverable', 'closing']} verb="Shared" />
              {!r.documents.some((d) => d.kind === 'deliverable') ? <p className="body-medium muted" style={{ margin: 0 }}>{translate("Nothing shared yet.")}</p> : null}
              {r.can.share ? <div><Button variant="tertiary" size="sm" icon="add" iconPosition="left" onClick={() => setModal('share')}>{translate("Share deliverable")}</Button></div> : null}
            </>}
      </Card></div>
      {ga ? <UploadReportModal session={session} r={r} open={modal === 'report'} onClose={() => setModal(undefined)} /> : <>
        <ShareModal session={session} r={r} open={modal === 'share'} onClose={() => setModal(undefined)} />
        <CompleteModal session={session} r={r} open={modal === 'complete'} onClose={() => setModal(undefined)} />
      </>}
      <RequestInfoModal session={session} request={r} open={modal === 'info'} onClose={() => setModal(undefined)} />
    </DetailLayout>
  );
}
