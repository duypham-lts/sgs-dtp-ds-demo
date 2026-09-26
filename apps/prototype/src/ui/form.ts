'use client';
// Form state with the validation rules of CLAUDE.md: errors appear on submit (or when a rule is checked
// explicitly), one message per field, and a field's error disappears as soon as the user edits it.
import { useCallback, useState } from 'react';

export type Rules<V> = Partial<Record<keyof V, (value: any, all: V) => string | undefined>>;

export function useForm<V extends Record<string, any>>(initial: V, rules: Rules<V> = {}) {
  const [values, setValues] = useState<V>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof V, string>>>({});

  const set = useCallback(<K extends keyof V>(key: K, value: V[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }, []);

  /** Runs every rule; returns true when the form is valid. */
  const validate = useCallback((): boolean => {
    const next: Partial<Record<keyof V, string>> = {};
    for (const k of Object.keys(rules) as (keyof V)[]) {
      const msg = rules[k]!(values[k], values);
      if (msg) next[k] = msg;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [rules, values]);

  const setError = useCallback((key: keyof V, message: string | undefined) => setErrors((e) => ({ ...e, [key]: message })), []);
  const reset = useCallback((v: V = initial) => { setValues(v); setErrors({}); }, [initial]);

  /** Props for a Graphite text field: value, onChange, error. */
  const field = <K extends keyof V>(key: K) => ({
    value: values[key] ?? '',
    onChange: (e: { target: { value: string } }) => set(key, e.target.value as V[K]),
    error: errors[key],
  });

  return { values, errors, set, setError, validate, reset, field };
}

export const required = (message = 'This field is required.') => (v: unknown) =>
  (Array.isArray(v) ? v.length === 0 : v === undefined || v === null || String(v).trim() === '') ? message : undefined;
