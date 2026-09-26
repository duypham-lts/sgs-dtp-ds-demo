// In-memory mock database, persisted to localStorage in the browser so a demo survives reloads.
// Server renders always start from the seed. Call resetDb() (Demo panel → "Reset data") to start over.
import { seed, MOCK_DB_VERSION } from './seed';
import type { MockDb } from './types';
import { applyScenario, DEFAULT_SCENARIO, type Scenario } from './scenarios';

const KEY = 'dtp-mock-db';
const SCENARIO_KEY = 'dtp-scenario';
let db: MockDb | null = null;
const listeners = new Set<() => void>();

function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }
const hasStorage = () => typeof window !== 'undefined' && !!window.localStorage;

export function currentScenario(): Scenario {
  if (!hasStorage()) return DEFAULT_SCENARIO;
  try { return (window.localStorage.getItem(SCENARIO_KEY) as Scenario) || DEFAULT_SCENARIO; } catch { return DEFAULT_SCENARIO; }
}
const fresh = (s: Scenario = currentScenario()) => applyScenario(clone(seed), s);

export function getDb(): MockDb {
  if (db) return db;
  if (hasStorage()) {
    try {
      const raw = window.localStorage.getItem(KEY);
      const saved = raw ? (JSON.parse(raw) as MockDb) : null;
      if (saved && saved.version === MOCK_DB_VERSION) return (db = saved);
    } catch { /* corrupted or blocked storage: fall back to seed */ }
  }
  return (db = fresh());
}

/** Apply a change, persist it and notify subscribers. */
export function mutate(fn: (db: MockDb) => void): void {
  fn(getDb());
  if (hasStorage()) {
    try { window.localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* storage full or blocked */ }
  }
  listeners.forEach((l) => l());
}

export function resetDb(scenario: Scenario = currentScenario()): void {
  if (hasStorage()) { try { window.localStorage.removeItem(KEY); window.localStorage.setItem(SCENARIO_KEY, scenario); } catch { /* ignore */ } }
  db = fresh(scenario);
  listeners.forEach((l) => l());
}

export function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

/** Test helper: replace the db with a fresh seed copy, without touching storage. */
export function __resetForTests(scenario: Scenario = DEFAULT_SCENARIO): void { db = fresh(scenario); }
