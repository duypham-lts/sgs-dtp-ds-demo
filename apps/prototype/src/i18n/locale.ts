// UI language for the prototype. English is the source string; zh-Hant (Traditional Chinese, Taiwan)
// is the only translation catalog. Missing keys stay in English.
import { ZH_HANT } from './zh-Hant';

export type Locale = 'en' | 'zh-Hant';

const KEY = 'dtp-locale';
let locale: Locale = 'en';

export function getLocale(): Locale {
  return locale;
}

export function setLocaleValue(next: Locale): void {
  locale = next;
  if (typeof document !== 'undefined') document.documentElement.lang = next === 'zh-Hant' ? 'zh-Hant' : 'en';
  try { window.localStorage.setItem(KEY, next); } catch { /* ignore */ }
}

export function readStoredLocale(): Locale {
  try {
    return window.localStorage.getItem(KEY) === 'zh-Hant' ? 'zh-Hant' : 'en';
  } catch {
    return 'en';
  }
}

export function translate(source: string, vars?: Record<string, string | number>): string {
  const raw = locale === 'zh-Hant' ? (ZH_HANT[source] ?? source) : source;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}

(globalThis as { __dtpT?: typeof translate }).__dtpT = translate;
