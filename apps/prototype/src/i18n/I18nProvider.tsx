'use client';
// Switches the prototype between English and Traditional Chinese (Taiwan). The choice is kept in
// localStorage and applied on the next render through translate() (see locale.ts).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getLocale, readStoredLocale, setLocaleValue, translate, type Locale } from './locale';

interface I18nCtx {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (source: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setState] = useState<Locale>('en');
  useEffect(() => {
    const stored = readStoredLocale();
    setLocaleValue(stored);
    setState(stored);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleValue(next);
    setState(next);
  }, []);

  const value = useMemo<I18nCtx>(() => ({
    locale,
    setLocale,
    t: (source, vars) => translate(source, vars),
  }), [locale, setLocale]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n must be used inside <I18nProvider>');
  return v;
}

/** Current catalog lookup. Safe during render of any descendant of I18nProvider. */
export { getLocale, translate };
