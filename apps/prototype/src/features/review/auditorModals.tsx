'use client';
import { translate } from '@/i18n/locale';
// Auditor modals and drawers of designs/08: AudStartReview, AudClarification, AudRaiseFinding, AudEvaluate,
// AudEvaluateClarification, AudChangeDueDate, AudCloseReview.
import { Button, Checkbox, DatePicker, DocumentItem, Drawer, FileUpload, InlineNotification, Modal, MultiSelect, Radio, Select, Textarea } from '@sgs/graphite';
import { useState } from 'react';
import { MockApiError, TODAY, type FindingClass, type Session } from '@/mock';
import { changeDueDate, closeReview, evaluateAnswer, evaluateCorrective, FINDING_LABEL, FINDING_OPTIONS, raiseFinding, requestClarification, startReview, type ClarificationView, type FindingView, type ItemView, type ReviewView } from '@/mock/api/audit';
import type { RequestView } from '@/mock/api/requests';
import { FieldError, StatTile } from '@/ui/bits';
import { useFakeDownload } from '@/ui/download';
import { fmtDate, fmtUs, fsize } from '@/ui/format';
import { useSnackbar } from '@/ui/snackbar';

const plainFiles = (l: FileList) => Array.from(l).map((f) => ({ fileName: f.name, sizeBytes: f.size }));

export function StartReviewModal({ session, request, open, onClose, onStarted }: { session: Session; request: RequestView; open: boolean; onClose: () => void; onStarted: () => void }) {
  const snack = useSnackbar();
  const tier = request.workspaceLabel;
  return (
    <Modal open={open} size="fit" title="Start audit review" onClose={onClose}
      primaryAction={{ label: 'Start review', onClick: async () => { await startReview(session, request.id); snack(`Audit review started. ${request.customerName}’s workspace is locked.`); onClose(); onStarted(); } }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}>
      <div className="modal-body" style={{ width: 520, gap: 12 }}>
        <p className="body-medium" style={{ margin: 0 }}>{translate("Start the audit review of")} <strong>{request.serviceFrameworkVersion} · {request.scopeName}</strong>?</p>
        <ul className="body-medium muted plain-list">
          <li>{request.workspaceStats?.requirements} review items are created, one per requirement{tier ? ' of the workspace tier' : ''}.</li>
          <li>{translate("The customer’s workspace is locked; they can only add files by responding to you.")}</li>
          <li>{translate("The request moves to In progress and the customer is notified.")}</li>
        </ul>
      </div>
    </Modal>
  );
}

