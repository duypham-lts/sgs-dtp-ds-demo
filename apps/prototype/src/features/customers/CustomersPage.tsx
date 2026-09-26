'use client';
// designs/03 TenantList (+ TenantCreate, TenantCreateAdmin). UC-ACC-001/003/007. SGS Admin manages; SGS User reads.
import { Button, DataTable, StatusTag, type TableColumn } from '@sgs/graphite';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { listCustomers, type TenantRow } from '@/mock/api/tenants';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { TwoLine } from '@/ui/bits';
import { fmtRelative, plural } from '@/ui/format';
import { ListLayout } from '@/ui/layout';
import { NotAllowed } from '@/shell/NotAllowed';
import { CreateAdminModal, CustomerFormModal } from '../users/modals';

export const TENANT_STATUS: Record<string, ['completed' | 'under-review' | 'draft', string, string]> = {
  active: ['completed', 'Active', 'Active'], admin_invited: ['under-review', 'Admin invited', 'Invited'], no_admin: ['draft', 'No admin yet', 'No admin'],
};

export function CustomersPage() {
  const { session } = usePersona();
  const router = useRouter();
  const q = useMockQuery(() => listCustomers(session), [session.user.id]);
  const [create, setCreate] = useState(false);
  const [admin, setAdmin] = useState<TenantRow>();
  if (session.user.role !== 'sgs_admin' && session.user.role !== 'sgs_user') return <NotAllowed what="customer accounts" />;
  const manage = session.user.role === 'sgs_admin';
  const rows = q.data ?? [];
  const cols: TableColumn<TenantRow>[] = [
    { key: 'name', header: 'Customer', sortable: true, render: (r) => <TwoLine top={r.name} sub={r.country} href={`/ops/customers/${r.id}`} />, searchValue: (r) => `${r.name} ${r.admin?.displayName ?? ''} ${r.admin?.email ?? ''}` },
    { key: 'admin', header: 'Customer Admin', render: (r) => r.admin
      ? <span className="two-line"><span style={{ fontWeight: 500 }}>{r.admin.displayName}</span><span className="body-small two-line__sub">{r.admin.email}</span></span>
      : manage ? <Button variant="tertiary" size="sm" icon="add" iconPosition="left" onClick={() => setAdmin(r)}>Create admin</Button> : <span className="muted">—</span> },
    { key: 'users', header: 'Users', align: 'end', width: 100, sortable: true },
    { key: 'scopes', header: 'Scopes', align: 'end', width: 100, sortable: true },
    { key: 'status', header: 'Status', width: 170, render: (r) => <StatusTag status={TENANT_STATUS[r.status][0]} size="sm" label={TENANT_STATUS[r.status][1]} /> },
    { key: 'createdAt', header: 'Created', width: 130, sortable: true, render: (r) => fmtRelative(r.createdAt, false) },
  ];
  return (
    <ListLayout crumbs={[{ label: 'Customers' }]} title="Customers"
      description={`Customer accounts of ${session.affiliate.name}. Each has one Customer Admin, who invites and manages the rest of their team.`}
      action={manage ? <Button size="md" icon="add" iconPosition="left" onClick={() => setCreate(true)}>Create customer</Button> : undefined}>
      <DataTable<TenantRow> title={plural(rows.length, 'customer')} columns={cols} rows={rows} loading={q.loading && !q.data} searchable searchPlaceholder="Search customers" layout="table" getRowId={(r) => r.id} />
      <CustomerFormModal session={session} open={create} onClose={() => setCreate(false)} onCreated={(id) => router.push(`/ops/customers/${id}`)} />
      <CreateAdminModal session={session} customer={admin} onClose={() => setAdmin(undefined)} />
    </ListLayout>
  );
}
