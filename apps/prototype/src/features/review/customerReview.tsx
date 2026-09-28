'use client';
import { translate } from '@/i18n/locale';
// Customer side of the audit review: designs/08 Reviews, ReviewFeedback, ReviewOverdue, RespondClarification,
// SubmitCorrectiveAction. UC-REV-004/011/012/013. Labels follow design-questions Q13.
import { Button, DataTable, DatePicker, FileUpload, InlineNotification, Modal, Skeleton, StatusTag, Tabs, Tag, Textarea, type TableColumn } from '@sgs/graphite';
import { useState } from 'react';
import { MockApiError, TODAY, type Session } from '@/mock';
import { FINDING_LABEL, getReview, listReviews, respondClarification, submitCorrectiveAction, type ClarificationView, type FindingView, type ReviewView } from '@/mock/api/audit';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { FieldError, TwoLine } from '@/ui/bits';
import { fmtDate } from '@/ui/format';
import { ListLayout } from '@/ui/layout';
import { useSnackbar } from '@/ui/snackbar';
import { NotFound } from '@/shell/NotAllowed';

const files = (l: FileList) => Array.from(l).map((f) => ({ fileName: f.name, sizeBytes: f.size }));
const shortDue = (iso?: string) => (iso ? fmtDate(iso).slice(0, 6) : '');

