'use client';
import { translate } from '@/i18n/locale';
// Training (SGS Academy) requests, decisions D2:
// - customer: designs/09 TrainList (Services 33 / My requests), TrainRequest, TrainDetail;
// - SGS: designs/09 TrainAdminQueue (To assign / Assigned / Rejected), TrainAdminAssign, reject with 09 AdminReject.
// The SGS request detail has no design: same layout as the other SGS detail pages, labelled "Chưa có design".
import { Button, Card, DataTable, InlineNotification, Modal, OverflowMenu, Select, Skeleton, StatusTag, Tabs, Tag, TextInput, Textarea, type TableColumn } from '@sgs/graphite';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getDb, MockApiError, type Session } from '@/mock';
import { SR_STATUS } from '@/mock/labels';
import { courseTitle, TRAINING_COURSES, TRAINING_FORMATS, TRAINING_LANGUAGES, TRAINING_MONTHS } from '@/mock/catalog/services';
import { customerHref, opsHref } from '@/mock/requestMeta';
import { assignTrainingContact, createTrainingRequest, trainingContactOptions } from '@/mock/api/certification';
import { getRequest, listRequests, requestAgain, type RequestRow, type RequestView } from '@/mock/api/requests';
import type { ServiceRequest } from '@/mock/types';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { AsideBox, Facts, Timeline, TwoLine } from '@/ui/bits';
import { fmtDate } from '@/ui/format';
import { DetailLayout, ListLayout } from '@/ui/layout';
import { useSnackbar } from '@/ui/snackbar';
import { NoDesign } from '@/shell/PageHead';
import { NotAllowed, NotFound } from '@/shell/NotAllowed';
import { InternalNotes } from '../requests/InternalNotes';
import { RejectModal, WithdrawModal } from '../consulting/modals';
import { PersonBox, RespondPanel } from '../consulting/parts';

type Course = (typeof TRAINING_COURSES)[number];
// designs/09: Submitted = under-review, Assigned = info (not the generic SR colours).
const TR_STATUS = (s: ServiceRequest['status']): [string, string] => (s === 'submitted' ? ['under-review', 'Submitted'] : s === 'assigned' ? ['info', 'Assigned'] : SR_STATUS[s]);
const fullCourse = (r: Pick<ServiceRequest, 'courseStd' | 'course'>) => courseTitle(r.courseStd ?? '', r.course ?? '');
const shortCourse = (r: Pick<ServiceRequest, 'courseStd' | 'course'>) => courseTitle(r.courseStd ?? '', r.course ?? '', true);
const monthShort = (m?: string) => (m ? m.replace(/^(\w{3})\w* (\d{4})$/, '$1 $2') : '—');
const people = (n?: number) => `${n ?? 0} ${n === 1 ? 'person' : 'people'}`;

