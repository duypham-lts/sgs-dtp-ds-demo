'use client';
// UC-AUTH-005 Activate account from invitation (designs/01 Activate, ActivatePassword, ActivateMismatch,
// ActivateSuccess, ActivateExpired, ActivateUsed, SgsActivate).
// - Password rules update while typing: dashed circle (not checked yet), green check, red warning.
// - "Activate account" is enabled once name, all rules, confirmation and the checkbox are filled in;
//   a confirmation that differs shows "Passwords don’t match." on submit and clears on edit.
import { Button, Checkbox, Icon, Link, Logo, Skeleton, TextInput } from '@sgs/graphite';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { sessionFor, type Portal } from '@/mock';
import { activateAccount, askForNewInvitation, getInvitation, passwordRules, type Invitation } from '@/mock/api/auth';
import { homeFor, usePersona } from '@/demo/persona';
import { useI18n } from '@/i18n/I18nProvider';
import { fmtDate } from '@/ui/format';
import { useSnackbar } from '@/ui/snackbar';
import { InlineFacts } from '@/ui/bits';
import { AuthCard, AuthFoot, PORTAL_SUB, ResultIcon } from './AuthCard';

const LOGIN: Record<Portal, string> = { customer: '/login', 'sgs-ops': '/ops/login' };

export function ActivatePage({ portal }: { portal: Portal }) {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [inv, setInv] = useState<Invitation>();
  const [done, setDone] = useState<{ userId: string }>();
  useEffect(() => { getInvitation(token).then(setInv); }, [token]);

  if (!inv) return <AuthCard portal={portal}><Skeleton lines={6} /></AuthCard>;
  // A link for the other portal opens in its own portal theme.
  const p = inv.state === 'unknown' ? portal : inv.portal;
  if (done) return <Activated portal={p} inv={inv} userId={done.userId} />;
  if (inv.state === 'expired') return <Expired portal={p} inv={inv} token={token} />;
  if (inv.state === 'used') return <Used portal={p} inv={inv} />;
  if (inv.state === 'unknown') return <Unknown portal={p} />;
  return <ActivateForm portal={p} inv={inv} token={token} onDone={setDone} />;
}

function ActivateForm({ portal, inv, token, onDone }: { portal: Portal; inv: Invitation; token: string; onDone: (r: { userId: string }) => void }) {
  const [name, setName] = useState(inv.name);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [mismatch, setMismatch] = useState<string>();
  const [nameError, setNameError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const rules = passwordRules(pw, inv.email);
  const { t } = useI18n();
  const sgs = portal === 'sgs-ops';
  const ready = name.trim() !== '' && rules.every((r) => r.ok) && confirm !== '' && agree;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setNameError(t('Enter your full name.')); return; }
    if (confirm !== pw) { setMismatch(t('Passwords don’t match.')); return; }
    setBusy(true);
    try { onDone(await activateAccount(token, { fullName: name, password: pw })); } finally { setBusy(false); }
  }

  return (
    <AuthCard portal={portal}>
      <form className="auth__stack" onSubmit={submit} noValidate>
        <div className="auth__heading">
          <h1 className="headline-small" style={{ margin: 0 }}>{sgs ? t('Activate your SGS account') : t('Activate your account')}</h1>
          <p className="body-medium auth__muted" style={{ margin: 0 }}>
            {sgs ? t('An SGS platform administrator invited you as {role} · {affiliate}.', { role: t(inv.role), affiliate: inv.affiliateName }) : t('{name} invited you to {org}.', { name: inv.inviterName, org: inv.orgName })}
          </p>
        </div>
        <div className="auth__fields">
          <TextInput label={t('Email')} width="100%" value={inv.email} readOnly helpText={sgs ? undefined : t('From your invitation. It becomes your sign-in name.')} />
          <TextInput label={t('Full name')} required width="100%" value={name} error={nameError} onChange={(e) => { setName(e.target.value); setNameError(undefined); }} />
          <TextInput label={t('Create password')} type="password" required width="100%" autoComplete="new-password" value={pw} onChange={(e) => { setPw(e.target.value); setMismatch(undefined); }} aria-describedby="pw-rules" />
          <ul id="pw-rules" className="body-small auth__rules" aria-label={t('Password rules')}>
            {rules.map((r) => {
              const state = !pw ? 'todo' : r.ok ? 'ok' : 'bad';
              return (
                <li key={r.id}>
                  <span className={`auth__rule-ic auth__rule-ic--${state}`}>
                    <Icon name={state === 'todo' ? 'circle-dash' : state === 'ok' ? 'checkmark--filled' : 'warning--filled'} size={16} />
                  </span>
                  <span>{t(r.label)}<span className="gr-sr">{state === 'todo' ? '' : state === 'ok' ? t(' (met)') : t(' (not met)')}</span></span>
                </li>
              );
            })}
          </ul>
          <TextInput label={t('Confirm password')} type="password" required width="100%" autoComplete="new-password" value={confirm} error={mismatch} onChange={(e) => { setConfirm(e.target.value); setMismatch(undefined); }} />
        </div>
        <Checkbox label={sgs ? t('I have read the SGS acceptable use policy for customer data.') : t('I agree to the Terms of use and Privacy notice.')} checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <Button variant="primary" fullWidth type="submit" disabled={!ready || busy}>{t('Activate account')}</Button>
        {sgs
          ? <AuthFoot>{t('Trouble signing in?')} <Link href="#" inline>{t('Contact the SGS Service Desk')}</Link></AuthFoot>
          : <AuthFoot>{t('Already activated?')} <Link href={LOGIN[portal]} inline>{t('Sign in')}</Link></AuthFoot>}
      </form>
    </AuthCard>
  );
}

