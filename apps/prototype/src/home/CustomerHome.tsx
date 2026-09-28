'use client';
// Home (Customer Portal): designs/12-dashboard Main (Customer Admin), CustomerUserHome (Customer User, limited to
// the assigned scopes; Customer Viewer gets the same page with "Open" instead of actions) and CustomerHomeEmpty
// (Customer Admin of a customer without any scope). Readiness is preparation progress, never a compliance decision.
import { Button, DataTable, ProgressBar, Skeleton, StatusTag, type TableColumn } from '@sgs/graphite';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { now } from '@/mock/api/core';
import { getCustomerDashboard, greeting, type CustomerDashboard } from '@/mock/api/dashboard';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { translate } from '@/i18n/locale';
import { useSidebar } from '@/shell/ShellContext';
import { ActionList, DashHead, GroupBars, Section, StageSteps, Tiles, TwoCol, lineText } from './parts';

type WsRow = CustomerDashboard['workspaces'][number];
type SrRow = CustomerDashboard['requests'][number];
const ATTENTION_SHOWN = 5;

function GetStarted({ d }: { d: CustomerDashboard }) {
  const router = useRouter();
  const steps = [
    { title: 'Create a scope', body: 'The part of your organisation you want to certify: the company, a product or a system.', cta: 'Create scope', href: '/scopes?new=1', primary: true },
    { title: 'Link a framework', body: 'Choose the standard and, where it has tiers, the protection level. A workspace is created.', cta: 'Link framework', href: '/scopes' },
    { title: 'Invite your team', body: 'Colleagues upload evidence for the scopes you give them.', cta: 'Invite users', href: '/admin/users?invite=1' },
  ];
  return (
    <>
      <DashHead title={translate('Welcome, {name}', { name: d.greetingName })} sub={translate('{org} · let’s get your first framework set up', { org: d.orgName })} />
      <div className="dash-body">
        <Section title="Get started" sub="Three steps to start preparing for certification" extend>
          <ol className="dash-steps">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="gr-card__num" aria-hidden="true">{i + 1}</span>
                <span className="title-small">{translate(s.title)}</span>
                <span className="body-small muted">{translate(s.body)}</span>
                <div style={{ marginTop: 'auto' }}><Button size="sm" variant={s.primary ? 'primary' : 'tertiary'} onClick={() => router.push(s.href)}>{translate(s.cta)}</Button></div>
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </>
  );
}

export function CustomerHome() {
  useSidebar('expanded');
  const router = useRouter();
  const { session } = usePersona();
  const q = useMockQuery(() => getCustomerDashboard(session), [session.user.id]);
  const [all, setAll] = useState(false);
  const d = q.data;
  if (!d) return <><DashHead title={`${translate(greeting(now()))}, ${session.user.displayName.split(' ')[0]}`} sub={session.tenant?.name ?? ''} /><Skeleton lines={10} /></>;
  if (d.empty) return <GetStarted d={d} />;

  const wsCols: TableColumn<WsRow>[] = [
    { key: 'title', header: translate('Workspace'), render: (r) => <span className="two-line"><a href={r.href} className="gr-link" style={{ fontWeight: 500 }}>{r.title}</a><span className="body-small muted">{r.scope}</span></span> },
    { key: 'percent', header: translate('Evidence coverage'), width: 220, render: (r) => <ProgressBar value={r.percent} size="sm" label={translate('{title} coverage', { title: r.title })} helperText={translate('{done} of {total}', { done: r.provided, total: r.total })} /> },
    { key: 'stage', header: translate('Certification progress'), width: 420, render: (r) => <StageSteps stage={r.stage} /> },
  ];
  const srCols: TableColumn<SrRow>[] = [
    { key: 'id', header: translate('Request'), width: 130, render: (r) => <a href={r.href} className="gr-link" style={{ fontWeight: 500 }}>{r.id}</a> },
    { key: 'service', header: translate('Service'), render: (r) => { const i = r.service.indexOf(' · '); return i < 0 ? translate(r.service) : `${translate(r.service.slice(0, i))} · ${r.service.slice(i + 3)}`; } },
    { key: 'status', header: translate('Status'), width: 190, render: (r) => <StatusTag status={r.status[0]} size="sm" label={translate(r.status[1])} /> },
  ];
  const shown = all ? d.attention : d.attention.slice(0, ATTENTION_SHOWN);
  return (
    <>
      <DashHead title={`${translate(greeting(now()))}, ${d.greetingName}`} sub={d.limited ? translate('{org} · workspaces of the scopes assigned to you', { org: d.orgName }) : d.orgName} />
      <div className="dash-body">
        <Tiles tiles={d.tiles} />
        <TwoCol>
          <Section title="Needs your attention" sub={d.attention.length ? translate(d.attention.length === 1 ? '1 item, most urgent first' : '{count} items, most urgent first', { count: d.attention.length }) : undefined}>
            <ActionList items={shown} empty="Nothing needs you right now. Review items, SGS questions and expiring evidence appear here." />
            {d.attention.length > ATTENTION_SHOWN ? <div><Button variant="ghost" size="sm" onClick={() => setAll((x) => !x)}>{all ? translate('Show fewer') : translate('Show all {count}', { count: d.attention.length })}</Button></div> : null}
          </Section>
          <Section title="Suggested next step">
            {d.next ? (
              <div className="dash-panel">
                <span className="title-small">{lineText(d.next.title, d.next.titleParts)}</span>
                <span className="body-small muted">{lineText(d.next.body, d.next.bodyParts, ' ')}</span>
                <div><Button size="sm" variant="tertiary" onClick={() => router.push(d.next!.href)}>{translate(d.next.cta)}</Button></div>
              </div>
            ) : <p className="body-medium muted" style={{ margin: 0 }}>{translate('Nothing to suggest right now: every workspace is in audit or certified.')}</p>}
          </Section>
        </TwoCol>
        {d.groups ? (
          <Section title="Coverage by control group" sub={d.groups.title} link={{ label: 'Open workspace', href: d.groups.href }}>
            <GroupBars items={d.groups.items} />
          </Section>
        ) : null}
        <Section title="Workspaces" sub="Evidence coverage is preparation progress, not a compliance decision" link={{ label: 'All workspaces', href: '/workspaces' }}>
          <DataTable<WsRow> columns={wsCols} rows={d.workspaces} layout="table" paginate={false} getRowId={(r) => r.id} emptyState={{ title: translate('No workspaces yet'), body: translate('A workspace is created when a framework is linked to a scope.') }} />
        </Section>
        <Section title="Service requests" link={{ label: 'All requests', href: '/service-requests' }} extend>
          <DataTable<SrRow> columns={srCols} rows={d.requests} layout="table" paginate={false} getRowId={(r) => r.id} emptyState={{ title: translate('No open requests'), body: translate('Request a service from the menu on the left.') }} />
        </Section>
      </div>
    </>
  );
}

