'use client';
import { translate } from '@/i18n/locale';
// designs/05 ScopeCreate (also Edit scope, UC-SCP-004: same form, no own design), LinkFramework,
// ChangeTier / ChangeTierLocked, AssignUsers. Field widths follow design-questions Q4: 552 / 268.
import { InlineNotification, Modal, Select, TextInput, Textarea } from '@sgs/graphite';
import { useMemo, useState } from 'react';
import { getDb, MockApiError, type ScopeType, type Session } from '@/mock';
import { SCOPE_TYPE_US } from '@/mock/labels2';
import { changeTier, createScope, linkableFrameworks, linkFramework, setScopeUsers, tierImpact, updateScope, type ScopeDetail, type ScopeInput, type WorkspaceRow } from '@/mock/api/scopes';
import { RadioCards } from '@/ui/bits';
import { required, useForm } from '@/ui/form';
import { useSnackbar } from '@/ui/snackbar';

const TYPE_OPTIONS = [
  { value: 'organization', title: 'Organization', sub: 'The whole company or one legal entity' },
  { value: 'product', title: 'Product', sub: 'A product or service you offer' },
  { value: 'system', title: 'System', sub: 'One information system; can belong to an organisation and a product' },
];

export function ScopeFormModal({ session, open, onClose, scope, onCreated }: { session: Session; open: boolean; onClose: () => void; scope?: ScopeDetail; onCreated?: (id: string) => void }) {
  const snack = useSnackbar();
  const db = getDb();
  const orgs = db.scopes.filter((s) => s.tenantId === session.user.tenantId && s.type === 'organization' && s.id !== scope?.id).map((s) => ({ value: s.id, label: s.name }));
  const prods = [{ value: '', label: 'None' }, ...db.scopes.filter((s) => s.tenantId === session.user.tenantId && s.type === 'product').map((s) => ({ value: s.id, label: s.name }))];
  const init = { type: (scope?.type ?? '') as ScopeType | '', name: scope?.name ?? '', parentOrgScopeId: scope?.parentOrgScopeId ?? '', parentProductScopeId: scope?.parentProductScopeId ?? '', description: scope?.description ?? '', outOfScope: scope?.outOfScope ?? '' };
  const f = useForm(init, { type: required('Choose the type of scope.'), name: required('Enter a name.'), description: required('Describe what is in scope.') });
  const [busy, setBusy] = useState(false);
  const close = () => { f.reset(init); onClose(); };
  async function save() {
    if (!f.validate()) return;
    setBusy(true);
    try {
      const input = f.values as ScopeInput;
      if (scope) { await updateScope(session, scope.id, input); snack('Scope saved'); close(); }
      else { const s = await createScope(session, input); snack(`${s.name} created. Link a framework to start collecting evidence.`); f.reset(); onClose(); onCreated?.(s.id); }
    } catch (e) { if (e instanceof MockApiError) f.setError('name', e.message); else throw e; } finally { setBusy(false); }
  }
  return (
    <Modal open={open} size="fit" title={scope ? 'Edit scope' : 'Create scope'} onClose={close}
      primaryAction={{ label: scope ? 'Save' : 'Create scope', disabled: busy, onClick: save }} secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        {scope ? null : (
          <>
            <RadioCards name="stype" legend="Type" required direction="row" options={TYPE_OPTIONS} value={f.values.type} onChange={(v) => f.set('type', v as ScopeType)} />
            {f.errors.type ? <div className="gr-field is-error" style={{ marginTop: -8 }}><div className="gr-field__msg" role="alert">{f.errors.type}</div></div> : null}
          </>
        )}
        <TextInput label="Name" width="552px" required {...f.field('name')} />
        {(scope?.type ?? f.values.type) === 'system' ? (
          <div className="field-row">
            <Select label="Belongs to organisation" width="268px" placeholder="Choose" options={orgs} value={f.values.parentOrgScopeId} onChange={(_, v) => f.set('parentOrgScopeId', v)} />
            <Select label="Belongs to product (optional)" width="268px" options={prods} value={f.values.parentProductScopeId} onChange={(_, v) => f.set('parentProductScopeId', v)} />
          </div>
        ) : null}
        <Textarea label="What is in scope" width="552px" required rows={2} {...f.field('description')} />
        <Textarea label="What is out of scope (optional)" width="552px" rows={2} placeholder="e.g. Marketing email tool run by a supplier" {...f.field('outOfScope')} />
      </div>
    </Modal>
  );
}

