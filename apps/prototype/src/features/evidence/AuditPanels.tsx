'use client';
// The customer's workspace while an audit review runs (designs/08 WorkspaceLocked, CorrectiveNotAccepted) and
// after it closed (08 WorkspaceAfterReview). The auditor's requests are answered here too: while the workspace is
// locked, a response is the only way to add files.
import { Button, DocumentItem, InlineNotification, StatusTag, Tag } from '@sgs/graphite';
import { useState } from 'react';
import type { Session } from '@/mock';
import { FINDING_LABEL, ITEM_LABEL, type ItemView, type ReviewView } from '@/mock/api/audit';
import type { EvidenceRow } from '@/mock/api/evidence';
import { useFakeDownload } from '@/ui/download';
import { fmtDate, fmtUs, fsize } from '@/ui/format';
import { CorrectiveModal, RespondModal } from '../review/customerReview';

/** Review statuses in the customer's navigator (labels of design-questions Q13). */
export const CUSTOMER_RN_LABELS: Record<string, ['draft' | 'completed' | 'needs-description' | 'missing-info' | 'under-review', string]> = {
  none: ['draft', 'Not reviewed'], acc: ['completed', 'Accepted'], clar: ['needs-description', 'Clarification requested'], find: ['missing-info', 'Finding'], resp: ['under-review', 'Response submitted'], cwf: ['completed', 'Closed with finding'],
};
export const RN_OF: Record<string, string> = { not_reviewed: 'none', accepted: 'acc', clarification_requested: 'clar', finding_raised: 'find', response_submitted: 'resp', closed_with_finding: 'cwf' };
export const itemTag = (i?: ItemView): [string, string] | undefined => (i ? [CUSTOMER_RN_LABELS[RN_OF[i.status]][0], i.status === 'finding_raised' ? 'Finding' : ITEM_LABEL[i.status][1]] : undefined);

export function FromAuditor({ session, review, item }: { session: Session; review: ReviewView; item?: ItemView }) {
  const [respond, setRespond] = useState(false);
  const [corr, setCorr] = useState(false);
  if (!item || (!item.findings.length && !item.clarifications.length)) return null;
  const writer = session.user.role === 'customer_admin' || session.user.role === 'customer_user';
  const f = item.findings.find((x) => x.status !== 'closed') ?? item.findings[item.findings.length - 1];
  const c = item.clarifications[item.clarifications.length - 1];
  const rejected = f?.actions.filter((a) => a.decision === 'not_accepted').pop();
  const last = f?.actions[f.actions.length - 1];
  return (
    <section className="gr-card">
      <div className="gr-card__head"><div><h2 className="gr-card__title">From the auditor</h2><p className="gr-card__sub">Respond here — this is the only way to add files while the workspace is locked</p></div></div>
      {f ? (
        <div className="ee-block">
          <div className="req-body__head" style={{ alignItems: 'center' }}>
            <span className="btn-row" style={{ gap: 8, alignItems: 'center' }}><span className="title-small">{f.code} · {FINDING_LABEL[f.classification]}</span>{f.dueOn && f.status !== 'closed' ? <Tag tone="required">{`Due ${fmtDate(f.dueOn)}${f.overdue ? ' · overdue' : ''}`}</Tag> : null}</span>
            <StatusTag status={f.status === 'closed' ? 'completed' : f.status === 'response_submitted' ? 'under-review' : 'missing-info'} label={f.status === 'closed' ? 'Closed' : f.status === 'response_submitted' ? 'Response submitted' : rejected ? 'Open · resubmit' : 'Open'} size="sm" />
          </div>
          <span className="body-medium">{f.text}</span>
          <span className="body-small muted">Raised by {f.raisedByName} on {fmtDate(f.raisedAt)}{f.relatedEvidenceIds.length ? ` · about ${item.evidence.filter((e) => f.relatedEvidenceIds.includes(e.id)).map((e) => e.fileName).join(', ')}` : ''}</span>
          {f.dueChanges.length ? <span className="body-small muted">Due date changed to {fmtDate(f.dueChanges[f.dueChanges.length - 1].to)}: {f.dueChanges[f.dueChanges.length - 1].reason}</span> : null}
          {rejected && f.status === 'open' ? <>
            <InlineNotification kind="error" title={`Corrective action not accepted · ${fmtDate(rejected.decidedAt)}`}>{review.auditorName}: {rejected.comment}</InlineNotification>
            <div className="two-line" style={{ gap: 4 }}><span className="body-small muted">Your previous submission · {fmtDate(rejected.submittedAt)}</span><span className="body-small">{rejected.actionTaken} · {rejected.files.length} file{rejected.files.length === 1 ? '' : 's'}</span></div>
          </> : null}
          {f.status === 'response_submitted' && last ? <span className="body-small muted">Corrective action submitted on {fmtDate(last.submittedAt)}. The auditor evaluates it.</span> : null}
          {f.status === 'open' && f.correctiveRequired && writer && !review.closedAt ? <div><Button size="md" onClick={() => setCorr(true)}>{rejected ? 'Submit corrective action again' : 'Submit corrective action'}</Button></div> : null}
        </div>
      ) : null}
      {c && !f ? (
        <div className="ee-block">
          <div className="req-body__head" style={{ alignItems: 'center' }}>
            <span className="btn-row" style={{ gap: 8, alignItems: 'center' }}><span className="title-small">Clarification requested</span>{!c.answeredAt ? <Tag tone="required">{`Due ${fmtDate(c.dueOn)}${c.overdue ? ' · overdue' : ''}`}</Tag> : null}</span>
            <StatusTag status={c.answeredAt ? 'under-review' : 'needs-description'} label={c.answeredAt ? 'Response submitted' : 'Waiting for you'} size="sm" />
          </div>
          <span className="body-medium">{c.question}</span>
          <span className="body-small muted">Asked by {c.askedByName} on {fmtDate(c.askedAt)}{c.answeredAt ? ` · answered ${fmtDate(c.answeredAt)} by ${c.answeredByName}` : ''}</span>
          {!c.answeredAt && writer && !review.closedAt ? <div><Button size="md" onClick={() => setRespond(true)}>Respond</Button></div> : null}
        </div>
      ) : null}
      <RespondModal session={session} c={respond ? c : undefined} onClose={() => setRespond(false)} />
      <CorrectiveModal session={session} f={corr ? f : undefined} onClose={() => setCorr(false)} />
    </section>
  );
}

