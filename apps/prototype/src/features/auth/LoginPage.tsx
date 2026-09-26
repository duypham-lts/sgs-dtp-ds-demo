'use client';
// UC-AUTH-001 Log in (designs/01-authentication Main, CustomerLogin*, SgsLogin*). States:
// - wrong email or password → one field error on Password, cleared when the user edits either field;
// - 5 failed attempts → "Sign-in is temporarily locked" (error notification), Sign in disabled for 15 minutes;
// - deactivated account → "Your account is not active";
// - session timeout (?reason=timeout) → snackbar from designs/02 SignInError.
import { Button, Checkbox, InlineNotification, Link, Logo, TextInput } from '@sgs/graphite';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { sessionFor, type Portal } from '@/mock';
import { lockedUntil, signIn } from '@/mock/api/auth';
import { homeFor, usePersona } from '@/demo/persona';
import { useSnackbar } from '@/ui/snackbar';
import { AuthCard, AuthFoot, PORTAL_SUB } from './AuthCard';

const COPY: Record<Portal, { placeholder: string; help: string; helpLink: string; inactive: string }> = {
  customer: { placeholder: 'name@company.com', help: 'Need help?', helpLink: 'Contact SGS support', inactive: 'Your organisation’s administrator deactivated this account. Contact them to get access again.' },
  'sgs-ops': { placeholder: 'name@sgs.com', help: 'Trouble signing in?', helpLink: 'Contact the SGS Service Desk', inactive: 'This SGS account is deactivated. Contact the SGS platform administrator.' },
};

export function LoginPage({ portal }: { portal: Portal }) {
  const router = useRouter();
  const params = useSearchParams();
  const snack = useSnackbar();
  const { ready, signedIn, session, setPersona } = usePersona();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keep, setKeep] = useState(false);
  const [error, setError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [notice, setNotice] = useState<'locked' | 'inactive'>();
  const [busy, setBusy] = useState(false);
  const c = COPY[portal];

  // Already signed in to this portal: go home.
  useEffect(() => { if (ready && signedIn && session.portal === portal) router.replace(homeFor(session)); }, [ready, signedIn, session, portal, router]);
  useEffect(() => {
    if (params.get('reason') === 'timeout') snack('You have been signed out after 30 minutes of inactivity.');
  }, [params, snack]);
  // A lock survives edits of the password and reloads; it ends after 15 minutes.
  useEffect(() => {
    if (notice !== 'locked') return;
    const until = lockedUntil(portal, email);
    if (!until) { setNotice(undefined); return; }
    const t = setTimeout(() => setNotice(undefined), Date.parse(until) - Date.now());
    return () => clearTimeout(t);
  }, [notice, portal, email]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setEmailError('Enter your email address.'); return; }
    if (!password) { setError('Enter your password.'); return; }
    setBusy(true);
    const r = await signIn(portal, email, password);
    setBusy(false);
    if (r.ok) { setPersona(r.userId, keep); router.push(homeFor(sessionFor(r.userId))); return; }
    if (r.reason === 'invalid') { setError('Incorrect email or password.'); setNotice(undefined); }
    else setNotice(r.reason);
  }

  const edit = (fn: (v: string) => void) => (e: { target: { value: string } }) => {
    fn(e.target.value);
    setError(undefined);
    setEmailError(undefined);
    if (notice === 'inactive') setNotice(undefined);
  };

  return (
    <AuthCard portal={portal}>
      <form className="auth__stack" onSubmit={submit} noValidate>
        <div className="auth__logo"><Logo siteName="Digital Trust Platform" siteSub={PORTAL_SUB[portal]} /></div>
        {notice === 'locked' ? (
          <InlineNotification kind="error" title="Sign-in is temporarily locked" live>Too many failed attempts. Try again in 15 minutes.</InlineNotification>
        ) : notice === 'inactive' ? (
          <InlineNotification kind="error" title="Your account is not active" live>{c.inactive}</InlineNotification>
        ) : null}
        <div className="auth__fields">
          <TextInput label="Email" type="email" required placeholder={c.placeholder} autoComplete="username" width="100%" value={email} onChange={edit(setEmail)} error={emailError} />
          <TextInput label="Password" type="password" required placeholder="Enter your password" autoComplete="current-password" width="100%" value={password} onChange={edit(setPassword)} error={error} />
        </div>
        <div style={{ marginTop: -16 }}><Checkbox label="Keep me signed in" checked={keep} onChange={(e) => setKeep(e.target.checked)} /></div>
        <Button variant="primary" fullWidth type="submit" disabled={notice === 'locked' || busy}>Sign in</Button>
        <AuthFoot>{c.help} <Link href="#" inline>{c.helpLink}</Link></AuthFoot>
      </form>
    </AuthCard>
  );
}
