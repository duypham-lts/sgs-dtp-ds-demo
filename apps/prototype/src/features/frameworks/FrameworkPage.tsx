'use client';
// designs/04 FwPreview (draft), FwActivate, FwDetail (active), FwRequirements; "Other versions" has no
// exported design (design-questions Q20): a version table built from the columns defined in FwPreview.
import { Breadcrumb, Button, Card, Modal, OverflowMenu, RequirementNavigator, Skeleton, StatusTag, Table, Tag, InlineNotification, type RequirementGroup, type StatusTagProps } from '@sgs/graphite';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { Framework, Requirement } from '@/mock';
import { activateFramework, discardDraft, getFramework, type FrameworkDetail, type FrameworkSummary, type TierRow } from '@/mock/api/frameworks';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { AsideBox, Facts, StatTile } from '@/ui/bits';
import { fmtDate } from '@/ui/format';
import { DetailLayout } from '@/ui/layout';
import { useSnackbar } from '@/ui/snackbar';
import { NoDesign } from '@/shell/PageHead';
import { NotAllowed, NotFound } from '@/shell/NotAllowed';
import { FW_STATUS } from './FrameworksPage';

export type FrameworkView = 'overview' | 'requirements' | 'versions';

const TIER_COLS = [
  { key: 'code', header: 'Code', width: 80 }, { key: 'label', header: 'Tier' }, { key: 'rank', header: 'Rank', align: 'end' as const, width: 80 },
  { key: 'added', header: 'New at this tier', align: 'end' as const }, { key: 'total', header: 'Total to meet', align: 'end' as const },
];

/** Tier tags in the navigator: lowest tier plain, the others "From X" (designs/04 tierLabels). */
export function tierLabels(f: Framework): Record<string, [StatusTagProps['status'], string]> {
  const tones: StatusTagProps['status'][] = ['draft', 'info', 'under-review'];
  return Object.fromEntries(f.tiers.map((t, i) => [t.code, [tones[i] ?? 'info', i === 0 ? t.label : `From ${t.label}`]]));
}
export function tierFilter(f: Framework) { return [{ value: 'all', label: 'All tiers' }, ...f.tiers.map((t) => ({ value: t.code, label: t.label }))]; }
export function toGroups(reqs: Requirement[], status: (r: Requirement) => string | undefined = (r) => r.minTier): RequirementGroup[] {
  const groups: RequirementGroup[] = [];
  for (const r of reqs) {
    let g = groups.find((x) => x.id === r.groupCode);
    if (!g) { g = { id: r.groupCode, code: r.groupCode, title: r.groupTitle, children: [] }; groups.push(g); }
    g.children!.push({ id: r.code, code: r.code, title: r.title, status: status(r) });
  }
  groups.forEach((g) => { g.count = String(g.children!.length); });
  return groups;
}

function appliesTo(f: Framework, r: Requirement): [string, string | undefined] {
  if (!f.tiers.length || !r.minTier) return ['All', undefined];
  const i = f.tiers.findIndex((t) => t.code === r.minTier);
  const yes = f.tiers.slice(i).map((t) => t.label), no = f.tiers.slice(0, i).map((t) => t.label);
  return [yes.length > 1 ? `${yes.slice(0, -1).join(', ')} and ${yes[yes.length - 1]}` : yes[0], no.length ? no.join(', ') : undefined];
}

function RequirementBody({ f, r, detail, full }: { f: FrameworkDetail; r: Requirement; detail: FrameworkDetail; full: boolean }) {
  const ev = detail.evidence.filter((e) => e.requirementId === r.id);
  const [applies, notFor] = appliesTo(f, r);
  const tier = r.minTier ? tierLabels(f)[r.minTier] : undefined;
  const facts: [string, string][] = [['Applies to', applies]];
  if (full) {
    if (notFor) facts.push(['Not required for', notFor]);
    facts.push(['Sort order', `${r.sortOrder} within ${r.measureCode ? `${r.measureCode} ${r.measureTitle}` : `${r.groupCode} ${r.groupTitle}`}`]);
  }
  facts.push(['Source', r.source ?? '—']);
  return (
    <div className="req-body" style={{ gap: full ? 20 : 16 }}>
      {full ? <Breadcrumb items={[{ label: `${r.groupCode} ${r.groupTitle}`, href: '#' }, ...(r.measureCode ? [{ label: `${r.measureCode} ${r.measureTitle}`, href: '#' }] : []), { label: r.code }]} /> : null}
      <div className="req-body__head">
        <div className="two-line" style={{ gap: full ? 4 : 0 }}>
          <span className="body-small muted">{full ? `${r.code} · Requirement · assessable` : `${r.code} · ${r.measureTitle ?? r.groupTitle}`}</span>
          {full ? <h3 className="headline-small" style={{ margin: 0 }}>{r.title}</h3> : <span className="title-medium">{r.title}</span>}
        </div>
        {tier && f.tiers[0].code !== r.minTier ? <Tag tone="info">{tier[1]}</Tag> : tier ? <Tag tone="neutral">{tier[1]}</Tag> : null}
      </div>
      <p className={full ? 'body-large' : 'body-medium'} style={{ margin: 0 }}>{r.statement}</p>
      <Facts items={facts} />
      <div className="req-body__ev">
        <span className="title-small">Expected evidence{full ? ` (${ev.length})` : ''}</span>
        {ev.map((e) => (
          <div key={e.id} className="ev-row">
            <span className="two-line"><span className="body-medium" style={{ fontWeight: 500 }}>{e.code} · {e.name}</span><span className="body-small two-line__sub">{e.description}</span></span>
            <Tag tone={e.mandatory ? 'required' : 'neutral'}>{e.mandatory ? 'Mandatory' : 'Optional'}</Tag>
          </div>
        ))}
      </div>
    </div>
  );
}

