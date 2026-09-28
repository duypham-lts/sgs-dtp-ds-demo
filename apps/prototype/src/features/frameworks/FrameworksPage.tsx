'use client';
import { translate } from '@/i18n/locale';
// designs/04 Main (+ FwImport, FwErrors). UC-FWK-001/009. SGS Admin imports; other SGS roles read.
import { Button, DataTable, IconButton, StatusTag, type TableColumn } from '@sgs/graphite';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { listFrameworks, type FrameworkSummary } from '@/mock/api/frameworks';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { TwoLine } from '@/ui/bits';
import { useFakeDownload } from '@/ui/download';
import { fmtRelative, plural } from '@/ui/format';
import { ListLayout } from '@/ui/layout';
import { NotAllowed } from '@/shell/NotAllowed';
import { ImportModal } from './ImportModal';

export const FW_STATUS: Record<string, ['completed' | 'draft', string, string]> = { active: ['completed', 'Active', 'Active'], draft: ['draft', 'Draft · not active', 'Draft'] };

export function FrameworksPage() {
  const { session } = usePersona();
  const q = useMockQuery(() => listFrameworks(session), [session.user.id]);
  const params = useSearchParams();
  const [importing, setImporting] = useState(params.get('import') === '1');
  const download = useFakeDownload();
  if (session.portal !== 'sgs-ops' || session.user.role === 'sgs_auditor') return <NotAllowed what="framework management" />;
  const admin = session.user.role === 'sgs_admin';
  const rows = q.data ?? [];
  const cols: TableColumn<FrameworkSummary>[] = [
    { key: 'name', header: 'Framework', sortable: true, render: (r) => <TwoLine top={r.name} sub={r.code} href={`/ops/frameworks/${r.id}`} />, searchValue: (r) => `${r.name} ${r.code}` },
    { key: 'versionLabel', header: 'Version', sortable: true, width: 220, render: (r) => <span style={{ fontWeight: 500 }}>{r.versionLabel}</span> },
    { key: 'issuedBy', header: 'Issued by', sortable: true, width: 150 },
    { key: 'tiers', header: 'Tiers', width: 190, render: (r) => (r.tiers.length ? r.tiers.map((t) => t.label).join(' · ') : '—') },
    { key: 'requirementCount', header: 'Requirements', align: 'end', width: 130, sortable: true },
    { key: 'status', header: 'Status', width: 170, render: (r) => <StatusTag status={FW_STATUS[r.status][0]} size="sm" label={FW_STATUS[r.status][1]} /> },
    { key: 'updatedAt', header: 'Updated', width: 130, sortValue: (r) => r.updatedAt, render: (r) => fmtRelative(r.updatedAt) },
    { key: 'dl', header: '', align: 'end', width: 64, render: (r) => <IconButton icon="download" label={`Download source file of ${r.shortName} · ${r.version}`} size="md" onClick={() => download(r.sourceFile ?? `${r.code}_${r.version}.xlsx`)} /> },
  ];
  return (
    <ListLayout crumbs={[{ label: 'Frameworks' }]} title="Frameworks" description="Frameworks customers can activate on their scopes. Import one from the Excel template."
      action={admin ? <div className="btn-row">
        <Button variant="tertiary" size="md" icon="download" iconPosition="left" onClick={() => download('SGS_DTP_Framework_Import_Template.xlsx')}>{translate("Download template")}</Button>
        <Button size="md" icon="upload" iconPosition="left" onClick={() => setImporting(true)}>{translate("Import framework")}</Button>
      </div> : undefined}>
      <DataTable<FrameworkSummary> title={plural(rows.length, 'framework')} columns={cols} rows={rows} loading={q.loading && !q.data} searchable searchPlaceholder="Search code or name" layout="table" getRowId={(r) => r.id} />
      <ImportModal session={session} open={importing} onClose={() => setImporting(false)} />
    </ListLayout>
  );
}