export function TrainingRequestModal({ session, course, onClose }: { session: Session; course?: Course; onClose: (id?: string) => void }) {
  const snack = useSnackbar();
  const empty = { participants: '', format: '', preferredMonth: '', language: '', message: '' };
  const [v, setV] = useState(empty);
  const [e, setE] = useState<Partial<Record<keyof typeof empty, string>>>({});
  const set = (k: keyof typeof empty, x: string) => { setV((y) => ({ ...y, [k]: x })); setE((y) => ({ ...y, [k]: undefined })); };
  const close = (id?: string) => { setV(empty); setE({}); onClose(id); };
  async function send() {
    const x: typeof e = {};
    const n = Number(v.participants);
    if (!v.participants.trim()) x.participants = 'Enter the number of participants.';
    else if (!Number.isInteger(n) || n < 1) x.participants = 'Enter a whole number from 1.';
    if (!v.format) x.format = 'Choose a format.';
    if (!v.preferredMonth) x.preferredMonth = 'Choose a month.';
    if (!v.language) x.language = 'Choose a language.';
    setE(x);
    if (Object.keys(x).length) return;
    try {
      const id = await createTrainingRequest(session, { courseId: course!.id, participants: n, format: v.format as 'Online', preferredMonth: v.preferredMonth, language: v.language as 'English', message: v.message });
      snack(`Request ${id} sent. An SGS contact will confirm dates and price.`);
      close(id);
    } catch (err) { if (err instanceof MockApiError) setE({ participants: err.message }); else throw err; }
  }
  const opts = (xs: readonly string[]) => xs.map((x) => ({ value: x, label: x }));
  return (
    <Modal open={!!course} size="fit" title="Request a training course" onClose={() => close()} primaryAction={{ label: 'Send request', onClick: send }} secondaryAction={{ label: 'Cancel', onClick: () => close() }}>
      {course ? (
        <div className="modal-body" style={{ width: 552 }}>
          <div className="summary-box"><span className="title-small">{courseTitle(course.std, course.course)}</span><span className="body-small muted">{course.cat}</span></div>
          <div className="field-row">
            <TextInput label="Participants" required size="s" type="number" min={1} value={v.participants} error={e.participants} onChange={(x) => set('participants', x.target.value)} />
            <Select label="Format" required size="s" placeholder="Choose" options={opts(TRAINING_FORMATS)} value={v.format} error={e.format} onChange={(_, x) => set('format', x)} />
          </div>
          <Select label="Preferred month" required size="s" placeholder="Choose" options={opts(TRAINING_MONTHS)} value={v.preferredMonth} error={e.preferredMonth} onChange={(_, x) => set('preferredMonth', x)} />
          <Select label="Language" required size="s" placeholder="Choose" options={opts(TRAINING_LANGUAGES)} value={v.language} error={e.language} onChange={(_, x) => set('language', x)} />
          <Textarea label="Message to SGS (optional)" size="l" rows={2} placeholder="e.g. Participants’ roles, preferred location" value={v.message} onChange={(x) => set('message', x.target.value)} />
        </div>
      ) : null}
    </Modal>
  );
}

export function TrainingCoursesPage() {
  const { session } = usePersona();
  const router = useRouter();
  const params = useSearchParams();
  const q = useMockQuery(() => listRequests(session, 'training'), [session.user.id]);
  const [course, setCourse] = useState<Course>();
  const canRequest = session.user.role === 'customer_admin' || session.user.role === 'customer_user';
  const rows = q.data ?? [];
  const svcCols: TableColumn<Course>[] = [
    { key: 'course', header: 'Course', sortable: true, render: (r) => <span style={{ fontWeight: 500 }}>{r.course}</span>, searchValue: (r) => `${r.course} ${r.std} ${r.cat}` },
    { key: 'std', header: 'Standard', sortable: true, width: 240 },
    { key: 'cat', header: 'Category', sortable: true, width: 200, render: (r) => <Tag tone="neutral">{r.cat}</Tag> },
    { key: 'act', header: '', align: 'end', width: 140, render: (r) => (canRequest ? <Button variant="tertiary" size="sm" onClick={() => setCourse(r)}>{translate("Request")}</Button> : null) },
  ];
  const reqCols: TableColumn<RequestRow>[] = [
    { key: 'id', header: 'Request', width: 140, render: (r) => <a href={customerHref('training', r.id)} className="gr-link" style={{ fontWeight: 500 }}>{r.id}</a> },
    { key: 'title', header: 'Service', sortable: true },
    { key: 'submittedAt', header: 'Submitted', sortable: true, width: 130, sortValue: (r) => r.submittedAt, render: (r) => fmtDate(r.submittedAt) },
    { key: 'assigneeName', header: 'SGS contact', render: (r) => r.assigneeName ?? '—' },
    { key: 'status', header: 'Status', render: (r) => { const s = TR_STATUS(r.status); return <StatusTag status={s[0] as 'info'} size="sm" label={s[1]} />; } },
  ];
  return (
    <ListLayout crumbs={[{ label: 'Service Requests', href: '/service-requests' }, { label: 'Training Courses' }]} title="Training Courses" description="Book an SGS Academy course for your team. An SGS contact confirms dates and price.">
      <section className="gr-card gr-card--extend docs-card">
        <Tabs label="Training Courses" defaultTab={params.get('tab') === 'mine' ? 'mine' : 'svc'} tabs={[
          { id: 'svc', label: 'Services', badge: TRAINING_COURSES.length, content: <DataTable columns={svcCols} rows={TRAINING_COURSES} searchable searchPlaceholder="Search services" layout="table" pageSize={10} getRowId={(r) => r.id} /> },
          { id: 'mine', label: 'My requests', badge: rows.length, content: <DataTable columns={reqCols} rows={rows} layout="table" loading={q.loading && !q.data} getRowId={(r) => r.id} emptyState={{ title: 'No training requests yet', body: 'Choose a course on the Services tab.' }} /> },
        ]} />
      </section>
      <TrainingRequestModal session={session} course={course} onClose={(id) => { setCourse(undefined); if (id) router.push(customerHref('training', id)); }} />
    </ListLayout>
  );
}

