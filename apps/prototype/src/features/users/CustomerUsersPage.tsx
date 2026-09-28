'use client';
import { translate } from '@/i18n/locale';
// designs/03 Main, CaUsersEmpty (+ CaInvite, CaRevoke, CaAssignScopes). UC-USR-001/003/006. Customer Admin only.
import { Button, DataTable, StatusTag, type TableColumn } from '@sgs/graphite';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDb } from '@/mock';
import { USER_STATUS } from '@/mock/labels';
import { listUsersFor, resendInvitation, scopeOptionsFor, type UserRow } from '@/mock/api/users';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { PersonCell } from '@/ui/bits';
import { fmtDate, fmtRelative, plural } from '@/ui/format';
import { ListLayout } from '@/ui/layout';
import { useSnackbar } from '@/ui/snackbar';
import { NotAllowed } from '@/shell/NotAllowed';
import { AssignScopesModal, InviteUserModal, RevokeModal } from './modals';

export function CustomerUsersPage() {
  const { session } = usePersona();
  const router = useRouter();
  const snack = useSnackbar();
  const users = useMockQuery(() => listUsersFor(session, 'tenant'), [session.user.id]);
  const [invite, setInvite] = useState(false);
  // ?invite=1 opens the modal straight away (Home → Get started, designs/12 CustomerHomeEmpty).
  useEffect(() => { if (new URLSearchParams(window.location.search).get('invite')) setInvite(true); }, []);
  const [revoke, setRevoke] = useState<UserRow>();
  const [assign, setAssign] = useState<UserRow>();
  if (session.user.role !== 'customer_admin') return <NotAllowed what="user administration" />;

  const scopes = scopeOptionsFor(getDb(), session.user.tenantId!);
  const rows = users.data ?? [];
  const onlyMe = users.data && rows.every((u) => u.id === session.user.id);
  const shown = onlyMe ? [] : rows;
  const href = (u: UserRow) => `/admin/users/${u.id}`;

  const cols: TableColumn<UserRow>[] = [
    { key: 'displayName', header: 'User', sortable: true, render: (r) => <PersonCell name={r.displayName} sub={r.email} href={href(r)} />, searchValue: (r) => `${r.displayName} ${r.email}` },
    { key: 'role', header: 'Role', sortable: true, width: 170, render: (r) => (r.role === 'customer_admin' ? 'Customer Admin' : r.role === 'customer_viewer' ? 'Customer Viewer' : 'Customer User') },
    { key: 'scopes', header: 'Scope access', width: 150, render: (r) => (r.scopeCount === 'all' ? 'All scopes' : r.scopeCount ? plural(r.scopeCount, 'scope') : '—') },
    { key: 'status', header: 'Status', sortable: true, width: 190, sortValue: (r) => USER_STATUS[r.status][1], render: (r) => <StatusTag status={USER_STATUS[r.status][0]} size="sm" label={USER_STATUS[r.status][1]} /> },
    { key: 'last', header: 'Last sign-in', width: 150, sortValue: (r) => r.lastSignInAt ?? '', render: (r) => fmtRelative(r.lastSignInAt, true).replace(/^Yesterday, .*/, 'Yesterday') },
  ];
  const inviteBtn = <Button size="md" icon="add" iconPosition="left" onClick={() => setInvite(true)}>{translate("Invite user")}</Button>;

  return (
    <ListLayout crumbs={[{ label: 'Administration', href: '/admin/users' }, { label: 'Users' }]} title="Users" description={translate('People in {org} who can use the Customer Portal.', { org: session.tenant?.name ?? '' })}>
      <DataTable<UserRow>
        title={plural(shown.length, 'user')} columns={cols} rows={shown} loading={users.loading && !users.data}
        searchable searchPlaceholder="Search name or email" toolbarActions={inviteBtn} layout="table" getRowId={(r) => r.id}
        emptyState={{ title: 'You’re the only user so far', body: `Invite the colleagues who will upload evidence and follow service requests for ${session.tenant?.name.replace(/ Co\., Ltd\.| Inc\.$/, '')}. Each gets an email to activate their account.`, action: <Button size="md" icon="add" iconPosition="left" onClick={() => setInvite(true)}>{translate("Invite your first colleague")}</Button> }}
        rowActions={(r) => r.status === 'invited' || r.status === 'expired'
          ? [{ label: 'View', onClick: () => router.push(href(r)) },
             { label: 'Resend invitation', onClick: async () => { const x = await resendInvitation(session, r.id); snack(`Invitation sent again. The link expires on ${fmtDate(x.expiresAt)}.`); } },
             { label: 'Revoke invitation', danger: true, onClick: () => setRevoke(r) }]
          : [{ label: 'View', onClick: () => router.push(href(r)) },
             { label: 'Assign scopes', disabled: r.role === 'customer_admin', onClick: () => setAssign(r) }]}
      />
      <InviteUserModal session={session} open={invite} onClose={() => setInvite(false)} scopes={scopes} />
      <RevokeModal session={session} user={revoke} onClose={() => setRevoke(undefined)} />
      <AssignScopesModal session={session} scopes={scopes} onClose={() => setAssign(undefined)}
        user={assign && { id: assign.id, displayName: assign.displayName, scopeIds: getDb().userScopes.filter((x) => x.userId === assign.id).map((x) => x.scopeId) }} />
    </ListLayout>
  );
}