export function LockedEvidence({ review, item }: { review: ReviewView; item?: ItemView }) {
  const download = useFakeDownload();
  const files: EvidenceRow[] = item ? [...item.evidence] : [];
  return (
    <section className="gr-card gr-card--extend">
      <div className="gr-card__head"><div><h2 className="gr-card__title">Evidence under review</h2><p className="gr-card__sub">Locked · as submitted on {fmtDate(review.startedAt)}</p></div><Tag tone="neutral">Locked</Tag></div>
      {files.length ? files.map((e) => (
        <DocumentItem key={e.id} docType={e.name} fileName={e.fileName} dateLabel={`Uploaded ${fmtUs(e.uploadedAt)} by ${e.uploadedBy}`} size={fsize(e.sizeBytes)}
          status={e.review === 'accepted' ? 'completed' : 'under-review'} statusLabel={e.review === 'accepted' ? 'Accepted' : 'In review'}
          actions={[{ type: 'view', label: `View ${e.name}`, onClick: () => download(e.fileName) }, { type: 'open', label: `Open ${e.fileName}`, onClick: () => download(e.fileName) }]} />
      )) : <p className="body-medium muted" style={{ margin: 0 }}>No evidence was submitted for this requirement.</p>}
    </section>
  );
}

export function LastAuditResult({ review, item }: { review: ReviewView; item?: ItemView }) {
  if (!item) return (
    <section className="gr-card"><div className="gr-card__head"><div><h2 className="gr-card__title">Last audit result</h2><p className="gr-card__sub">Not in last audit</p></div></div></section>
  );
  const f = item.findings;
  return (
    <section className="gr-card">
      <div className="gr-card__head"><div><h2 className="gr-card__title">Last audit result</h2><p className="gr-card__sub">Audit {review.requestTitle} · {review.auditorName} · closed {fmtDate(review.closedAt)}</p></div></div>
      {f.length ? f.map((x) => {
        const acc = x.actions.find((a) => a.decision === 'accepted');
        return (
          <div key={x.id} className="ee-block" style={{ gap: 8 }}>
            <div className="req-body__head" style={{ alignItems: 'center' }}><span className="title-small">{x.code} · {FINDING_LABEL[x.classification]}</span><StatusTag status="completed" label="Closed" size="sm" /></div>
            <span className="body-medium">{x.text}</span>
            {acc ? <span className="body-small muted">Corrective action accepted on {fmtDate(acc.decidedAt)} · {x.files.filter((e) => acc.files.includes(e.id)).map((e) => e.name.replace(/^Corrective action · F-\d+ · /, '')).join(' and ') || 'no files'}</span> : <span className="body-small muted">No response needed</span>}
          </div>
        );
      }) : <span className="body-medium">{item.status === 'accepted' ? 'Accepted by the auditor.' : ITEM_LABEL[item.status][1]}</span>}
    </section>
  );
}
