import { describe, expect, it } from 'vitest';
import { __resetForTests, getDb } from './store';

const items = (review: string) => getDb().reviewItems.filter((x) => x.reviewId === review);
const count = (review: string, status: string) => items(review).filter((x) => x.status === status).length;

describe('seed scenarios (decisions D13)', () => {
  it('audit in progress: 40 of 61 reviewed, 3 items need the customer', () => {
    __resetForTests('audit');
    expect(items('rv-cr015')).toHaveLength(61);
    expect(61 - count('rv-cr015', 'not_reviewed')).toBe(40);
    expect(count('rv-cr015', 'accepted')).toBe(35);
    expect(getDb().findings.filter((f) => f.reviewId === 'rv-cr015' && f.status === 'open').map((f) => f.code)).toEqual(['F-003', 'F-004']);
    expect(getDb().workspaces.find((w) => w.id === 'ws-a10-cdp')!.status).toBe('audit_in_progress');
  });
  it('before the audit: no review, workspace preparing, request assigned', () => {
    __resetForTests('preparation');
    expect(items('rv-cr015')).toHaveLength(0);
    expect(getDb().serviceRequests.find((r) => r.id === 'CR-2026-015')!.status).toBe('assigned');
  });
  it('audit closed: 58 accepted, 3 closed with finding, workspace unlocked', () => {
    __resetForTests('audited');
    expect(count('rv-cr015', 'accepted')).toBe(58);
    expect(count('rv-cr015', 'closed_with_finding')).toBe(3);
    expect(getDb().workspaces.find((w) => w.id === 'ws-a10-cdp')!.status).toBe('audited');
  });
  it('certificate issued: TW26/1142 for CR-2026-015', () => {
    __resetForTests('certified');
    expect(getDb().certifications[0].number).toBe('TW26/1142');
    expect(getDb().serviceRequests.find((r) => r.id === 'CR-2026-015')!.status).toBe('certificate_issued');
  });
});