const trainingFacts = (r: RequestView): [string, string][] => [
  ['Course', fullCourse(r)], ['Participants', String(r.participants ?? '—')], ['Format', r.format ?? '—'], ['Preferred month', r.preferredMonth ?? '—'], ['Language', r.language ?? '—'],
  ...(r.message ? [['Message', r.message] as [string, string]] : []),
];

export function CustomerTrainingDetail({ id }: { id: string }) {
  const { session } = usePersona();
  const router = useRouter();
  const snack = useSnackbar();
  const q = useMockQuery(() => getRequest(session, id), [session.user.id, id]);
  const [withdraw, setWithdraw] = useState(false);
  if (q.error) return <NotFound what="request" />;
  const r = q.data;
  if (!r) return <Skeleton lines={10} />;
  const st = TR_STATUS(r.status);
  const label = r.status === 'submitted' ? 'Submitted · waiting for SGS' : st[1];
  let status: React.ReactNode;
  if (r.status === 'submitted' || r.status === 'information_requested') status = <InlineNotification kind="info" title="SGS is reviewing your request">{translate("An SGS Academy contact will confirm dates, location and price with you by email.")}</InlineNotification>;
  else if (r.status === 'assigned') status = <Facts items={[['SGS contact', r.assignee?.name ?? '—'], ['Assigned on', fmtDate(r.approvedAt)], ['Next step', r.sgsMessage ?? `${r.assignee?.name.split(' ')[0]} will confirm dates, location and price with you by email.`]]} />;
  else if (r.status === 'rejected') status = <>
    <InlineNotification kind="error" title={`Reason: ${r.rejectReason}`}>{r.rejectMessage}</InlineNotification>
    {r.can.requestAgain ? <div><Button size="md" icon="add" iconPosition="left" onClick={async () => { await requestAgain(session, r.id).catch(() => undefined); router.push('/service-requests/training'); }}>{translate("Request again")}</Button></div> : null}
  </>;
  else if (r.status === 'withdrawn') status = <InlineNotification kind="info" title={`Withdrawn on ${fmtDate(r.withdrawnAt)}`}>SGS stopped handling this request.{r.withdrawReason ? ` Reason: ${r.withdrawReason}.` : ''}</InlineNotification>;
  return (
    <DetailLayout backHref="/service-requests/training?tab=mine" sections={[...(r.openInfo ? [{ id: 'info', label: 'Action required' }] : []), { id: 'st', label: 'Status' }, { id: 'rq', label: 'Request' }, { id: 'hist', label: 'History' }]}
      header={{ title: `${r.id} · ${shortCourse(r)}`, subtitle: `Training Courses · ${r.participants} participant${r.participants === 1 ? '' : 's'}`, status: { status: st[0] as 'info', label, shortLabel: st[1] },
        actions: r.can.withdraw ? <OverflowMenu size="md" label="Request actions" items={[{ label: 'Withdraw request', danger: true, onClick: () => setWithdraw(true) }]} /> : undefined }}
      aside={<>
        <div className="title-medium">{translate("SGS Requests & Communications")}</div>
        {r.assignee && r.status === 'assigned' ? <PersonBox title="Your SGS contact" person={r.assignee} sub={r.assignee.title ?? 'SGS Academy'} /> : null}
        <AsideBox title="Need help?"><span className="body-small muted">{translate("Questions about this request? Contact SGS support and quote the request number.")}</span><div><Button variant="tertiary" size="sm" onClick={() => snack(`SGS support: support.tw@sgs.com · +886 2 2793 5000 (sample contact). Quote ${r.id}.`)}>{translate("Contact support")}</Button></div></AsideBox>
      </>}>
      {r.openInfo ? <RespondPanel session={session} request={r} /> : null}
      <div data-section="st"><Card number={1} title="Status">{status}</Card></div>
      <div data-section="rq"><Card number={2} title="Request" subtitle="What you asked for"><Facts items={trainingFacts(r)} /></Card></div>
      <div data-section="hist" className="card-extend"><Card number={3} title="History" extend><Timeline steps={r.timeline} /></Card></div>
      <WithdrawModal session={session} request={r} open={withdraw} onClose={() => setWithdraw(false)} />
    </DetailLayout>
  );
}

