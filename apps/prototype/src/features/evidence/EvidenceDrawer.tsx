'use client';
import { translate } from '@/i18n/locale';
// designs/05 EvidenceDetail: drawer with workspace, validity, SGS review, the requirements that use the
// file and its versions. Footer: unlink (when opened from a requirement), download, upload new version.
import { Button, Drawer, Skeleton, Table } from '@sgs/graphite';
import { useRef } from 'react';
import { getEvidence, unlinkEvidence, uploadNewVersion } from '@/mock/api/evidence';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { useFakeDownload } from '@/ui/download';
import { fmtDate, fsize } from '@/ui/format';
import { useSnackbar } from '@/ui/snackbar';

const REVIEW: Record<string, string> = { not_reviewed: 'Not reviewed by SGS yet', in_review: 'In review by SGS', accepted: 'Accepted by SGS', under_review: 'New version · waiting for SGS review' };

export function EvidenceDrawer({ id, requirement, onClose }: { id?: string; requirement?: { id: string; code: string }; onClose: () => void }) {
  const { session } = usePersona();
  const snack = useSnackbar();
  const download = useFakeDownload();
  const file = useRef<HTMLInputElement>(null);
  const q = useMockQuery(() => (id ? getEvidence(session, id) : Promise.resolve(undefined)), [session.user.id, id]);
  const e = q.data;
  const mapped = e && requirement && e.usedForRows.some((r) => r.requirementId === requirement.id);
  const footer = e ? (
    <>
      {mapped && e.canWrite ? <Button variant="ghost" size="md" onClick={async () => { const r = await unlinkEvidence(session, e.id, requirement!.id); snack(`Mapping removed from ${r.code}. The file stays in your library.`); onClose(); }}>Unlink from {requirement!.code}</Button> : null}
      <span style={{ flexGrow: 1 }} />
      <Button variant="tertiary" size="md" icon="download" iconPosition="left" onClick={() => download(e.fileName)}>{translate("Download")}</Button>
      {e.canWrite ? <Button size="md" icon="upload" iconPosition="left" onClick={() => file.current?.click()}>{translate("Upload new version")}</Button> : null}
      <input ref={file} type="file" className="gr-sr" tabIndex={-1} aria-label="New version file" onChange={async (ev) => {
        const f = ev.target.files?.[0];
        ev.target.value = '';
        if (!f) return;
        const r = await uploadNewVersion(session, e.id, { name: f.name, size: f.size });
        snack(`Version ${r.version} uploaded. ${r.requirements === 1 ? 'The requirement that uses it is' : `All ${r.requirements} requirements that use it are`} updated.`);
      }} />
    </>
  ) : undefined;
  return (
    <Drawer open={!!id} size="lg" onClose={onClose} title={e?.name ?? 'Evidence'}
      subtitle={e ? `${e.fileName} · ${fsize(e.sizeBytes)} · ${e.scanState === 'clean' ? 'scanned, clean' : 'scanning for viruses…'}` : undefined} footer={footer}>
      {!e ? <Skeleton lines={6} /> : (
        <div className="drawer-body">
          <dl className="body-medium kv">
            <div className="kv__row"><dt>{translate("Workspace")}</dt><dd>{e.workspaceTitle}</dd></div>
            <div className="kv__row"><dt>{translate("Valid")}</dt><dd>{e.validFrom || e.validUntil ? `${fmtDate(e.validFrom)} – ${e.validUntil ? fmtDate(e.validUntil) : 'no end date'}` : 'Doesn’t expire'}</dd></div>
            <div className="kv__row"><dt>{translate("Review")}</dt><dd>{REVIEW[e.review]}</dd></div>
          </dl>
          <div className="drawer-section"><h3 className="title-small" style={{ margin: 0 }}>{translate("Used for")}</h3>
            {e.usedForRows.length
              ? <Table density="compact" getRowId={(r) => r.requirementId} rows={e.usedForRows} columns={[{ key: 'requirement', header: 'Requirement' }, { key: 'expected', header: 'Expected evidence' }]} />
              : <p className="body-medium muted" style={{ margin: 0 }}>{translate("Not linked to any requirement. It stays in the library until you link it.")}</p>}
          </div>
          <div className="drawer-section"><h3 className="title-small" style={{ margin: 0 }}>{translate("Versions")}</h3>
            <Table density="compact" getRowId={(r) => r.id} rows={e.versions} columns={[{ key: 'versionNo', header: 'Version', width: 80 }, { key: 'fileName', header: 'File' }, { key: 'at', header: 'Uploaded', render: (r) => `${fmtDate(r.uploadedAt)} · ${r.by}` }]} />
          </div>
        </div>
      )}
    </Drawer>
  );
}
