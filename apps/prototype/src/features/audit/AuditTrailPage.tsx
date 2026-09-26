'use client';
// Audit trail (UC-AUD-002, SGS Admin): designs/10 Main, SgsAuditConsultant, SgsAuditDetail.
// Activity log (UC-AUD-004, Customer Admin): designs/10 CaActivity, CaActivityDetail.
// One page for both portals: the customer version has no Customer filter or column and is limited to the own tenant.
import { Button, DataTable, DatePicker, Drawer, SearchInput, Select, Skeleton, Table, Tag, type TableColumn } from '@sgs/graphite';
import { useState } from 'react';
import { getDb, TODAY } from '@/mock';
import { AUDIT_CATEGORY, getAuditEvent, listAuditEvents, type AuditRow } from '@/mock/api/auditTrail';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { TwoLine } from '@/ui/bits';
import { fmtDateTime } from '@/ui/format';
import { ListLayout } from '@/ui/layout';
import { useSnackbar } from '@/ui/snackbar';
import { NotAllowed } from '@/shell/NotAllowed';

const EMPTY = { q: '', cat: 'all', ten: 'all', from: '', to: '' };

function EventDrawer({ id, onClose }: { id?: string; onClose: () => void }) {
  const { session } = usePersona();
  const q = useMockQuery(() => (id ? getAuditEvent(session, id) : Promise.resolve(undefined)), [session.user.id, id]);
  const d = q.data;
  return (
    <Drawer open={!!id} size="lg" title={d?.action ?? 'Event'} subtitle={d ? `${fmtDateTime(d.occurredAt)} · ${AUDIT_CATEGORY[d.cat][0]}` : undefined} onClose={onClose}>
      {!d ? <Skeleton lines={6} /> : (
        <div className="audit-detail">
          <dl className="body-medium audit-detail__facts">
            {d.facts.map(([k, v]) => <div key={k} style={{ display: 'contents' }}><dt className="muted">{k}</dt><dd>{v}</dd></div>)}
          </dl>
          {d.changes.length ? (
            <div className="audit-detail__change">
              <h3 className="title-small" style={{ margin: 0 }}>Change</h3>
              <Table density="compact" columns={[{ key: 'field', header: 'Field', width: 160 }, { key: 'before', header: 'Before' }, { key: 'after', header: 'After' }]} rows={d.changes} getRowId={(r) => r.field} />
            </div>
          ) : null}
        </div>
      )}
    </Drawer>
  );
}

