'use client';
// AppShell page template (design-system/graphite/components/AppShell): TopBar (home) on top, AppSidebar on
// the left, content area in the middle. Only the content area scrolls. Page background `background`,
// 12px padding and gaps, as in every designs/*.dc.html board.
import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppSidebar, Button, EmptyState, TopBar } from '@sgs/graphite';
import type { ReactNode } from 'react';
import { api, ROLE_LABEL, type Portal } from '@/mock';
import { recordSignOut } from '@/mock/api/auth';
import { useMockQuery } from '@/mock/react';
import { usePersona } from '@/demo/persona';
import { useI18n } from '@/i18n/I18nProvider';
import { activeNavId, badgesFor, navFor } from './nav';
import { toNotificationItem } from './notifications';
import { SpaLinks } from './SpaLinks';
import { useShell } from './ShellContext';

const SITE_SUB: Record<Portal, string> = { customer: 'Customer Portal', 'sgs-ops': 'Operations Console' };
const HOME: Record<Portal, string> = { customer: '/', 'sgs-ops': '/ops' };
const SETTINGS: Record<Portal, string> = { customer: '/settings', 'sgs-ops': '/ops/settings' };
export const LOGIN: Record<Portal, string> = { customer: '/login', 'sgs-ops': '/ops/login' };
/** Session timeout after inactivity (docs/prototype-plan.md §3.7; snackbar copy from designs/02 SignInError). */
const IDLE_MS = 30 * 60_000;

/** Signs out after IDLE_MS without pointer or keyboard activity. */
function useIdleSignOut(active: boolean, onIdle: () => void) {
  const cb = useRef(onIdle);
  cb.current = onIdle;
  useEffect(() => {
    if (!active) return;
    let t = setTimeout(() => cb.current(), IDLE_MS);
    const bump = () => { clearTimeout(t); t = setTimeout(() => cb.current(), IDLE_MS); };
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    return () => { clearTimeout(t); events.forEach((e) => window.removeEventListener(e, bump)); };
  }, [active]);
}

export function PortalShell({ portal, children }: { portal: Portal; children: ReactNode }) {
  const { session, ready, signedIn, signOut } = usePersona();
  const { locale, setLocale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, setCollapsed } = useShell();
  const requests = useMockQuery(() => api.listServiceRequests(session), [session.user.id]);
  const sections = navFor(session.user.role, badgesFor(session.user.role, requests.data ?? []));
  const notifications = useMockQuery(() => api.listNotifications(session), [session.user.id]);
  const items = (notifications.data ?? []).map(toNotificationItem);
  const dark = portal === 'sgs-ops';

  const wrongPortal = session.portal !== portal;

  // Signed out (UC-AUTH-002): portal pages need a session.
  useEffect(() => { if (ready && !signedIn) router.replace(LOGIN[portal]); }, [ready, signedIn, router, portal]);
  useIdleSignOut(ready && signedIn, () => {
    recordSignOut(session.user.id, 'timeout');
    signOut();
    router.push(`${LOGIN[session.portal]}?reason=timeout`);
  });

  if (!ready || !signedIn) return <div data-theme={portal} className="shell" />;

  return (
    <div data-theme={portal} className="shell">
      <SpaLinks className="shell__frame">
        <TopBar
          key={session.user.id}
          variant="home"
          tone={dark ? 'dark' : undefined}
          badge={dark ? t('Internal') : undefined}
          siteName={t('Digital Trust Platform')}
          siteSub={t(SITE_SUB[portal])}
          language={locale}
          onLanguageChange={(code) => setLocale(code === 'zh-Hant' ? 'zh-Hant' : 'en')}
          // No home links in any portal: "Request Applications" was removed on request (2026-09-26, design-questions
          // Q33; Service Requests stays in the sidebar) and "Communications" is out of MVP (Q18).
          homeLinks={[]}
          userName={session.user.displayName}
          userEmail={session.user.email}
          notificationItems={items}
          // UC-NTF-002: read state is saved to the (mock) server. Navigation to item.href is done by SpaLinks.
          onNotificationOpen={(n) => { void api.markNotificationRead(session, n.id); }}
          onMarkAllRead={() => { void api.markAllNotificationsRead(session); }}
          // Only Settings: "Profile" has no MVP use case (UC-ORG-001 is Phase 2) and no design (design-questions Q27).
          accountLinks={[{ label: t('Settings'), href: SETTINGS[portal] }]}
          signOutLabel={t('Sign out')}
          onSignOut={() => { recordSignOut(session.user.id, 'user'); signOut(); router.push(LOGIN[session.portal]); }}
        />
        <div className="shell__body">
          <div className="shell__side">
            <AppSidebar
              key={session.user.id}
              tone={dark ? 'dark' : undefined}
              label={t(dark ? 'SGS Operations' : 'Customer Portal')}
              sections={sections}
              active={activeNavId(sections, pathname)}
              collapsed={collapsed}
              onCollapsedChange={setCollapsed}
            />
          </div>
          <main className="shell__main" aria-label={`${t(SITE_SUB[portal])} · ${t(ROLE_LABEL[session.user.role])}`}>
            {wrongPortal ? (
              <EmptyState
                icon="user--access"
                title={t('This page belongs to the {portal}', { portal: t(SITE_SUB[portal]) })}
                body={t('You are signed in as {name} ({role}).', { name: session.user.displayName, role: t(ROLE_LABEL[session.user.role]) })}
                action={<Button size="md" onClick={() => router.push(HOME[session.portal])}>{t('Go to my home')}</Button>}
              />
            ) : children}
          </main>
        </div>
      </SpaLinks>
    </div>
  );
}