export function ClarificationModal({ session, item, onClose }: { session: Session; item?: ItemView; onClose: () => void }) {
  const snack = useSnackbar();
  const [q, setQ] = useState('');
  const [expect, setExpect] = useState<'answer_files' | 'answer'>('answer_files');
  const [due, setDue] = useState('');
  const [e, setE] = useState<{ q?: string; due?: string }>({});
  const close = () => { setQ(''); setDue(''); setE({}); onClose(); };
  return (
    <Modal open={!!item} size="fit" title="Request clarification" onClose={close}
      primaryAction={{ label: 'Send to customer', onClick: async () => {
        const x: typeof e = {};
        if (!q.trim()) x.q = 'Write your question.';
        if (!due) x.due = 'Choose a due date.';
        setE(x);
        if (Object.keys(x).length) return;
        await requestClarification(session, item!.id, { question: q, expect, dueOn: due }); snack(`Clarification sent for ${item!.requirement.code}`); close();
      } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <p className="body-small muted" style={{ margin: 0 }}>{item?.requirement.code} · {item?.requirement.title}</p>
        <Textarea label="Question for the customer" required size="l" rows={3} value={q} error={e.q} onChange={(x) => { setQ(x.target.value); setE((y) => ({ ...y, q: undefined })); }} />
        <fieldset className="plain-fieldset">
          <legend className="label-small muted" style={{ marginBottom: 4 }}>{translate("Expected response")}</legend>
          <div className="btn-row" style={{ gap: 24 }}><Radio name="exp" label="Answer and files" checked={expect === 'answer_files'} onChange={() => setExpect('answer_files')} /><Radio name="exp" label="Answer only" checked={expect === 'answer'} onChange={() => setExpect('answer')} /></div>
        </fieldset>
        <DatePicker label="Due date" required today={TODAY} min={TODAY} value={due} error={e.due} onChange={(v) => { setDue(v); setE((y) => ({ ...y, due: undefined })); }} />
      </div>
    </Modal>
  );
}

export function RaiseFindingModal({ session, item, onClose }: { session: Session; item?: ItemView; onClose: () => void }) {
  const snack = useSnackbar();
  const init = { cls: '' as FindingClass | '', text: '', ev: [] as string[], corrective: true, due: '', note: '' };
  const [v, setV] = useState(init);
  const [e, setE] = useState<{ cls?: string; text?: string; due?: string }>({});
  const close = () => { setV(init); setE({}); onClose(); };
  const needsDue = v.corrective && (v.cls === 'major' || v.cls === 'minor');
  return (
    <Modal open={!!item} size="fit" title="Raise finding" onClose={close}
      primaryAction={{ label: 'Raise finding', onClick: async () => {
        const x: typeof e = {};
        if (!v.cls) x.cls = 'Choose the classification.';
        if (!v.text.trim()) x.text = 'Describe the finding.';
        if (needsDue && !v.due) x.due = 'Choose a due date.';
        setE(x);
        if (Object.keys(x).length) return;
        try { const code = await raiseFinding(session, item!.id, { classification: v.cls as FindingClass, text: v.text, relatedEvidenceIds: v.ev, correctiveRequired: v.corrective, dueOn: v.due, internalNote: v.note }); snack(`${code} raised on ${item!.requirement.code}`); close(); }
        catch (err) { if (err instanceof MockApiError) setE({ text: err.message }); else throw err; }
      } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <p className="body-small muted" style={{ margin: 0 }}>{item?.requirement.code} · {item?.requirement.title}</p>
        <Select label="Classification" required width="552px" placeholder="Choose" options={FINDING_OPTIONS} value={v.cls} error={e.cls} onChange={(_, x) => { setV({ ...v, cls: x as FindingClass }); setE((y) => ({ ...y, cls: undefined })); }} />
        <Textarea label="Finding" required size="l" rows={3} value={v.text} error={e.text} onChange={(x) => { setV({ ...v, text: x.target.value }); setE((y) => ({ ...y, text: undefined })); }} />
        <MultiSelect label="Related evidence (optional)" width="552px" options={(item?.evidence ?? []).map((x) => ({ value: x.id, label: x.fileName }))} value={v.ev} onChange={(x) => setV({ ...v, ev: x })} />
        {v.cls === 'observation' || v.cls === 'ofi' ? <InlineNotification kind="info" title="No response needed">An {v.cls === 'ofi' ? 'opportunity for improvement' : 'observation'} closes right away; the customer sees it.</InlineNotification> : (
          <div className="field-row" style={{ alignItems: 'flex-start', gap: 24 }}>
            <Checkbox label="Corrective action required" checked={v.corrective} onChange={(x) => setV({ ...v, corrective: x.target.checked })} />
            {v.corrective ? <DatePicker label="Due date" required today={TODAY} min={TODAY} value={v.due} error={e.due} onChange={(x) => { setV({ ...v, due: x }); setE((y) => ({ ...y, due: undefined })); }} /> : null}
          </div>
        )}
        <Textarea label="Internal note (optional)" size="l" rows={2} placeholder="Only visible to SGS" value={v.note} onChange={(x) => setV({ ...v, note: x.target.value })} />
      </div>
    </Modal>
  );
}

function FileRows({ files }: { files: FindingView['files'] }) {
  const download = useFakeDownload();
  return <>{files.map((f) => <DocumentItem key={f.id} docType={f.name.replace(/^Corrective action · F-\d+ · /, '')} fileName={f.fileName} dateLabel={fmtUs(f.uploadedAt)} size={fsize(f.sizeBytes)} actions={[{ type: 'view', label: `View ${f.fileName}`, onClick: () => download(f.fileName) }, { type: 'download', label: `Download ${f.fileName}`, onClick: () => download(f.fileName) }]} />)}</>;
}

export function EvaluateDrawer({ session, finding, onClose }: { session: Session; finding?: FindingView; onClose: () => void }) {
  const snack = useSnackbar();
  const [dec, setDec] = useState<'accepted' | 'not_accepted'>('accepted');
  const [comment, setComment] = useState('');
  const [err, setErr] = useState<string>();
  const close = () => { setDec('accepted'); setComment(''); setErr(undefined); onClose(); };
  const a = finding?.actions[finding.actions.length - 1];
  return (
    <Drawer open={!!finding} size="lg" onClose={close} title={`Evaluate corrective action · ${finding?.code ?? ''}`}
      subtitle={finding && a ? `${FINDING_LABEL[finding.classification]} · ${finding.requirementCode} · submitted ${fmtDate(a.submittedAt)}` : undefined}
      footer={<><span style={{ flexGrow: 1 }} /><Button variant="tertiary" size="md" onClick={close}>{translate("Cancel")}</Button><Button size="md" onClick={async () => {
        if (dec === 'not_accepted' && !comment.trim()) { setErr('Tell the customer what is missing.'); return; }
        await evaluateCorrective(session, finding!.id, { decision: dec, comment }); snack(dec === 'accepted' ? `${finding!.code} closed` : `${finding!.code} sent back to the customer`); close();
      }}>{translate("Save decision")}</Button></>}>
      {finding && a ? (
        <div className="drawer-body" style={{ gap: 20 }}>
          <div className="drawer-section" style={{ gap: 4 }}><span className="title-small">{translate("Finding")}</span><span className="body-medium">{finding.text}</span></div>
          <div className="drawer-section" style={{ gap: 4 }}><span className="title-small">Action taken · completed {fmtDate(a.completedOn)}</span><span className="body-medium">{a.actionTaken}</span>{a.note ? <span className="body-small muted">Note: {a.note}</span> : null}</div>
          <div className="drawer-section"><span className="title-small">Evidence ({a.files.length})</span><FileRows files={finding.files.filter((f) => a.files.includes(f.id))} /></div>
          <fieldset className="plain-fieldset" style={{ gap: 4 }}>
            <legend className="label-small muted" style={{ marginBottom: 4 }}>{translate("Decision")} <span className="gr-req">*</span></legend>
            <Radio name="dec" label="Accept — close the finding" checked={dec === 'accepted'} onChange={() => setDec('accepted')} />
            <Radio name="dec" label="Not accepted — send back to the customer" checked={dec === 'not_accepted'} onChange={() => setDec('not_accepted')} />
          </fieldset>
          <Textarea label="Comment to the customer (required if not accepted)" size="l" rows={2} value={comment} error={err} onChange={(x) => { setComment(x.target.value); setErr(undefined); }} />
        </div>
      ) : null}
    </Drawer>
  );
}

export function EvaluateAnswerDrawer({ session, item, clarification, onClose, onRaiseFinding }: { session: Session; item?: ItemView; clarification?: ClarificationView; onClose: () => void; onRaiseFinding: () => void }) {
  const snack = useSnackbar();
  const [next, setNext] = useState<'accept' | 'followup' | 'finding'>('accept');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState<string>();
  const close = () => { setNext('accept'); setMsg(''); setErr(undefined); onClose(); };
  const c = clarification;
  return (
    <Drawer open={!!c} size="lg" onClose={close} title={`Evaluate answer · ${item?.requirement.code ?? ''}`} subtitle={c ? `Clarification sent ${fmtDate(c.askedAt).slice(0, 6)} · answered ${fmtDate(c.answeredAt)} by ${c.answeredByName}` : undefined}
      footer={<><span style={{ flexGrow: 1 }} /><Button variant="tertiary" size="md" onClick={close}>{translate("Cancel")}</Button><Button size="md" onClick={async () => {
        if (next === 'finding') { close(); onRaiseFinding(); return; }
        if (next === 'followup' && !msg.trim()) { setErr('Write the follow-up question.'); return; }
        await evaluateAnswer(session, item!.id, { next, message: msg }); snack(next === 'accept' ? `${item!.requirement.code} accepted` : 'Follow-up question sent'); close();
      }}>{translate("Save")}</Button></>}>
      {c ? (
        <div className="drawer-body" style={{ gap: 20 }}>
          <div className="drawer-section" style={{ gap: 4 }}><span className="title-small">{translate("Your question")}</span><span className="body-medium">{c.question}</span></div>
          <div className="drawer-section" style={{ gap: 4 }}><span className="title-small">{translate("Answer")}</span><span className="body-medium">{c.answer}</span></div>
          {c.fileRows.length ? <div className="drawer-section"><span className="title-small">Files ({c.fileRows.length})</span><FileRows files={c.fileRows} /></div> : null}
          <fieldset className="plain-fieldset" style={{ gap: 4 }}>
            <legend className="label-small muted" style={{ marginBottom: 4 }}>{translate("Next step")} <span className="gr-req">*</span></legend>
            <Radio name="nx" label="Accept the requirement" checked={next === 'accept'} onChange={() => setNext('accept')} />
            <Radio name="nx" label="Ask a follow-up question" checked={next === 'followup'} onChange={() => setNext('followup')} />
            <Radio name="nx" label="Raise a finding instead" checked={next === 'finding'} onChange={() => setNext('finding')} />
          </fieldset>
          {/* design-questions Q5: Textarea in the drawer uses 552 instead of 100%. */}
          <Textarea label="Message to the customer (required for a follow-up)" width="552px" rows={2} value={msg} error={err} onChange={(x) => { setMsg(x.target.value); setErr(undefined); }} />
        </div>
      ) : null}
    </Drawer>
  );
}

export function ChangeDueDateModal({ session, finding, onClose }: { session: Session; finding?: FindingView; onClose: () => void }) {
  const snack = useSnackbar();
  const [due, setDue] = useState('');
  const [reason, setReason] = useState('');
  const [e, setE] = useState<{ due?: string; reason?: string }>({});
  const close = () => { setDue(''); setReason(''); setE({}); onClose(); };
  const days = finding?.dueOn ? Math.round((Date.parse(TODAY) - Date.parse(finding.dueOn)) / 86_400_000) : 0;
  return (
    <Modal open={!!finding} size="fit" title="Change due date" onClose={close}
      primaryAction={{ label: 'Save due date', onClick: async () => {
        const x: typeof e = {};
        if (!due) x.due = 'Choose the new due date.';
        if (!reason.trim()) x.reason = 'Give a reason; the customer sees it.';
        setE(x);
        if (Object.keys(x).length) return;
        await changeDueDate(session, finding!.id, { dueOn: due, reason }); snack(`Due date of ${finding!.code} changed to ${fmtDate(due)}`); close();
      } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      {finding ? (
        <div className="modal-body" style={{ width: 552 }}>
          <div className="summary-box"><span className="title-small">{finding.code} · {FINDING_LABEL[finding.classification]} · {finding.requirementCode}</span>
            <span className="body-small muted">Due {fmtDate(finding.dueOn)}{days > 0 ? ` · overdue by ${days} day${days === 1 ? '' : 's'}` : ''} · {finding.actions.length ? 'corrective action submitted' : 'no corrective action yet'}</span></div>
          <DatePicker label="New due date" required width="268px" today={TODAY} min={TODAY} value={due} error={e.due} onChange={(v) => { setDue(v); setE((y) => ({ ...y, due: undefined })); }} />
          <Textarea label="Reason (shown to the customer)" required width="552px" rows={2} value={reason} error={e.reason} onChange={(x) => { setReason(x.target.value); setE((y) => ({ ...y, reason: undefined })); }} />
        </div>
      ) : null}
    </Modal>
  );
}

export function CloseReviewModal({ session, review, open, onClose }: { session: Session; review: ReviewView; open: boolean; onClose: () => void }) {
  const snack = useSnackbar();
  const [report, setReport] = useState<{ fileName: string; sizeBytes: number }>();
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string>();
  const close = () => { setReport(undefined); setOk(false); setErr(undefined); onClose(); };
  const c = review.counts;
  return (
    <Modal open={open} size="fit" title="Close review" onClose={close}
      primaryAction={{ label: 'Close review', onClick: async () => {
        if (!ok) { setErr('Confirm the review is complete.'); return; }
        try { await closeReview(session, review.id, { report, confirmed: ok }); snack(`Review closed. ${review.customerName}’s workspace is unlocked and your access ended.`); close(); }
        catch (e) { if (e instanceof MockApiError) setErr(e.message); else throw e; }
      } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <div className="stat-grid" style={{ gap: 8 }}>
          <StatTile value={c.accepted} label="Accepted" /><StatTile value={c.cwf} label="Closed with finding" /><StatTile value={c.openFindings} label="Open" /><StatTile value={c.reviewed} label="Reviewed" />
        </div>
        {review.state === 'ready'
          ? <InlineNotification kind="success" title="Ready to close">All {c.total} items are final and no finding is open.</InlineNotification>
          : <InlineNotification kind="warning" title="Not ready to close">{c.total - c.accepted - c.cwf} items are not final or a finding is still open.</InlineNotification>}
        <FileUpload label="Audit report (optional)" multiple={false} hint="PDF · shown to the customer on the request" onFilesAdded={(l) => setReport(plainFiles(l)[0])} onRemove={() => setReport(undefined)} />
        <div><Checkbox label="The review is complete. Closing unlocks the customer’s workspace and ends my access." checked={ok} onChange={(x) => { setOk(x.target.checked); setErr(undefined); }} /><FieldError>{err}</FieldError></div>
        <p className="body-small muted" style={{ margin: 0 }}>{translate("Closing the review is not the certification decision. An SGS User creates the certificate afterwards.")}</p>
      </div>
    </Modal>
  );
}
