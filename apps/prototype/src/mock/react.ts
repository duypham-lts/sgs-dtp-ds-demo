'use client';
// React bindings for the mock API: re-run a query when the mock db changes or its inputs change.
import { useEffect, useState } from 'react';
import { subscribe } from './store';

export interface QueryState<T> { data: T | undefined; loading: boolean; error: Error | undefined }

export function useMockQuery<T>(run: () => Promise<T>, deps: unknown[]): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({ data: undefined, loading: true, error: undefined });
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);
  useEffect(() => {
    let live = true;
    setState((s) => ({ ...s, loading: true }));
    run().then(
      (data) => { if (live) setState({ data, loading: false, error: undefined }); },
      (error: Error) => { if (live) setState({ data: undefined, loading: false, error }); },
    );
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return state;
}
