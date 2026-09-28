'use client';
import { translate } from '@/i18n/locale';
// designs/04 FwImport (two steps) and FwErrors (checked file had errors: nothing imported, list of problems).
import { Button, FileUpload, InlineNotification, Modal, Table } from '@sgs/graphite';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Session } from '@/mock';
import { checkImportFile, type ImportError } from '@/mock/api/frameworks';
import { FieldError } from '@/ui/bits';
import { useFakeDownload } from '@/ui/download';
import { useSnackbar } from '@/ui/snackbar';
import { plural } from '@/ui/format';

const ERR_COLS = [
  { key: 'sheet', header: 'Sheet', width: 160 }, { key: 'row', header: 'Row', width: 64, align: 'end' as const },
  { key: 'column', header: 'Column', width: 200 }, { key: 'problem', header: 'Problem' },
];

export function ImportModal({ session, open, onClose }: { session: Session; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const snack = useSnackbar();
  const download = useFakeDownload();
  const [file, setFile] = useState<File | null>(null);
  const [missing, setMissing] = useState(false);
  const [errors, setErrors] = useState<{ fileName: string; errors: ImportError[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const close = () => { setFile(null); setErrors(null); setMissing(false); setUploadKey((k) => k + 1); onClose(); };

  async function check() {
    if (!file) { setMissing(true); return; }
    setBusy(true);
    const r = await checkImportFile(session, { name: file.name, size: file.size });
    setBusy(false);
    if (r.ok) { snack('File check passed. Review the draft, then activate it.'); close(); router.push(`/ops/frameworks/${r.frameworkId}`); return; }
    setErrors({ fileName: r.fileName, errors: r.errors });
    setFile(null);
    setUploadKey((k) => k + 1);
  }
  const upload = (label: string, hint: string) => (
    <>
      <FileUpload key={uploadKey} label={label} required multiple={false} accept=".xlsx" hint={hint}
        onFilesAdded={(list) => { setFile(list[0] ?? null); setMissing(false); }} onRemove={() => setFile(null)} />
      <FieldError>{missing ? 'Choose the completed Excel file.' : undefined}</FieldError>
    </>
  );

  return (
    <Modal open={open} size="fit" title="Import a framework" onClose={close}
      primaryAction={{ label: 'Check file', disabled: busy, onClick: check }} secondaryAction={{ label: 'Cancel', onClick: close }}>
      {errors ? (
        <div className="modal-body" style={{ width: 760 }}>
          <InlineNotification kind="error" title={`${plural(errors.errors.length, 'error')} in ${errors.fileName}`}>{translate("Nothing was imported. Fix these rows in Excel and upload the file again.")}</InlineNotification>
          <Table density="compact" columns={ERR_COLS} rows={errors.errors} getRowId={(r) => `${r.sheet}${r.row}${r.column}`} />
          {upload('Corrected file', 'Excel (.xlsx) · up to 20 MB')}
        </div>
      ) : (
        <div className="modal-body" style={{ width: 552, gap: 24 }}>
          <div className="import-step">
            <span className="gr-card__num" aria-hidden="true">1</span>
            <div className="import-step__body">
              <span className="title-small">{translate("Download the template and fill it in")}</span>
              <span className="body-small muted">{translate("One file = one framework version. A new version of an existing framework (same code, different version) is added as its own entry. Sheets: Framework (one row), Tiers (leave empty if the framework has no tiers), Requirements, Expected_Evidence.")}</span>
              <div><Button variant="tertiary" size="sm" icon="download" iconPosition="left" onClick={() => download('SGS_DTP_Framework_Import_Template.xlsx')}>{translate("Download template (.xlsx)")}</Button></div>
            </div>
          </div>
          <div className="import-step">
            <span className="gr-card__num" aria-hidden="true">2</span>
            <div className="import-step__body">
              <span className="title-small">{translate("Upload the completed file")}</span>
              {upload('Framework file', 'Excel (.xlsx) · up to 20 MB · checked before anything is saved')}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
