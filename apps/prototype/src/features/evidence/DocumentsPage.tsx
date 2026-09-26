'use client';
// designs/05 Documents and EvidenceLibrary (same page opened from a workspace: filtered, with
// "Back to workspace"). UC-EVD-006. Tabs: All / Expiring or expired / Not linked.
import { DataTable, IconButton, Link, Select, StatusTag, Tabs, Tag, type TableColumn } from '@sgs/graphite';
import { useRouter, useSearchParams } from 'next/navigation';
import { listEvidence, listWorkspaces, type EvidenceRow } from '@/mock/api/evidence';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { TwoLine } from '@/ui/bits';
import { fmtDate } from '@/ui/format';
import { useFakeDownload } from '@/ui/download';
import { PageHead } from '@/shell/PageHead';
import { useSidebar } from '@/shell/ShellContext';
import { EvidenceDrawer } from './EvidenceDrawer';

const VALIDITY: Record<string, ['completed' | 'needs-description' | 'missing-info', string]> = { ok: ['completed', 'Valid'], soon: ['needs-description', 'Expires soon'], exp: ['missing-info', 'Expired'] };

export function DocumentsPage() {
  useSidebar('expanded');
  const { session } = usePersona();
  const router = useRouter();
  const params = useSearchParams();
  const download = useFakeDownload();
  const from = params.get('workspace') ?? undefined;
  const ws = params.get('ws') ?? from ?? 'all';
  const evq = useMockQuery(() => listEvidence(session), [session.user.id]);
  const wsq = useMockQuery(() => listWorkspaces(session), [session.user.id]);
  const set = (k: string, v?: string) => { const p = new URLSearchParams(params.toString()); if (v) p.set(k, v); else p.delete(k); router.replace(`/documents?${p.toString()}`, { scroll: false }); };
  const rows = (evq.data ?? []).filter((e) => ws === 'all' || e.workspaceId === ws);
  const cols: TableColumn<EvidenceRow>[] = [
    { key: 'name', header: 'Evidence', sortable: true, render: (r) => <TwoLine top={r.name} sub={r.fileName} href={`#evidence-${r.id}`} />, searchValue: (r) => `${r.name} ${r.fileName}` },
    { key: 'workspaceLabel', header: 'Workspace', sortable: true, width: 260 },
    { key: 'usedFor', header: 'Used for', width: 150, render: (r) => (r.usedFor.length ? r.usedFor.join(', ') : <Tag tone="required">Not linked</Tag>) },
    { key: 'validUntil', header: 'Valid until', width: 120, render: (r) => (r.validUntil ? fmtDate(r.validUntil) : '—') },
    { key: 'validity', header: 'Validity', width: 140, render: (r) => <StatusTag status={VALIDITY[r.validity][0]} size="sm" label={VALIDITY[r.validity][1]} /> },
    { key: 'uploadedAt', header: 'Uploaded', width: 190, render: (r) => `${r.uploadedBy} · ${fmtDate(r.uploadedAt)}` },
    { key: 'dl', header: '', align: 'end', width: 64, render: (r) => <IconButton icon="download" label={`Download ${r.fileName}`} size="md" onClick={() => download(r.fileName)} /> },
  ];
  const table = (list: EvidenceRow[]) => <DataTable<EvidenceRow> columns={cols} rows={list} searchable searchPlaceholder="Search evidence" layout="table" paginate={false} getRowId={(r) => r.id} loading={evq.loading && !evq.data} />;
  const soon = rows.filter((r) => r.validity !== 'ok'), unlinked = rows.filter((r) => !r.usedFor.length);
  const wsOpts = [{ value: 'all', label: 'All workspaces' }, ...(wsq.data ?? []).map((w) => ({ value: w.id, label: `${w.fw} · ${w.scopeName.replace(/ · Taipei$/, '')}` }))];
  return (
    <>
      <PageHead crumbs={[{ label: 'Documents' }]} title="Documents" description="Evidence uploaded to the workspaces you can access. Each file belongs to one workspace."
        action={from ? <Link href={`/workspaces/${from}`}>Back to workspace</Link> : undefined} />
      {/* Names open the drawer: rows use #evidence-<id> links so the list stays plain links. */}
      <section className="gr-card gr-card--extend docs-card" onClickCapture={(e) => {
        const a = (e.target as HTMLElement).closest('a[href^="#evidence-"]');
        if (a) { e.preventDefault(); set('evidence', a.getAttribute('href')!.slice(10)); }
      }}>
        <div className="gr-dt__tools" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Select label="Workspace" size="s" width="360px" value={ws} options={wsOpts} onChange={(_, v) => set('ws', v === 'all' ? undefined : v)} />
        </div>
        <Tabs label="Evidence filter" tabs={[
          { id: 'all', label: 'All', badge: rows.length, content: table(rows) },
          { id: 'exp', label: 'Expiring or expired', badge: soon.length, content: table(soon) },
          { id: 'nl', label: 'Not linked', badge: unlinked.length, content: table(unlinked) },
        ]} />
      </section>
      <EvidenceDrawer id={params.get('evidence') ?? undefined} onClose={() => set('evidence')} />
    </>
  );
}
