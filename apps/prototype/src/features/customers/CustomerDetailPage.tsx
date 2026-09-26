'use client';
// designs/03 TenantDetail (admin active), TenantNew (no admin yet), TenantScopes, TenantEdit, TenantCreateAdmin.
// UC-ACC-002/004/007. An invited admin (no design) shows the admin row with "Invitation pending".
import { Avatar, Button, Card, DataTable, EmptyState, Link, Skeleton, StatusTag, Table, Tag } from '@sgs/graphite';
import { useState } from 'react';
import { ROLE_LABEL } from '@/mock';
import { USER_STATUS } from '@/mock/labels';
import { getCustomer, type TenantScopeRow } from '@/mock/api/tenants';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { AsideBox, Facts } from '@/ui/bits';
import { fmtDate, fmtRelative, plural } from '@/ui/format';
import { DetailLayout } from '@/ui/layout';
import { NotAllowed, NotFound } from '@/shell/NotAllowed';
import { CreateAdminModal, CustomerFormModal } from '../users/modals';
import { TENANT_STATUS } from './CustomersPage';

const TYPE_TONE: Record<string, 'neutral' | 'info' | 'required'> = { Organization: 'neutral', Product: 'info', System: 'required' };

export function CustomerDetailPage({ id, view }: { id: string; view: 'overview' | 'scopes' }) {
  const { session } = usePersona();
  const q = useMockQuery(() => getCustomer(session, id), [session.user.id, id]);
  const [edit, setEdit] = useState(false);
  const [createAdmin, setCreateAdmin] = useState(false);
  if (session.user.role !== 'sgs_admin' && session.user.role !== 'sgs_user') return <NotAllowed what="customer accounts" />;
  if (q.error) return <NotFound what="customer" />;
  const t = q.data;
  if (!t) return <Skeleton lines={8} />;
  const manage = session.user.role === 'sgs_admin';
  const base = `/ops/customers/${id}`;
  const sections = [
    { id: 'adm', label: 'Customer Admin', href: view === 'scopes' ? base : undefined },
    { id: 'pf', label: 'Profile', href: view === 'scopes' ? base : undefined },
    { id: 'us', label: 'Users', href: view === 'scopes' ? base : undefined },
    { id: 'sc', label: 'Scopes', href: `${base}/scopes` },
  ];
  const [st, label, short] = TENANT_STATUS[t.status];
  const created = t.createdAt === '2026-09-25' ? 'Today' : fmtDate(t.createdAt);
  const noAdmin = t.status === 'no_admin';
  const aside = (
    <>
      <div className="title-medium">Account</div>
      <AsideBox title="Status">
        {noAdmin || !t.lastSignIn
          ? <span className="body-small muted">Nobody can sign in for this customer until the Customer Admin activates their account.</span>
          : <><span className="body-medium">{plural(t.users, 'user')} · {plural(t.scopes, 'scope')}</span><span className="body-small muted">Last sign-in {fmtRelative(t.lastSignIn.at, false).toLowerCase().replace(/^(\d)/, 'on $1')} by {t.lastSignIn.name}</span></>}
      </AsideBox>
    </>
  );
  const header = {
    title: t.name, subtitle: `${t.country} · ${t.affiliateName}`, status: { status: st, label, shortLabel: short },
    actions: noAdmin && manage ? <Button size="md" icon="add" iconPosition="left" onClick={() => setCreateAdmin(true)}>Create admin</Button> : undefined,
  };

  if (view === 'scopes') {
    const cols = [
      { key: 'name', header: 'Scope', sortable: true, render: (r: TenantScopeRow) => <span style={{ fontWeight: 500 }}>{r.name}</span> },
      { key: 'type', header: 'Type', sortable: true, width: 140, render: (r: TenantScopeRow) => <Tag tone={TYPE_TONE[r.type]}>{r.type}</Tag> },
      { key: 'belongsTo', header: 'Belongs to', width: 220 },
      { key: 'frameworks', header: 'Framework · version', render: (r: TenantScopeRow) => r.frameworks.length ? <span className="two-line">{r.frameworks.map((f) => <span key={f}>{f}</span>)}</span> : <span className="body-small muted">None linked</span> },
      { key: 'tiers', header: 'Tier (set by customer)', width: 180, render: (r: TenantScopeRow) => r.tiers.length ? <span className="two-line">{r.tiers.map((x, i) => <span key={i}>{x}</span>)}</span> : '—' },
      { key: 'users', header: 'Users', align: 'end' as const, width: 80 },
      { key: 'createdAt', header: 'Created', width: 120, render: (r: TenantScopeRow) => fmtDate(r.createdAt) },
    ];
    return (
      <DetailLayout backHref="/ops/customers" sections={sections} activeSection="sc" sidebar="expanded" header={header} aside={aside}>
        <div className="card-extend"><Card title="Scopes" subtitle="Managed by the customer. Requirements and evidence are visible only to the auditor or consultant assigned to a request." extend>
          <DataTable<TenantScopeRow> title={plural(t.scopeRows.length, 'scope')} columns={cols} rows={t.scopeRows} searchable searchPlaceholder="Search scopes" layout="table" paginate={false} getRowId={(r) => r.id} />
        </Card></div>
      </DetailLayout>
    );
  }

  const userCols = [
    { key: 'displayName', header: 'User' },
    { key: 'role', header: 'Role', render: (r: { role: keyof typeof ROLE_LABEL }) => ROLE_LABEL[r.role] },
    { key: 'status', header: 'Status', render: (r: { status: keyof typeof USER_STATUS }) => <StatusTag status={USER_STATUS[r.status][0]} size="sm" label={USER_STATUS[r.status][1]} /> },
  ];
  const admin = t.admin;
  return (
    <DetailLayout backHref="/ops/customers" sections={sections} sidebar="expanded" header={header} aside={aside}>
      <div data-section="adm"><Card number={1} title="Customer Admin" subtitle="One per customer. They invite and manage the other users.">
        {admin ? (
          <div className="admin-row">
            <span className="person-cell"><Avatar name={admin.displayName} size="lg" /><span className="two-line"><span className="body-medium" style={{ fontWeight: 500 }}>{admin.displayName}</span>
              <span className="body-small two-line__sub">{admin.email} · {admin.status === 'active' ? `active since ${fmtDate(admin.activatedAt)}` : `invited ${fmtDate(admin.invitedAt)}, link expires ${fmtDate(admin.invitationExpiresAt)}`}</span></span></span>
            <StatusTag status={USER_STATUS[admin.status][0]} label={USER_STATUS[admin.status][1]} size="sm" />
          </div>
        ) : (
          <EmptyState size="sm" icon="user--access" title="No Customer Admin yet" body="Create the admin to activate this customer. They get an email to set up their account."
            action={manage ? <Button size="md" icon="add" iconPosition="left" onClick={() => setCreateAdmin(true)}>Create admin</Button> : undefined} />
        )}
      </Card></div>
      <div data-section="pf"><Card number={2} title="Profile" subtitle="Maintained by SGS"
        actions={manage ? <Button variant="tertiary" size="sm" icon="edit" iconPosition="left" onClick={() => setEdit(true)}>Edit</Button> : undefined}>
        <Facts items={[['Company name', t.name], ['Country', t.country], ['SGS affiliate', t.affiliateName], ['Created', `${created} by ${t.creatorName ?? 'SGS'}`], ...(t.internalNote ? [['Internal note', t.internalNote] as [string, string]] : [])]} />
      </Card></div>
      <div data-section="us"><Card number={3} title="Users" subtitle="Managed by the Customer Admin · read only">
        {t.members.length
          ? <><Table density="compact" columns={userCols} rows={t.members.filter((m) => m.status !== 'deactivated' && m.status !== 'expired').slice(0, 6)} getRowId={(r) => r.id} />
              <div><Link href="/ops/admin/users?tab=cust">Open in Users</Link></div></>
          : <EmptyState size="sm" title="No users yet" body="Users appear here once the Customer Admin invites them." />}
      </Card></div>
      <div data-section="sc" className="card-extend"><Card number={4} title="Scopes" extend
        subtitle={t.scopes ? `${plural(t.scopes, 'scope')} · ${plural(t.frameworkCount, 'framework')} linked · managed by the customer` : 'Scopes are created by the customer. The customer sets the tier of each framework.'}
        actions={t.scopes ? <Link href={`${base}/scopes`}>View scopes</Link> : undefined}>
        {t.scopes ? null : <EmptyState size="sm" title="No scopes yet" body="The Customer Admin creates scopes after signing in." />}
      </Card></div>
      <CustomerFormModal key={`${t.name}${t.country}${t.internalNote}`} session={session} open={edit} customer={t} onClose={() => setEdit(false)} />
      <CreateAdminModal session={session} customer={createAdmin ? t : undefined} onClose={() => setCreateAdmin(false)} />
    </DetailLayout>
  );
}
