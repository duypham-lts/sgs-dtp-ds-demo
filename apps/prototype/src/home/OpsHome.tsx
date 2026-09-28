'use client';
// Home (SGS Operations), designs/12-dashboard: SgsAdminHome (SGS Admin and SGS User), ConsultantHome, AuditorHome.
import { Button, DataTable, Skeleton, StatusTag, type TableColumn } from '@sgs/graphite';
import { useRouter } from 'next/navigation';
import { now } from '@/mock/api/core';
import { getAuditorDashboard, getConsultantDashboard, getSgsDashboard, greeting, type AuditorDashboard, type ConsultantDashboard, type SgsDashboard } from '@/mock/api/dashboard';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { translate } from '@/i18n/locale';
import { useSidebar } from '@/shell/ShellContext';
import { TwoLine } from '@/ui/bits';
import { ActionList, DashHead, Section, Tiles, TwoCol, lineText } from './parts';

const dash = (n: number) => (n ? String(n) : '—');
const idLink = (href: string, id: string) => <a href={href} className="gr-link" style={{ fontWeight: 500 }}>{id}</a>;

export function OpsHome() {
  useSidebar('expanded');
  const { session } = usePersona();
  const role = session.user.role;
  const hello = `${translate(greeting(now()))}, ${session.user.displayName.split(' ')[0]}`;
  if (role === 'sgs_consultant') return <ConsultantHome hello={hello} />;
  if (role === 'sgs_auditor') return <AuditorHome hello={hello} />;
  return <SgsAdminHome hello={hello} />;
}

function SgsAdminHome({ hello }: { hello: string }) {
  const router = useRouter();
  const { session } = usePersona();
  const q = useMockQuery(() => getSgsDashboard(session), [session.user.id]);
  const head = <DashHead title={hello} sub={translate('{org} · operations overview', { org: session.affiliate.name })} />;
  const d = q.data;
  if (!d) return <>{head}<Skeleton lines={10} /></>;
  type W = SgsDashboard['workload'][number]; type O = SgsDashboard['onboarding'][number]; type T = SgsDashboard['triage'][number]; type A = SgsDashboard['audits'][number];
  const wCols: TableColumn<W>[] = [
    { key: 'name', header: 'Person', render: (r) => <TwoLine top={r.name} sub={translate(r.role)} /> },
    { key: 'audits', header: 'Audits', align: 'end', width: 90, render: (r) => dash(r.audits) },
    { key: 'consulting', header: 'Consulting', align: 'end', width: 110, render: (r) => dash(r.consulting) },
    { key: 'training', header: 'Training', align: 'end', width: 100, render: (r) => dash(r.training) },
  ];
  const oCols: TableColumn<O>[] = [
    { key: 'name', header: 'Customer', render: (r) => <span className="two-line"><a href={r.href} className="gr-link" style={{ fontWeight: 500 }}>{r.name}</a><span className="body-small muted">{lineText(r.since, r.sinceParts)}</span></span> },
    { key: 'tag', header: 'Blocked at', width: 190, render: (r) => <StatusTag status={r.tag[0]} size="sm" label={translate(r.tag[1])} /> },
  ];
  const tCols: TableColumn<T>[] = [
    { key: 'id', header: 'Request', width: 130, render: (r) => idLink(r.href, r.id) },
    { key: 'customer', header: 'Customer · service', render: (r) => { const i = r.service.indexOf(' · '); const service = i < 0 ? translate(r.service) : `${translate(r.service.slice(0, i))} · ${r.service.slice(i + 3)}`; return <TwoLine top={r.customer} sub={service} />; } },
    { key: 'waiting', header: 'Waiting', width: 110, align: 'end', render: (r) => lineText(r.waiting, r.waitingParts) },
    { key: 'cta', header: '', align: 'end', width: 150, render: (r) => <Button size="sm" variant="tertiary" onClick={() => router.push(r.href)}>{r.cta}</Button> },
  ];
  const aCols: TableColumn<A>[] = [
    { key: 'id', header: 'Request', width: 130, render: (r) => idLink(r.href, r.id) },
    { key: 'customer', header: 'Customer · workspace', render: (r) => <TwoLine top={r.customer} sub={r.workspace} /> },
    { key: 'auditor', header: 'Auditor', width: 120 },
    { key: 'reviewed', header: 'Reviewed', width: 110, align: 'end' },
    { key: 'status', header: 'Status', width: 190, render: (r) => <StatusTag status={r.status[0]} size="sm" label={translate(r.status[1])} /> },
  ];
  return (
    <>
      {head}
      <div className="dash-body">
        <Tiles tiles={d.tiles} />
        <TwoCol ratio="1fr 1fr">
          <Section title="Team workload" sub="Open assignments per person · use it when assigning">
            <DataTable<W> columns={wCols} rows={d.workload} layout="table" paginate={false} getRowId={(r) => r.id} />
          </Section>
          <Section title="Customer onboarding" sub="Customers not ready to work in the portal yet">
            <DataTable<O> columns={oCols} rows={d.onboarding} layout="table" paginate={false} getRowId={(r) => r.id} emptyState={{ title: 'Every customer is set up', body: 'Customers without an active Customer Admin or a scope appear here.' }} />
          </Section>
        </TwoCol>
        <Section title="Requests to triage" sub="Submitted requests across all services" link={{ label: 'All requests', href: '/ops/requests' }}>
          <DataTable<T> columns={tCols} rows={d.triage} layout="table" paginate={false} getRowId={(r) => r.id} emptyState={{ title: 'Nothing to triage', body: 'New requests from customers appear here.' }} />
        </Section>
        <Section title="Audits" sub="Certification requests assigned to an auditor" link={{ label: 'Certification requests', href: '/ops/requests/certification' }} extend>
          <DataTable<A> columns={aCols} rows={d.audits} layout="table" paginate={false} getRowId={(r) => r.id} emptyState={{ title: 'No audits open', body: 'Certification requests appear here once an auditor is assigned.' }} />
        </Section>
      </div>
    </>
  );
}

