// Seed scenarios. The designs draw the same Appendix 10 workspace (Customer data platform) at two moments:
// preparing evidence (designs/05) and locked by the audit of CR-2026-015 (designs/08). One seed can't be both,
// so the demo can reset to either. From "before the audit" the auditor can start the review in the UI.
import type { MockDb } from './types';

export type Scenario = 'audit' | 'preparation' | 'ready' | 'audited' | 'certified';
export const SCENARIO_LABEL: Record<Scenario, string> = { preparation: 'Before the audit', audit: 'Audit in progress', ready: 'Ready to close', audited: 'Audit closed', certified: 'Certificate issued' };
export const DEFAULT_SCENARIO: Scenario = 'audit';

const tweaks: Record<Scenario, ((db: MockDb) => void)[]> = { audit: [], preparation: [], ready: [], audited: [], certified: [] };

/** Modules register what differs per scenario (e.g. designs/08 adds the review in progress). */
export function registerScenario(s: Scenario, fn: (db: MockDb) => void) { tweaks[s].push(fn); }

registerScenario('preparation', (db) => {
  const ws = db.workspaces.find((w) => w.id === 'ws-a10-cdp')!;
  ws.status = 'preparing';
  ws.lockedByRequestId = undefined;
  const cr = db.serviceRequests.find((r) => r.id === 'CR-2026-015')!;
  cr.status = 'assigned';
});

export function applyScenario(db: MockDb, s: Scenario): MockDb {
  tweaks[s].forEach((fn) => fn(db));
  return db;
}
