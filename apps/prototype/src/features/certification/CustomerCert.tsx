'use client';
import { translate } from '@/i18n/locale';
// Customer side of certification (decisions D2):
// - designs/09 Main (Certification Services: catalogue + my requests) and CertRequest;
// - request detail: 09 CertDetail / CertDetailAssigned, 08 ReqAssigned / ReqInProgress / ReqCompleted / ReqCertIssued;
// - designs/08 Certifications (master / detail).
import { Button, Card, DataTable, DocumentItem, EmptyState, InlineNotification, OverflowMenu, ProgressBar, SearchInput, Skeleton, StatusTag, Tabs, type TableColumn } from '@sgs/graphite';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getDb } from '@/mock';
import { SR_STATUS } from '@/mock/labels';
import { CERT_SERVICES } from '@/mock/catalog/services';
import { customerHref } from '@/mock/requestMeta';
import { listCertifications, type CertificationRow } from '@/mock/api/certification';
import { getRequest, listRequests, requestAgain, type RequestRow, type RequestView } from '@/mock/api/requests';
import { getReviewByRequest } from '@/mock/api/audit';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { AsideBox, Facts, StatTile, Timeline } from '@/ui/bits';
import { useFakeDownload } from '@/ui/download';
import { useSnackbar } from '@/ui/snackbar';
import { fmtDate, fmtUs, fsize } from '@/ui/format';
import { DetailLayout, ListLayout } from '@/ui/layout';
import { NotFound } from '@/shell/NotAllowed';
import { PersonBox, RespondPanel } from '../consulting/parts';
import { WithdrawModal } from '../consulting/modals';
import { CertRequestModal } from './CertRequestModal';

type Svc = (typeof CERT_SERVICES)[number];

export function CertServicesPage() {
  const { session } = usePersona();
  const router = useRouter();
  const params = useSearchParams();
  const q = useMockQuery(() => listRequests(session, 'certification'), [session.user.id]);
  const [std, setStd] = useState<string>();
  const canRequest = session.user.role === 'customer_admin' || session.user.role === 'customer_user';
  const rows = q.data ?? [];
  const svcCols: TableColumn<Svc & { id: string }>[] = [
    { key: 'std', header: 'Standard', sortable: true, width: 220, render: (r) => <span style={{ fontWeight: 500 }}>{r.std}</span> },
    { key: 'name', header: 'Service', sortable: true, render: (r) => <span className="two-line"><span>{r.name}</span><span className="body-small two-line__sub" lang="zh-Hant">{r.zh}</span></span>, searchValue: (r) => `${r.std} ${r.name} ${r.zh}` },
    { key: 'act', header: '', align: 'end', width: 140, render: (r) => (canRequest ? <Button variant="tertiary" size="sm" onClick={() => setStd(r.std)}>{translate("Request")}</Button> : null) },
  ];
  const reqCols: TableColumn<RequestRow>[] = [
    { key: 'id', header: 'Request', width: 140, render: (r) => <a href={customerHref('certification', r.id)} className="gr-link" style={{ fontWeight: 500 }}>{r.id}</a> },
    { key: 'svc', header: 'Service', sortable: true, render: (r) => `${r.serviceFramework ?? r.frameworkLabel} · ${(r.scopeName ?? '').replace(' · ', ', ')}` },
    { key: 'submittedAt', header: 'Submitted', sortable: true, width: 130, sortValue: (r) => r.submittedAt, render: (r) => fmtDate(r.submittedAt) },
    { key: 'assigneeName', header: 'SGS auditor', render: (r) => r.assigneeName ?? '—' },
    { key: 'status', header: 'Status', render: (r) => <StatusTag status={SR_STATUS[r.status][0]} size="sm" label={SR_STATUS[r.status][1]} /> },
  ];
  return (
    <ListLayout crumbs={[{ label: 'Service Requests', href: '/service-requests' }, { label: 'Certification Services' }]} title="Certification Services" description="Request a certification. An SGS auditor gets back to you to plan the audit.">
      <section className="gr-card gr-card--extend docs-card">
        <Tabs label="Certification Services" defaultTab={params.get('tab') === 'mine' ? 'mine' : 'svc'} tabs={[
          { id: 'svc', label: 'Services', badge: CERT_SERVICES.length, content: <DataTable columns={svcCols} rows={CERT_SERVICES.map((x) => ({ ...x, id: x.std }))} searchable searchPlaceholder="Search services" layout="table" pageSize={10} getRowId={(r) => r.id} /> },
          { id: 'mine', label: 'My requests', badge: rows.length, content: <DataTable columns={reqCols} rows={rows} layout="table" loading={q.loading && !q.data} getRowId={(r) => r.id} emptyState={{ title: 'No certification requests yet', body: 'Choose a service on the Services tab, or request certification from a workspace.' }} /> },
        ]} />
      </section>
      {std ? <CertRequestModal session={session} ctx={{ kind: 'catalog', std }} open onClose={() => { setStd(undefined); router.refresh(); }} /> : null}
    </ListLayout>
  );
}