function ConsultantHome({ hello }: { hello: string }) {
  const { session } = usePersona();
  const q = useMockQuery(() => getConsultantDashboard(session), [session.user.id]);
  const head = <DashHead title={hello} sub={translate('SGS Consultant · your assignments')} />;
  const d = q.data;
  if (!d) return <>{head}<Skeleton lines={10} /></>;
  type R = ConsultantDashboard['assignments'][number];
  const cols: TableColumn<R>[] = [
    { key: 'id', header: 'Request', width: 130, render: (r) => idLink(r.href, r.id) },
    { key: 'customer', header: 'Customer · workspace', render: (r) => { const i = r.workspace.indexOf(' · '); const workspace = i < 0 ? translate(r.workspace) : `${translate(r.workspace.slice(0, i))} · ${r.workspace.slice(i + 3)}`; return <TwoLine top={r.customer} sub={workspace} />; } },
    { key: 'dates', header: 'Dates', width: 220, render: (r) => lineText(r.dates, r.datesParts, '') },
    { key: 'status', header: 'Status', width: 170, render: (r) => <StatusTag status={r.status[0]} size="sm" label={translate(r.status[1])} /> },
  ];
  return (
    <>
      {head}
      <div className="dash-body">
        <Tiles tiles={d.tiles} />
        <TwoCol>
          <Section title="Next up">
            <ActionList items={d.next} empty="Nothing to do right now. New assignments appear here." />
          </Section>
          <Section title="Coming up" sub="Dates agreed when the request was approved">
            {d.coming.length ? (
              <ul className="dash-list">
                {d.coming.map((c) => (
                  <li key={c.id}>
                    <a href={c.href} className="dash-date">
                      <span className="dash-date__day"><span className="body-small muted" style={{ textTransform: 'uppercase' }}>{translate(c.month)}</span><span className="title-medium">{c.day}</span></span>
                      <span className="two-line"><span className="body-medium" style={{ fontWeight: 500 }}>{lineText(c.title, c.titleParts)}</span><span className="body-small muted">{lineText(c.sub, c.subParts)}</span></span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : <p className="body-medium muted" style={{ margin: 0 }}>{translate("No dates coming up.")}</p>}
          </Section>
        </TwoCol>
        <Section title="My assignments" sub="Workspaces are read only while an assignment is in progress" link={{ label: 'All assignments', href: '/ops/my-assignments/gap-analysis' }} extend>
          <DataTable<R> columns={cols} rows={d.assignments} layout="table" paginate={false} getRowId={(r) => r.id} emptyState={{ title: 'No assignments in progress', body: 'An SGS Admin assigns you when a request is approved.' }} />
        </Section>
      </div>
    </>
  );
}

function AuditorHome({ hello }: { hello: string }) {
  const { session } = usePersona();
  const q = useMockQuery(() => getAuditorDashboard(session), [session.user.id]);
  const head = <DashHead title={hello} sub={translate('SGS Auditor/Certification · your audits')} />;
  const d = q.data;
  if (!d) return <>{head}<Skeleton lines={10} /></>;
  type R = AuditorDashboard['audits'][number];
  const cols: TableColumn<R>[] = [
    { key: 'id', header: 'Request', width: 130, render: (r) => idLink(r.href, r.id) },
    { key: 'customer', header: 'Customer · workspace', render: (r) => <TwoLine top={r.customer} sub={r.workspace} /> },
    { key: 'reviewed', header: 'Reviewed', width: 110, align: 'end' },
    { key: 'toEvaluate', header: 'To evaluate', width: 120, align: 'end' },
    { key: 'status', header: 'Status', width: 200, render: (r) => <StatusTag status={r.status[0]} size="sm" label={translate(r.status[1])} /> },
  ];
  return (
    <>
      {head}
      <div className="dash-body">
        <Tiles tiles={d.tiles} />
        <TwoCol>
          <Section title="Needs your attention" sub="Most recent first">
            <ActionList items={d.attention} empty="Nothing needs you right now. Customer responses and new audits appear here." />
          </Section>
          <Section title="Open findings" sub="Across your open audits">
            <ul className="dash-list">
              {d.findings.map((f) => (
                <li key={f.label} className="dash-count">
                  <span className="two-line"><span className="body-medium" style={{ fontWeight: 500 }}>{translate(f.label)}</span><span className="body-small muted">{lineText(f.sub, f.subParts)}</span></span>
                  <span className="headline-small">{f.value}</span>
                </li>
              ))}
            </ul>
          </Section>
        </TwoCol>
        <Section title="My audits" link={{ label: 'All my audits', href: '/ops/audits' }} extend>
          <DataTable<R> columns={cols} rows={d.audits} layout="table" paginate={false} getRowId={(r) => r.id} emptyState={{ title: 'No open audits', body: 'Certification requests assigned to you appear here.' }} />
        </Section>
      </div>
    </>
  );
}
