// Date formats used across designs/: "21 Sep 2026", "Today, 09:12", "Yesterday, 17:40", "Yesterday".
import { getLocale, translate } from '@/i18n/locale';
import { TODAY } from '@/mock/seed';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 2026-09-21 or an ISO timestamp → "21 Sep 2026". */
export function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (getLocale() === 'zh-Hant') return `${y}年${m}月${d}日`;
  return `${String(d).padStart(2, '0')} ${MON[m - 1]} ${y}`;
}

/** "21 Sep" (no year), as in timelines and notification meta. */
export function fmtDay(iso?: string | null): string {
  if (!iso) return '—';
  const [, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (getLocale() === 'zh-Hant') return `${m}月${d}日`;
  return `${String(d).padStart(2, '0')} ${MON[m - 1]}`;
}

function dayDiff(iso: string): number {
  const a = Date.UTC(...(TODAY.split('-').map(Number).map((v, i) => (i === 1 ? v - 1 : v)) as [number, number, number]));
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return Math.round((a - Date.UTC(y, m - 1, d)) / 86_400_000);
}

/** "Today, 09:12" / "Yesterday, 17:40" / "18 Sep 2026" (with time when the value has one and withTime). */
export function fmtRelative(iso?: string | null, withTime = true): string {
  if (!iso) return '—';
  const time = iso.length > 10 ? iso.slice(11, 16) : '';
  const diff = dayDiff(iso);
  if (diff === 0) return time && withTime ? translate('Today, {time}', { time }) : translate('Today');
  if (diff === 1) return time && withTime ? translate('Yesterday, {time}', { time }) : translate('Yesterday');
  return fmtDate(iso);
}

/** "21 Sep 2026, 10:02" */
export function fmtDateTime(iso?: string | null): string {
  if (!iso) return '—';
  return iso.length > 10 ? `${fmtDate(iso)}, ${iso.slice(11, 16)}` : fmtDate(iso);
}

/** Days from TODAY to the date (negative = past). */
export function daysUntil(iso: string): number { return -dayDiff(iso); }

export function plural(n: number, one: string, many = `${one}s`): string { return `${n} ${translate(n === 1 ? one : many)}`; }

/** "Sep 12, 2026" and "Sep 2027" (designs/05 DocumentItem date labels). */
export function fmtUs(iso?: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${MON[m - 1]} ${d}, ${y}`;
}
export function fmtMonth(iso?: string | null): string {
  if (!iso) return '—';
  const [y, m] = iso.slice(0, 7).split('-').map(Number);
  return `${MON[m - 1]} ${y}`;
}
/** 1200000 → "1.2 MB", 412000 → "412 KB". */
export function fsize(bytes: number): string {
  return bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;
}
