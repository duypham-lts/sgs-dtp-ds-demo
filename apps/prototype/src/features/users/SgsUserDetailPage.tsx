'use client';
import { translate } from '@/i18n/locale';
// designs/03 SgsUserDetail. UC-USR-002. Assignments are read only (managed in each request).
import { Button, Card, InlineNotification, OverflowMenu, Skeleton, StatusTag, Table } from '@sgs/graphite';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ROLE_LABEL } from '@/mock';
import { ROLE_SUMMARY, SR_STATUS, USER_STATUS } from '@/mock/labels';
import { getUserDetail, resendInvitation } from '@/mock/api/users';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { AsideBox, AsideList, Facts } from '@/ui/bits';
import { fmtDate, fmtRelative } from '@/ui/format';
import { DetailLayout } from '@/ui/layout';
import { useSnackbar } from '@/ui/snackbar';
import { NotAllowed, NotFound } from '@/shell/NotAllowed';
import { RevokeModal } from './modals';

const CAN: Record<string, string[]> = {
  sgs_admin: ['Manage SGS users and customers of the affiliate', 'Triage and assign service requests', 'See the audit trail of the affiliate'],
  sgs_user: ['Work on requests and customer accounts of the affiliate', 'Assign auditors and create certificates', 'Can’t manage users'],
  sgs_consultant: ['See requests assigned to them', 'Read the workspaces of those requests while they are in progress', 'Can’t manage users or customers'],
  sgs_auditor: ['See audits assigned to them', 'Review the evidence of those requests during the audit', 'Can’t manage users or customers'],
};

export function SgsUserDetailPage({ id }: { id: string }) {
  const { session } = usePersona();
  const router = useRouter();
  const snack = useSnackbar();
  const q = useMockQuery(() => getUserDetail(session, id), [session.user.id, id]);
  const [revoke, setRevoke] = useState(false);
  if (session.user.role !== 'sgs_admin') return <NotAllowed what="user administration" />;
  if (q.error) return <NotFound what="user" />;
  const u = q.data;
  if (!u) return <Skeleton lines={8} />;
  const pending = u.status === 'invited' || u.status === 'expired';
  const resend = async () => { const r = await resendInvitation(session, u.id); snack(`Invitation sent again. The link expires on ${fmtDate(r.expiresAt)}.`); };
  const status = { status: USER_STATUS[u.status][0], label: USER_STATUS[u.status][1], shortLabel: pending ? 'Pending' : USER_STATUS[u.status][1] };
  const roleName = u.role === 'sgs_auditor' ? 'SGS Auditor' : ROLE_LABEL[u.role];
  const aCols = [{ key: 'label', header: 'Request' }, { key: 'customer', header: 'Customer' }, { key: 'status', header: 'Status', render: (r: { status: string }) => <StatusTag status={SR_STATUS[r.status][0]} size="sm" label={SR_STATUS[r.status][1]} /> }];
  const sections = [{ id: 'st', label: 'Status' }, { id: 'pf', label: 'Profile' }, { id: 'role', label: 'Role' }, { id: 'as', label: 'Assignments' }];

  return (
    <DetailLayout backHref="/ops/admin/users" sections={sections} sidebar="expanded"
      header={{ title: u.displayName, subtitle: `${u.email} · ${u.orgName}`, status, actions: pending ? <OverflowMenu size="md" label="User actions" items={[{ label: 'Resend invitation', onClick: resend }, { label: 'Revoke invitation', danger: true, onClick: () => setRevoke(true) }]} /> : undefined }}
      aside={<>
        <div className="title-medium">{translate("Access summary")}</div>
        <AsideBox title={pending ? 'Before activation' : `What ${u.displayName} can do`}>
          {pending ? <span className="body-small muted">{u.displayName} can’t sign in until they activate the account from the email.</span> : <AsideList items={CAN[u.role] ?? []} />}
        </AsideBox>
      </>}>
      <div data-section="st"><Card number={1} title="Status">
        {pending ? (
          <>
            <InlineNotification kind="info" title={`Invitation sent on ${fmtDate(u.invitedAt)}`}>The link expires on {fmtDate(u.invitationExpiresAt)}.</InlineNotification>
            <div className="btn-row"><Button variant="secondary" size="md" onClick={resend}>{translate("Resend invitation")}</Button><Button variant="tertiary" size="md" onClick={() => setRevoke(true)}>{translate("Revoke invitation")}</Button></div>
          </>
        ) : <Facts items={[['Account', `Active since ${fmtDate(u.activatedAt)}`], ['Last sign-in', fmtRelative(u.lastSignInAt)]]} />}
      </Card></div>
      <div data-section="pf"><Card number={2} title="Profile">
        <Facts items={[['Full name', u.displayName], ['Email', u.email], ['Affiliate', u.orgName], ['Invited by', u.inviterName ? `${u.inviterName}${u.invitedAt ? ` · ${fmtDate(u.invitedAt)}` : ''}` : '—']]} />
      </Card></div>
      <div data-section="role"><Card number={3} title="Role" subtitle={`${roleName} — ${ROLE_SUMMARY[u.role]} · set when the user was invited`} /></div>
      <div data-section="as" className="card-extend"><Card number={4} title="Current assignments" subtitle="Read only · managed in each request" extend>
        {u.assignments.length ? <Table density="compact" columns={aCols} rows={u.assignments} getRowId={(r) => r.requestId} /> : <p className="body-medium muted" style={{ margin: 0 }}>{translate("No open assignments.")}</p>}
      </Card></div>
      <RevokeModal session={session} user={revoke ? u : undefined} onClose={() => setRevoke(false)} onDone={() => router.push('/ops/admin/users')} />
    </DetailLayout>
  );
}
