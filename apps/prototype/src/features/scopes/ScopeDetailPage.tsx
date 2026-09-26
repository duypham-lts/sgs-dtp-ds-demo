'use client';
// designs/05 ScopeDetail (+ AssignUsers, LinkFramework, ChangeTier, ChangeTierLocked). UC-SCP-002/004/006,
// UC-USR-006. "Change tier" sits on each tiered framework row (design-questions Q19).
import { Button, Card, DataTable, OverflowMenu, ProgressBar, Skeleton, StatusTag, Table, type TableColumn } from '@sgs/graphite';
import { useState } from 'react';
import { SCOPE_TYPE_US, WS_STATUS } from '@/mock/labels2';
import { getScope, type WorkspaceRow } from '@/mock/api/scopes';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { AsideBox, Facts } from '@/ui/bits';
import { fmtDate } from '@/ui/format';
import { DetailLayout } from '@/ui/layout';
import { useSnackbar } from '@/ui/snackbar';
import { NotFound } from '@/shell/NotAllowed';
import { AssignUsersModal, ChangeTierModal, LinkFrameworkModal, ScopeFormModal } from './modals';

export function ScopeDetailPage({ id }: { id: string }) {
  const { session } = usePersona();
  const snack = useSnackbar();
  const q = useMockQuery(() => getScope(session, id), [session.user.id, id]);
  const [edit, setEdit] = useState(false);
  const [link, setLink] = useState(false);
  const [assign, setAssign] = useState(false);
  const [tierFor, setTierFor] = useState<WorkspaceRow>();
  if (q.error) return <NotFound what="scope" />;
  const sc = q.data;
  if (!sc) return <Skeleton lines={8} />;
  const admin = sc.canManage;
  const typeName = SCOPE_TYPE_US[sc.type];
  const onEdit = () => (sc.locked ? snack('The scope can’t be edited while an audit is running.') : setEdit(true));
  const fwCols: TableColumn<WorkspaceRow>[] = [
    { key: 'fw', header: 'Framework · version', render: (r) => <a href={`/workspaces/${r.id}`} className="gr-link" style={{ fontWeight: 500 }}>{r.fw}</a> },
    { key: 'tierLabel', header: 'Tier', width: 150 },
    { key: 'cov', header: 'Coverage', width: 220, render: (r) => <ProgressBar value={r.percent} size="sm" label={`${r.fw} coverage`} helperText={`${r.provided} / ${r.total}`} /> },
    { key: 'status', header: 'Status', width: 190, render: (r) => <StatusTag status={WS_STATUS[r.status][0]} size="sm" label={WS_STATUS[r.status][1]} /> },
    ...(admin && sc.workspaces.some((w) => w.tiered) ? [{ key: 'act', header: '', align: 'end' as const, width: 130, render: (r: WorkspaceRow) => (r.tiered ? <Button variant="ghost" size="sm" onClick={() => setTierFor(r)}>Change tier</Button> : null) }] : []),
  ];
  const facts: [string, string][] = [['Type', typeName]];
  if (sc.type === 'system') facts.push(['Belongs to', sc.belongsTo]);
  else facts.push(['Contains', sc.contains.join(', ') || '—']);
  return (
    <DetailLayout backHref="/scopes" sections={[{ id: 'ov', label: 'Overview' }, { id: 'fw', label: 'Frameworks' }, { id: 'us', label: 'Users' }]}
      header={{ title: sc.name, subtitle: `${typeName} scope · ${session.tenant?.name}`, status: { status: 'completed', label: 'Active', shortLabel: 'Active' },
        actions: admin ? <OverflowMenu size="md" label="Scope actions" items={[{ label: 'Edit scope', onClick: onEdit }]} /> : undefined }}
      aside={<>
        <div className="title-medium">Summary</div>
        <AsideBox title="Evidence coverage">
          {sc.workspaces.length ? sc.workspaces.map((w) => <ProgressBar key={w.id} label={w.title} value={w.percent} helperText={`${w.provided} of ${w.total} requirements have their mandatory evidence`} />) : <span className="body-small muted">No framework linked yet.</span>}
          <span className="body-small muted">Preparation progress only — not a compliance decision.</span>
        </AsideBox>
      </>}>
      <div data-section="ov"><Card number={1} title="Overview" actions={admin ? <Button variant="tertiary" size="sm" icon="edit" iconPosition="left" onClick={onEdit}>Edit</Button> : undefined}>
        <dl className="facts" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {facts.map(([k, v]) => <div key={k}><dt className="body-small facts__k">{k}</dt><dd className="body-medium facts__v">{v}</dd></div>)}
          <div style={{ gridColumn: '1 / -1' }}><dt className="body-small facts__k">In scope</dt><dd className="body-medium facts__v">{sc.description}</dd></div>
          <div style={{ gridColumn: '1 / -1' }}><dt className="body-small facts__k">Out of scope</dt><dd className="body-medium facts__v">{sc.outOfScope || '—'}</dd></div>
        </dl>
      </Card></div>
      <div data-section="fw"><Card number={2} title="Frameworks" subtitle="Each framework gets its own workspace"
        actions={admin ? <Button size="sm" icon="add" iconPosition="left" onClick={() => setLink(true)}>Link framework</Button> : undefined}>
        {sc.workspaces.length ? <DataTable<WorkspaceRow> columns={fwCols} rows={sc.workspaces} layout="table" paginate={false} getRowId={(r) => r.id} />
          : <p className="body-medium muted" style={{ margin: 0 }}>No framework linked yet. Link one to create a workspace and start collecting evidence.</p>}
      </Card></div>
      <div data-section="us" className="card-extend"><Card number={3} title="Users" subtitle="Can work in every workspace of this scope" extend
        actions={admin ? <Button variant="tertiary" size="sm" onClick={() => setAssign(true)}>Assign users</Button> : undefined}>
        <Table density="compact" getRowId={(r) => r.id} rows={sc.members} columns={[{ key: 'name', header: 'User' }, { key: 'role', header: 'Role' }, { key: 'grantedAt', header: 'Given', align: 'end', render: (r) => (r.grantedAt ? fmtDate(r.grantedAt) : '—') }]} />
      </Card></div>
      {admin ? <>
        <ScopeFormModal key={`${sc.name}${sc.description}`} session={session} open={edit} onClose={() => setEdit(false)} scope={sc} />
        <LinkFrameworkModal session={session} scope={sc} open={link} onClose={() => setLink(false)} />
        <AssignUsersModal session={session} scope={sc} open={assign} onClose={() => setAssign(false)} />
        <ChangeTierModal session={session} scope={sc} workspace={tierFor} onClose={() => setTierFor(undefined)} />
      </> : null}
    </DetailLayout>
  );
}