function certFacts(r: RequestView, tier?: string): [string, string][] {
  const out: [string, string][] = r.workspaceId
    ? [['Service', r.certType ?? 'Initial certification'], ['Workspace', [r.serviceFrameworkVersion, tier, r.scopeName].filter(Boolean).join(' · ')], ['Preferred audit period', r.preferredPeriod ?? '—']]
    : [['Service', `${r.serviceFramework} certification`], ['Scope', r.scopeName ?? '—'], ['Type', r.certType ?? '—'], ['Preferred audit period', r.preferredPeriod ?? '—']];
  if (r.message) out.push(['Message', r.message]);
  return out;
}

export function CustomerCertDetail({ id }: { id: string }) {
  const { session } = usePersona();
  const router = useRouter();
  const download = useFakeDownload();
  const snack = useSnackbar();
  const q = useMockQuery(() => getRequest(session, id), [session.user.id, id]);
  const rv = useMockQuery(() => getReviewByRequest(session, id), [session.user.id, id]);
  const [withdraw, setWithdraw] = useState(false);
  if (q.error) return <NotFound what="request" />;
  const r = q.data;
  if (!r) return <Skeleton lines={10} />;
  const review = rv.data;
  const db = getDb();
  const ws = db.workspaces.find((w) => w.id === r.workspaceId);
  const fw = ws && db.frameworks.find((f) => f.id === ws.frameworkId);
  const tier = fw?.tiers.find((t) => t.code === ws?.tier)?.label;
  const cert = db.certifications.find((c) => c.requestId === r.id);
  const st = SR_STATUS[r.status];
  const need = review?.counts.needYou ?? 0;
  const label = r.status === 'submitted' ? 'Submitted · waiting for SGS' : r.status === 'in_progress' ? `Audit in progress${need ? ` · ${need} item${need === 1 ? '' : 's'} need${need === 1 ? 's' : ''} you` : ''}` : r.status === 'assigned' ? 'Assigned' : st[1];
  const facts = certFacts(r, tier);
  const title = `${r.id} · ${fw ? `${fw.shortName} certification` : r.serviceFramework}`;
  const subtitle = `Certification Services · ${(r.scopeName ?? '').replace(' · ', ws ? ' · ' : ', ')}${tier ? ` · tier ${tier}` : ''}`;
  const againBtn = r.can.requestAgain ? <div><Button size="md" icon="add" iconPosition="left" onClick={async () => { await requestAgain(session, r.id).catch(() => undefined); router.push('/service-requests/certification'); }}>{translate("Request again")}</Button></div> : null;
  let status: React.ReactNode;
  if (r.status === 'submitted' || r.status === 'information_requested') status = <InlineNotification kind="info" title="SGS is reviewing your request">{translate("An SGS auditor will be assigned and get in touch to plan the audit. You’ll be notified in the portal.")}</InlineNotification>;
  else if (r.status === 'assigned') status = <Facts items={[['SGS auditor', r.assignee?.name ?? '—'], ['Assigned on', fmtDate(r.approvedAt)], ['Next step', r.sgsMessage ?? `${r.assignee?.name.split(' ')[0]} will contact you to agree the audit dates. The workspace stays open until the audit review starts.`]]} />;
  else if (r.status === 'in_progress' && review) status = (<>
    <ProgressBar label="Requirements reviewed" value={Math.round((review.counts.reviewed / review.counts.total) * 100)} helperText={`${review.counts.reviewed} of ${review.counts.total} reviewed by ${review.auditorName}`} />
    <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}><StatTile value={review.counts.needYou} label="Need your response" /><StatTile value={review.counts.findings} label="Findings" /><StatTile value={review.counts.accepted} label="Accepted" /></div>
    <div className="btn-row"><Button size="md" onClick={() => router.push(`/reviews/${review.id}`)}>{translate("Open review")}</Button><Button variant="tertiary" size="md" onClick={() => router.push(`/workspaces/${r.workspaceId}`)}>{translate("Open workspace (locked)")}</Button></div>
  </>);
  else if (r.status === 'audit_completed' || r.status === 'certificate_issued') {
    const f = review?.items.flatMap((i) => i.findings) ?? [];
    status = r.status === 'certificate_issued' && cert ? (<>
      <InlineNotification kind="success" title={`Certificate ${cert.number} issued on ${fmtDate(cert.certificateDate)}`}>Valid until {fmtDate(cert.validTo)}.</InlineNotification>
      <div><Button size="md" onClick={() => router.push(`/certifications?cert=${cert.id}`)}>{translate("View certificate")}</Button></div>
    </>) : (<>
      <div className="stat-grid">
        <StatTile value={review?.counts.accepted ?? 0} label="Accepted" /><StatTile value={f.filter((x) => x.classification === 'major' && x.status !== 'closed').length} label="Major open" />
        <StatTile value={f.filter((x) => x.classification === 'minor' && x.status === 'closed').length} label="Minor · closed" /><StatTile value={f.filter((x) => x.classification === 'observation').length} label="Observation" />
      </div>
      {review?.reportFileName ? <DocumentItem variant="sgs" docType="Audit report" fileName={review.reportFileName} dateLabel={`Issued ${fmtUs(review.closedAt)} by ${review.auditorName}`} size={fsize(review.reportSizeBytes ?? 0)}
        actions={[{ type: 'open', label: 'Open audit report', onClick: () => download(review.reportFileName!) }, { type: 'download', label: 'Download audit report', onClick: () => download(review.reportFileName!) }]} /> : null}
      <p className="body-small muted" style={{ margin: 0 }}>{translate("The workspace is unlocked. SGS now decides on the certificate; you’ll be notified.")}</p>
    </>);
  } else if (r.status === 'rejected') status = <><InlineNotification kind="error" title={`Reason: ${r.rejectReason}`}>{r.rejectMessage}</InlineNotification>{againBtn}</>;
  else if (r.status === 'withdrawn') status = <InlineNotification kind="info" title={`Withdrawn on ${fmtDate(r.withdrawnAt)}`}>SGS stopped reviewing this request.{r.withdrawReason ? ` Reason: ${r.withdrawReason}.` : ''}</InlineNotification>;

  return (
    <DetailLayout backHref="/service-requests/certification?tab=mine" sections={[...(r.openInfo ? [{ id: 'info', label: 'Action required' }] : []), { id: 'st', label: 'Status' }, { id: 'rq', label: 'Request' }, { id: 'hist', label: 'History' }]}
      header={{ title, subtitle, status: { status: st[0], label, shortLabel: st[1] }, actions: r.can.withdraw ? <OverflowMenu size="md" label="Request actions" items={[{ label: 'Withdraw request', danger: true, onClick: () => setWithdraw(true) }]} /> : undefined }}
      aside={<>
        <div className="title-medium">{translate("SGS Requests & Communications")}</div>
        {r.assignee && r.status !== 'rejected' ? <PersonBox title="Your SGS auditor" person={r.assignee} sub="SGS Auditor/Certification" /> : null}
        <AsideBox title="Need help?"><span className="body-small muted">Questions about this request? Contact {r.assignee ? 'your SGS auditor or ' : ''}SGS support.</span><div><Button variant="tertiary" size="sm" onClick={() => snack(r.assignee ? `Write to ${r.assignee.email} or SGS support (support.tw@sgs.com, sample contact).` : 'SGS support: support.tw@sgs.com · +886 2 2793 5000 (sample contact).')}>{translate("Contact support")}</Button></div></AsideBox>
      </>}>
      {r.openInfo ? <RespondPanel session={session} request={r} /> : null}
      <div data-section="st"><Card number={1} title="Status">{status}</Card></div>
      <div data-section="rq"><Card number={2} title="Request" subtitle={ws ? `Submitted ${fmtDate(r.submittedAt)} by ${r.requester?.name}` : 'What you asked for'}><Facts items={facts} /></Card></div>
      <div data-section="hist" className="card-extend"><Card number={3} title="History" extend><Timeline steps={r.timeline} /></Card></div>
      <WithdrawModal session={session} request={r} open={withdraw} onClose={() => setWithdraw(false)} />
    </DetailLayout>
  );
}

