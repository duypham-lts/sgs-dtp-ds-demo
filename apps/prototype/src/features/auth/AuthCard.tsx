'use client';
// Sign-in / activation frame of designs/01-authentication: a 960px card on the page background, a 440px
// brand panel (mosaic, product name, portal) and the form area with a compact LanguageSelector top right.
// Customer: brand panel on background-brand-subtle. SGS Operations: panel on shell-dark (inverse theme).
import { LanguageSelector } from '@sgs/graphite';
import type { ReactNode } from 'react';
import type { Portal } from '@/mock';
import { useI18n } from '@/i18n/I18nProvider';

const P = [
  'M36,0 A36,36 0 0 1 72,36 A36,36 0 0 1 36,72 H0 V36 A36,36 0 0 1 36,0 Z',
  'M108,0 A36,36 0 0 1 144,36 V72 H108 A36,36 0 0 1 72,36 A36,36 0 0 1 108,0 Z',
  'M180,0 A36,36 0 0 1 216,36 V72 H180 A36,36 0 0 1 144,36 A36,36 0 0 1 180,0 Z',
  'M252,0 A36,36 0 0 1 288,36 A36,36 0 0 1 252,72 H216 V36 A36,36 0 0 1 252,0 Z',
  'M36,72 A36,36 0 0 1 72,108 A36,36 0 0 1 36,144 A36,36 0 0 1 0,108 V72 H36 Z',
  'M180,72 A36,36 0 0 1 216,108 A36,36 0 0 1 180,144 A36,36 0 0 1 144,108 V72 H180 Z',
  'M252,72 H288 V108 A36,36 0 0 1 252,144 A36,36 0 0 1 216,108 A36,36 0 0 1 252,72 Z',
  'M36,144 H72 V180 A36,36 0 0 1 36,216 A36,36 0 0 1 0,180 A36,36 0 0 1 36,144 Z',
  'M108,144 A36,36 0 0 1 144,180 A36,36 0 0 1 108,216 H72 V180 A36,36 0 0 1 108,144 Z',
  'M180,144 A36,36 0 0 1 216,180 V216 H180 A36,36 0 0 1 144,180 A36,36 0 0 1 180,144 Z',
];
const FILL: Record<Portal, string[]> = {
  customer: ['orange', 'peach', 'burgundy', 'slate', 'slate', 'orange', 'peach', 'peach', 'burgundy', 'slate'],
  'sgs-ops': ['slate', 'orange', 'charcoal', 'slate', 'charcoal', 'slate', 'peach', 'orange', 'slate', 'charcoal'],
};

function Mosaic({ portal }: { portal: Portal }) {
  return (
    <svg width="288" height="216" viewBox="0 0 288 216" aria-hidden="true">
      {P.map((d, i) => <path key={i} d={d} style={{ fill: `var(--brand-${FILL[portal][i]})` }} />)}
    </svg>
  );
}

export const PORTAL_SUB: Record<Portal, string> = { customer: 'Customer Portal', 'sgs-ops': 'Operations Console' };
const PANEL_SUB: Record<Portal, string> = { customer: 'Customer Portal', 'sgs-ops': 'SGS Operations · internal access' };

export function AuthCard({ portal, children }: { portal: Portal; children: ReactNode }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div data-theme={portal} className="auth">
      <div className="auth__card">
        <div data-theme={portal === 'sgs-ops' ? 'inverse' : 'customer'} className={`auth__brand auth__brand--${portal}`}>
          <Mosaic portal={portal} />
          <div className="auth__brand-text">
            <span className="headline-small">{t('Digital Trust Platform')}</span>
            <span className="body-medium auth__muted">{t(PANEL_SUB[portal])}</span>
          </div>
        </div>
        <div className="auth__form">
          <div className="auth__lang">
            <LanguageSelector compact value={locale} onChange={(code) => setLocale(code === 'zh-Hant' ? 'zh-Hant' : 'en')} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Big round status icon of the result pages (ActivateSuccess / Expired / Used). */
export function ResultIcon({ tone, children }: { tone: 'success' | 'error' | 'info'; children: ReactNode }) {
  return <span aria-hidden="true" className={`auth__result auth__result--${tone}`}>{children}</span>;
}

/** Help line at the bottom of the form ("Need help? Contact SGS support"). */
export function AuthFoot({ children }: { children: ReactNode }) {
  return <p className="body-small auth__foot">{children}</p>;
}
