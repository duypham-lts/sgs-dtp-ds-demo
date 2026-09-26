'use client';
// Request certification (decisions D2): from a workspace (designs/08 Main: scope, framework and tier filled
// in) or from the catalogue (designs/09 CertRequest: choose scope and type).
import { FileUpload, Modal, Radio, Select, Textarea } from '@sgs/graphite';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getDb, MockApiError, type Session } from '@/mock';
import { AUDIT_PERIODS, CERT_SERVICES, CERT_TYPES } from '@/mock/catalog/services';
import { visibleScopeIds } from '@/mock/access';
import { createCertRequest, workspaceCertSummary } from '@/mock/api/certification';
import { customerHref } from '@/mock/requestMeta';
import { FieldError } from '@/ui/bits';
import { useSnackbar } from '@/ui/snackbar';

type Ctx = { kind: 'workspace'; workspaceId: string; title: string; scopeName: string } | { kind: 'catalog'; std: string };

export function CertRequestModal({ session, ctx, open, onClose }: { session: Session; ctx: Ctx; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const snack = useSnackbar();
  const db = getDb();
  const ws = ctx.kind === 'workspace' ? workspaceCertSummary(db, ctx.workspaceId) : undefined;
  const svc = CERT_SERVICES.find((x) => x.std === (ctx.kind === 'catalog' ? ctx.std : ws?.std));
  const scopeIds = visibleScopeIds(db, session);
  const scopes = db.scopes.filter((x) => scopeIds.has(x.id)).map((x) => ({ value: x.id, label: x.name }));
  const [scopeId, setScopeId] = useState('');
  const [type, setType] = useState<(typeof CERT_TYPES)[number]>('Initial certification');
  const [period, setPeriod] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<{ fileName: string; sizeBytes: number }[]>([]);
  const [e, setE] = useState<{ scope?: string; period?: string; form?: string }>({});
  const close = () => { setScopeId(''); setPeriod(''); setMessage(''); setFiles([]); setE({}); onClose(); };
  async function send() {
    const x: typeof e = {};
    if (ctx.kind === 'catalog' && !scopeId) x.scope = 'Choose a scope.';
    if (!period) x.period = 'Choose the preferred audit period.';
    setE(x);
    if (Object.keys(x).length) return;
    try {
      const id = await createCertRequest(session, { scopeId: ws?.scopeId ?? scopeId, std: svc?.std ?? '', workspaceId: ctx.kind === 'workspace' ? ctx.workspaceId : undefined, certType: type, preferredPeriod: period, message, files });
      snack(`Certification request ${id} sent. You’ll be notified in the portal when SGS assigns an auditor.`);
      close();
      router.push(customerHref('certification', id));
    } catch (err) { if (err instanceof MockApiError) setE({ form: err.message }); else throw err; }
  }
  return (
    <Modal open={open} size="fit" title="Request certification" onClose={close} primaryAction={{ label: 'Send request', onClick: send }} secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        {ctx.kind === 'workspace' ? (
          <div className="summary-box">
            <span className="title-small">{ctx.title.replace(/ · (Basic|Medium|High|Normal|Very high)$/, '')}{ws?.tier ? ` · tier ${ws.tier}` : ''}</span>
            <span className="body-small muted">{ctx.scopeName} · {ws?.total} requirements · initial certification</span>
          </div>
        ) : (
          <div className="summary-box">
            <span className="title-small">{svc?.std} · {svc?.name}</span>
            <span className="body-small muted" lang="zh-Hant">{svc?.zh}</span>
          </div>
        )}
        {ctx.kind === 'catalog' ? (
          <>
            <Select label="Scope" required size="m" placeholder="Choose a scope" options={scopes} value={scopeId} error={e.scope} helpText="Only scopes assigned to you are listed." onChange={(_, v) => { setScopeId(v); setE((y) => ({ ...y, scope: undefined, form: undefined })); }} />
            <fieldset className="plain-fieldset">
              <legend className="label-small muted">Type <span className="gr-req">*</span></legend>
              <div className="btn-row" style={{ gap: 24 }}>{CERT_TYPES.map((t) => <Radio key={t} name="ct" label={t} checked={type === t} onChange={() => setType(t)} />)}</div>
            </fieldset>
          </>
        ) : null}
        <Select label="Preferred audit period" required size="s" placeholder="Choose" options={AUDIT_PERIODS.map((p) => ({ value: p, label: p }))} value={period} error={e.period} onChange={(_, v) => { setPeriod(v); setE((y) => ({ ...y, period: undefined })); }} />
        <Textarea label="Message to SGS (optional)" size="l" rows={2} value={message} onChange={(x) => setMessage(x.target.value)}
          placeholder={ctx.kind === 'workspace' ? 'e.g. Hosting is in the Hsinchu data centre; please plan one day on site.' : 'e.g. Number of sites and employees, current certificates, deadlines'} />
        <FileUpload label="Documents (optional)" hint={ctx.kind === 'workspace' ? 'e.g. organisation chart · up to 20 MB each' : 'e.g. current certificate, organisation chart · up to 20 MB each'}
          onFilesAdded={(l) => { const add = Array.from(l).map((x) => ({ fileName: x.name, sizeBytes: x.size })); setFiles((f) => [...f, ...add]); }} onRemove={(r) => setFiles((f) => f.filter((x) => x.fileName !== r.name))} />
        {ctx.kind === 'workspace' ? <p className="body-small muted" style={{ margin: 0 }}>When the audit review starts, this workspace is locked so the auditor reviews the evidence as submitted.</p> : null}
        <FieldError>{e.form}</FieldError>
      </div>
    </Modal>
  );
}
