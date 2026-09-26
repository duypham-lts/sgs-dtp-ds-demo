'use client';
// "All requests" of both portals (UC-SRQ-002): every service request the user may see, all categories in
// one list, each row opening the detail page of its category. No design: built from the list pattern of
// designs/06 and 09 and labelled "Chưa có design".
import { DataTable, StatusTag, type TableColumn } from '@sgs/graphite';
import { SR_STATUS } from '@/mock/labels';
import { SR_META, customerHref, opsHref } from '@/mock/requestMeta';
import { listRequests, type RequestRow } from '@/mock/api/requests';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { TwoLine } from '@/ui/bits';
import { fmtDate } from '@/ui/format';
import { ListLayout } from '@/ui/layout';
import { NotAllowed } from '@/shell/NotAllowed';

export function AllRequestsPage() {
  const { session } = usePersona();
  const sgs = session.portal === 'sgs-ops';
  const allowed = sgs ? session.user.role === 'sgs_admin' || session.user.role === 'sgs_user' : true;
  const q = useMockQuery(() => (allowed ? listRequests(session, undefined, { includeDrafts: !sgs }) : Promise.resolve([])), [session.user.id, allowed]);
  if (!allowed) return <NotAllowed what="all requests" />;
  const href = (r: RequestRow) => (sgs ? opsHref(r.category, r.id) : r.status === 'draft' ? `/service-requests/${SR_META[r.category].slug}/new?draft=${r.id}` : customerHref(r.category, r.id));
  const rows = q.data ?? [];
  const cols: TableColumn<RequestRow>[] = [
    { key: 'id', header: 'Request', width: 140, render: (r) => <a href={href(r)} className="gr-link" style={{ fontWeight: 500 }}>{r.id}</a> },
    { key: 'category', header: 'Service', sortable: true, sortValue: (r) => SR_META[r.category].label, render: (r) => <TwoLine top={SR_META[r.category].label} sub={r.title} />, searchValue: (r) => `${r.id} ${SR_META[r.category].label} ${r.title} ${r.customerName}` },
    ...(sgs ? [{ key: 'customerName', header: 'Customer', sortable: true, width: 200 } as TableColumn<RequestRow>] : []),
    { key: 'submittedAt', header: 'Submitted', sortable: true, width: 130, sortValue: (r) => r.submittedAt ?? '', render: (r) => (r.submittedAt ? fmtDate(r.submittedAt) : 'Not submitted') },
    { key: 'assigneeName', header: 'SGS contact', width: 150, render: (r) => r.assigneeName ?? '—' },
    { key: 'status', header: 'Status', width: 190, render: (r) => <StatusTag status={SR_STATUS[r.status][0]} size="sm" label={SR_STATUS[r.status][1]} /> },
  ];
  return (
    <ListLayout noDesign crumbs={[{ label: sgs ? 'Requests' : 'Service Requests' }, { label: 'All requests' }]} title="All requests"
      description={sgs ? `Every service request of ${session.affiliate.name}’s customers, all services in one list.` : 'Every request of your organisation, all services in one list.'}>
      <DataTable<RequestRow> title={`${rows.length} request${rows.length === 1 ? '' : 's'}`} columns={cols} rows={rows} layout="table" searchable
        searchPlaceholder={sgs ? 'Search requests or customers' : 'Search requests'} pageSize={10} defaultSort={{ key: 'submittedAt', dir: 'desc' }}
        getRowId={(r) => r.id} loading={q.loading && !q.data} emptyState={{ title: 'No requests yet', body: sgs ? 'Requests from customers appear here.' : 'Request a service from the menu on the left.' }} />
    </ListLayout>
  );
}