function tierOptions(tiers: { code: string; label: string; localLabel?: string; hint?: string; total: number }[]) {
  return tiers.map((t, i) => ({
    value: t.code, title: t.localLabel ? `${t.label} · ${t.localLabel}` : t.label,
    sub: i === 0 ? t.hint ?? 'Baseline' : `${tiers[i - 1].label} + ${t.total - tiers[i - 1].total} more controls`, right: `${t.total} requirements`,
  }));
}

export function LinkFrameworkModal({ session, scope, open, onClose }: { session: Session; scope: ScopeDetail; open: boolean; onClose: () => void }) {
  const snack = useSnackbar();
  const options = useMemo(() => linkableFrameworks(getDb(), scope.id), [scope.id, scope.workspaces.length]);
  const [code, setCode] = useState('');
  const [version, setVersion] = useState('');
  const [tier, setTier] = useState('');
  const [errors, setErrors] = useState<{ code?: string; tier?: string }>({});
  const [busy, setBusy] = useState(false);
  const fw = options.find((o) => o.code === code);
  const ver = fw?.versions.find((v) => v.id === version) ?? fw?.versions.find((v) => !v.linked);
  const close = () => { setCode(''); setVersion(''); setTier(''); setErrors({}); onClose(); };
  async function save() {
    const e: typeof errors = {};
    if (!fw || !ver) e.code = 'Choose a framework.';
    if (ver?.tiers.length && !tier) e.tier = 'Choose the protection tier.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await linkFramework(session, scope.id, ver!.id, tier || undefined);
      const t = ver!.tiers.find((x) => x.code === tier);
      snack(`Workspace created for ${ver!.label}${t ? ` · ${t.label}` : ''}`);
      close();
    } catch (err) { if (err instanceof MockApiError) setErrors({ code: err.message }); else throw err; } finally { setBusy(false); }
  }
  return (
    <Modal open={open} size="fit" title="Link a framework" onClose={close}
      primaryAction={{ label: 'Link and create workspace', disabled: busy, onClick: save }} secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <Select label="Framework" width="552px" required placeholder="Choose a framework" value={code} error={errors.code}
          options={options.map((o) => ({ value: o.code, label: o.label, description: o.description }))}
          onChange={(_, v) => { setCode(v); setVersion(''); setTier(''); setErrors({}); }} />
        {fw ? <Select label="Version" required size="m" value={ver?.id ?? ''} helpText="Only active versions are listed." onChange={(_, v) => { setVersion(v); setTier(''); }}
          options={fw.versions.map((v) => ({ value: v.id, label: v.linked ? `${v.label} · already linked` : v.label }))} /> : null}
        {ver?.tiers.length ? (
          <>
            <RadioCards name="tier" legend={`Protection tier of this ${scope.type}`} required options={tierOptions(ver.tiers)} value={tier} onChange={(v) => { setTier(v); setErrors((x) => ({ ...x, tier: undefined })); }} />
            {errors.tier ? <div className="gr-field is-error" style={{ marginTop: -8 }}><div className="gr-field__msg" role="alert">{errors.tier}</div></div> : null}
          </>
        ) : null}
        <p className="body-small muted" style={{ margin: 0 }}>{translate("A workspace is created for this scope with the requirements of the chosen tier. You can change the tier later; uploaded evidence stays.")}</p>
      </div>
    </Modal>
  );
}

