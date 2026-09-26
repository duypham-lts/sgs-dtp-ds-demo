'use client';
// designs/03 SgsUsers (+ SgsInviteSgs). SGS Admin: SGS users of the affiliate (invite, resend, revoke) and
// customer users read-only. Customer Admins are created from Customers (TenantCreateAdmin).
import { Button, DataTable, StatusTag, Tabs, type TableColumn } from '@sgs/graphite';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ROLE_LABEL } from '@/mock';
import { USER_STATUS } from '@/mock/labels';
import { listUsersFor, resendInvitation, type UserRow } from '@/mock/api/users';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { PersonCell } from '@/ui/bits';
import { fmtDate, fmtRelative } from '@/ui/format';
import { ListLayout } from '@/ui/layout';
import { useSnackbar } from '@/ui/snackbar';
import { NotAllowed } from '@/shell/NotAllowed';
import { InviteSgsUserModal, RevokeModal } from './modals';

const shortRole = (r: UserRow) => (r.role === 'sgs_auditor' ? 'SGS Auditor' : ROLE_LABEL[r.role]);
const last = (r: UserRow) => fmtRelative(r.lastSignInAt, false);

export function SgsUsersPage() {
  const { session } = usePersona();
  const router = useRouter();
  const params = useSearchParams();
  const snack = useSnackbar();
  const sgs = useMockQuery(() => listUsersFor(session, 'sgs'), [session.user.id]);
  const cust = useMockQuery(() => listUsersFor(session, 'customers'), [session.user.id]);
  const [invite, setInvite] = useState(false);
  const [revoke, setRevoke] = useState<UserRow>();
  if (session.user.role !== 'sgs_admin') return <NotAllowed what="user administration" />;

  const status: TableColumn<UserRow> = { key: 'status', header: 'Status', width: 190, render: (r) => <StatusTag status={USER_STATUS[r.status][0]} size="sm" label={USER_STATUS[r.status][1]} /> };
  const sgsCols: TableColumn<UserRow>[] = [
    { key: 'displayName', header: 'User', sortable: true, render: (r) => <PersonCell name={r.displayName} sub={r.email} href={`/ops/admin/users/${r.id}`} />, searchValue: (r) => `${r.displayName} ${r.email}` },
    { key: 'role', header: 'Role', sortable: true, width: 180, render: shortRole, sortValue: shortRole },
    { key: 'orgName', header: 'Affiliate', width: 160 }, status, { key: 'last', header: 'Last sign-in', width: 140, render: last },
  ];
  const custCols: TableColumn<UserRow>[] = [
    { key: 'displayName', header: 'User', sortable: true, render: (r) => <PersonCell name={r.displayName} sub={r.email} href={`/ops/customers/${r.tenantId}`} />, searchValue: (r) => `${r.displayName} ${r.email} ${r.orgName}` },
    { key: 'orgName', header: 'Customer', sortable: true }, { key: 'role', header: 'Role', sortable: true, width: 160, render: shortRole }, status,
    { key: 'last', header: 'Last sign-in', width: 140, render: last },
  ];
  const acts = (r: UserRow, detail: string) => r.status === 'invited' || r.status === 'expired'
    ? [{ label: 'View', onClick: () => router.push(detail) },
       { label: 'Resend invitation', onClick: async () => { const x = await resendInvitation(session, r.id); snack(`Invitation sent again. The link expires on ${fmtDate(x.expiresAt)}.`); } },
       { label: 'Revoke invitation', danger: true, onClick: () => setRevoke(r) }]
    : [{ label: 'View', onClick: () => router.push(detail) }];
  const sgsRows = sgs.data ?? [], custRows = cust.data ?? [];

  return (
    <ListLayout crumbs={[{ label: 'Administration', href: '/ops/admin/users' }, { label: 'Users' }]} title="Users" description={`SGS staff of ${session.affiliate.name} and the users of its customers.`}>
      <Tabs label="User type" defaultTab={params.get('tab') === 'cust' ? 'cust' : 'sgs'} tabs={[
        { id: 'sgs', label: 'SGS users', badge: sgsRows.length, content: (
          <DataTable<UserRow> columns={sgsCols} rows={sgsRows} loading={sgs.loading && !sgs.data} searchable searchPlaceholder="Search name or email" layout="table" getRowId={(r) => r.id}
            rowActions={(r) => acts(r, `/ops/admin/users/${r.id}`)}
            toolbarActions={<Button size="md" icon="add" iconPosition="left" onClick={() => setInvite(true)}>Invite SGS user</Button>} />) },
        { id: 'cust', label: 'Customer users', badge: custRows.length, content: (
          // Customer users are read-only here: they are managed by their own Customer Admin.
          <DataTable<UserRow> columns={custCols} rows={custRows} loading={cust.loading && !cust.data} searchable searchPlaceholder="Search name, email or customer" layout="table" getRowId={(r) => r.id}
            description="Customer Admins are created from Customers. Customer Users are invited by their own admin."
            rowActions={(r) => r.role === 'customer_admin' ? acts(r, `/ops/customers/${r.tenantId}`) : [{ label: 'View', onClick: () => router.push(`/ops/customers/${r.tenantId}`) }]} />) },
      ]} />
      <InviteSgsUserModal session={session} open={invite} onClose={() => setInvite(false)} />
      <RevokeModal session={session} user={revoke} onClose={() => setRevoke(undefined)} />
    </ListLayout>
  );
}
