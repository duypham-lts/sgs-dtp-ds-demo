'use client';
// Modals of service requests: WithdrawModal (designs/06 old set, decisions D4, all categories),
// Request information (D3, no design), Approve & assign (06 MvpAdminApprove, 07 IsAdminApprove),
// Reject (06 MvpAdminReject, 07 IsAdminReject).
import { DatePicker, Modal, Select, Textarea } from '@sgs/graphite';
import { useState } from 'react';
import { getDb, MockApiError, TODAY, type Session } from '@/mock';
import { REJECT_REASONS, WITHDRAW_REASONS } from '@/mock/requestMeta';
import { approveAndAssign, consultantOptions, rejectRequest, requestInformation, withdrawRequest, type RequestView } from '@/mock/api/requests';
import { useSnackbar } from '@/ui/snackbar';
import { NoDesign } from '@/shell/PageHead';
import { CONSULTING_COPY, type ConsultingCategory } from './config';

const opts = (xs: string[]) => xs.map((x) => ({ value: x, label: x }));
const clearOn = <T,>(set: (fn: (x: T) => T) => void, k: keyof T) => set((x) => ({ ...x, [k]: undefined }));

export function WithdrawModal({ session, request, open, onClose }: { session: Session; request: RequestView; open: boolean; onClose: () => void }) {
  const snack = useSnackbar();
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const close = () => { setReason(''); setComment(''); onClose(); };
  return (
    <Modal open={open} size="fit" danger title="Withdraw this request?" onClose={close}
      primaryAction={{ label: 'Withdraw request', onClick: async () => {
        try { await withdrawRequest(session, request.id, { reason, comment }); snack(`${request.id} withdrawn. SGS stops reviewing it.`); close(); }
        catch (e) { if (e instanceof MockApiError) { snack(e.message); close(); } else throw e; }
      } }}
      secondaryAction={{ label: 'Keep request', onClick: close }}>
      <div className="modal-body" style={{ width: 428 }}>
        <p className="body-medium muted" style={{ margin: 0 }}>{request.id} moves to Withdrawn and SGS stops reviewing it. You can send a new request any time.</p>
        <Select label="Reason (optional)" size="m" placeholder="Select a reason" options={opts(WITHDRAW_REASONS)} value={reason} onChange={(_, v) => setReason(v)} />
        <Textarea label="Comment for SGS (optional)" size="m" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>
    </Modal>
  );
}

