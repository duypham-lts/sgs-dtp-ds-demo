'use client';
import { translate } from '@/i18n/locale';
// designs/05 Workspace (+ UploadEvidence, LinkEvidence, EvidenceDetail). UC-EVD-004/005/007/008/011/012/016.
// Left: RequirementNavigator with Missing / Partial / Provided per requirement; right: the selected requirement
// and its expected evidence. Owner per requirement (D6) has no design and carries the "Chưa có design" tag.
import { Breadcrumb, Button, Card, DocumentItem, InlineNotification, RequirementNavigator, Select, Skeleton, StatusTag, Tag } from '@sgs/graphite';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { REQ_STATUS_LABEL } from '@/mock/coverage';
import { getRequirementView, getWorkspace, listEvidence, setRequirementOwner, type EvidenceRow } from '@/mock/api/evidence';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { fmtDate, fmtMonth, fmtUs, fsize, plural } from '@/ui/format';
import { useSidebar } from '@/shell/ShellContext';
import { useSnackbar } from '@/ui/snackbar';
import { useFakeDownload } from '@/ui/download';
import { NoDesign } from '@/shell/PageHead';
import { NotFound } from '@/shell/NotAllowed';
import { PageHeader } from '@sgs/graphite';
import { EvidenceDrawer } from './EvidenceDrawer';
import { CUSTOMER_RN_LABELS, FromAuditor, LastAuditResult, LockedEvidence, RN_OF, itemTag } from './AuditPanels';
import { getWorkspaceReview } from '@/mock/api/audit';
import { getDb } from '@/mock';
import { CertRequestModal } from '../certification/CertRequestModal';
import { CERT_SERVICES } from '@/mock/catalog/services';
import { LinkEvidenceModal, UploadEvidenceModal } from './modals';

const FILTERS = [{ value: 'all', label: 'All' }, { value: 'missing', label: 'Missing' }, { value: 'partial', label: 'Partial' }, { value: 'provided', label: 'Provided' }];
const LABELS = Object.fromEntries(Object.entries(REQ_STATUS_LABEL)) as Record<string, ['missing-info' | 'needs-description' | 'completed', string]>;

export function docLabel(e: EvidenceRow, code?: string) {
  const other = e.usedFor.filter((c) => c !== code);
  return [`Uploaded ${fmtUs(e.uploadedAt)} by ${e.uploadedBy}`, e.validUntil ? `valid until ${fmtMonth(e.validUntil)}` : null, other.length ? `also used in ${other.join(', ')}` : null].filter(Boolean).join(' · ');
}
export function docStatus(e: EvidenceRow): { status: 'completed' | 'missing-info' | 'under-review' | 'needs-description'; label: string } {
  if (e.scanState === 'scanning') return { status: 'under-review', label: 'Scanning' };
  if (e.validity === 'exp') return { status: 'missing-info', label: 'Expired' };
  if (e.validity === 'soon') return { status: 'needs-description', label: 'Expires soon' };
  return { status: 'completed', label: 'Provided' };
}