function RequirementsBrowser({ f, full }: { f: FrameworkDetail; full: boolean }) {
  const groups = useMemo(() => toGroups(f.requirements), [f.requirements]);
  const pre = f.requirements.find((r) => r.code === 'R.1.1.3') ?? f.requirements[0];
  const [sel, setSel] = useState(pre?.code);
  const r = f.requirements.find((x) => x.code === sel) ?? pre;
  if (!r) return <p className="body-medium muted">No requirements.</p>;
  return (
    <div className={full ? 'req-split req-split--full' : 'req-split'}>
      <div className="req-split__nav">
        <RequirementNavigator label="Requirements" groups={groups} defaultExpanded={[r.groupCode]} selected={sel} onSelect={(id) => setSel(id)}
          filterOptions={f.tiers.length ? tierFilter(f) : undefined} statusLabels={tierLabels(f)} emptyStatusLabel="" filterable={f.tiers.length > 0} />
      </div>
      <div className="req-split__main"><RequirementBody f={f} r={r} detail={f} full={full} /></div>
    </div>
  );
}

export function FrameworkPage({ id, view }: { id: string; view: FrameworkView }) {
  const { session } = usePersona();
  const router = useRouter();
  const snack = useSnackbar();
  const q = useMockQuery(() => getFramework(session, id), [session.user.id, id]);
  const [activate, setActivate] = useState(false);
  const [discard, setDiscard] = useState(false);
  if (session.portal !== 'sgs-ops' || session.user.role === 'sgs_auditor') return <NotAllowed what="framework management" />;
  if (q.error) return <NotFound what="framework" />;
  const f = q.data;
  if (!f) return <Skeleton lines={8} />;
  const admin = session.user.role === 'sgs_admin';
  const draft = f.status === 'draft';
  const base = `/ops/frameworks/${id}`;
  const status = { status: FW_STATUS[f.status][0], label: FW_STATUS[f.status][1], shortLabel: FW_STATUS[f.status][2] };
  const subtitle = `${f.code} · ${f.versionFull} · ${f.issuedBy}`;
  const header = {
    title: f.name, subtitle, status,
    actions: draft
      ? (admin ? <div className="btn-row"><Button variant="tertiary" size="md" onClick={() => setDiscard(true)}>Discard draft</Button><Button size="md" onClick={() => setActivate(true)}>Activate</Button></div> : undefined)
      : (admin ? <OverflowMenu size="md" label="Framework actions" items={[{ label: 'Import new version', onClick: () => router.push('/ops/frameworks?import=1') }]} /> : undefined),
  };
  const counts = f.counts;
  const groupWord = f.groupLabel[1];
  const facts: [string, string][] = [['Code', f.code], ['Issued by', f.issuedBy], ['Version', f.versionFull], ['Effective date', f.effectiveDate ? fmtDate(f.effectiveDate) : 'Not set'], ['Description', f.description]];
  const frameworkCard = (n: number) => (
    <div data-section="fw"><Card number={n} title="Framework" subtitle="From the Framework sheet">
      <dl className="facts" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {facts.map(([k, v], i) => <div key={k} style={i === 4 ? { gridColumn: '1 / -1' } : undefined}><dt className="body-small facts__k">{k}</dt><dd className="body-medium facts__v">{v}</dd></div>)}
      </dl>
    </Card></div>
  );
  const tierCard = (n: number) => f.tiers.length ? (
    <div data-section="tiers"><Card number={n} title="Tiers" subtitle="Higher tiers include every requirement of the tiers below">
      <Table<TierRow> density="compact" columns={TIER_COLS} rows={f.tierRows} getRowId={(r) => r.code} />
    </Card></div>
  ) : null;
  const summaryLine = `${counts.groups} ${groupWord}${counts.measures ? ` · ${counts.measures} control measures` : ''} · ${counts.requirements} requirements`;
  const modals = (
    <>
      <Modal open={activate} size="fit" title="Activate framework" onClose={() => setActivate(false)}
        primaryAction={{ label: 'Activate framework', onClick: async () => { await activateFramework(session, id); setActivate(false); snack(`${f.shortName} · ${f.version} is active. Customers can now activate it on their scopes.`); } }}
        secondaryAction={{ label: 'Cancel', onClick: () => setActivate(false) }}>
        <div className="modal-body" style={{ width: 520 }}>
          <p className="body-medium" style={{ margin: 0 }}>Activate <strong>{f.name}</strong> · {f.versionFull}?</p>
          <ul className="body-medium muted" style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>Customers can activate it on their scopes.</li>
            {/* Copy per design-questions Q11: the customer sets the tier (designs/04 says SGS does). */}
            {f.tiers.length ? <li>Each customer chooses the tier of their scope: {f.tiers.map((t) => t.label).join(', ').replace(/, ([^,]*)$/, ' or $1')}.</li> : null}
            <li>The content is locked. Changes need a new version.</li>
          </ul>
        </div>
      </Modal>
      <Modal open={discard} size="fit" danger title="Discard draft?" onClose={() => setDiscard(false)}
        primaryAction={{ label: 'Discard draft', onClick: async () => { await discardDraft(session, id); setDiscard(false); snack('Draft discarded. Nothing was published.'); router.push('/ops/frameworks'); } }}
        secondaryAction={{ label: 'Cancel', onClick: () => setDiscard(false) }}>
        <div className="modal-body" style={{ width: 440 }}>
          <p className="body-medium" style={{ margin: 0 }}>The imported draft of <strong>{f.shortName} · {f.version}</strong> is removed. Customers never saw it. You can import the file again later.</p>
        </div>
      </Modal>
    </>
  );

  if (draft) {
    return (
      <DetailLayout backHref="/ops/frameworks" sidebar="expanded" header={header}
        sections={[{ id: 'fw', label: 'Framework' }, ...(f.tiers.length ? [{ id: 'tiers', label: 'Tiers' }] : []), { id: 'req', label: 'Requirements' }]}
        aside={<>
          <div className="title-medium">Import</div>
          <InlineNotification kind="success" title="File check passed">No errors. The draft is ready to activate.</InlineNotification>
          <AsideBox title="After activation"><span className="body-small muted">Customers can activate this framework on their scopes and choose the tier. Requirements can’t be edited in the platform; import a new version to change them.</span></AsideBox>
        </>}>
        {frameworkCard(1)}
        {tierCard(2)}
        <div data-section="req" className="card-extend"><Card number={f.tiers.length ? 3 : 2} title="Requirements" subtitle={`${summaryLine} · ${counts.evidence} expected evidence items`} extend>
          <RequirementsBrowser f={f} full={false} />
        </Card></div>
        {modals}
      </DetailLayout>
    );
  }

  const sections = [{ id: 'ov', label: 'Overview', href: base }, { id: 'req', label: 'Requirements', href: `${base}/requirements` }, { id: 'ver', label: 'Other versions', href: `${base}/versions` }];
  const active = view === 'overview' ? 'ov' : view === 'requirements' ? 'req' : 'ver';
  return (
    <DetailLayout key={view} backHref="/ops/frameworks" sidebar="expanded" header={header} sections={sections} activeSection={active}>
      {view === 'overview' ? (
        <>
          {frameworkCard(1)}
          {tierCard(2)}
          <div className="card-extend"><Card number={f.tiers.length ? 3 : 2} title="Content" subtitle="What the file contains" extend>
            <div className="stat-grid">
              <StatTile value={counts.groups} label={groupWord[0].toUpperCase() + groupWord.slice(1)} href={`${base}/requirements`} />
              {counts.measures ? <StatTile value={counts.measures} label="Control measures" href={`${base}/requirements`} /> : null}
              <StatTile value={counts.requirements} label="Requirements" href={`${base}/requirements`} />
              <StatTile value={counts.evidence} label="Expected evidence items" href={`${base}/requirements`} />
            </div>
          </Card></div>
        </>
      ) : view === 'requirements' ? (
        <div className="card-extend"><Card title="Requirements" subtitle={`${summaryLine}. Read only — import a new version to change them.`} extend>
          <RequirementsBrowser f={f} full />
        </Card></div>
      ) : (
        <div className="card-extend"><Card title="Other versions" subtitle={`Every imported version of ${f.code}`} actions={<NoDesign />} extend>
          {/* TODO(design-questions Q20): FwVersions exists on the canvas but is missing from the export. */}
          <Table<FrameworkSummary> density="compact" getRowId={(r) => r.id} rows={f.versions} columns={[
            { key: 'versionLabel', header: 'Version', render: (r) => <a href={`/ops/frameworks/${r.id}`} className="gr-link">{r.versionLabel}</a> },
            { key: 'status', header: 'Status', render: (r) => <StatusTag status={FW_STATUS[r.status][0]} size="sm" label={FW_STATUS[r.status][1]} /> },
            { key: 'importedByName', header: 'Imported by' },
            { key: 'activatedAt', header: 'Activated', align: 'end', render: (r) => (r.activatedAt ? fmtDate(r.activatedAt) : '—') },
          ]} />
        </Card></div>
      )}
      {modals}
    </DetailLayout>
  );
}
