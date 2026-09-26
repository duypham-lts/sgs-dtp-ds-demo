import { describe, expect, it } from 'vitest';
import { coverage, requirementStatuses } from './coverage';
import { seed } from './seed';

const ws = (id: string) => seed.workspaces.find((w) => w.id === id)!;
const code = (id: string) => id.split(':')[1];

describe('seeded coverage matches the designs (designs/05)', () => {
  it('Appendix 10 · Customer data platform · Medium: 38 of 61 (62%)', () => {
    expect(coverage(seed, ws('ws-a10-cdp'))).toEqual({ provided: 38, total: 61, percent: 62 });
  });
  it('ISO/IEC 27001 · Head office: 74 of 116 (64%)', () => {
    expect(coverage(seed, ws('ws-27001-hq'))).toEqual({ provided: 74, total: 116, percent: 64 });
  });
  it('requirement statuses drawn in designs/05 Workspace', () => {
    const st = new Map([...requirementStatuses(seed, ws('ws-a10-cdp'))].map(([k, v]) => [code(k), v]));
    expect(st.get('R.1.1.1')).toBe('provided');
    expect(st.get('R.1.1.2')).toBe('provided');
    expect(st.get('R.1.1.3')).toBe('missing');
    expect(st.get('R.1.1.4')).toBe('partial'); // only an expired file
    expect(st.get('R.1.3.1')).toBe('missing');
    expect(st.get('R.7.1.1')).toBe('partial');
  });
});