export function WorkspacePage({ id }: { id: string }) {
  useSidebar('collapsed');
  const { session } = usePersona();
  const router = useRouter();
  const params = useSearchParams();
  const snack = useSnackbar();
  const download = useFakeDownload();
  const wq = useMockQuery(() => getWorkspace(session, id), [session.user.id, id]);
  const w = wq.data;
  const code = params.get('req') ?? w?.requirements[0]?.code ?? '';
  const rq = useMockQuery(() => (code ? getRequirementView(session, id, code) : Promise.resolve(undefined)), [session.user.id, id, code]);
  const evq = useMockQuery(() => listEvidence(session, { workspaceId: id }), [session.user.id, id]);
  const rvq = useMockQuery(() => getWorkspaceReview(session, id), [session.user.id, id]);
  const [certModal, setCertModal] = useState(false);
  const [upload, setUpload] = useState(false);
  const [link, setLink] = useState(false);
  const evidenceId = params.get('evidence') ?? undefined;
  const setParam = (k: string, v?: string) => {
    const p = new URLSearchParams(params.toString());
    if (v) p.set(k, v); else p.delete(k);
    router.replace(`/workspaces/${id}?${p.toString()}`, { scroll: false });
  };
  const review = rvq.data;
  const mode: 'prep' | 'locked' | 'after' = w?.workspace.status === 'audit_in_progress' && review && !review.closedAt ? 'locked' : w?.workspace.status === 'audited' && review?.closedAt ? 'after' : 'prep';
  const itemOf = (c: string) => review?.items.find((i) => i.requirement.code === c);
  const groups = useMemo(() => {
    if (!w) return [];
    return w.groups.map((g) => ({ id: g.code, code: g.code, title: g.title, progress: g.progress,
      children: w.requirements.filter((r) => r.groupCode === g.code).map((r) => ({ id: r.code, code: r.code, title: r.title, status: mode === 'prep' ? r.status : RN_OF[itemOf(r.code)?.status ?? 'not_reviewed'] })) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, mode, review]);
  if (wq.error) return <NotFound what="workspace" />;
  if (!w) return <Skeleton lines={10} />;
  const r = rq.data;
  const fw = w.framework;
  const tierOf = (c?: string) => fw.tiers.find((t) => t.code === c)?.label;
  const mandatory = r?.items.filter((i) => i.mandatory) ?? [];
  const provided = r ? mandatory.filter((i) => i.evidence.some((e) => docStatus(e).status !== 'missing-info' && e.scanState === 'clean')).length : 0;
  const admin = session.user.role === 'customer_admin';
  const item = r ? itemOf(r.code) : undefined;
  const writer = session.user.role === 'customer_admin' || session.user.role === 'customer_user';
  const db = getDb();
  const certifiable = CERT_SERVICES.some((x) => x.code === w.framework.code);
  const openCert = db.serviceRequests.find((x) => x.category === 'certification' && x.workspaceId === id && !['rejected', 'withdrawn', 'certificate_issued'].includes(x.status));
  const headStatus = mode === 'locked' ? { status: 'under-review' as const, label: 'Audit in progress · locked', shortLabel: 'Locked' }
    : mode === 'after' ? { status: 'completed' as const, label: `Audit completed · ${fmtDate(review!.closedAt)}`, shortLabel: 'Audited' }
    : { status: 'draft' as const, label: `Preparing · ${w.percent}% coverage`, shortLabel: `${w.percent}%` };
  const headActions = mode === 'locked' ? undefined : (
    <div className="btn-row">
      <a href={`/documents?workspace=${id}`} className="gr-btn gr-btn--tertiary gr-btn--md">{translate("Evidence library")}</a>
      {mode === 'prep' && certifiable && writer && !openCert ? <Button size="md" onClick={() => setCertModal(true)}>{translate("Request certification")}</Button> : null}
    </div>
  );
  const rnCaption = mode === 'locked' ? `Audit ${review!.requestTitle} · ${review!.auditorName}` : mode === 'after' ? `Last audit ${review!.requestTitle} · ${review!.counts.accepted} accepted · ${review!.counts.cwf} closed with finding` : `${w.provided} of ${w.total} requirements have their mandatory evidence · not a compliance decision`;
  const tag = mode === 'prep' ? undefined : itemTag(item);

  return (
    <>
      <PageHeader title={w.title} subtitle={`${w.scope.name} · ${w.scopeType} scope`} onBack={() => router.push('/workspaces')} status={headStatus} actions={headActions} />
      {mode === 'locked' ? <InlineNotification kind="info" title="Audit review in progress · evidence is locked">{review!.auditorName} is reviewing this workspace for {review!.requestTitle}. You can only add files through a response to the auditor. The workspace unlocks when the review closes.</InlineNotification> : null}
      {mode === 'after' ? <InlineNotification kind="success" title={`Audit review closed on ${fmtDate(review!.closedAt)} · workspace unlocked`}>Results of audit {review!.requestTitle} are shown on each requirement. You can upload new versions again; the evidence the auditor accepted is kept on record.</InlineNotification> : null}
      <div className="ws-grid">
        <div className="ws-grid__nav">
          <RequirementNavigator label="Requirements" groups={groups} defaultExpanded={[r?.groupCode ?? groups[0]?.id]} selected={code}
            onSelect={(c) => setParam('req', c)}
            filterOptions={mode === 'prep' ? FILTERS : [{ value: 'all', label: 'All' }, { value: 'clar', label: 'Clarification' }, { value: 'find', label: 'Finding' }, { value: 'acc', label: 'Accepted' }]}
            statusLabels={mode === 'prep' ? LABELS : CUSTOMER_RN_LABELS}
            framework={{ name: w.title, progress: mode === 'after' ? Math.round(((review!.counts.accepted + review!.counts.cwf) / review!.counts.total) * 100) : w.percent, caption: rnCaption }} />
        </div>
        <div className="ws-grid__main">
          {!r ? <Skeleton lines={6} /> : (
            <>
              <section className="gr-card">
                <Breadcrumb items={[{ label: `${r.groupCode} ${r.groupTitle}`, href: '#' }, ...(r.measureCode ? [{ label: `${r.measureCode} ${r.measureTitle}`, href: '#' }] : []), { label: r.code }]} />
                <div className="req-body__head" style={{ gap: 16 }}>
                  <div className="two-line" style={{ gap: 4 }}>
                    <span className="body-small muted">{r.code}{r.minTier ? ` · from ${tierOf(r.minTier)}` : ''}</span>
                    <h2 className="headline-small" style={{ margin: 0 }}>{r.title}</h2>
                  </div>
                  {tag ? <StatusTag status={tag[0] as 'completed'} label={tag[1]} size="sm" /> : <StatusTag status={LABELS[r.status][0]} label={LABELS[r.status][1]} size="sm" />}
                </div>
                <p className="body-large" style={{ margin: 0 }}>{r.statement}</p>
                {mode === 'locked' ? null : <div className="owner-row">
                  <Select label="Owner" size="m" placeholder="Nobody yet" disabled={!admin}
                    options={w.owners.map((o) => ({ value: o.id, label: o.name }))} value={r.ownerId ?? ''}
                    onChange={async (_, v) => { await setRequirementOwner(session, id, r.code, v); snack(`${w.owners.find((o) => o.id === v)?.name} now owns ${r.code}`); }} />
                  <NoDesign />
                </div>}
              </section>
              {mode === 'locked' && review ? <><FromAuditor session={session} review={review} item={item} /><LockedEvidence review={review} item={item} /></> : null}
              {mode === 'after' && review ? <LastAuditResult review={review} item={item} /> : null}
              {mode === 'locked' ? null : <section className="gr-card gr-card--extend">
                <div className="gr-card__head">
                  <div><h2 className="gr-card__title">{mode === 'after' ? 'Evidence' : 'Expected evidence'}</h2><p className="gr-card__sub">{mode === 'after' ? 'Editable again' : `${plural(mandatory.length, 'mandatory item')} · ${provided} provided`}</p></div>
                  {w.canWrite ? <div className="btn-row" style={{ gap: 8 }}>
                    <Button variant="tertiary" size="sm" onClick={() => setLink(true)}>{translate("Link existing evidence")}</Button>
                    <Button size="sm" icon="upload" iconPosition="left" onClick={() => setUpload(true)}>{translate("Upload evidence")}</Button>
                  </div> : null}
                </div>
                {r.items.map((it) => (
                  <div key={it.id} className="ee-block">
                    <div className="req-body__head">
                      <span className="two-line"><span className="title-small">{it.code} · {it.name}</span><span className="body-small two-line__sub">{it.description}</span></span>
                      <Tag tone={it.mandatory ? 'required' : 'neutral'}>{it.mandatory ? 'Mandatory' : 'Optional'}</Tag>
                    </div>
                    {it.evidence.length ? it.evidence.map((e) => {
                      const st = docStatus(e);
                      return <DocumentItem key={e.id} docType={e.name} fileName={e.fileName} dateLabel={docLabel(e, r.code)} size={fsize(e.sizeBytes)} status={st.status} statusLabel={st.label}
                        actions={[{ type: 'view', label: `View ${e.name}`, onClick: () => setParam('evidence', e.id) }, { type: 'open', label: `Open ${e.fileName}`, onClick: () => download(e.fileName) }]} />;
                    }) : <p className="body-medium muted" style={{ margin: 0 }}>No evidence yet.{w.canWrite ? ' Upload a file or link one that is already in this workspace.' : ''}</p>}
                  </div>
                ))}
              </section>}
            </>
          )}
        </div>
      </div>
      <UploadEvidenceModal session={session} ws={w} req={r} open={upload} onClose={() => setUpload(false)} />
      <LinkEvidenceModal session={session} ws={w} code={code} evidence={evq.data ?? []} open={link} onClose={() => setLink(false)} />
      {certModal ? <CertRequestModal session={session} ctx={{ kind: 'workspace', workspaceId: id, title: w.title, scopeName: w.scope.name }} open onClose={() => setCertModal(false)} /> : null}
      <EvidenceDrawer id={evidenceId} requirement={r ? { id: r.id, code: r.code } : undefined} onClose={() => setParam('evidence')} />
    </>
  );
}
