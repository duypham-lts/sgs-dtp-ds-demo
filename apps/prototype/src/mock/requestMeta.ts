// Per-category settings of service requests (docs/prototype-plan.md §3.1, §3.5).
import type { SrCategory, SrStatus } from './types';

export const SR_META: Record<SrCategory, { slug: string; prefix: string; label: string; noun: string }> = {
  gap_analysis: { slug: 'gap-analysis', prefix: 'GA', label: 'Gap Analysis', noun: 'gap analysis' },
  implementation_support: { slug: 'implementation-support', prefix: 'IS', label: 'Implementation Support', noun: 'support request' },
  certification: { slug: 'certification', prefix: 'CR', label: 'Certification', noun: 'certification request' },
  training: { slug: 'training', prefix: 'TR', label: 'Training', noun: 'training request' },
};
export const categoryOfSlug = (slug: string) => (Object.entries(SR_META).find(([, m]) => m.slug === slug)?.[0] as SrCategory | undefined);

/** Service-catalogue frameworks offered for consulting (designs/06 MvpWizard1, 07 IsWizard1; docs/book-a-service.md).
 * `code` links to a platform framework when one exists, so the workspace can be linked automatically. */
export const CONSULTING_FRAMEWORKS = [
  { value: 'ISO/IEC 27001', description: 'Information Security Management System', code: 'ISO_IEC_27001', ga: true, is: true },
  { value: 'ISO/IEC 42001', description: 'Artificial Intelligence Management System', code: 'ISO_IEC_42001', ga: true, is: true },
  { value: 'ISO/IEC 27701', description: 'Privacy Information Management System', code: 'ISO_IEC_27701', ga: true, is: true },
  { value: 'ISO 22301', description: 'Business Continuity Management System', code: 'ISO_22301', ga: true, is: true },
  { value: 'ISO/IEC 20000', description: 'Service Management System', code: undefined, ga: true, is: true },
  { value: 'TISAX', description: 'Trusted Information Security Assessment Exchange', code: 'TISAX_VDA_ISA', ga: true, is: true },
  { value: 'NIST CSF', description: 'Cybersecurity Framework', code: undefined, ga: true, is: true },
  { value: 'Cybersecurity Management Act', description: 'Certification scheme (Taiwan)', code: 'TW_ISRM_ANNEX10_EN', ga: true, is: false },
];

/** One list for every category, in the order of designs/06 (07 lists the same five differently; plan §3.5). */
export const REJECT_REASONS = ['Scope not ready or unclear', 'Duplicate of an open request', 'Framework not offered', 'No commercial agreement', 'Other'];
export const WITHDRAW_REASONS = ['Timing does not suit us', 'We want to change the scope', 'We will do it internally', 'Other'];
export const SUPPORT_OPTIONS = [
  ['Policies and procedures', 'Draft or update the documents the framework requires'],
  ['Implement controls', 'Help put technical and organisational controls in place'],
  ['Prepare evidence', 'Decide what proves each requirement and how to collect it'],
  ['Prepare for the certification audit', 'Mock interviews, readiness check, audit logistics'],
] as const;
export const DELIVERY_LABEL = { on_site: 'On site', remote: 'Remote', hybrid: 'Hybrid' } as const;

/** Withdraw is allowed before SGS delivery begins (decisions D4). */
export function canWithdrawStatus(category: SrCategory, status: SrStatus, previous?: SrStatus): boolean {
  const s = status === 'information_requested' ? previous : status;
  return category === 'gap_analysis' || category === 'implementation_support' ? s === 'submitted' : s === 'submitted' || s === 'assigned';
}

export const customerHref = (category: SrCategory, id: string) => `/service-requests/${SR_META[category].slug}/${id}`;
export const opsHref = (category: SrCategory, id: string) => `/ops/requests/${SR_META[category].slug}/${id}`;
export const consultantHref = (category: SrCategory, id: string) => `/ops/my-assignments/${SR_META[category].slug}/${id}`;
