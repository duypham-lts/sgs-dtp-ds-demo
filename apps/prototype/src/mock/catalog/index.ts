// Builds REQUIREMENT and EXPECTED_EVIDENCE rows for the seeded framework versions.
import type { ExpectedEvidence, Framework, Requirement } from '../types';
import { AMENDED_ONLY, APPENDIX10 } from './appendix10';
import { OTHER_FRAMEWORKS } from './others';

/** Expected-evidence descriptions shown verbatim in designs/04. */
const EE_DESC: Record<string, string> = {
  'R.1.1.1': 'Documented procedure covering account request, creation, modification, activation, deactivation, and deletion.',
  'R.1.1.3': 'System configuration or log showing inactive accounts are automatically disabled.',
};
const A10_SOURCE = 'Regulations on Cyber Security Responsibility Levels, Article 11, Appendix 10';

export function buildCatalog(frameworks: Framework[]): { requirements: Requirement[]; expectedEvidence: ExpectedEvidence[] } {
  const requirements: Requirement[] = [];
  const expectedEvidence: ExpectedEvidence[] = [];
  for (const fw of frameworks) {
    let n = 0;
    const add = (r: Omit<Requirement, 'id' | 'frameworkId' | 'sortOrder'>, ee: string, eeDesc: string) => {
      n += 1;
      const id = `${fw.id}:${r.code}`;
      requirements.push({ ...r, id, frameworkId: fw.id, sortOrder: n * 10 });
      expectedEvidence.push({ id: `${id}:ee`, requirementId: id, code: `EE-${String(n).padStart(3, '0')}`, name: ee, description: eeDesc, mandatory: true });
    };
    if (fw.code === 'TW_ISRM_ANNEX10_EN') {
      for (const d of APPENDIX10) for (const m of d.measures) for (const [code, title, tier, statement, ee] of m.rows) {
        if (fw.version !== 'amended version' && AMENDED_ONLY.has(code)) continue;
        add({ code, title, statement, groupCode: d.code, groupTitle: d.title, measureCode: m.code, measureTitle: m.title, minTier: tier, source: A10_SOURCE },
          ee, EE_DESC[code] ?? `Configuration, record or document showing that: ${statement.charAt(0).toLowerCase()}${statement.slice(1)}`);
      }
      continue;
    }
    const sections = OTHER_FRAMEWORKS[fw.id] ?? [];
    const total = sections.reduce((a, s) => a + s.items.length, 0);
    let i = 0;
    for (const s of sections) for (const [code, title] of s.items) {
      i += 1;
      // Tiered frameworks (TISAX): the first `tier.total` requirements belong to that tier and up.
      const minTier = fw.tiers.length ? fw.tiers.find((t) => i <= t.total)?.code : undefined;
      add({ code, title, statement: `${title}: the organization shall meet this requirement of ${fw.shortName}.`, groupCode: s.code, groupTitle: s.title, minTier, source: `${fw.shortName} ${fw.version}` },
        `${title} evidence`, `Document or record showing ${title.toLowerCase()} is in place.`);
    }
    if (total && total !== fw.requirementCount) throw new Error(`${fw.id}: ${total} requirements, expected ${fw.requirementCount}`);
  }
  return { requirements, expectedEvidence };
}

/** Requirements that apply to a tier (all of them for frameworks without tiers). */
export function inTier(fw: Framework, r: Requirement, tier?: string): boolean {
  if (!fw.tiers.length || !tier || !r.minTier) return true;
  const rank = (c: string) => fw.tiers.find((t) => t.code === c)?.rank ?? 0;
  return rank(r.minTier) <= rank(tier);
}
