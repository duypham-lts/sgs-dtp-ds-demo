'use client';
// designs/05 Workspaces. UC-EVD-003. Workspaces of the scopes the user can access.
import { DataTable, ProgressBar, StatusTag, type TableColumn } from '@sgs/graphite';
import { translate } from '@/i18n/locale';
import { WS_STATUS } from '@/mock/labels2';
import { listWorkspaces } from '@/mock/api/evidence';
import type { WorkspaceRow } from '@/mock/api/scopes';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { TwoLine } from '@/ui/bits';
import { plural } from '@/ui/format';
import { ListLayout } from '@/ui/layout';

export function WorkspacesPage() {
  const { session } = usePersona();
  const q = useMockQuery(() => listWorkspaces(session), [session.user.id]);
  const rows = q.data ?? [];
  const cols: TableColumn<WorkspaceRow>[] = [
    { key: 'fw', header: 'Workspace', render: (r) => <TwoLine top={r.fw} sub={`${r.scopeName} · ${r.scopeType}`} href={`/workspaces/${r.id}`} />, searchValue: (r) => `${r.fw} ${r.scopeName}` },
    { key: 'tierLabel', header: 'Tier', width: 150 },
    { key: 'cov', header: 'Evidence coverage', width: 260, render: (r) => <ProgressBar value={r.percent} size="sm" label={`${r.fw} coverage`} helperText={`${r.provided} of ${r.total} requirements`} /> },
    { key: 'status', header: 'Status', width: 190, render: (r) => <StatusTag status={WS_STATUS[r.status][0]} size="sm" label={WS_STATUS[r.status][1]} /> },
  ];
  return (
    <ListLayout crumbs={[{ label: 'Workspaces' }]} title="Workspaces"
      description={translate(session.user.role === 'customer_admin' ? 'Workspaces of the scopes of your organisation. Coverage shows how much evidence is in place — it is not a compliance decision.' : 'Workspaces of the scopes assigned to you. Coverage shows how much evidence is in place — it is not a compliance decision.')}>
      <DataTable<WorkspaceRow> title={plural(rows.length, 'workspace')} columns={cols} rows={rows} loading={q.loading && !q.data} searchable searchPlaceholder="Search workspaces" layout="table" getRowId={(r) => r.id}
        emptyState={{ title: 'No workspaces yet', body: 'A workspace is created when a framework is linked to a scope.' }} />
    </ListLayout>
  );
}
