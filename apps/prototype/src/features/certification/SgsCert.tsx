'use client';
import { translate } from '@/i18n/locale';
// SGS side of certification: designs/08 SgsCertRequests (tabs To assign / In audit / Ready for certificate /
// Closed), SgsAssignAuditor, SgsCreateCert, SgsCertifications; reject with the shared modal (09 AdminReject).
// The request detail for SGS has no design (docs/prototype-plan.md §4.5): same layout as the other SGS detail pages.
import { Button, Card, DataTable, DatePicker, Modal, Select, Skeleton, StatusTag, Tabs, TextInput, Textarea, type TableColumn } from '@sgs/graphite';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getDb, MockApiError, TODAY, type Session } from '@/mock';
import { SR_STATUS } from '@/mock/labels';
import { opsHref } from '@/mock/requestMeta';
import { assignAuditor, auditorOptions, createCertificate, listCertifications, type CertificationRow } from '@/mock/api/certification';
import { getRequest, listRequests, type RequestRow, type RequestView } from '@/mock/api/requests';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { AsideBox, Facts, Timeline, TwoLine } from '@/ui/bits';
import { fmtDate } from '@/ui/format';
import { DetailLayout, ListLayout } from '@/ui/layout';
import { useSnackbar } from '@/ui/snackbar';
import { NoDesign } from '@/shell/PageHead';
import { NotAllowed, NotFound } from '@/shell/NotAllowed';
import { InternalNotes } from '../requests/InternalNotes';
import { RejectModal } from '../consulting/modals';
import { PersonBox } from '../consulting/parts';

const triage = (s: Session) => s.user.role === 'sgs_admin' || s.user.role === 'sgs_user';
const wsLabel = (r: RequestRow) => {
  const db = getDb();
  const ws = db.workspaces.find((w) => w.id === r.workspaceId);
  const tier = ws && db.frameworks.find((f) => f.id === ws.frameworkId)?.tiers.find((t) => t.code === ws.tier)?.label;
  return [r.serviceFrameworkVersion, (r.scopeName ?? '').replace(/ · Taipei$/, ''), tier].filter(Boolean).join(' · ');
};
const periodShort = (p?: string) => (p ? p.replace(/^(\w{3})\w* (\d{4})$/, '$1 $2') : '—');

