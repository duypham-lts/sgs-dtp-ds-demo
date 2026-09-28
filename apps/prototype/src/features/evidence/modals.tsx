'use client';
import { translate } from '@/i18n/locale';
// designs/05 UploadEvidence and LinkEvidence.
import { DatePicker, FileUpload, Modal, MultiSelect, SearchInput, TextInput, type UploadFile } from '@sgs/graphite';
import { useEffect, useState } from 'react';
import { MockApiError, TODAY, type Session } from '@/mock';
import { linkEvidence, SCAN_MS, uploadEvidence, type EvidenceRow, type RequirementView, type WorkspaceDetail } from '@/mock/api/evidence';
import { FieldError } from '@/ui/bits';
import { useSnackbar } from '@/ui/snackbar';
import { plural } from '@/ui/format';

const niceName = (file: string) => file.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/^./, (c) => c.toUpperCase());

export function UploadEvidenceModal({ session, ws, req, open, onClose }: { session: Session; ws: WorkspaceDetail; req?: RequirementView; open: boolean; onClose: () => void }) {
  const snack = useSnackbar();
  const r = req;
  const code = req?.code ?? '';
  const ee = req?.items.find((i) => i.mandatory) ?? req?.items[0];
  const [file, setFile] = useState<File | null>(null);
  const [shown, setShown] = useState<UploadFile[]>([]);
  const [uploadKey, setUploadKey] = useState(0);
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [until, setUntil] = useState('');
  const [also, setAlso] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ file?: string; name?: string; until?: string }>({});
  const [busy, setBusy] = useState(false);
  const close = () => { setFile(null); setShown([]); setUploadKey((k) => k + 1); setName(''); setFrom(''); setUntil(''); setAlso([]); setErrors({}); onClose(); };
  // Files are scanned for viruses before they can be used (designs/05: "Scanning for viruses…").
  useEffect(() => {
    if (!shown.length || shown[0].status !== 'scanning') return;
    const t = setTimeout(() => { setShown((s) => s.map((f) => ({ ...f, status: 'complete' }))); setUploadKey((k) => k + 1); }, SCAN_MS);
    return () => clearTimeout(t);
  }, [shown]);
  async function save() {
    const e: typeof errors = {};
    if (!file) e.file = 'Choose a file.';
    if (!name.trim()) e.name = 'Enter a name.';
    if (from && until && until < from) e.until = 'Valid until must be after valid from.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const res = await uploadEvidence(session, { workspaceId: ws.id, requirementCode: code, alsoCodes: also, name, fileName: file!.name, sizeBytes: file!.size, validFrom: from, validUntil: until });
      snack(res.mapped > 1 ? `Evidence uploaded and mapped to ${res.mapped} requirements` : `Evidence uploaded for ${code}`);
      close();
    } catch (err) { if (err instanceof MockApiError) setErrors({ name: err.message }); else throw err; } finally { setBusy(false); }
  }
  if (!r) return null;
  const options = ws.requirements.filter((x) => x.code !== code).map((x) => ({ value: x.code, label: `${x.code} ${x.title}` }));
  return (
    <Modal open={open} size="fit" title="Upload evidence" onClose={close}
      primaryAction={{ label: 'Upload', disabled: busy, onClick: save }} secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <p className="body-small muted" style={{ margin: 0 }}>For {r.code} {r.title}{ee ? ` · ${ee.code} ${ee.name}` : ''}</p>
        <div>
          <FileUpload key={uploadKey} label="File" required multiple={false} hint="Any file type · up to 20 MB · scanned for viruses" defaultFiles={shown}
            onFilesAdded={(list) => { const f = list[0]; if (!f) return; setFile(f); setShown([{ name: f.name, size: f.size, status: f.size > 20 * 1048576 ? 'error' : 'scanning', error: 'File is larger than 20 MB.' }]); setUploadKey((k) => k + 1); if (!name) setName(niceName(f.name)); setErrors((x) => ({ ...x, file: undefined })); }}
            onRemove={() => { setFile(null); setShown([]); }} />
          <FieldError>{errors.file}</FieldError>
        </div>
        <TextInput label="Name" width="552px" required value={name} error={errors.name} onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined })); }} />
        <div className="field-row">
          <DatePicker label="Valid from (optional)" width="268px" today={TODAY} value={from} onChange={(v) => { setFrom(v); setErrors((x) => ({ ...x, until: undefined })); }} />
          <DatePicker label="Valid until (optional)" width="268px" today={TODAY} value={until} error={errors.until} helpText="Leave empty if it doesn’t expire." onChange={(v) => { setUntil(v); setErrors((x) => ({ ...x, until: undefined })); }} />
        </div>
        <MultiSelect label="Also use for (optional)" width="552px" placeholder="Other requirements in this workspace" options={options} value={also} onChange={setAlso} />
      </div>
    </Modal>
  );
}

export function LinkEvidenceModal({ session, ws, code, evidence, open, onClose }: { session: Session; ws: WorkspaceDetail; code: string; evidence: EvidenceRow[]; open: boolean; onClose: () => void }) {
  const snack = useSnackbar();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  const close = () => { setQ(''); setSel([]); onClose(); };
  const candidates = evidence.filter((e) => !e.usedFor.includes(code) && (!q || `${e.name} ${e.fileName}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <Modal open={open} size="fit" title="Link existing evidence" onClose={close}
      primaryAction={{ label: sel.length ? `Link ${plural(sel.length, 'item')}` : 'Link', disabled: !sel.length, onClick: async () => { await linkEvidence(session, ws.id, code, sel); snack(`${plural(sel.length, 'file')} linked to ${code}`); close(); } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552, gap: 12 }}>
        <p className="body-small muted" style={{ margin: 0 }}>{translate("Evidence already in this workspace. Linking doesn’t copy the file; a new version updates every requirement that uses it.")}</p>
        <SearchInput label="Search evidence" placeholder="Search evidence" size="l" width="100%" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="check-list">
        {candidates.length ? candidates.map((e) => (
          <label key={e.id} className="check-row" style={{ padding: '10px 12px' }}>
            <input type="checkbox" className="gr-check" checked={sel.includes(e.id)} onChange={() => setSel(sel.includes(e.id) ? sel.filter((x) => x !== e.id) : [...sel, e.id])} />
            <span className="two-line" style={{ flexGrow: 1 }}><span className="body-medium" style={{ fontWeight: 500 }}>{e.name}</span><span className="body-small two-line__sub">{e.fileName} · {e.usedFor.length ? `used in ${e.usedFor.join(', ')}` : 'not linked yet'}</span></span>
          </label>
        )) : <p className="body-medium muted" style={{ margin: 0 }}>{q ? 'No evidence matches your search.' : 'Every file of this workspace is already linked here.'}</p>}
        </div>
      </div>
    </Modal>
  );
}
