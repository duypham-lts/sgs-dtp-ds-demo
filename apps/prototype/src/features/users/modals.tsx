'use client';
import { translate } from '@/i18n/locale';
// Modals of designs/03-user-management. Each validates like CLAUDE.md asks: errors on submit, orange,
// one per field, cleared on edit; server conflicts (duplicate email) land on the field they are about.
import { InlineNotification, Modal, MultiSelect, Select, Tag, TextInput, Textarea } from '@sgs/graphite';
import { useState } from 'react';
import { MockApiError, type Session, type SgsRole } from '@/mock';
import { COUNTRIES, SGS_ROLE_OPTIONS } from '@/mock/labels';
import { createCustomer, updateCustomer, type TenantRow } from '@/mock/api/tenants';
import { createCustomerAdmin, EMAIL_RE, inviteCustomerUser, inviteSgsUser, revokeInvitation, setUserScopes } from '@/mock/api/users';
import { required, useForm } from '@/ui/form';
import { useSnackbar } from '@/ui/snackbar';
import { plural } from '@/ui/format';

const email = (v: string) => (!v?.trim() ? 'Enter an email address.' : !EMAIL_RE.test(v.trim()) ? 'Enter a valid email address, e.g. name@company.com.' : undefined);

function useSubmit<T>(fn: () => Promise<T>, onError: (e: MockApiError) => void) {
  const [busy, setBusy] = useState(false);
  return {
    busy,
    run: async () => {
      setBusy(true);
      try { return await fn(); } catch (e) { if (e instanceof MockApiError) onError(e); else throw e; } finally { setBusy(false); }
    },
  };
}

export interface ScopeOption { value: string; label: string; description: string; frameworks: string; type: string; meta: string }

/** designs/03 CaInvite: Customer Admin invites a Customer User. */
export function InviteUserModal({ session, open, onClose, scopes }: { session: Session; open: boolean; onClose: () => void; scopes: ScopeOption[] }) {
  const snack = useSnackbar();
  const f = useForm({ email: '', name: '', scopeIds: [] as string[] }, { email });
  const submit = useSubmit(async () => {
    const u = await inviteCustomerUser(session, { email: f.values.email, name: f.values.name, scopeIds: f.values.scopeIds });
    snack(`Invitation sent to ${u.email}`);
    f.reset(); onClose();
  }, (e) => f.setError('email', e.message));
  return (
    <Modal open={open} size="fit" title="Invite a user" onClose={() => { f.reset(); onClose(); }}
      primaryAction={{ label: 'Send invitation', disabled: submit.busy, onClick: () => { if (f.validate()) submit.run(); } }}
      secondaryAction={{ label: 'Cancel', onClick: () => { f.reset(); onClose(); } }}>
      <div className="modal-body" style={{ width: 552 }}>
        <p className="body-medium muted" style={{ margin: 0 }}>They join {session.tenant?.name} as a Customer User and get an email to activate their account.</p>
        <TextInput label="Email" type="email" required size="l" helpText="The invitation is sent here. It becomes their sign-in name." {...f.field('email')} />
        <TextInput label="Full name (optional)" size="l" {...f.field('name')} />
        <MultiSelect label="Scope access (optional)" width="552px" placeholder="No scopes yet" options={scopes.map(({ value, label, description }) => ({ value, label, description }))}
          value={f.values.scopeIds} onChange={(v) => f.set('scopeIds', v)} helpText="They can only see the scopes you choose. You can change this later." />
      </div>
    </Modal>
  );
}

/** designs/03 CaRevoke (also used on the SGS side). */
export function RevokeModal({ session, user, onClose, onDone }: { session: Session; user?: { id: string; email: string }; onClose: () => void; onDone?: () => void }) {
  const snack = useSnackbar();
  const [error, setError] = useState<string>();
  const submit = useSubmit(async () => { await revokeInvitation(session, user!.id); snack(`Invitation for ${user!.email} revoked`); onClose(); onDone?.(); }, (e) => setError(e.message));
  return (
    <Modal open={!!user} size="fit" danger title="Revoke invitation?" onClose={onClose}
      primaryAction={{ label: 'Revoke invitation', disabled: submit.busy, onClick: () => submit.run() }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}>
      <div className="modal-body" style={{ width: 440 }}>
        <p className="body-medium" style={{ margin: 0 }}>{translate("The link sent to")} <strong>{user?.email}</strong> {translate("stops working. You can invite them again later.")}</p>
        {error ? <InlineNotification kind="error" title="Couldn’t revoke">{error}</InlineNotification> : null}
      </div>
    </Modal>
  );
}

/** designs/03 CaAssignScopes: plain checkbox rows with the scope type as a Tag. */
export function AssignScopesModal({ session, user, scopes, onClose }: {
  session: Session; user?: { id: string; displayName: string; scopeIds: string[] }; scopes: ScopeOption[]; onClose: () => void;
}) {
  const snack = useSnackbar();
  const [sel, setSel] = useState<string[] | null>(null);
  const chosen = sel ?? user?.scopeIds ?? [];
  const close = () => { setSel(null); onClose(); };
  const submit = useSubmit(async () => { await setUserScopes(session, user!.id, chosen); snack(`Scope access saved for ${user!.displayName}`); close(); }, (e) => snack(e.message));
  const toggle = (id: string) => setSel(chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id]);
  return (
    <Modal open={!!user} size="fit" title="Assign scope access" onClose={close}
      primaryAction={{ label: 'Save access', disabled: submit.busy, onClick: () => submit.run() }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <p className="body-medium muted" style={{ margin: 0 }}>{user?.displayName} can see and work on requests, workspaces and documents of the scopes you tick.</p>
        <fieldset className="check-rows">
          <legend className="gr-sr">{translate("Scopes")}</legend>
          {scopes.map((o) => (
            <label key={o.value} className="check-row">
              <input type="checkbox" className="gr-check" checked={chosen.includes(o.value)} onChange={() => toggle(o.value)} />
              <span className="two-line" style={{ flexGrow: 1 }}>
                <span className="body-medium" style={{ fontWeight: 500 }}>{o.label}</span>
                <span className="body-small two-line__sub">{o.frameworks || 'No frameworks linked'}</span>
              </span>
              <Tag tone="neutral">{o.type}</Tag>
            </label>
          ))}
        </fieldset>
        <p className="body-small muted" style={{ margin: 0 }}>{chosen.length} of {plural(scopes.length, 'scope')} selected</p>
      </div>
    </Modal>
  );
}

