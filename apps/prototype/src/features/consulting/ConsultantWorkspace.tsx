'use client';
// designs/06 MvpConsWorkspace, MvpConsWorkspaceEnded; 07 IsConsWorkspace(Ended). UC-EVD-020, UC-ROL-001.
// Read only: requirements and evidence (download only) while the request is in progress; afterwards the
// access-ended page. Views and downloads are recorded in the customer's audit trail.
// The "Customer self-assessment" block of the design is left out: self-assessment (UC-ASM-*) is Phase 2.
import { Button, DocumentItem, EmptyState, InlineNotification, PageHeader, RequirementNavigator, Skeleton, StatusTag } from '@sgs/graphite';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { getDb, mutate } from '@/mock';
import { REQ_STATUS_LABEL } from '@/mock/coverage';
import { audit } from '@/mock/api/core';
import { getRequirementView, getWorkspace } from '@/mock/api/evidence';
import { getRequest } from '@/mock/api/requests';
import { consultantHref } from '@/mock/requestMeta';
import { logReadAccess } from '@/mock/api/auditTrail';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { useSidebar } from '@/shell/ShellContext';
import { useSnackbar } from '@/ui/snackbar';
import { fmtDate, fmtUs, fsize } from '@/ui/format';
import { NotFound } from '@/shell/NotAllowed';
import type { ConsultingCategory } from './config';

const REVIEW_LABEL: Record<string, ['completed' | 'under-review' | 'draft', string]> = { accepted: ['completed', 'Accepted'], in_review: ['under-review', 'In review'], under_review: ['under-review', 'Under review'], not_reviewed: ['draft', 'Not reviewed'] };
const FILTERS = [{ value: 'all', label: 'All' }, { value: 'missing', label: 'Missing' }, { value: 'partial', label: 'Partial' }, { value: 'provided', label: 'Provided' }];