export function CustomerCertificationsPage() {
  const { session } = usePersona();
  const router = useRouter();
  const params = useSearchParams();
  const q = useMockQuery(() => listCertifications(session), [session.user.id]);
  const [search, setSearch] = useState('');
  const rows = (q.data ?? []).filter((c) => !search || `${c.number} ${c.frameworkLabel} ${c.scopeName}`.toLowerCase().includes(search.toLowerCase()));
  const sel = rows.find((c) => c.id === params.get('cert')) ?? rows[0];
  const card = (c: CertificationRow) => (
    <a key={c.id} href={`/certifications?cert=${c.id}`} className={`cert-card${c.id === sel?.id ? ' is-on' : ''}`} aria-current={c.id === sel?.id ? 'true' : undefined}
      onClick={(e) => { e.preventDefault(); router.replace(`/certifications?cert=${c.id}`, { scroll: false }); }}>
      <span className="body-small muted">{c.number} · {c.status === 'active' ? 'Active' : 'Expired'}</span>
      <span className="title-medium">{c.frameworkLabel}{c.tier ? ` (${getDb().frameworks.find((f) => f.id === c.frameworkId)?.tiers.find((t) => t.code === c.tier)?.label})` : ''}</span>
      <span className="body-small muted">{c.scopeName} · expires on {fmtDate(c.validTo)}</span>
    </a>
  );
  const long = (iso: string) => { const d = new Date(`${iso}T00:00:00Z`); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); };
  const fwName = (c: CertificationRow) => getDb().frameworks.find((f) => f.id === c.frameworkId)?.name ?? c.frameworkLabel;
  return (
    <div className="cert-grid">
      <div className="cert-grid__list">
        <h1 className="headline-small" style={{ margin: 0 }}>{translate("Certifications")}</h1>
        <SearchInput label="Search certificates" placeholder="Search certificates" size="s" width="100%" value={search} onChange={(e) => setSearch(e.target.value)} />
        {q.loading && !q.data ? <Skeleton lines={4} /> : rows.map(card)}
        <span className="body-small muted">{rows.length} certificate{rows.length === 1 ? '' : 's'}</span>
      </div>
      <section className="gr-card gr-card--extend">
        {!sel ? <EmptyState title="No certificates yet" body="Certificates appear here when SGS issues them after an audit." /> : (
          <>
            <div className="req-body__head" style={{ gap: 16 }}>
              <div className="two-line" style={{ gap: 4 }}><span className="body-small muted">{sel.number}</span><h2 className="headline-medium" style={{ margin: 0 }}>{fwName(sel)}</h2></div>
              <StatusTag status={sel.status === 'active' ? 'completed' : 'draft'} label={sel.status === 'active' ? 'Active' : 'Expired'} size="sm" />
            </div>
            <Facts columns={3} items={[['Certificate date', long(sel.certificateDate)], ['Valid to', long(sel.validTo)], ['Accreditation', sel.accreditation]]} />
            <dl className="facts" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div><dt className="body-small facts__k">{translate("Certified company")}</dt><dd className="body-medium facts__v">{sel.customerName}</dd></div>
              <div><dt className="body-small facts__k">{translate("Scope · tier")}</dt><dd className="body-medium facts__v">{sel.scopeName}{sel.tier ? ` · ${getDb().frameworks.find((f) => f.id === sel.frameworkId)?.tiers.find((t) => t.code === sel.tier)?.label}` : ''}</dd></div>
              <div style={{ gridColumn: '1 / -1' }}><dt className="body-small facts__k">{translate("Certificate scope")}</dt><dd className="body-medium facts__v">{sel.certificateScope}</dd></div>
            </dl>
            <Facts columns={3} items={[['Certificate number', sel.number], ['Contract number', sel.contractNumber ?? '—'], ['Certified by', sel.certifiedBy]]} />
            <div className="drawer-section"><span className="title-small">Certified sites ({sel.sites.length})</span>
              <div className="sites-grid">{sel.sites.map((x) => <div key={x} className="site-box"><span className="body-medium">{x}</span></div>)}</div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
