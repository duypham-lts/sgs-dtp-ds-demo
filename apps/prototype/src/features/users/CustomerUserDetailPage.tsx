'use client';
import { translate } from '@/i18n/locale';
// designs/03 CaUserDetail (active user) and CaUserPending (invitation pending / expired). UC-USR-002/003/006.
import { Button, Card, InlineNotification, OverflowMenu, Skeleton, Table } from '@sgs/graphite';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getDb } from '@/mock';
import { ROLE_SUMMARY, USER_STATUS } from '@/mock/labels';
import { getUserDetail, resendInvitation, scopeOptionsFor } from '@/mock/api/users';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { AsideBox, AsideList, Facts, Timeline } from '@/ui/bits';
import { fmtDate, fmtRelative, plural } from '@/ui/format';
import { DetailLayout } from '@/ui/layout';
import { useSnackbar } from '@/ui/snackbar';
import { NotAllowed, NotFound } from '@/shell/NotAllowed';
import { AssignScopesModal, RevokeModal } from './modals';

const SECTIONS = [{ id: 'st', label: 'Status' }, { id: 'pf', label: 'Profile' }, { id: 'role', label: 'Role' }, { id: 'sc', label: 'Scope access' }, { id: 'hist', label: 'History' }];
const ROLE_NAME: Record<string, string> = { customer_admin: 'Customer Admin', customer_user: 'Customer User', customer_viewer: 'Customer Viewer' };

export function CustomerUserDetailPage({ id }: { id: string }) {
  const { session } = usePersona();
  const router = useRouter();
  const snack = useSnackbar();
  const q = useMockQuery(() => getUserDetail(session, id), [session.user.id, id]);
  const [revoke, setRevoke] = useState(false);
  const [assign, setAssign] = useState(false);
  if (session.user.role !== 'customer_admin') return <NotAllowed what="user administration" />;
  if (q.error) return <NotFound what="user" />;
  const u = q.data;
  if (!u) return <Skeleton lines={8} />;

  const pending = u.status === 'invited' || u.status === 'expired';
  const first = u.displayName.split(' ')[0];
  const resend = async () => { const r = await resendInvitation(session, u.id); snack(`Invitation sent again. The link expires on ${fmtDate(r.expiresAt)}.`); };
  const canAssign = u.role !== 'customer_admin';
  const scopeCols = [{ key: 'name', header: 'Scope' }, { key: 'type', header: 'Type' }, { key: 'frameworks', header: 'Frameworks' }, { key: 'given', header: 'Given', align: 'end' as const, render: (r: { grantedAt?: string }) => fmtDate(r.grantedAt) }];
  const status = { status: USER_STATUS[u.status][0], label: USER_STATUS[u.status][1], shortLabel: pending ? (u.status === 'expired' ? 'Expired' : 'Pending') : USER_STATUS[u.status][1] };
  const menu = pending
    ? [{ label: 'Resend invitation', onClick: resend }, { label: 'Revoke invitation', danger: true, onClick: () => setRevoke(true) }]
    : [{ label: 'Assign scopes', disabled: !canAssign, onClick: () => setAssign(true) }];
  const history = u.history.map((h) => ({ title: h.title, meta: `${fmtDate(h.at)} · ${h.meta}` }));
  if (pending) history.push({ title: u.status === 'expired' ? 'Invitation expired' : `Waiting for ${u.displayName} to activate`, meta: `Link ${u.status === 'expired' ? 'expired' : 'expires'} ${fmtDate(u.invitationExpiresAt)}`, state: u.status === 'expired' ? 'error' : 'current' } as never);

  return (
    <DetailLayout backHref="/admin/users" sections={SECTIONS}
      header={{ title: u.displayName, subtitle: u.email, status, actions: <OverflowMenu size="md" label="User actions" items={menu} /> }}
      aside={<>
        <div className="title-medium">{translate("Access summary")}</div>
        {pending
          ? <AsideBox title="Before activation"><span className="body-small muted">{first} can’t sign in or see any data until they activate the account from the email.</span></AsideBox>
          : <AsideBox title={`What ${u.displayName} can do`}><AsideList items={u.role === 'customer_admin'
              ? ['Work in every scope of the organisation', 'Invite users and give them scope access', 'Create scopes and request SGS services']
              : [`Work in the workspaces of ${plural(u.scopes.length, 'scope')}`, 'Create and follow service requests for those scopes', 'Can’t manage users or scopes']} /></AsideBox>}
      </>}>
      <div data-section="st"><Card number={1} title="Status">
        {pending ? (
          <>
            <InlineNotification kind={u.status === 'expired' ? 'warning' : 'info'} title={`Invitation sent on ${fmtDate(u.invitedAt)}`}>
              {u.status === 'expired' ? `The link expired on ${fmtDate(u.invitationExpiresAt)}. Resend it to give ${first} a new link.` : `The link expires on ${fmtDate(u.invitationExpiresAt)}. Resend it if ${first} didn’t get the email; revoke it if you invited the wrong person.`}
            </InlineNotification>
            <div className="btn-row"><Button variant="secondary" size="md" onClick={resend}>{translate("Resend invitation")}</Button><Button variant="tertiary" size="md" onClick={() => setRevoke(true)}>{translate("Revoke invitation")}</Button></div>
          </>
        ) : (
          <Facts items={[['Account', u.status === 'deactivated' ? `Deactivated on ${fmtDate(u.deactivatedAt)}` : `Active since ${fmtDate(u.activatedAt)}`], ['Last sign-in', fmtRelative(u.lastSignInAt)]]} />
        )}
      </Card></div>
      <div data-section="pf"><Card number={2} title="Profile">
        <Facts items={[['Full name', u.displayName], ['Email', u.email], ['Organisation', u.orgName], ['Invited by', u.inviterName ? (pending ? u.inviterName : `${u.inviterName} · ${fmtDate(u.invitedAt)}`) : '—']]} />
      </Card></div>
      <div data-section="role"><Card number={3} title="Role" subtitle={`${ROLE_NAME[u.role]} — ${pending ? 'given when the invitation is accepted' : ROLE_SUMMARY[u.role]}`} /></div>
      <div data-section="sc"><Card number={4} title="Scope access"
        subtitle={u.role === 'customer_admin' ? 'All scopes' : pending ? `${plural(u.scopes.length, 'scope')}, given when the invitation is accepted` : `${u.scopes.length} of ${plural(u.tenantScopeCount, 'scope')}`}
        actions={!pending && canAssign ? <Button variant="tertiary" size="sm" onClick={() => setAssign(true)}>{translate("Assign scopes")}</Button> : undefined}>
        {u.scopes.length ? <Table density="compact" columns={scopeCols} rows={u.scopes} getRowId={(r) => r.scopeId} /> : <p className="body-medium muted" style={{ margin: 0 }}>{translate("No scopes yet.")}</p>}
      </Card></div>
      <div data-section="hist" className="card-extend"><Card number={5} title="History" extend><Timeline steps={history} /></Card></div>
      <RevokeModal session={session} user={revoke ? u : undefined} onClose={() => setRevoke(false)} onDone={() => router.push('/admin/users')} />
      <AssignScopesModal session={session} scopes={scopeOptionsFor(getDb(), session.user.tenantId!)} onClose={() => setAssign(false)}
        user={assign ? { id: u.id, displayName: u.displayName, scopeIds: u.scopes.map((s) => s.scopeId) } : undefined} />
    </DetailLayout>
  );
}
