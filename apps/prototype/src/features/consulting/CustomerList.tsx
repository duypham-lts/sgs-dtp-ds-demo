'use client';
// designs/06 MvpList, MvpListEmpty; 07 Main, IsListEmpty. UC-SRQ-002.
import { Button, Card, DataTable, EmptyState, StatusTag, type TableColumn } from '@sgs/graphite';
import { useRouter } from 'next/navigation';
import { SR_STATUS } from '@/mock/labels';
import { SR_META } from '@/mock/requestMeta';
import { fmtRange, listRequests, type RequestRow } from '@/mock/api/requests';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { fmtDate } from '@/ui/format';
import { ListLayout } from '@/ui/layout';
import { CONSULTING_COPY, type ConsultingCategory } from './config';

export function CustomerConsultingList({ category }: { category: ConsultingCategory }) {
  const { session } = usePersona();
  const router = useRouter();
  const c = CONSULTING_COPY[category];
  const slug = SR_META[category].slug;
  const q = useMockQuery(() => listRequests(session, category, { includeDrafts: true }), [session.user.id, category]);
  const canRequest = session.user.role === 'customer_admin' || session.user.role === 'customer_user';
  const rows = q.data ?? [];
  const href = (r: RequestRow) => (r.status === 'draft' ? `/service-requests/${slug}/new?draft=${r.id}` : `/service-requests/${slug}/${r.id}`);
  const newBtn = canRequest ? <Button icon="add" iconPosition="left" onClick={() => router.push(`/service-requests/${slug}/new`)}>{c.newLabel}</Button> : undefined;
  const crumbs = [{ label: 'Service Requests', href: '/service-requests' }, { label: c.title }];
  if (q.data && !rows.length) {
    return (
      <ListLayout crumbs={crumbs} title={c.title}>
        <Card extend className="center-card"><EmptyState icon="document" title={c.emptyTitle} body={c.emptyBody} action={newBtn} /></Card>
      </ListLayout>
    );
  }
  const cols: TableColumn<RequestRow>[] = [
    { key: 'id', header: 'Request', sortable: true, width: 140, render: (r) => <a href={href(r)} className="gr-link" style={{ fontWeight: 500 }}>{r.id}</a> },
    { key: 'frameworkLabel', header: 'Framework', sortable: true },
    { key: 'scopeName', header: 'Scope', sortable: true, render: (r) => r.scopeName ?? '—' },
    { key: 'assigneeName', header: 'SGS consultant', render: (r) => r.assigneeName ?? '—' },
    { key: 'period', header: c.periodLabel, render: (r) => (r.approvedAt ? fmtRange(r.periodFrom, r.periodTo) : category === 'implementation_support' && r.preferredStart ? fmtRange(r.preferredStart, r.preferredEnd) : '—') },
    { key: 'status', header: 'Status', sortable: true, sortValue: (r) => SR_STATUS[r.status][1], render: (r) => <StatusTag status={SR_STATUS[r.status][0]} size="sm" label={SR_STATUS[r.status][1]} /> },
    { key: 'updatedAt', header: 'Last update', width: 130, sortValue: (r) => r.updatedAt, render: (r) => fmtDate(r.updatedAt) },
  ];
  return (
    <ListLayout crumbs={crumbs} title={c.title} description={c.description} action={newBtn}>
      <DataTable<RequestRow> title={c.listTitle} columns={cols} rows={rows} loading={q.loading && !q.data} searchable searchPlaceholder={c.search} layout="table" getRowId={(r) => r.id} />
    </ListLayout>
  );
}