export function AuditTrailPage() {
  const { session } = usePersona();
  const snack = useSnackbar();
  const sgs = session.portal === 'sgs-ops';
  const allowed = session.user.role === (sgs ? 'sgs_admin' : 'customer_admin');
  const q = useMockQuery(() => (allowed ? listAuditEvents(session) : Promise.resolve([])), [session.user.id, allowed]);
  const [f, setF] = useState(EMPTY);
  const [open, setOpen] = useState<string>();
  if (!allowed) return <NotAllowed what={sgs ? 'the audit trail' : 'the activity log'} />;
  const all = q.data ?? [];
  const set = (k: keyof typeof EMPTY, v: string) => setF((x) => ({ ...x, [k]: v }));
  const text = f.q.trim().toLowerCase();
  const rows = all.filter((r) => {
    const day = r.occurredAt.slice(0, 10);
    return (!text || `${r.who} ${r.action} ${r.objectLabel} ${r.context}`.toLowerCase().includes(text)) && (f.cat === 'all' || r.cat === f.cat)
      && (f.ten === 'all' || r.tenantId === f.ten) && (!f.from || day >= f.from) && (!f.to || day <= f.to);
  });
  const filtered = JSON.stringify(f) !== JSON.stringify(EMPTY);
  const cats = [{ value: 'all', label: 'All actions' }, ...(Object.keys(AUDIT_CATEGORY) as (keyof typeof AUDIT_CATEGORY)[]).filter((k) => all.some((r) => r.cat === k)).map((k) => ({ value: k, label: AUDIT_CATEGORY[k][0] }))];
  const tenants = [{ value: 'all', label: 'All customers' }, ...getDb().tenants.filter((t) => t.affiliateId === session.user.affiliateId).map((t) => ({ value: t.id, label: t.name }))];
  const cols: TableColumn<AuditRow>[] = [
    { key: 'occurredAt', header: 'Date & time', sortable: true, width: 160, render: (r) => fmtDateTime(r.occurredAt) },
    { key: 'who', header: 'Who', sortable: true, render: (r) => <TwoLine top={r.who} sub={r.whoSub} /> },
    { key: 'action', header: 'Action', sortable: true, render: (r) => <span className="audit-action"><span>{r.action}</span><Tag tone={AUDIT_CATEGORY[r.cat][1]}>{AUDIT_CATEGORY[r.cat][0]}</Tag></span> },
    { key: 'objectLabel', header: 'Object', render: (r) => <TwoLine top={r.objectLabel} sub={r.objectType} /> },
    ...(sgs ? [{ key: 'customerName', header: 'Customer', sortable: true, width: 170 } as TableColumn<AuditRow>] : []),
    { key: 'context', header: 'Context', width: 120, render: (r) => r.context || '—' },
  ];
  return (
    <ListLayout crumbs={sgs ? [{ label: 'Administration' }, { label: 'Audit trail' }] : [{ label: 'Audit Logs', href: '/audit-logs' }, { label: 'Activity log' }]}
      title={sgs ? 'Audit trail' : 'Activity log'}
      description={sgs ? `Every recorded action in ${session.affiliate.name} and its customers — for support, compliance and investigation.`
        : `Everything done on ${session.tenant?.name.replace(/ Co\., Ltd\.$| Inc\.$| JSC$/, '')}’s evidence, requests, certificates and users — by your team, by SGS and by the system.`}>
      <section className="gr-card gr-card--extend audit-card">
        <div className="gr-dt__tools audit-tools">
          <SearchInput label="Search events" placeholder="Search person, action or object" size="s" width="280px" value={f.q} onChange={(e) => set('q', e.target.value)} />
          <Select label="Action" size="s" width="200px" value={f.cat} options={cats} onChange={(_, v) => set('cat', v)} />
          {sgs ? <Select label="Customer" size="s" width="200px" value={f.ten} options={tenants} onChange={(_, v) => set('ten', v)} /> : null}
          <DatePicker label="From date" placeholder="From" size="s" width="160px" today={TODAY} max={f.to || undefined} value={f.from} onChange={(v) => set('from', v)} />
          <DatePicker label="To date" placeholder="To" size="s" width="160px" today={TODAY} min={f.from || undefined} value={f.to} onChange={(v) => set('to', v)} />
          <Button variant="ghost" size="sm" disabled={!filtered} onClick={() => setF(EMPTY)}>Clear filters</Button>
        </div>
        <DataTable<AuditRow> title={`${rows.length} ${rows.length === 1 ? 'event' : 'events'}`} description="Recorded once and never changed." columns={cols} rows={rows} layout="table" pageSize={10}
          defaultSort={{ key: 'occurredAt', dir: 'desc' }} getRowId={(r) => r.id} loading={q.loading && !q.data}
          // No UC for the export (docs/prototype-plan.md §4.5: no UC-AUD-003): the button only explains.
          toolbarActions={<Button variant="tertiary" size="sm" icon="download" iconPosition="left" onClick={() => snack(`The CSV export of ${rows.length} events is not part of the MVP (no use case). The prototype does not create the file.`)}>Export CSV</Button>}
          rowActions={(r) => [{ label: 'View details', onClick: () => setOpen(r.id) }, { label: 'Show related events', onClick: () => setF({ ...EMPTY, q: r.context || r.objectLabel }) }]}
          emptyState={{ title: 'No events match', body: 'Change or clear the filters.' }} />
      </section>
      <EventDrawer id={open} onClose={() => setOpen(undefined)} />
    </ListLayout>
  );
}