export function ConsultantWorkspace({ id, category }: { id: string; category: ConsultingCategory }) {
  useSidebar('collapsed');
  const { session } = usePersona();
  const router = useRouter();
  const params = useSearchParams();
  const snack = useSnackbar();
  const rq = useMockQuery(() => getRequest(session, id), [session.user.id, id]);
  const r = rq.data;
  const wq = useMockQuery(() => (r?.workspaceId && r.can.openWorkspace ? getWorkspace(session, r.workspaceId) : Promise.resolve(undefined)), [session.user.id, r?.workspaceId, r?.can.openWorkspace]);
  const w = wq.data;
  const code = params.get('req') ?? w?.requirements.find((x) => x.status !== 'provided')?.code ?? w?.requirements[0]?.code ?? '';
  const req = useMockQuery(() => (w && code ? getRequirementView(session, w.id, code) : Promise.resolve(undefined)), [session.user.id, w?.id, code]);
  // Every view by SGS is recorded in the customer's audit trail (plan §3.1, designs/10 "Consultant activity").
  useEffect(() => {
    if (w) logReadAccess(session, { tenantId: w.workspace.tenantId, action: 'Opened workspace (read only)', category: 'evidence', objectType: 'Workspace', objectId: w.workspace.id, objectLabel: r?.workspaceLabel ?? w.workspace.id, context: r?.id });
  }, [w?.workspace.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!w || !code) return;
    mutate((db) => audit(db, { ...session }, { tenantId: w.workspace.tenantId, action: 'Viewed requirement evidence', category: 'evidence', objectType: 'Requirement', objectId: `${w.frameworkId}:${code}`, objectLabel: code, context: r?.id }));
  }, [w?.id, code]); // eslint-disable-line react-hooks/exhaustive-deps
  const groups = useMemo(() => (w ? w.groups.map((g) => ({ id: g.code, code: g.code, title: g.title, progress: g.progress, children: w.requirements.filter((x) => x.groupCode === g.code).map((x) => ({ id: x.code, code: x.code, title: x.title, status: x.status })) })) : []), [w]);
  if (rq.error) return <NotFound what="assignment" />;
  if (!r) return <Skeleton lines={8} />;
  const back = consultantHref(category, r.id);
  const title = `Workspace · ${r.workspaceLabel ?? r.frameworkLabel}`;
  const subtitle = `${r.customerName} · opened from ${r.id}`;
  if (!r.can.openWorkspace) {
    return (
      <>
        <PageHeader title={title} subtitle={subtitle} onBack={() => router.push(back)} />
        <section className="gr-card gr-card--extend center-card">
          <EmptyState icon="user--access" title={r.status === 'completed' ? `Your access to this workspace ended on ${fmtDate(r.completedAt)}` : 'You can’t open this workspace now'}
            body={r.status === 'completed' ? `${r.id} was completed, so the customer’s requirements and evidence are no longer visible to you. What you submitted is still available on the request. If you need access again, ask the SGS admin.` : 'Access starts when the request is in progress.'}
            action={<div className="btn-row"><a href={back} className="gr-btn gr-btn--primary gr-btn--md">Back to {r.id}</a><Button variant="ghost" size="md" onClick={() => snack(`Write to ${r.approver?.email ?? 'your SGS admin'} to ask for access.`)}>Contact SGS admin</Button></div>} />
        </section>
      </>
    );
  }
  if (!w) return <Skeleton lines={8} />;
  const x = req.data;
  const owner = x?.ownerId ? getDb().users.find((u) => u.id === x.ownerId)?.displayName : undefined;
  const files = x?.items.flatMap((it) => it.evidence) ?? [];
  const setReq = (c: string) => router.replace(`${back}/workspace?req=${c}`, { scroll: false });
  const download = (name: string, evidenceId: string) => {
    mutate((db) => audit(db, session, { tenantId: w.workspace.tenantId, action: 'Downloaded evidence', category: 'evidence', objectType: 'Evidence', objectId: evidenceId, objectLabel: name, context: r.id }));
    snack(`${name} would download here. The download is recorded in the customer’s audit trail.`);
  };
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} onBack={() => router.push(back)} status={{ status: 'info', label: 'Read only', shortLabel: 'Read only' }} />
      <InlineNotification kind="info" title="Read only">You can view requirements and download evidence until {r.id} is completed. Every view and download is recorded in the customer’s audit trail. You can’t upload, change or delete anything.</InlineNotification>
      <div className="cons-grid">
        <div className="ws-grid__nav">
          <RequirementNavigator label={`${w.framework.shortName} requirements`} groups={groups} defaultExpanded={[x?.groupCode ?? groups[0]?.id]} selected={code} onSelect={setReq}
            filterOptions={FILTERS} statusLabels={REQ_STATUS_LABEL} framework={{ name: w.title, progress: w.percent, caption: `Customer readiness · ${w.provided} of ${w.total} requirements with their mandatory evidence` }} />
        </div>
        <div className="ws-grid__main">
          {!x ? <Skeleton lines={6} /> : (
            <>
              <section className="gr-card">
                <div className="gr-card__head">
                  <div><h2 className="gr-card__title">{x.code} {x.title}</h2><p className="gr-card__sub">{[x.groupTitle, x.measureTitle, owner ? `owner ${owner}` : null, files[0] ? `last updated ${fmtDate(files.map((f) => f.uploadedAt).sort().pop())}` : null].filter(Boolean).join(' · ')}</p></div>
                  <StatusTag status={REQ_STATUS_LABEL[x.status][0]} label={x.status === 'missing' ? 'Missing evidence' : REQ_STATUS_LABEL[x.status][1]} size="sm" />
                </div>
                <p className="body-medium" style={{ margin: 0 }}>{x.statement}</p>
              </section>
              <section className="gr-card gr-card--extend">
                <div className="gr-card__head"><div><h2 className="gr-card__title">Evidence</h2><p className="gr-card__sub">{files.length} document{files.length === 1 ? '' : 's'} · download only · any file type</p></div></div>
                {files.length ? files.map((e) => {
                  const rv = REVIEW_LABEL[e.review];
                  return <DocumentItem key={e.id} variant={rv[0] === 'under-review' ? 'under-review' : 'standard'} docType={e.name} fileName={e.fileName} dateLabel={`Uploaded ${fmtUs(e.uploadedAt)} by ${e.uploadedBy}`} size={fsize(e.sizeBytes)} status={rv[0]} statusLabel={rv[1]}
                    actions={[{ type: 'download', label: `Download ${e.fileName}`, onClick: () => download(e.fileName, e.id) }]} />;
                }) : <p className="body-medium muted" style={{ margin: 0 }}>The customer hasn’t uploaded evidence for this requirement yet.</p>}
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}
