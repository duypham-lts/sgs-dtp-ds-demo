// Display labels shared by several modules (copy as in designs/).
import type { ScopeType, SgsRole, UserStatus } from './types';

export const SCOPE_TYPE_LABEL: Record<ScopeType, string> = { organization: 'Organisation', product: 'Product', system: 'System' };

/** designs/03 Users: StatusTag per user status. */
export const USER_STATUS: Record<UserStatus, ['completed' | 'under-review' | 'missing-info' | 'draft', string]> = {
  active: ['completed', 'Active'],
  invited: ['under-review', 'Invitation pending'],
  expired: ['missing-info', 'Invitation expired'],
  deactivated: ['draft', 'Deactivated'],
};

/** designs/03 SgsInviteSgs role options. */
export const SGS_ROLE_OPTIONS: { value: SgsRole; label: string; description: string }[] = [
  { value: 'sgs_admin', label: 'SGS Admin', description: 'Manages users, customers and requests of the affiliate' },
  { value: 'sgs_user', label: 'SGS User', description: 'Works on requests and customer accounts' },
  { value: 'sgs_auditor', label: 'SGS Auditor', description: 'Reviews evidence and runs audits' },
  { value: 'sgs_consultant', label: 'SGS Consultant', description: 'Delivers gap analysis and implementation support' },
];

/** designs/03 SgsUserDetail "Role" card subtitles. */
export const ROLE_SUMMARY: Record<string, string> = {
  customer_admin: 'manages users and scopes of the organisation',
  customer_user: 'works on assigned scopes only',
  customer_viewer: 'reads assigned scopes, can’t change anything',
  sgs_admin: 'manages users, customers and requests of the affiliate',
  sgs_user: 'works on requests and customer accounts',
  sgs_auditor: 'reviews evidence and runs audits',
  sgs_consultant: 'delivers gap analysis and implementation support',
};

export const COUNTRIES = [
  { value: 'Taiwan', label: 'Taiwan' }, { value: 'Vietnam', label: 'Vietnam' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' }, { value: 'Singapore', label: 'Singapore' },
];

/** Service request status → StatusTag (docs/prototype-plan.md §3.1, list labels). */
export const SR_STATUS: Record<string, ['completed' | 'under-review' | 'needs-description' | 'missing-info' | 'rejected' | 'draft' | 'info', string]> = {
  draft: ['draft', 'Draft'],
  submitted: ['under-review', 'Submitted'],
  information_requested: ['missing-info', 'Action required'],
  assigned: ['info', 'Assigned'],
  in_progress: ['info', 'In progress'],
  audit_completed: ['completed', 'Audit completed'],
  completed: ['completed', 'Completed'],
  certificate_issued: ['completed', 'Certificate issued'],
  rejected: ['rejected', 'Rejected'],
  withdrawn: ['draft', 'Withdrawn'],
};