const triage = (s: Session) => s.user.role === 'sgs_admin' || s.user.role === 'sgs_user';

export function AssignTrainingModal({ session, request, onClose }: { session: Session; request?: RequestRow; onClose: () => void }) {
  const snack = useSnackbar();
  const [who, setWho] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState<string>();
  const close = () => { setWho(''); setMsg(''); setErr(undefined); onClose(); };
  return (
    <Modal open={!!request} size="fit" title="Assign training request" onClose={close}
      primaryAction={{ label: 'Assign', onClick: async () => {
        if (!who) { setErr('Choose who takes the request.'); return; }
        try { await assignTrainingContact(session, request!.id, { contactId: who, message: msg }); snack(`${request!.id} assigned to ${getDb().users.find((u) => u.id === who)?.displayName}`); close(); }
        catch (e) { if (e instanceof MockApiError) setErr(e.message); else throw e; }
      } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      {request ? (
        <div className="modal-body" style={{ width: 552 }}>
          <dl className="summary-box summary-grid">
            <div><dt className="body-small muted">{translate("Request")}</dt><dd className="body-medium">{request.id} · {request.customerName}</dd></div>
            <div><dt className="body-small muted">{translate("Course")}</dt><dd className="body-medium">{shortCourse(request)}</dd></div>
            <div><dt className="body-small muted">{translate("Participants · format")}</dt><dd className="body-medium">{request.participants} · {request.format}</dd></div>
            <div><dt className="body-small muted">{translate("Preferred")}</dt><dd className="body-medium" lang={request.language === '繁體中文' ? 'zh-Hant' : undefined}>{request.preferredMonth} · {request.language}</dd></div>
          </dl>
          <Select label="Assign to" required size="m" placeholder="Choose a person" options={trainingContactOptions(getDb(), session)} value={who} error={err} helpText="They get an email and contact the customer." onChange={(_, v) => { setWho(v); setErr(undefined); }} />
          {/* TODO(open-question #16): placeholder copy of the design mentions an audit; training wording used. */}
          <Textarea label="Message to the customer (optional)" size="l" rows={2} placeholder="e.g. Mei will confirm dates and price with you." value={msg} onChange={(e) => setMsg(e.target.value)} />
        </div>
      ) : null}
    </Modal>
  );
}

export function SgsTrainingRequests() {
  const { session } = usePersona();
  const router = useRouter();
  const params = useSearchParams();
  const q = useMockQuery(() => listRequests(session, 'training'), [session.user.id]);
  const [assign, setAssign] = useState<RequestRow>();
  const [reject, setReject] = useState<RequestView>();
  if (!triage(session)) return <NotAllowed what="training requests" />;
  const rows = q.data ?? [];
  const cols: TableColumn<RequestRow>[] = [
    { key: 'id', header: 'Request', width: 130, render: (r) => <a href={opsHref('training', r.id)} className="gr-link" style={{ fontWeight: 500 }}>{r.id}</a> },
    { key: 'customerName', header: 'Customer', sortable: true, searchValue: (r) => `${r.id} ${r.customerName} ${shortCourse(r)}` },
    { key: 'course', header: 'Course', sortable: true, sortValue: (r) => shortCourse(r), render: (r) => <TwoLine top={shortCourse(r)} sub={`${r.format} · ${people(r.participants)}`} /> },
    { key: 'preferredMonth', header: 'Preferred', render: (r) => <TwoLine top={monthShort(r.preferredMonth)} sub={r.language ?? ''} /> },
    { key: 'submittedAt', header: 'Submitted', sortable: true, sortValue: (r) => r.submittedAt, render: (r) => fmtDate(r.submittedAt) },
    { key: 'assigneeName', header: 'SGS contact', render: (r) => r.assigneeName ?? '—' },
    { key: 'status', header: 'Status', render: (r) => { const s = TR_STATUS(r.status); return <StatusTag status={s[0] as 'info'} size="sm" label={s[1]} />; } },
  ];
  const open = (r: RequestRow) => ({ label: 'Open', onClick: () => router.push(opsHref('training', r.id)) });
  const t = (sts: string[], acts: (r: RequestRow) => { label: string; danger?: boolean; onClick: () => void }[]) =>
    <DataTable<RequestRow> columns={cols} rows={rows.filter((r) => sts.includes(r.status))} layout="table" searchable searchPlaceholder="Search requests or customers" rowActions={acts} getRowId={(r) => r.id} loading={q.loading && !q.data} />;
  const count = (sts: string[]) => rows.filter((r) => sts.includes(r.status)).length;
  // Withdrawn requests have no tab in the design; they are listed with Rejected. TODO(open-question): see docs/design-questions.md Q29.
  return (
    <ListLayout crumbs={[{ label: 'Requests', href: '/ops/requests' }, { label: 'Training' }]} title="Training requests" description="Assign each request to an SGS contact, or reject it with a reason.">
      <section className="gr-card gr-card--extend docs-card">
        <Tabs label="Request status" defaultTab={params.get('tab') ?? 'todo'} tabs={[
          { id: 'todo', label: 'To assign', badge: count(['submitted', 'information_requested']), content: t(['submitted', 'information_requested'], (r) => r.status === 'submitted' ? [
            { label: 'Assign', onClick: () => setAssign(r) }, { label: 'Reject', danger: true, onClick: async () => setReject(await getRequest(session, r.id)) }] : [open(r)]) },
          { id: 'as', label: 'Assigned', badge: count(['assigned']), content: t(['assigned'], (r) => [open(r)]) },
          { id: 'rj', label: 'Rejected', badge: count(['rejected', 'withdrawn']), content: t(['rejected', 'withdrawn'], (r) => [open(r)]) },
        ]} />
      </section>
      <AssignTrainingModal session={session} request={assign} onClose={() => setAssign(undefined)} />
      {reject ? <RejectModal session={session} request={reject} open onClose={() => setReject(undefined)} /> : null}
    </ListLayout>
  );
}

export function SgsTrainingDetail({ id }: { id: string }) {
  const { session } = usePersona();
  const q = useMockQuery(() => getRequest(session, id), [session.user.id, id]);
  const [modal, setModal] = useState<'assign' | 'reject'>();
  if (!triage(session)) return <NotAllowed what="training requests" />;
  if (q.error) return <NotFound what="request" />;
  const r = q.data;
  if (!r) return <Skeleton lines={8} />;
  const st = TR_STATUS(r.status);
  const actions = r.status === 'submitted'
    ? <div className="btn-row"><Button variant="tertiary" size="md" onClick={() => setModal('reject')}>{translate("Reject")}</Button><Button size="md" onClick={() => setModal('assign')}>{translate("Assign")}</Button></div> : undefined;
  return (
    <DetailLayout backHref="/ops/requests/training" sidebar="expanded" sections={[{ id: 'rq', label: 'Request' }, { id: 'hist', label: 'History' }, { id: 'notes', label: 'Internal notes' }]}
      header={{ title: `${r.id} · ${shortCourse(r)}`, subtitle: `${r.customerName} · ${people(r.participants)}`, status: { status: st[0] as 'info', label: st[1], shortLabel: st[1] }, actions }}
      aside={<>
        <div className="title-medium">{translate("Customer")}</div>
        <AsideBox title={r.customerName}><span className="body-small muted">Contact: {r.requester?.name} · {r.requester?.email}</span></AsideBox>
        {r.assignee ? <PersonBox title="SGS contact" person={r.assignee} sub={r.assignee.title ?? 'SGS'} /> : null}
      </>}>
      <div data-section="rq"><Card number={1} title="Request" subtitle={`Submitted ${fmtDate(r.submittedAt)} by ${r.requester?.name}`} actions={<NoDesign />}><Facts items={trainingFacts(r)} /></Card></div>
      <div data-section="hist"><Card number={2} title="History"><Timeline steps={r.timeline} /></Card></div>
      <div data-section="notes" className="card-extend"><InternalNotes session={session} request={r} number={3} /></div>
      <AssignTrainingModal session={session} request={modal === 'assign' ? r : undefined} onClose={() => setModal(undefined)} />
      <RejectModal session={session} request={r} open={modal === 'reject'} onClose={() => setModal(undefined)} />
    </DetailLayout>
  );
}