/** designs/03 SgsInviteSgs. */
export function InviteSgsUserModal({ session, open, onClose }: { session: Session; open: boolean; onClose: () => void }) {
  const snack = useSnackbar();
  const f = useForm({ email: '', name: '', role: '' as SgsRole | '' }, { email, role: required('Choose a role.') });
  const close = () => { f.reset(); onClose(); };
  const submit = useSubmit(async () => {
    const u = await inviteSgsUser(session, { email: f.values.email, name: f.values.name, role: f.values.role as SgsRole });
    snack(`Invitation sent to ${u.email}`); close();
  }, (e) => f.setError('email', e.message));
  return (
    <Modal open={open} size="fit" title="Invite an SGS user" onClose={close}
      primaryAction={{ label: 'Send invitation', disabled: submit.busy, onClick: () => { if (f.validate()) submit.run(); } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <TextInput label="Email" type="email" required size="l" {...f.field('email')} />
        <TextInput label="Full name (optional)" size="l" {...f.field('name')} />
        <Select label="Role" width="552px" required placeholder="Choose a role" options={SGS_ROLE_OPTIONS} value={f.values.role} onChange={(_, v) => f.set('role', v as SgsRole)} error={f.errors.role} />
        <TextInput label="Affiliate" size="m" value={session.affiliate.name} readOnly helpText="New SGS users join your affiliate." />
      </div>
    </Modal>
  );
}

/** designs/03 TenantCreate / TenantEdit. */
export function CustomerFormModal({ session, open, customer, onClose, onCreated }: {
  session: Session; open: boolean; customer?: TenantRow; onClose: () => void; onCreated?: (id: string) => void;
}) {
  const snack = useSnackbar();
  const init = { name: customer?.name ?? '', country: customer?.country ?? '', note: customer?.internalNote ?? '' };
  const f = useForm(init, { name: required('Enter the company name.'), country: required('Choose a country.') });
  const close = () => { f.reset(init); onClose(); };
  const submit = useSubmit(async () => {
    if (customer) { await updateCustomer(session, customer.id, f.values); snack('Customer details saved'); close(); }
    else { const t = await createCustomer(session, f.values); snack(`${t.name} created. Next, create the customer’s admin.`); f.reset(); onClose(); onCreated?.(t.id); }
  }, (e) => f.setError('name', e.message));
  return (
    <Modal open={open} size="fit" title={customer ? 'Edit customer' : 'Create customer'} onClose={close}
      primaryAction={{ label: customer ? 'Save' : 'Create customer', disabled: submit.busy, onClick: () => { if (f.validate()) submit.run(); } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <TextInput label="Company name" required size="l" {...f.field('name')} />
        <Select label="Country" required size="m" placeholder="Choose a country" options={COUNTRIES} value={f.values.country} onChange={(_, v) => f.set('country', v)} error={f.errors.country} />
        {customer ? null : <TextInput label="SGS affiliate" size="m" value={session.affiliate.name} readOnly helpText={`The customer is visible only to ${session.affiliate.name} staff.`} />}
        <Textarea label="Internal note (optional)" size="l" rows={2} placeholder={customer ? undefined : 'Only visible to SGS, e.g. contract reference'} {...f.field('note')} />
        {customer ? null : <p className="body-small muted" style={{ margin: 0 }}>{translate("Next, create the customer’s admin. Nobody can sign in for this customer until then.")}</p>}
      </div>
    </Modal>
  );
}

/** designs/03 TenantCreateAdmin. */
export function CreateAdminModal({ session, customer, onClose }: { session: Session; customer?: TenantRow; onClose: () => void }) {
  const snack = useSnackbar();
  const f = useForm({ email: '', name: '' }, { email });
  const close = () => { f.reset(); onClose(); };
  const first = f.values.name.trim().split(' ')[0] || 'They';
  const submit = useSubmit(async () => { const u = await createCustomerAdmin(session, customer!.id, f.values); snack(`Invitation sent to ${u.email}`); close(); }, (e) => f.setError('email', e.message));
  return (
    <Modal open={!!customer} size="fit" title="Create Customer Admin" onClose={close}
      primaryAction={{ label: 'Send invitation', disabled: submit.busy, onClick: () => { if (f.validate()) submit.run(); } }}
      secondaryAction={{ label: 'Cancel', onClick: close }}>
      <div className="modal-body" style={{ width: 552 }}>
        <p className="body-medium muted" style={{ margin: 0 }}>{customer?.name} · {customer?.country}</p>
        <TextInput label="Email" type="email" required size="l" helpText="The invitation is sent here. It becomes their sign-in name." {...f.field('email')} />
        <TextInput label="Full name (optional)" size="l" {...f.field('name')} />
        <div style={{ width: 552, maxWidth: '100%' }}>
          <InlineNotification kind="info" title="One admin per customer">{first} becomes the Customer Admin. They can then invite Customer Users and give them scope access.</InlineNotification>
        </div>
      </div>
    </Modal>
  );
}
