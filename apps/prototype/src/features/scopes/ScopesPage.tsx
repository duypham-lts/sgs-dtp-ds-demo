'use client';
// designs/05 ScopesEmpty, Main (+ ScopeCreate). UC-SCP-001/003. Customer Admin creates; others see assigned scopes.
import { Button, DataTable, Tag, type TableColumn } from '@sgs/graphite';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { listScopeRows, type ScopeRow } from '@/mock/api/scopes';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { plural } from '@/ui/format';
import { ListLayout } from '@/ui/layout';
import { ScopeFormModal } from './modals';

export const TYPE_TONE: Record<string, 'neutral' | 'info' | 'required'> = { Organization: 'neutral', Product: 'info', System: 'required' };

export function ScopesPage() {
  const { session } = usePersona();
  const router = useRouter();
  const q = useMockQuery(() => listScopeRows(session), [session.user.id]);
  const [create, setCreate] = useState(false);
  // ?new=1 opens the modal straight away (Home → Get started, designs/12 CustomerHomeEmpty).
  useEffect(() => { if (new URLSearchParams(window.location.search).get('new')) setCreate(true); }, []);
  const admin = session.user.role === 'customer_admin';
  const rows = q.data ?? [];
  const org = session.tenant?.name.replace(/ (Co\., Ltd\.|Inc\.|JSC|LLC)$/, '');
  const cols: TableColumn<ScopeRow>[] = [
    { key: 'name', header: 'Scope', sortable: true, render: (r) => (
      <span className="scope-cell"><a href={`/scopes/${r.id}`} className="gr-link" style={{ fontWeight: 500 }}>{r.name}</a><Tag tone={TYPE_TONE[r.typeLabel]}>{r.typeLabel}</Tag></span>
    ), searchValue: (r) => `${r.name} ${r.typeLabel}` },
    { key: 'belongsTo', header: 'Belongs to', width: 240 },
    { key: 'frameworks', header: 'Frameworks', render: (r) => r.frameworks.length ? <span className="two-line" style={{ fontWeight: 400 }}>{r.frameworks.map((f) => <span key={f}>{f}</span>)}</span> : <span className="body-small muted">None linked yet</span> },
    { key: 'users', header: 'Users', align: 'end', width: 90 },
    { key: 'coverage', header: 'Evidence coverage', align: 'end', width: 160, render: (r) => (r.coverage === null ? '—' : `${r.coverage}%`) },
  ];
  const createBtn = admin ? <Button icon="add" iconPosition="left" onClick={() => setCreate(true)}>Create scope</Button> : undefined;
  return (
    <ListLayout crumbs={[{ label: 'Scopes' }]} title="Scopes" action={createBtn}
      description={admin ? `The parts of ${org} you prepare for a framework: the organisation, a product or a system.` : 'Scopes assigned to you. Only scopes assigned to you are listed.'}>
      <DataTable<ScopeRow> title={plural(rows.length, 'scope')} columns={cols} rows={rows} loading={q.loading && !q.data} searchable searchPlaceholder="Search scopes" layout="table" getRowId={(r) => r.id}
        emptyState={admin
          ? { title: 'Create your first scope', body: 'A scope is the part of your organisation you want to prepare: the whole organisation, a product, or one system. Link a framework to it to start collecting evidence.', action: <Button icon="add" iconPosition="left" onClick={() => setCreate(true)}>Create scope</Button> }
          : { title: 'No scopes assigned to you yet', body: 'Ask your Customer Admin to give you access to a scope.' }} />
      <ScopeFormModal session={session} open={create} onClose={() => setCreate(false)} onCreated={(id) => router.push(`/scopes/${id}`)} />
    </ListLayout>
  );
}