export function RespondModal({ session, c, onClose }: { session: Session; c?: ClarificationView; onClose: () => void }) {
  const snack = useSnackbar();
  const [answer, setAnswer] = useState('');
  const [fs, setFs] = useState<{ fileName: string; sizeBytes: number }[]>([]);
  const [err, setErr] = useState<string>();
  const close = () => { setAnswer(''); setFs([]); setErr(undefined); onClose(); };
  return (
    <Modal open={!!c} size="fit" title="Respond to the auditor" onClose={close}
      primaryAction={{ label: 'Send response', onClick: async () => {
        if (!answer.trim()) { setErr('Write your answer.'); return; }
        try { await respondClarification(session, c!.id, { answer, files: fs }); snack(`Response sent for ${c!.requirementCode}`); close(); }
        catch (e) { if (e instanceof MockApiError) setErr(e.message); else throw e; }
      } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      {c ? (
        <div className="modal-body" style={{ width: 552 }}>
          <div className="summary-box" style={{ gap: 4 }}><span className="body-small muted">{c.requirementCode} · {c.askedByName} asked on {fmtDate(c.askedAt)} · due {shortDue(c.dueOn)}</span><span className="body-medium">{c.question}</span></div>
          <Textarea label="Your answer" required size="l" rows={3} value={answer} error={err} onChange={(e) => { setAnswer(e.target.value); setErr(undefined); }} />
          {c.expect === 'answer_files' ? <FileUpload label="Files (optional)" hint={`Added to the workspace under ${c.requirementCode} as part of this response`} onFilesAdded={(l) => { const add = files(l); setFs((x) => [...x, ...add]); }} onRemove={(r) => setFs((x) => x.filter((y) => y.fileName !== r.name))} /> : null}
        </div>
      ) : null}
    </Modal>
  );
}

export function CorrectiveModal({ session, f, onClose }: { session: Session; f?: FindingView; onClose: () => void }) {
  const snack = useSnackbar();
  const init = { action: '', done: '', note: '' };
  const [v, setV] = useState(init);
  const [fs, setFs] = useState<{ fileName: string; sizeBytes: number }[]>([]);
  const [e, setE] = useState<{ action?: string; done?: string; files?: string }>({});
  const close = () => { setV(init); setFs([]); setE({}); onClose(); };
  return (
    <Modal open={!!f} size="fit" title="Submit corrective action" onClose={close}
      primaryAction={{ label: 'Submit', onClick: async () => {
        const x: typeof e = {};
        if (!v.action.trim()) x.action = 'Describe the action taken.';
        if (!v.done) x.done = 'Choose when it was completed.';
        if (!fs.length) x.files = 'Add the evidence of the correction.';
        setE(x);
        if (Object.keys(x).length) return;
        await submitCorrectiveAction(session, f!.id, { actionTaken: v.action, completedOn: v.done, files: fs, note: v.note }); snack(`Corrective action submitted for ${f!.code}`); close();
      } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      {f ? (
        <div className="modal-body" style={{ width: 552 }}>
          <div className="summary-box" style={{ gap: 4 }}><span className="body-small muted">{f.code} · {FINDING_LABEL[f.classification]} · {f.requirementCode} · due {fmtDate(f.dueOn)}</span><span className="body-medium">{f.text}</span></div>
          <Textarea label="Action taken" width="552px" required rows={3} value={v.action} error={e.action} onChange={(x) => { setV({ ...v, action: x.target.value }); setE((y) => ({ ...y, action: undefined })); }} />
          <DatePicker label="Completed on" required today={TODAY} max={TODAY} value={v.done} error={e.done} onChange={(x) => { setV({ ...v, done: x }); setE((y) => ({ ...y, done: undefined })); }} />
          <div>
            <FileUpload label="Evidence of the correction" required hint={`One or more files · added to the workspace under ${f.requirementCode} for this finding`} onFilesAdded={(l) => { const add = files(l); setFs((x) => [...x, ...add]); setE((y) => ({ ...y, files: undefined })); }} onRemove={(r) => setFs((x) => x.filter((y) => y.fileName !== r.name))} />
            <FieldError>{e.files}</FieldError>
          </div>
          <Textarea label="Note for the auditor (optional)" width="552px" rows={2} value={v.note} onChange={(x) => setV({ ...v, note: x.target.value })} />
        </div>
      ) : null}
    </Modal>
  );
}

export function ReviewsPage() {
  const { session } = usePersona();
  const q = useMockQuery(() => listReviews(session), [session.user.id]);
  const rows = q.data ?? [];
  const cols: TableColumn<ReviewView>[] = [
    { key: 'n', header: 'Review', render: (r) => <TwoLine top={`Audit review · ${r.frameworkShort}`} sub={`${r.scopeName}${r.tierLabel ? ` · tier ${r.tierLabel}` : ''}`} href={`/reviews/${r.id}`} /> },
    { key: 'requestTitle', header: 'Request', width: 130 },
    { key: 'auditorName', header: 'Auditor', width: 130 },
    { key: 'todo', header: 'Need your response', width: 190, render: (r) => {
      const due = r.items.flatMap((i) => [...i.clarifications.filter((c) => !c.answeredAt).map((c) => c.dueOn), ...i.findings.filter((f) => f.status === 'open' && f.dueOn).map((f) => f.dueOn!)]).sort()[0];
      return r.counts.needYou && !r.closedAt ? <Tag tone="required">{`${r.counts.needYou} item${r.counts.needYou === 1 ? '' : 's'}${due ? ` · next due ${shortDue(due)}` : ''}`}</Tag> : '—';
    } },
    { key: 'status', header: 'Status', width: 150, render: (r) => <StatusTag status={r.closedAt ? 'completed' : 'under-review'} size="sm" label={r.closedAt ? 'Closed' : 'In progress'} /> },
  ];
  const open = rows.filter((r) => !r.closedAt), closed = rows.filter((r) => r.closedAt);
  const t = (list: ReviewView[]) => <DataTable<ReviewView> columns={cols} rows={list} layout="table" paginate={false} getRowId={(r) => r.id} loading={q.loading && !q.data} emptyState={{ title: 'No reviews here', body: 'Audit reviews appear when SGS starts auditing one of your workspaces.' }} />;
  return (
    <ListLayout crumbs={[{ label: 'Reviews' }]} title="Reviews" description="Audit reviews SGS runs on your workspaces. Respond to the auditor’s requests and findings here.">
      <section className="gr-card gr-card--extend docs-card">
        <Tabs label="Review status" tabs={[{ id: 'o', label: 'Open', badge: open.length, content: t(open) }, { id: 'c', label: 'Closed', badge: closed.length, content: t(closed) }]} />
      </section>
    </ListLayout>
  );
}

type Row = { id: string; code: string; title: string; kind: 'clar' | 'finding'; tone: ['needs-description' | 'missing-info' | 'info' | 'completed', string]; msg: string; due?: string; overdue: boolean; action: React.ReactNode };

export function ReviewFeedbackPage({ id }: { id: string }) {
  const { session } = usePersona();
  const q = useMockQuery(() => getReview(session, id), [session.user.id, id]);
  const [respond, setRespond] = useState<ClarificationView>();
  const [corr, setCorr] = useState<FindingView>();
  if (q.error) return <NotFound what="review" />;
  const rv = q.data;
  if (!rv) return <Skeleton lines={8} />;
  const writer = session.user.role === 'customer_admin' || session.user.role === 'customer_user';
  const closed = !!rv.closedAt;
  const rows: Row[] = [];
  for (const i of rv.items) {
    const c = i.clarifications[i.clarifications.length - 1];
    if (c) rows.push({ id: c.id, code: i.requirement.code, title: i.requirement.title, kind: 'clar', tone: ['needs-description', 'Clarification requested'], msg: c.question, due: c.dueOn, overdue: c.overdue,
      action: c.answeredAt ? <StatusTag status="under-review" size="sm" label="Response submitted" /> : writer && !closed ? <Button size="sm" variant="tertiary" onClick={() => setRespond(c)}>{translate("Respond")}</Button> : <span className="body-small muted">{translate("Waiting")}</span> });
    for (const f of i.findings) {
      const resubmit = f.status === 'open' && f.actions.some((a) => a.decision === 'not_accepted');
      rows.push({ id: f.id, code: i.requirement.code, title: i.requirement.title, kind: 'finding', tone: [f.classification === 'observation' || f.classification === 'ofi' ? 'info' : 'missing-info', FINDING_LABEL[f.classification]], msg: f.text, due: f.dueOn, overdue: f.overdue,
        action: !f.correctiveRequired ? <span className="body-small muted">{translate("No response needed")}</span>
          : f.status === 'closed' ? <StatusTag status="completed" size="sm" label="Closed" />
          : f.status === 'response_submitted' ? <StatusTag status="under-review" size="sm" label="Response submitted" />
          : writer && !closed ? <Button size="sm" onClick={() => setCorr(f)}>{resubmit ? 'Submit again' : 'Submit corrective action'}</Button> : <span className="body-small muted">{translate("Waiting")}</span> });
    }
  }
  const overdue = rows.filter((r) => r.overdue);
  const cols: TableColumn<Row>[] = [
    { key: 'code', header: 'Requirement', render: (r) => <TwoLine top={r.code} sub={r.title} /> },
    { key: 'tone', header: 'Type', width: 190, render: (r) => <StatusTag status={r.tone[0]} size="sm" label={r.tone[1]} /> },
    { key: 'msg', header: 'From the auditor' },
    { key: 'due', header: 'Due', width: 130, render: (r) => (r.overdue ? <Tag tone="required">{`${fmtDate(r.due)} · overdue`}</Tag> : r.due ? fmtDate(r.due) : '—') },
    { key: 'action', header: '', align: 'end', width: 220, render: (r) => r.action },
  ];
  return (
    <ListLayout crumbs={[{ label: 'Reviews', href: '/reviews' }, { label: `Audit review · ${rv.requestTitle}` }]} title={`Audit review · ${rv.frameworkShort}`}
      description={`${rv.scopeName} · ${rv.requestTitle} · auditor ${rv.auditorName} · started ${fmtDate(rv.startedAt)}${closed ? ` · closed ${fmtDate(rv.closedAt)}` : ''}`}>
      {overdue.length && !closed ? (
        <InlineNotification kind="error" title={`${overdue.length} response${overdue.length === 1 ? ' is' : 's are'} overdue`}>
          {overdue.map((o) => o.code).join(', ')} {overdue.length === 1 ? 'was' : 'were'} due on {overdue.map((o) => fmtDate(o.due)).join(', ')}. Respond as soon as you can, or contact {rv.auditorName} if you need more time. Open items delay the certificate.
        </InlineNotification>
      ) : null}
      <section className="gr-card gr-card--extend docs-card">
        <DataTable<Row> title={closed ? 'All auditor requests and findings' : `${rv.counts.needYou} need your response`} description="Findings and clarification requests from this audit review only." columns={cols} rows={rows} layout="table" paginate={false} getRowId={(r) => r.id}
          emptyState={{ title: 'Nothing from the auditor yet', body: 'Clarification requests and findings appear here as the auditor reviews your evidence.' }} />
      </section>
      <RespondModal session={session} c={respond} onClose={() => setRespond(undefined)} />
      <CorrectiveModal session={session} f={corr} onClose={() => setCorr(undefined)} />
    </ListLayout>
  );
}
