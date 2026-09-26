// Framework / tier / workspace labels as written in designs/05 ("Appendix 10 · 2022 · Medium", "Medium · 中").
import type { Framework, Scope, Workspace } from './types';

export const fwVersion = (f: Framework) => `${f.shortName} · ${f.version}`;
export function tierName(f: Framework, code?: string, local = true): string {
  if (!f.tiers.length) return 'No tiers';
  const t = f.tiers.find((x) => x.code === code);
  if (!t) return '—';
  return local && t.localLabel ? `${t.label} · ${t.localLabel}` : t.label;
}
export const wsTitle = (f: Framework, w: Workspace) => (f.tiers.length ? `${fwVersion(f)} · ${tierName(f, w.tier, false)}` : fwVersion(f));
export const SCOPE_TYPE_US: Record<Scope['type'], string> = { organization: 'Organization', product: 'Product', system: 'System' };
export const WS_STATUS: Record<Workspace['status'], ['draft' | 'under-review' | 'completed', string]> = {
  preparing: ['draft', 'Preparing'], audit_in_progress: ['under-review', 'Audit in progress'], audited: ['completed', 'Audit completed'],
};
