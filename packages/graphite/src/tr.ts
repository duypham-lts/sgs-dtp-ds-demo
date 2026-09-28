// UI-copy lookup. The prototype registers a translator on globalThis; the design-system
// package stays free of a catalog. Missing keys and non-strings are returned unchanged.
type TFn = (source: string, vars?: Record<string, string | number>) => string;

export function tr<T>(value: T, vars?: Record<string, string | number>): T {
  if (typeof value !== 'string' || value.length === 0) return value;
  const fn = (globalThis as { __dtpT?: TFn }).__dtpT;
  if (!fn) {
    if (!vars) return value;
    return value.replace(/\{(\w+)\}/g, (_, k: string) => (vars[k] == null ? '' : String(vars[k]))) as T;
  }
  return fn(value, vars) as T;
}