export function RequestInfoModal({ session, request, open, onClose }: { session: Session; request: RequestView; open: boolean; onClose: () => void }) {
  const snack = useSnackbar();
  const [q, setQ] = useState('');
  const [due, setDue] = useState('');
  const [err, setErr] = useState<string>();
  const close = () => { setQ(''); setDue(''); setErr(undefined); onClose(); };
  return (
    <Modal open={open} size="fit" title="Request information" onClose={close}
      primaryAction={{ label: 'Send to customer', onClick: async () => {
        if (!q.trim()) { setErr('Write what you need from the customer.'); return; }
        await requestInformation(session, request.id, { question: q, dueOn: due }); snack(`Information requested. ${request.customerName} is notified.`); close();
      } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <div className="btn-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="body-medium muted" style={{ margin: 0, flex: 1 }}>{request.id} moves to “Action required” until {request.customerName} answers. The customer sees your question.</p>
          <NoDesign />
        </div>
        <Textarea label="What do you need?" required size="l" rows={3} value={q} error={err} onChange={(e) => { setQ(e.target.value); setErr(undefined); }} />
        <DatePicker label="Answer by (optional)" width="268px" today={TODAY} min={TODAY} value={due} onChange={setDue} />
      </div>
    </Modal>
  );
}

export function ApproveModal({ session, request, category, open, onClose }: { session: Session; request: RequestView; category: ConsultingCategory; open: boolean; onClose: () => void }) {
  const snack = useSnackbar();
  const c = CONSULTING_COPY[category];
  const [v, setV] = useState({ consultantId: '', from: '', to: '', message: '' });
  const [e, setE] = useState<{ consultantId?: string; from?: string; to?: string }>({});
  const close = () => { setV({ consultantId: '', from: '', to: '', message: '' }); setE({}); onClose(); };
  async function save() {
    const x: typeof e = {};
    if (!v.consultantId) x.consultantId = 'Choose a consultant.';
    if (!v.from) x.from = 'Choose a start date.';
    if (!v.to) x.to = 'Choose an end date.';
    else if (v.from && v.to < v.from) x.to = 'The end must be after the start.';
    setE(x);
    if (Object.keys(x).length) return;
    try {
      await approveAndAssign(session, request.id, v);
      snack(`Request approved · ${getDb().users.find((u) => u.id === v.consultantId)?.displayName} assigned`);
      close();
    } catch (err) { if (err instanceof MockApiError) setE({ consultantId: err.message }); else throw err; }
  }
  return (
    <Modal open={open} size="fit" title="Approve and assign consultant" onClose={close}
      primaryAction={{ label: 'Approve & assign', onClick: save }} secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <p className="body-medium muted" style={{ margin: 0 }}>{request.id} · {request.customerName}. The request moves to In progress and the consultant can read the workspace until {category === 'gap_analysis' ? 'the report is delivered' : 'it is completed'}.</p>
        <Select label="Consultant" width="552px" required placeholder="Choose a consultant" options={consultantOptions(getDb(), session)} value={v.consultantId} error={e.consultantId}
          onChange={(_, x) => { setV({ ...v, consultantId: x }); clearOn(setE, 'consultantId'); }} />
        <div className="field-row">
          <DatePicker label={c.approveFrom} width="268px" required today={TODAY} min={TODAY} value={v.from} error={e.from} onChange={(x) => { setV({ ...v, from: x }); clearOn(setE, 'from'); }} />
          <DatePicker label={c.approveTo} width="268px" required today={TODAY} min={v.from || TODAY} value={v.to} error={e.to} onChange={(x) => { setV({ ...v, to: x }); clearOn(setE, 'to'); }} />
        </div>
        <Textarea label="Message to the customer (optional)" size="l" rows={2} placeholder={c.approvePlaceholder} value={v.message} onChange={(x) => setV({ ...v, message: x.target.value })} />
      </div>
    </Modal>
  );
}

export function RejectModal({ session, request, open, onClose }: { session: Session; request: RequestView; open: boolean; onClose: () => void }) {
  const snack = useSnackbar();
  const [v, setV] = useState({ reason: '', message: '' });
  const [e, setE] = useState<{ reason?: string; message?: string }>({});
  const close = () => { setV({ reason: '', message: '' }); setE({}); onClose(); };
  return (
    <Modal open={open} size="fit" danger title="Reject this request?" onClose={close}
      primaryAction={{ label: 'Reject request', onClick: async () => {
        const x: typeof e = {};
        if (!v.reason) x.reason = 'Select a reason.';
        if (!v.message.trim()) x.message = 'Write a message to the customer.';
        setE(x);
        if (Object.keys(x).length) return;
        await rejectRequest(session, request.id, v); snack(`${request.id} rejected. The customer sees your reason.`); close();
      } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <p className="body-medium muted" style={{ margin: 0 }}>The customer sees the reason and your message.</p>
        <Select label="Reason" required size="m" placeholder="Select a reason" options={opts(REJECT_REASONS)} value={v.reason} error={e.reason} onChange={(_, x) => { setV({ ...v, reason: x }); clearOn(setE, 'reason'); }} />
        <Textarea label="Message to the customer" required size="l" rows={3} helpText="Be specific about what they can do next." value={v.message} error={e.message} onChange={(x) => { setV({ ...v, message: x.target.value }); clearOn(setE, 'message'); }} />
      </div>
    </Modal>
  );
}