export function ChangeTierModal({ session, scope, workspace, onClose }: { session: Session; scope: ScopeDetail; workspace?: WorkspaceRow; onClose: () => void }) {
  const snack = useSnackbar();
  const [tier, setTier] = useState<string>();
  if (!workspace) return <Modal open={false} title="Change tier" />;
  const fw = getDb().frameworks.find((f) => f.id === workspace.frameworkId)!;
  const current = fw.tiers.find((t) => t.code === workspace.tier);
  const chosen = tier ?? workspace.tier!;
  const next = fw.tiers.find((t) => t.code === chosen)!;
  const locked = workspace.status === 'audit_in_progress';
  const close = () => { setTier(undefined); onClose(); };
  const impact = tierImpact(getDb(), workspace.id, chosen);
  if (locked) {
    return (
      <Modal open size="fit" title="Change tier" onClose={close} primaryAction={{ label: 'Change tier', disabled: true }} secondaryAction={{ label: 'Close', onClick: close }}>
        <div className="modal-body" style={{ width: 552 }}>
          <p className="body-medium muted" style={{ margin: 0 }}>{scope.name} · {workspace.fw} · {current?.label}</p>
          <InlineNotification kind="warning" title="Tier can’t be changed during an audit">
            Audit {workspace.lockedBy} is reviewing this workspace against tier {current?.label} ({current?.total} requirements). You can change the tier after the review closes. Unlinking the framework and editing the scope are blocked for the same reason.
          </InlineNotification>
        </div>
      </Modal>
    );
  }
  return (
    <Modal open size="fit" title="Change tier" onClose={close}
      primaryAction={{ label: chosen === workspace.tier ? 'Change tier' : `Change to ${next.label}`, disabled: chosen === workspace.tier, onClick: async () => { await changeTier(session, workspace.id, chosen); snack(`${workspace.fw} is now ${next.label}. Coverage ${impact.to}%.`); close(); } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <p className="body-medium muted" style={{ margin: 0 }}>{scope.name} · {workspace.fw} · currently {current?.label}</p>
        <RadioCards name="tier" legend="Tier" hideLegend options={tierOptions(fw.tiers)} value={chosen} onChange={setTier} />
        {chosen !== workspace.tier ? (
          <InlineNotification kind="info" title={impact.delta > 0 ? `${impact.delta} more requirements to meet` : `${-impact.delta} fewer requirements to meet`}>
            Evidence you already uploaded stays linked. Coverage will {impact.to < impact.from ? 'drop' : 'change'} from {impact.from}% to {impact.to}%{impact.delta > 0 ? ' until you add evidence for the new requirements' : ''}.
          </InlineNotification>
        ) : null}
      </div>
    </Modal>
  );
}

export function AssignUsersModal({ session, scope, open, onClose }: { session: Session; scope: ScopeDetail; open: boolean; onClose: () => void }) {
  const snack = useSnackbar();
  const [sel, setSel] = useState<string[] | null>(null);
  const chosen = sel ?? scope.candidates.filter((c) => c.selected).map((c) => c.id);
  const close = () => { setSel(null); onClose(); };
  return (
    <Modal open={open} size="fit" title="Assign users" onClose={close}
      primaryAction={{ label: 'Save', onClick: async () => { await setScopeUsers(session, scope.id, chosen); snack(`Users of ${scope.name} saved`); close(); } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 480, gap: 12 }}>
        <p className="body-medium muted" style={{ margin: 0 }}>Users you tick can work in every workspace of {scope.name}. Customer Admins always have access.</p>
        {scope.candidates.map((c) => (
          <label key={c.id} className="check-row">
            <input type="checkbox" className="gr-check" checked={chosen.includes(c.id)} onChange={() => setSel(chosen.includes(c.id) ? chosen.filter((x) => x !== c.id) : [...chosen, c.id])} />
            <span className="two-line"><span className="body-medium" style={{ fontWeight: 500 }}>{c.name}</span><span className="body-small two-line__sub">{c.email}{c.status === 'invited' || c.status === 'expired' ? ' · invitation pending' : ''}</span></span>
          </label>
        ))}
      </div>
    </Modal>
  );
}

export { SCOPE_TYPE_US };