function Activated({ portal, inv, userId }: { portal: Portal; inv: Invitation; userId: string }) {
  const router = useRouter();
  const snack = useSnackbar();
  const { setPersona } = usePersona();
  const { t } = useI18n();
  const go = () => { setPersona(userId, false); router.push(homeFor(sessionFor(userId))); };
  // designs/01 has no "activated" page for SGS accounts (docs/prototype-plan.md §4.5): go straight in.
  useEffect(() => {
    if (portal === 'sgs-ops') { snack(t('Your SGS account is active.')); go(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portal]);
  if (portal === 'sgs-ops') return <AuthCard portal={portal}><Skeleton lines={4} /></AuthCard>;
  const access = inv.role === 'Customer Admin' ? t('All scopes') : inv.scopeCount ? t(inv.scopeCount === 1 ? '1 scope assigned by {name}' : '{count} scopes assigned by {name}', { count: inv.scopeCount, name: inv.inviterName }) : t('No scopes yet');
  return (
    <AuthCard portal={portal}>
      <div className="auth__stack">
        <ResultIcon tone="success"><Icon name="checkmark--filled" size={28} /></ResultIcon>
        <div className="auth__heading">
          <h1 className="headline-small" style={{ margin: 0 }}>{t('Your account is ready')}</h1>
          <p className="body-medium auth__muted" style={{ margin: 0 }}>{t('You can now sign in to {org} on the Digital Trust Platform.', { org: inv.orgName })}</p>
        </div>
        <InlineFacts items={[[t('Organisation'), inv.orgName], [t('Role'), t(inv.role)], [t('Access'), access]]} />
        <Button variant="primary" fullWidth icon="arrow--right" onClick={go}>{t('Continue to the portal')}</Button>
      </div>
    </AuthCard>
  );
}

function Expired({ portal, inv, token }: { portal: Portal; inv: Invitation; token: string }) {
  const router = useRouter();
  const snack = useSnackbar();
  const [asked, setAsked] = useState(false);
  const { t } = useI18n();
  const admin = portal === 'customer' ? `${inv.inviterName}, ${t('your organisation’s administrator')},` : t('your SGS platform administrator');
  return (
    <AuthCard portal={portal}>
      <div className="auth__stack">
        <div className="auth__logo"><Logo siteName={t('Digital Trust Platform')} siteSub={t(PORTAL_SUB[portal])} /></div>
        <ResultIcon tone="error"><Icon name="warning--filled" size={28} /></ResultIcon>
        <div className="auth__heading">
          <h1 className="headline-small" style={{ margin: 0 }}>{t('This invitation link has expired')}</h1>
          <p className="body-medium auth__muted" style={{ margin: 0 }}>{t('Invitation links work once and are valid for a limited time. Ask {admin} to send a new one.', { admin })}</p>
        </div>
        <div className="auth__buttons">
          {/* TODO(decisions G1): no UC covers "Ask for a new invitation"; the prototype notifies the inviter in the portal. */}
          <Button variant="primary" fullWidth disabled={asked} onClick={async () => { const r = await askForNewInvitation(token); setAsked(true); snack(t('We let {name} know. You’ll get a new link from them.', { name: r.inviterName })); }}>{t('Ask for a new invitation')}</Button>
          <Button variant="tertiary" fullWidth onClick={() => router.push(LOGIN[portal])}>{t('Sign in instead')}</Button>
        </div>
      </div>
    </AuthCard>
  );
}

function Used({ portal, inv }: { portal: Portal; inv: Invitation }) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <AuthCard portal={portal}>
      <div className="auth__stack">
        <div className="auth__logo"><Logo siteName={t('Digital Trust Platform')} siteSub={t(PORTAL_SUB[portal])} /></div>
        <ResultIcon tone="info"><Icon name="information--filled" size={28} /></ResultIcon>
        <div className="auth__heading">
          <h1 className="headline-small" style={{ margin: 0 }}>{t('This account is already active')}</h1>
          <p className="body-medium auth__muted" style={{ margin: 0 }}>{t('{email} was activated on {date}. Sign in with your password.', { email: inv.email, date: fmtDate(inv.activatedAt) })}</p>
        </div>
        <Button variant="primary" fullWidth onClick={() => router.push(LOGIN[portal])}>{t('Sign in')}</Button>
      </div>
    </AuthCard>
  );
}

/** Token not found. No design: reuses the expired layout without the request button. */
function Unknown({ portal }: { portal: Portal }) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <AuthCard portal={portal}>
      <div className="auth__stack">
        <div className="auth__logo"><Logo siteName={t('Digital Trust Platform')} siteSub={t(PORTAL_SUB[portal])} /></div>
        <ResultIcon tone="error"><Icon name="warning--filled" size={28} /></ResultIcon>
        <div className="auth__heading">
          <h1 className="headline-small" style={{ margin: 0 }}>{t('This invitation link doesn’t work')}</h1>
          <p className="body-medium auth__muted" style={{ margin: 0 }}>{t('Open the link from your invitation email again, or ask your administrator for a new one.')}</p>
        </div>
        <Button variant="primary" fullWidth onClick={() => router.push(LOGIN[portal])}>{t('Sign in')}</Button>
      </div>
    </AuthCard>
  );
}