export function AssignAuditorModal({ session, request, onClose }: { session: Session; request?: RequestRow; onClose: () => void }) {
  const snack = useSnackbar();
  const [aud, setAud] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState<string>();
  const close = () => { setAud(''); setMsg(''); setErr(undefined); onClose(); };
  return (
    <Modal open={!!request} size="fit" title="Assign auditor" onClose={close}
      primaryAction={{ label: 'Assign', onClick: async () => {
        if (!aud) { setErr('Choose an auditor.'); return; }
        try { await assignAuditor(session, request!.id, { auditorId: aud, message: msg }); snack(`${request!.id} assigned to ${getDb().users.find((u) => u.id === aud)?.displayName}`); close(); }
        catch (e) { if (e instanceof MockApiError) setErr(e.message); else throw e; }
      } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      {request ? (
        <div className="modal-body" style={{ width: 552 }}>
          <div className="summary-box"><span className="title-small">{request.id} · {request.customerName}</span><span className="body-small muted">{wsLabel(request)} · preferred {request.preferredPeriod}</span></div>
          <Select label="Auditor" required size="m" placeholder="Choose an auditor" options={auditorOptions(getDb(), session)} value={aud} error={err} helpText="Only SGS Auditor/Certification users. The auditor also runs the audit review." onChange={(_, v) => { setAud(v); setErr(undefined); }} />
          <Textarea label="Message to the customer (optional)" size="l" rows={2} placeholder="e.g. David will contact you this week to agree dates." value={msg} onChange={(e) => setMsg(e.target.value)} />
        </div>
      ) : null}
    </Modal>
  );
}

export function CreateCertModal({ session, request, onClose }: { session: Session; request?: RequestRow; onClose: () => void }) {
  const snack = useSnackbar();
  const empty = { number: '', accreditation: '', certificateDate: '', validTo: '', certificateScope: '', sites: '', contractNumber: '' };
  const [v, setV] = useState(empty);
  const [e, setE] = useState<Partial<Record<keyof typeof empty, string>>>({});
  const set = (k: keyof typeof empty, x: string) => { setV((y) => ({ ...y, [k]: x })); setE((y) => ({ ...y, [k]: undefined })); };
  const close = () => { setV(empty); setE({}); onClose(); };
  const rv = request ? getDb().reviews.find((x) => x.requestId === request.id) : undefined;
  async function save() {
    const x: typeof e = {};
    if (!v.number.trim()) x.number = 'Enter the certificate number.';
    if (!v.accreditation) x.accreditation = 'Choose the accreditation.';
    if (!v.certificateDate) x.certificateDate = 'Choose the certificate date.';
    if (!v.validTo) x.validTo = 'Choose the end of validity.';
    else if (v.certificateDate && v.validTo <= v.certificateDate) x.validTo = 'Valid to must be after the certificate date.';
    if (!v.certificateScope.trim()) x.certificateScope = 'Describe the certificate scope.';
    if (!v.sites.trim()) x.sites = 'List at least one site.';
    setE(x);
    if (Object.keys(x).length) return;
    try { await createCertificate(session, request!.id, { ...v, accreditation: v.accreditation as 'TAF' }); snack(`Certificate ${v.number} created. ${request!.customerName} is notified.`); close(); }
    catch (err) { if (err instanceof MockApiError) setE({ number: err.message }); else throw err; }
  }
  return (
    <Modal open={!!request} size="fit" title="Create certification record" onClose={close} primaryAction={{ label: 'Create and notify customer', onClick: save }} secondaryAction={{ label: 'Cancel', onClick: close }}>
      {request ? (
        <div className="modal-body" style={{ width: 552 }}>
          <div className="summary-box">
            <span className="title-small">{request.id} · {request.customerName} · audit completed {fmtDate(rv?.closedAt)}</span>
            <span className="body-small muted">{wsLabel(request)} · auditor {request.assigneeName} · {getDb().findings.filter((f) => f.reviewId === rv?.id && f.status !== 'closed').length} open findings</span>
          </div>
          <div className="field-row">
            <TextInput label="Certificate number" required width="268px" value={v.number} error={e.number} onChange={(x) => set('number', x.target.value)} />
            <Select label="Accreditation" width="268px" required placeholder="Choose" options={['TAF', 'UKAS', 'Not accredited'].map((a) => ({ value: a, label: a }))} value={v.accreditation} error={e.accreditation} onChange={(_, x) => set('accreditation', x)} />
          </div>
          <div className="field-row">
            <DatePicker label="Certificate date" width="268px" required today={TODAY} value={v.certificateDate} error={e.certificateDate} onChange={(x) => set('certificateDate', x)} />
            <DatePicker label="Valid to" width="268px" required today={TODAY} min={v.certificateDate || TODAY} value={v.validTo} error={e.validTo} onChange={(x) => set('validTo', x)} />
          </div>
          <Textarea label="Certificate scope" required size="l" rows={2} value={v.certificateScope} error={e.certificateScope} onChange={(x) => set('certificateScope', x.target.value)} />
          <Textarea label="Certified sites" required size="l" rows={2} helpText="One site per line." value={v.sites} error={e.sites} onChange={(x) => set('sites', x.target.value)} />
          <div className="field-row">
            <TextInput label="Contract number" width="268px" value={v.contractNumber} onChange={(x) => set('contractNumber', x.target.value)} />
            <TextInput label="Certified by" width="268px" value={session.affiliate.legalName} readOnly />
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export function SgsCertRequests() {
  const { session } = usePersona();
  const router = useRouter();
  const params = useSearchParams();
  const q = useMockQuery(() => listRequests(session, 'certification'), [session.user.id]);
  const [assign, setAssign] = useState<RequestRow>();
  const [reject, setReject] = useState<RequestView>();
  const [cert, setCert] = useState<RequestRow>();
  if (!triage(session)) return <NotAllowed what="certification requests" />;
  const rows = q.data ?? [];
  const cols: TableColumn<RequestRow>[] = [
    { key: 'id', header: 'Request', width: 130, render: (r) => <a href={opsHref('certification', r.id)} className="gr-link" style={{ fontWeight: 500 }}>{r.id}</a> },
    { key: 'customerName', header: 'Customer · workspace', render: (r) => <TwoLine top={r.customerName} sub={wsLabel(r)} />, searchValue: (r) => `${r.id} ${r.customerName} ${wsLabel(r)}` },
    { key: 'preferredPeriod', header: 'Preferred', width: 110, render: (r) => periodShort(r.preferredPeriod) },
    { key: 'assigneeName', header: 'Auditor', width: 130, render: (r) => r.assigneeName ?? '—' },
    { key: 'status', header: 'Status', width: 170, render: (r) => <StatusTag status={r.status === 'in_progress' ? 'under-review' : SR_STATUS[r.status][0]} size="sm" label={SR_STATUS[r.status][1]} /> },
  ];
  const t = (sts: string[], acts: (r: RequestRow) => { label: string; danger?: boolean; onClick: () => void }[]) =>
    <DataTable<RequestRow> columns={cols} rows={rows.filter((r) => sts.includes(r.status))} layout="table" searchable searchPlaceholder="Search requests or customers" rowActions={acts} getRowId={(r) => r.id} loading={q.loading && !q.data} />;
  const open = (r: RequestRow) => ({ label: 'Open', onClick: () => router.push(opsHref('certification', r.id)) });
  const count = (sts: string[]) => rows.filter((r) => sts.includes(r.status)).length;
  return (
    <ListLayout crumbs={[{ label: 'Requests', href: '/ops/requests' }, { label: 'Certification' }]} title="Certification requests" description="Assign each request to an SGS Auditor/Certification. After the audit closes, create the certification record.">
      <section className="gr-card gr-card--extend docs-card">
        <Tabs label="Request status" defaultTab={params.get('tab') ?? 'todo'} tabs={[
          { id: 'todo', label: 'To assign', badge: count(['submitted', 'information_requested']), content: t(['submitted', 'information_requested'], (r) => r.status === 'submitted' ? [
            { label: 'Assign auditor', onClick: () => setAssign(r) }, open(r), { label: 'Reject', danger: true, onClick: async () => setReject(await getRequest(session, r.id)) }] : [open(r)]) },
          { id: 'run', label: 'In audit', badge: count(['assigned', 'in_progress']), content: t(['assigned', 'in_progress'], (r) => [open(r)]) },
          { id: 'cert', label: 'Ready for certificate', badge: count(['audit_completed']), content: t(['audit_completed'], (r) => [{ label: 'Create certification record', onClick: () => setCert(r) }, open(r)]) },
          { id: 'closed', label: 'Closed', badge: count(['certificate_issued', 'rejected', 'withdrawn']), content: t(['certificate_issued', 'rejected', 'withdrawn'], (r) => [open(r)]) },
        ]} />
      </section>
      <AssignAuditorModal session={session} request={assign} onClose={() => setAssign(undefined)} />
      {reject ? <RejectModal session={session} request={reject} open onClose={() => setReject(undefined)} /> : null}
      <CreateCertModal session={session} request={cert} onClose={() => setCert(undefined)} />
    </ListLayout>
  );
}

export function SgsCertRequestDetail({ id }: { id: string }) {
  const { session } = usePersona();
  const q = useMockQuery(() => getRequest(session, id), [session.user.id, id]);
  const [modal, setModal] = useState<'assign' | 'reject' | 'cert'>();
  if (!triage(session)) return <NotAllowed what="certification requests" />;
  if (q.error) return <NotFound what="request" />;
  const r = q.data;
  if (!r) return <Skeleton lines={8} />;
  const st = SR_STATUS[r.status];
  const actions = r.status === 'submitted'
    ? <div className="btn-row"><Button variant="tertiary" size="md" onClick={() => setModal('reject')}>{translate("Reject")}</Button><Button size="md" onClick={() => setModal('assign')}>{translate("Assign auditor")}</Button></div>
    : r.status === 'audit_completed' ? <Button size="md" onClick={() => setModal('cert')}>{translate("Create certification record")}</Button> : undefined;
  return (
    <DetailLayout backHref="/ops/requests/certification" sidebar="expanded" sections={[{ id: 'rq', label: 'Request' }, { id: 'hist', label: 'History' }, { id: 'notes', label: 'Internal notes' }]}
      header={{ title: `${r.id} · ${r.serviceFramework}`, subtitle: `${r.customerName} · ${r.scopeName} · ${r.certType?.toLowerCase()}`, status: { status: st[0], label: st[1], shortLabel: st[1] }, actions }}
      aside={<>
        <div className="title-medium">{translate("Customer")}</div>
        <AsideBox title={r.customerName}><span className="body-small muted">Contact: {r.requester?.name}</span></AsideBox>
        {r.assignee ? <PersonBox title="Auditor" person={r.assignee} sub="SGS Auditor/Certification" /> : null}
      </>}>
      <div data-section="rq"><Card number={1} title="Request" subtitle={`Submitted ${fmtDate(r.submittedAt)} by ${r.requester?.name}`} actions={<NoDesign />}>
        <Facts items={[['Service', r.certType ?? '—'], ['Workspace', wsLabel(r) || 'No workspace on this scope'], ['Preferred audit period', r.preferredPeriod ?? '—'], ['Message', r.message ?? '—']]} />
      </Card></div>
      <div data-section="hist"><Card number={2} title="History"><Timeline steps={r.timeline} /></Card></div>
      <div data-section="notes" className="card-extend"><InternalNotes session={session} request={r} number={3} /></div>
      <AssignAuditorModal session={session} request={modal === 'assign' ? r : undefined} onClose={() => setModal(undefined)} />
      <RejectModal session={session} request={r} open={modal === 'reject'} onClose={() => setModal(undefined)} />
      <CreateCertModal session={session} request={modal === 'cert' ? r : undefined} onClose={() => setModal(undefined)} />
    </DetailLayout>
  );
}

export function SgsCertificationsPage() {
  const { session } = usePersona();
  const q = useMockQuery(() => listCertifications(session), [session.user.id]);
  if (!triage(session)) return <NotAllowed what="certificates" />;
  const rows = q.data ?? [];
  const cols: TableColumn<CertificationRow>[] = [
    { key: 'number', header: 'Certificate', width: 130, render: (r) => <span style={{ fontWeight: 500 }}>{r.number}</span> },
    { key: 'customerName', header: 'Customer · scope', render: (r) => <span className="two-line"><span>{r.customerName}</span><span className="body-small two-line__sub">{r.scopeName}</span></span>, searchValue: (r) => `${r.number} ${r.customerName} ${r.frameworkLabel}` },
    { key: 'frameworkLabel', header: 'Framework', sortable: true, render: (r) => `${r.frameworkLabel}${r.tier ? ` (${getDb().frameworks.find((f) => f.id === r.frameworkId)?.tiers.find((t) => t.code === r.tier)?.label})` : ''}` },
    { key: 'certificateDate', header: 'Certificate date', width: 150, sortable: true, render: (r) => fmtDate(r.certificateDate) },
    { key: 'validTo', header: 'Valid to', width: 130, sortable: true, render: (r) => fmtDate(r.validTo) },
    { key: 'status', header: 'Status', width: 120, render: (r) => <StatusTag status={r.status === 'active' ? 'completed' : 'draft'} size="sm" label={r.status === 'active' ? 'Active' : 'Expired'} /> },
  ];
  return (
    <ListLayout crumbs={[{ label: 'Certifications' }]} title="Certifications" description={translate('Certificates issued to customers of {org}.', { org: session.affiliate.name })}>
      <DataTable<CertificationRow> title={`${rows.length} certificate${rows.length === 1 ? '' : 's'}`} columns={cols} rows={rows} searchable searchPlaceholder="Search number, customer or framework" layout="table" getRowId={(r) => r.id} loading={q.loading && !q.data} />
    </ListLayout>
  );
}
