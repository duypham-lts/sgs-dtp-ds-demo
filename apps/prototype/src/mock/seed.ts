// Seed data. People, organisations and numbers come from the sample data in designs/ so the prototype
// can be compared with the screenshots. Where the designs contradict each other or a UC rule, the seed
// follows the rule and says so (e.g. one active consultant per customer, UC-ACC-006).
// Records marked "mock only" do not appear in any design; they exist to exercise tenant/affiliate isolation.
import type { MockDb } from './types';
import { buildCatalog } from './catalog';
import { seedEvidence } from './seedEvidence';
import { seedAuditTrail } from './seedAuditTrail';
import { seedAudit } from './seedAudit';

const A10_DESC = 'Appendix 10 to the Regulations on Cyber Security Responsibility Levels (Article 11), covering the High / Medium / Basic protection levels.';

export const TODAY = '2026-09-25';
export const MOCK_DB_VERSION = 9;
/** Password of every seeded account (demo only; production sign-in is Entra External ID). */
export const DEMO_PASSWORD = 'Demo-Password-01';

const seedDb: MockDb = {
  version: MOCK_DB_VERSION,

  affiliates: [
    { id: 'aff-tw', name: 'SGS Taiwan', legalName: 'SGS Taiwan Ltd.', region: 'Taiwan' },
    { id: 'aff-vn', name: 'SGS Vietnam', legalName: 'SGS Vietnam Ltd.', region: 'Vietnam' }, // mock only
  ],

  tenants: [
    { id: 't-abc', affiliateId: 'aff-tw', name: 'ABC Trading Co., Ltd.', country: 'Taiwan', status: 'active', internalNote: 'Contract SGS-TW-2025-0311', createdAt: '2025-03-12', createdBy: 'u-minh' },
    { id: 't-formosa', affiliateId: 'aff-tw', name: 'Formosa Chips Inc.', country: 'Taiwan', status: 'active', createdAt: '2025-06-04', createdBy: 'u-minh' },
    { id: 't-lotus', affiliateId: 'aff-tw', name: 'Lotus Cosmetics JSC', country: 'Vietnam', status: 'admin_invited', createdAt: '2026-09-24', createdBy: 'u-minh' },
    { id: 't-riyadh', affiliateId: 'aff-tw', name: 'Riyadh Imports LLC', country: 'Saudi Arabia', status: 'no_admin', createdAt: '2026-09-25', createdBy: 'u-minh' },
    { id: 't-saigon', affiliateId: 'aff-vn', name: 'Saigon Foods JSC', country: 'Vietnam', status: 'active', createdAt: '2026-01-15' }, // mock only
  ],

  users: [
    // ABC Trading Co., Ltd. (designs/03, 05, 06, 07, 08)
    { id: 'u-linh', affiliateId: 'aff-tw', tenantId: 't-abc', email: 'linh.tran@abc-trading.com', displayName: 'Linh Tran', role: 'customer_admin', status: 'active', title: 'Compliance lead', invitedAt: '2025-03-12', invitedBy: 'u-minh', activatedAt: '2025-03-13', lastSignInAt: '2026-09-25T09:12:00+08:00' },
    { id: 'u-wei', affiliateId: 'aff-tw', tenantId: 't-abc', email: 'wei.chen@abc-trading.com', displayName: 'Wei Chen', role: 'customer_user', status: 'active', title: 'IT manager', invitedAt: '2026-09-20', invitedBy: 'u-linh', activatedAt: '2026-09-21', lastSignInAt: '2026-09-24T17:40:00+08:00' },
    { id: 'u-mei', affiliateId: 'aff-tw', tenantId: 't-abc', email: 'mei.lin@abc-trading.com', displayName: 'Mei Lin', role: 'customer_user', status: 'active', invitedAt: '2026-09-15', invitedBy: 'u-linh', activatedAt: '2026-09-16', lastSignInAt: '2026-09-18T11:05:00+08:00' },
    { id: 'u-kevin', affiliateId: 'aff-tw', tenantId: 't-abc', email: 'kevin.ho@abc-trading.com', displayName: 'Kevin Ho', role: 'customer_user', status: 'invited', invitedAt: '2026-09-24', invitedBy: 'u-linh', invitationToken: 'inv-kevin', invitationExpiresAt: '2026-10-01' },
    { id: 'u-amy', affiliateId: 'aff-tw', tenantId: 't-abc', email: 'amy.chou@abc-trading.com', displayName: 'Amy Chou', role: 'customer_user', status: 'deactivated', activatedAt: '2025-05-02', lastSignInAt: '2026-06-02T10:00:00+08:00', deactivatedAt: '2026-06-10' },
    { id: 'u-jason', affiliateId: 'aff-tw', tenantId: 't-abc', email: 'jason.wu@abc-trading.com', displayName: 'Jason Wu', role: 'customer_user', status: 'expired', invitedAt: '2026-09-10', invitedBy: 'u-linh', invitationToken: 'inv-jason', invitationExpiresAt: '2026-09-17' },
    { id: 'u-iris', affiliateId: 'aff-tw', tenantId: 't-abc', email: 'iris.huang@abc-trading.com', displayName: 'Iris Huang', role: 'customer_viewer', status: 'active', activatedAt: '2026-08-01' }, // mock only: no design shows a Viewer
    // Formosa Chips Inc.
    { id: 'u-daniel', affiliateId: 'aff-tw', tenantId: 't-formosa', email: 'wt.chen@formosachips.com', displayName: 'Chen Wei-Ting', role: 'customer_admin', status: 'active', activatedAt: '2025-06-03', lastSignInAt: '2026-09-20T15:10:00+08:00' },
    // Lotus Cosmetics JSC (admin invited, not yet active)
    { id: 'u-ha', affiliateId: 'aff-tw', tenantId: 't-lotus', email: 'ha.nguyen@lotus.vn', displayName: 'Nguyen Thi Ha', role: 'customer_admin', status: 'invited', invitedAt: '2026-09-20', invitedBy: 'u-minh', invitationToken: 'inv-ha', invitationExpiresAt: '2026-09-27' },
    // Saigon Foods JSC (other affiliate, mock only)
    { id: 'u-quang', affiliateId: 'aff-vn', tenantId: 't-saigon', email: 'quang.le@saigonfoods.vn', displayName: 'Quang Le', role: 'customer_admin', status: 'active', activatedAt: '2026-01-16' },

    // SGS Taiwan
    { id: 'u-minh', affiliateId: 'aff-tw', tenantId: null, email: 'minh.nguyen@sgs.com', displayName: 'Minh Nguyen', role: 'sgs_admin', status: 'active', activatedAt: '2024-11-01', lastSignInAt: '2026-09-25T08:30:00+08:00' },
    { id: 'u-grace', affiliateId: 'aff-tw', tenantId: null, email: 'grace.lin@sgs.com', displayName: 'Grace Lin', role: 'sgs_user', status: 'active', title: 'Certification coordinator', activatedAt: '2025-01-10', invitedBy: 'u-minh', lastSignInAt: '2026-09-24T09:00:00+08:00' },
    { id: 'u-meichang', affiliateId: 'aff-tw', tenantId: null, email: 'mei.chang@sgs.com', displayName: 'Mei Chang', role: 'sgs_user', status: 'active', title: 'SGS Academy coordinator', activatedAt: '2025-02-01', invitedBy: 'u-minh', lastSignInAt: '2026-09-22T14:00:00+08:00' },
    { id: 'u-anna', affiliateId: 'aff-tw', tenantId: null, email: 'anna.lee@sgs.com', displayName: 'Anna Lee', role: 'sgs_consultant', status: 'active', title: 'Lead consultant · ISMS, privacy', invitedAt: '2025-03-10', invitedBy: 'u-minh', activatedAt: '2025-03-12', lastSignInAt: '2026-09-25T08:05:00+08:00' },
    { id: 'u-minhtran', affiliateId: 'aff-tw', tenantId: null, email: 'minh.tran@sgs.com', displayName: 'Minh Tran', role: 'sgs_consultant', status: 'active', title: 'Consultant · AI, ISMS', activatedAt: '2025-04-01' },
    { id: 'u-david', affiliateId: 'aff-tw', tenantId: null, email: 'david.wu@sgs.com', displayName: 'David Wu', role: 'sgs_auditor', status: 'active', title: 'Lead auditor · ISMS', activatedAt: '2024-12-01', invitedBy: 'u-minh', lastSignInAt: '2026-09-24T16:20:00+08:00' },
    // Wei Lin is a consultant in 06/07 (approve lists), an auditor in 08 and an invited consultant in 03: the seed keeps consultant.
    { id: 'u-weilin', affiliateId: 'aff-tw', tenantId: null, email: 'wei.lin@sgs.com', displayName: 'Wei Lin', role: 'sgs_consultant', status: 'active', title: 'Consultant · ISMS', activatedAt: '2025-03-01' },
    { id: 'u-kai', affiliateId: 'aff-tw', tenantId: null, email: 'kai.huang@sgs.com', displayName: 'Kai Huang', role: 'sgs_auditor', status: 'active', title: 'Auditor · ISMS', activatedAt: '2025-03-01' }, // mock only: 08's second auditor (Wei Lin) is a consultant here
    { id: 'u-tom', affiliateId: 'aff-tw', tenantId: null, email: 'tom.hsu@sgs.com', displayName: 'Tom Hsu', role: 'sgs_consultant', status: 'invited', invitedAt: '2026-09-24', invitedBy: 'u-minh', invitationToken: 'inv-tom', invitationExpiresAt: '2026-10-01' }, // mock only: an SGS invitation to activate (01 SgsActivate)
    { id: 'u-peter', affiliateId: 'aff-tw', tenantId: null, email: 'peter.wang@sgs.com', displayName: 'Peter Wang', role: 'sgs_user', status: 'deactivated', activatedAt: '2024-05-01', deactivatedAt: '2026-06-30' }, // mock only: deactivated SGS account (01 SgsLoginInactive)
    // SGS Vietnam (mock only)
    { id: 'u-lan', affiliateId: 'aff-vn', tenantId: null, email: 'lan.tran@sgs.com', displayName: 'Lan Tran', role: 'sgs_admin', status: 'active', activatedAt: '2025-01-01' },
  ],

  scopes: [
    { id: 's-hq', tenantId: 't-abc', type: 'organization', name: 'Head office · Taipei', description: 'Taipei head office, 3 sites, 240 employees; IT, HR, finance and customer service processes.', outOfScope: 'Manufacturing partner in Taichung.', status: 'active', createdAt: '2025-03-12' },
    // designs/05 (the scope module) has 4 scopes. "Plant · Taichung" (a "Site scope" in 03, 06, 07) is left out: UC-SCP-003 has no site type.
    { id: 's-ai', tenantId: 't-abc', type: 'product', name: 'AI platform', description: 'Machine-learning platform offered to retail customers.', status: 'active', createdAt: '2026-09-11' },
    { id: 's-loyalty', tenantId: 't-abc', type: 'product', name: 'Retail loyalty app', description: 'Loyalty app for retail partners.', status: 'active', createdAt: '2025-06-02' },
    { id: 's-cdp', tenantId: 't-abc', type: 'system', name: 'Customer data platform', description: 'CRM and loyalty database, APIs for the retail app, hosting in Hsinchu data centre.', outOfScope: 'Marketing email tool run by a supplier', parentOrgScopeId: 's-hq', parentProductScopeId: 's-loyalty', status: 'active', createdAt: '2026-08-20' },
    { id: 's-fab', tenantId: 't-formosa', type: 'organization', name: 'Hsinchu fab', description: 'Wafer fab and supporting IT.', status: 'active', createdAt: '2025-06-10' },
    // Saigon Foods (other affiliate, mock only) has no scope yet: its admin sees designs/05 ScopesEmpty.
  ],

  userScopes: [
    { userId: 'u-wei', scopeId: 's-hq', tenantId: 't-abc', grantedBy: 'u-linh', grantedAt: '2026-09-21' },
    { userId: 'u-wei', scopeId: 's-cdp', tenantId: 't-abc', grantedBy: 'u-linh', grantedAt: '2026-09-22' },
    { userId: 'u-mei', scopeId: 's-hq', tenantId: 't-abc', grantedBy: 'u-linh', grantedAt: '2026-09-18' },
    { userId: 'u-kevin', scopeId: 's-hq', tenantId: 't-abc', grantedBy: 'u-linh', grantedAt: '2026-09-24' },
    { userId: 'u-iris', scopeId: 's-hq', tenantId: 't-abc', grantedBy: 'u-linh', grantedAt: '2026-08-01' },
  ],

  sgsAssignments: [
    // At most one active consultant per customer (UC-ACC-006). The designs show two or three for ABC; the seed keeps Anna Lee.
    { id: 'as-1', affiliateId: 'aff-tw', userId: 'u-anna', tenantId: 't-abc', roleContext: 'sgs_consultant', validFrom: '2026-08-20', isActive: true },
    { id: 'as-2', affiliateId: 'aff-tw', userId: 'u-anna', tenantId: 't-formosa', roleContext: 'sgs_consultant', validFrom: '2026-09-18', isActive: true },
    { id: 'as-3', affiliateId: 'aff-tw', userId: 'u-weilin', tenantId: 't-abc', roleContext: 'sgs_consultant', validFrom: '2026-01-28', validTo: '2026-04-28', isActive: false },
  ],

  frameworks: [
    { id: 'fw-a10-amended', code: 'TW_ISRM_ANNEX10_EN', name: 'Security Baselines for ICT Systems (Appendix 10)', shortName: 'Appendix 10', version: 'amended version', versionLabel: 'Appendix 10 · amended version', versionFull: 'Appendix 10 per Article 11 – amended version', issuedBy: 'MODA', status: 'draft',
      description: A10_DESC, groupLabel: ['dimension', 'dimensions'], sourceFile: 'SGS_DTP_Framework_Import_Appendix10.xlsx', importedBy: 'u-minh',
      tiers: [{ code: 'P', label: 'Basic', localLabel: '普', hint: 'Baseline for every system', rank: 1, total: 44 }, { code: 'M', label: 'Medium', localLabel: '中', rank: 2, total: 61 }, { code: 'H', label: 'High', localLabel: '高', rank: 3, total: 79 }], requirementCount: 79, updatedAt: '2026-09-25T10:20:00+08:00' },
    { id: 'fw-a10-2022', code: 'TW_ISRM_ANNEX10_EN', name: 'Security Baselines for ICT Systems (Appendix 10)', shortName: 'Appendix 10', version: '2022', versionLabel: 'Appendix 10 · 2022', versionFull: 'Appendix 10 · 2022', issuedBy: 'MODA', status: 'active', effectiveDate: '2022-09-01',
      description: A10_DESC, groupLabel: ['dimension', 'dimensions'], sourceFile: 'Appendix10_2022.xlsx', importedBy: 'u-minh', activatedBy: 'u-minh', activatedAt: '2025-08-14',
      // designs/04 FwDetail shows 44 / 17 / 18 = 79 for this version too, but it has 76 requirements (docs/prototype-plan.md §4.2 #12).
      tiers: [{ code: 'P', label: 'Basic', localLabel: '普', hint: 'Baseline for every system', rank: 1, total: 44 }, { code: 'M', label: 'Medium', localLabel: '中', rank: 2, total: 61 }, { code: 'H', label: 'High', localLabel: '高', rank: 3, total: 76 }], requirementCount: 76, updatedAt: '2025-08-14T11:00:00+08:00' },
    { id: 'fw-27001-2022', code: 'ISO_IEC_27001', name: 'ISO/IEC 27001 Information security management', shortName: 'ISO/IEC 27001', version: '2022', versionLabel: '2022', versionFull: '2022', issuedBy: 'ISO / IEC', status: 'active', effectiveDate: '2022-10-25',
      description: 'Requirements for establishing, implementing, maintaining and continually improving an information security management system.', groupLabel: ['clause', 'clauses'], importedBy: 'u-minh', activatedBy: 'u-minh', activatedAt: '2026-03-02', tiers: [], requirementCount: 116, updatedAt: '2026-03-02T09:00:00+08:00' },
    { id: 'fw-27001-2013', code: 'ISO_IEC_27001', name: 'ISO/IEC 27001 Information security management', shortName: 'ISO/IEC 27001', version: '2013', versionLabel: '2013', versionFull: '2013', issuedBy: 'ISO / IEC', status: 'active', effectiveDate: '2013-10-01',
      description: 'Previous edition, kept for customers still certified against it.', groupLabel: ['clause', 'clauses'], importedBy: 'u-minh', activatedBy: 'u-minh', activatedAt: '2024-01-10', tiers: [], requirementCount: 114, updatedAt: '2024-01-10T09:00:00+08:00' },
    { id: 'fw-42001', code: 'ISO_IEC_42001', name: 'ISO/IEC 42001 AI management system', shortName: 'ISO/IEC 42001', version: '2023', versionLabel: '2023', versionFull: '2023', issuedBy: 'ISO / IEC', status: 'active', effectiveDate: '2023-12-18',
      description: 'Requirements for an artificial intelligence management system.', groupLabel: ['clause', 'clauses'], importedBy: 'u-minh', activatedBy: 'u-minh', activatedAt: '2026-04-11', tiers: [], requirementCount: 76, updatedAt: '2026-04-11T09:00:00+08:00' },
    // Not in designs/04 Main, but linked to scopes in designs/03 and 05 (mock keeps them).
    { id: 'fw-27701', code: 'ISO_IEC_27701', name: 'ISO/IEC 27701 Privacy information management', shortName: 'ISO/IEC 27701', version: '2019', versionLabel: '2019', versionFull: '2019', issuedBy: 'ISO / IEC', status: 'active', effectiveDate: '2019-08-06',
      description: 'Extension to ISO/IEC 27001 for privacy information management.', groupLabel: ['clause', 'clauses'], importedBy: 'u-minh', activatedBy: 'u-minh', activatedAt: '2025-12-12', tiers: [], requirementCount: 40, updatedAt: '2025-12-12T09:00:00+08:00' },
    { id: 'fw-22301', code: 'ISO_22301', name: 'ISO 22301 Business continuity management', shortName: 'ISO 22301', version: '2019', versionLabel: '2019', versionFull: '2019', issuedBy: 'ISO', status: 'active', effectiveDate: '2019-10-30',
      description: 'Requirements for a business continuity management system.', groupLabel: ['clause', 'clauses'], importedBy: 'u-minh', activatedBy: 'u-minh', activatedAt: '2025-12-12', tiers: [], requirementCount: 31, updatedAt: '2025-12-12T09:00:00+08:00' },
    { id: 'fw-tisax', code: 'TISAX_VDA_ISA', name: 'TISAX · VDA ISA', shortName: 'TISAX', version: 'ISA 6.0', versionLabel: 'ISA 6.0', versionFull: 'ISA 6.0', issuedBy: 'ENX Association', status: 'active', effectiveDate: '2023-10-01',
      description: 'VDA Information Security Assessment catalogue used for TISAX labels.', groupLabel: ['chapter', 'chapters'], importedBy: 'u-minh', activatedBy: 'u-minh', activatedAt: '2026-05-20',
      tiers: [{ code: 'n', label: 'Normal', rank: 1, total: 52 }, { code: 'h', label: 'High', rank: 2, total: 70 }, { code: 'vh', label: 'Very high', rank: 3, total: 78 }], requirementCount: 78, updatedAt: '2026-05-20T09:00:00+08:00' },
  ],
  requirements: [],
  expectedEvidence: [],

  workspaces: [
    { id: 'ws-27001-hq', tenantId: 't-abc', scopeId: 's-hq', frameworkId: 'fw-27001-2022', cycleLabel: '2026', status: 'preparing', createdBy: 'u-linh', createdAt: '2025-11-10' },
    { id: 'ws-22301-hq', tenantId: 't-abc', scopeId: 's-hq', frameworkId: 'fw-22301', cycleLabel: '2026', status: 'preparing', createdBy: 'u-linh', createdAt: '2026-01-20' },
    { id: 'ws-27701-cdp', tenantId: 't-abc', scopeId: 's-cdp', frameworkId: 'fw-27701', cycleLabel: '2026', status: 'preparing', createdBy: 'u-linh', createdAt: '2026-09-01' },
    { id: 'ws-27701-loyalty', tenantId: 't-abc', scopeId: 's-loyalty', frameworkId: 'fw-27701', cycleLabel: '2026', status: 'preparing', createdBy: 'u-linh', createdAt: '2025-12-15' },
    // Locked by the audit of CR-2026-015 (designs/08) in the default scenario; "before the audit" scenario: preparing (designs/05).
    { id: 'ws-a10-cdp', tenantId: 't-abc', scopeId: 's-cdp', frameworkId: 'fw-a10-2022', tier: 'M', cycleLabel: '2026', status: 'audit_in_progress', lockedByRequestId: 'CR-2026-015', createdBy: 'u-linh', createdAt: '2026-08-20' },
    { id: 'ws-42001-ai', tenantId: 't-abc', scopeId: 's-ai', frameworkId: 'fw-42001', cycleLabel: '2026', status: 'preparing', createdBy: 'u-linh', createdAt: '2026-09-22' },
    { id: 'ws-tisax-fab', tenantId: 't-formosa', scopeId: 's-fab', frameworkId: 'fw-tisax', tier: 'vh', cycleLabel: '2026', status: 'preparing', createdBy: 'u-daniel', createdAt: '2026-06-01' },
  ],
  evidence: [],
  evidenceVersions: [],
  evidenceMappings: [],
  requirementOwners: [],

  // Service requests. Sample data of designs/06 (GA) and 07 (IS), adjusted so that the demo date
  // (25 Sep 2026) is after every past event, requests of the removed "Plant · Taichung" scope use Head office,
  // and a customer has at most one active consultant (UC-ACC-006): Anna Lee for ABC Trading and Formosa Chips.
  serviceRequests: [
    { id: 'GA-2026-005', tenantId: 't-abc', category: 'gap_analysis', status: 'submitted', title: 'Gap Analysis · ISO/IEC 27701', scopeId: 's-cdp', frameworkId: 'fw-27701', workspaceId: 'ws-27701-cdp', serviceFramework: 'ISO/IEC 27701', serviceFrameworkVersion: 'ISO/IEC 27701:2019',
      requesterId: 'u-linh', submittedAt: '2026-09-21T10:30:00+08:00', updatedAt: '2026-09-21T10:30:00+08:00', goal: 'We process personal data for 3 retail brands and want to know what is missing before we certify.', delivery: 'on_site', earliestStart: '2026-10-12', contactUserId: 'u-linh', contactTitle: 'Compliance lead', consentWorkspace: true, attested: true },
    { id: 'GA-2026-004', tenantId: 't-abc', category: 'gap_analysis', status: 'in_progress', title: 'Gap Analysis · ISO/IEC 42001', scopeId: 's-ai', frameworkId: 'fw-42001', workspaceId: 'ws-42001-ai', serviceFramework: 'ISO/IEC 42001', serviceFrameworkVersion: 'ISO/IEC 42001:2023',
      requesterId: 'u-linh', assigneeId: 'u-anna', submittedAt: '2026-09-01T09:00:00+08:00', updatedAt: '2026-09-12T09:00:00+08:00', goal: 'Understand what our AI platform needs before customers ask for ISO/IEC 42001.', delivery: 'on_site', earliestStart: '2026-09-15', contactUserId: 'u-linh', contactTitle: 'Compliance lead', consentWorkspace: true, attested: true,
      approvedAt: '2026-09-04T11:00:00+08:00', approvedBy: 'u-minh', periodFrom: '2026-09-16', periodTo: '2026-09-18', siteLabel: 'Taipei HQ', sgsMessage: 'Please have the ML platform owner available on day 1.' },
    { id: 'GA-2026-002', tenantId: 't-abc', category: 'gap_analysis', status: 'completed', title: 'Gap Analysis · ISO/IEC 27001', scopeId: 's-hq', frameworkId: 'fw-27001-2022', workspaceId: 'ws-27001-hq', serviceFramework: 'ISO/IEC 27001', serviceFrameworkVersion: 'ISO/IEC 27001:2022',
      requesterId: 'u-linh', assigneeId: 'u-anna', submittedAt: '2026-09-02T09:00:00+08:00', updatedAt: '2026-09-24T16:40:00+08:00', goal: 'Certify the head office by Q2 2027; biggest concern is supplier management.', delivery: 'on_site', earliestStart: '2026-09-14', contactUserId: 'u-linh', contactTitle: 'Compliance lead', consentWorkspace: true, attested: true,
      approvedAt: '2026-09-05T10:00:00+08:00', approvedBy: 'u-minh', periodFrom: '2026-09-14', periodTo: '2026-09-18',
      completedAt: '2026-09-24T16:40:00+08:00', completedBy: 'u-anna', closingNote: 'Solid ISMS foundation. Close the asset inventory, supplier agreements and backup testing gaps first — details on pages 6–9.' },
    { id: 'GA-2026-001', tenantId: 't-abc', category: 'gap_analysis', status: 'rejected', title: 'Gap Analysis · TISAX', scopeId: 's-hq', serviceFramework: 'TISAX', serviceFrameworkVersion: 'TISAX',
      requesterId: 'u-linh', submittedAt: '2026-06-12T09:00:00+08:00', updatedAt: '2026-06-15T10:00:00+08:00', goal: 'Prepare for the OEM supplier assessment.', delivery: 'on_site', earliestStart: '2026-07-01', contactUserId: 'u-linh', consentWorkspace: true, attested: true,
      rejectReason: 'Scope not ready or unclear', rejectMessage: 'The Taichung plant starts production in Q4 2026. We suggest requesting the gap analysis once the first line is running.', rejectedAt: '2026-06-15T10:00:00+08:00', rejectedBy: 'u-minh' },
    { id: 'GA-2026-006', tenantId: 't-formosa', category: 'gap_analysis', status: 'in_progress', title: 'Gap Analysis · TISAX', scopeId: 's-fab', frameworkId: 'fw-tisax', workspaceId: 'ws-tisax-fab', serviceFramework: 'TISAX', serviceFrameworkVersion: 'TISAX · VDA ISA 6',
      requesterId: 'u-daniel', assigneeId: 'u-anna', submittedAt: '2026-09-15T09:00:00+08:00', updatedAt: '2026-09-18T10:00:00+08:00', goal: 'Reach assessment level 2 for our OEM customers by Q2 2027.', delivery: 'on_site', earliestStart: '2026-10-19', contactUserId: 'u-daniel', contactTitle: 'CISO', consentWorkspace: true, attested: true,
      approvedAt: '2026-09-18T10:00:00+08:00', approvedBy: 'u-minh', periodFrom: '2026-10-20', periodTo: '2026-10-22', sgsMessage: 'Customer prefers remote pre-meeting on 15 Oct.' },
    { id: 'IS-2026-004', tenantId: 't-abc', category: 'implementation_support', status: 'submitted', title: 'Implementation Support · ISO/IEC 27701', scopeId: 's-cdp', frameworkId: 'fw-27701', workspaceId: 'ws-27701-cdp', serviceFramework: 'ISO/IEC 27701', serviceFrameworkVersion: 'ISO/IEC 27701:2019',
      requesterId: 'u-linh', submittedAt: '2026-09-22T14:00:00+08:00', updatedAt: '2026-09-22T14:00:00+08:00', supportNeeded: ['Policies and procedures', 'Prepare evidence'], goal: 'Put the privacy procedures in place before the ISO/IEC 27701 audit.', preferredStart: '2026-12-01', preferredEnd: '2027-02-28', delivery: 'hybrid', contactUserId: 'u-linh', consentWorkspace: true, attested: true },
    { id: 'IS-2026-003', tenantId: 't-abc', category: 'implementation_support', status: 'in_progress', title: 'Implementation Support · ISO/IEC 27001', scopeId: 's-hq', frameworkId: 'fw-27001-2022', workspaceId: 'ws-27001-hq', serviceFramework: 'ISO/IEC 27001', serviceFrameworkVersion: 'ISO/IEC 27001:2022',
      requesterId: 'u-linh', assigneeId: 'u-anna', submittedAt: '2026-08-05T09:00:00+08:00', updatedAt: '2026-09-20T15:00:00+08:00', supportNeeded: ['Policies and procedures', 'Prepare evidence'], goal: 'Close the 10 Not met gaps first. Target: certification audit in Q2 2027.', preferredStart: '2026-09-01', preferredEnd: '2026-11-30', delivery: 'hybrid', contactUserId: 'u-linh', consentWorkspace: true, attested: true,
      approvedAt: '2026-08-20T10:00:00+08:00', approvedBy: 'u-minh', periodFrom: '2026-09-01', periodTo: '2026-11-30', sgsMessage: 'Kick-off call in the first week of September.' },
    { id: 'IS-2026-001', tenantId: 't-abc', category: 'implementation_support', status: 'completed', title: 'Implementation Support · TISAX', scopeId: 's-hq', serviceFramework: 'TISAX', serviceFrameworkVersion: 'TISAX',
      requesterId: 'u-linh', assigneeId: 'u-weilin', submittedAt: '2026-01-20T09:00:00+08:00', updatedAt: '2026-04-28T17:00:00+08:00', supportNeeded: ['Policies and procedures', 'Prepare evidence'], goal: 'Set up the ISMS for the plant before the TISAX assessment.', preferredStart: '2026-02-01', preferredEnd: '2026-04-30', delivery: 'on_site', contactUserId: 'u-linh', consentWorkspace: true, attested: true,
      approvedAt: '2026-01-28T10:00:00+08:00', approvedBy: 'u-minh', periodFrom: '2026-02-01', periodTo: '2026-04-30',
      completedAt: '2026-04-28T17:00:00+08:00', completedBy: 'u-weilin', closingNote: 'All planned documents are delivered and the ISMS for the plant is in place. Next step: book the TISAX assessment; keep supplier reviews on the quarterly cycle.' },
    { id: 'IS-2025-009', tenantId: 't-abc', category: 'implementation_support', status: 'rejected', title: 'Implementation Support · ISO 22301', scopeId: 's-hq', frameworkId: 'fw-22301', workspaceId: 'ws-22301-hq', serviceFramework: 'ISO 22301', serviceFrameworkVersion: 'ISO 22301',
      requesterId: 'u-linh', submittedAt: '2025-12-02T09:00:00+08:00', updatedAt: '2025-12-10T10:00:00+08:00', supportNeeded: ['Policies and procedures'], goal: 'Business continuity plan for the head office.', preferredStart: '2026-01-05', preferredEnd: '2026-03-31', delivery: 'on_site', contactUserId: 'u-linh', consentWorkspace: true, attested: true,
      rejectReason: 'No commercial agreement', rejectMessage: 'We need a signed proposal before we can start. Your SGS account manager will contact you this week.', rejectedAt: '2025-12-10T10:00:00+08:00', rejectedBy: 'u-minh' },
    // Certification requests (designs/08 is the reference for the flow, decisions D2). Dates are moved before the demo date.
    { id: 'CR-2026-018', tenantId: 't-abc', category: 'certification', status: 'submitted', title: 'Recertification · ISO 22301', scopeId: 's-hq', frameworkId: 'fw-22301', workspaceId: 'ws-22301-hq', serviceFramework: 'ISO 22301', serviceFrameworkVersion: 'ISO 22301 · 2019',
      requesterId: 'u-linh', submittedAt: '2026-09-23T09:00:00+08:00', updatedAt: '2026-09-23T09:00:00+08:00', certType: 'Recertification', preferredPeriod: 'Q1 2027', message: '3 sites, about 240 employees. We need the certificate before our bank tender in June 2027.' },
    { id: 'CR-2026-017', tenantId: 't-formosa', category: 'certification', status: 'assigned', title: 'Initial certification · TISAX', scopeId: 's-fab', frameworkId: 'fw-tisax', workspaceId: 'ws-tisax-fab', serviceFramework: 'TISAX', serviceFrameworkVersion: 'TISAX · ISA 6.0',
      requesterId: 'u-daniel', assigneeId: 'u-david', submittedAt: '2026-09-20T09:00:00+08:00', updatedAt: '2026-09-22T10:00:00+08:00', approvedAt: '2026-09-22T10:00:00+08:00', approvedBy: 'u-grace', certType: 'Initial certification', preferredPeriod: 'December 2026', message: 'Please audit prototype protection on day 2.', sgsMessage: 'David will contact you this week to agree dates.', contactUserId: 'u-daniel', contactTitle: 'CISO' },
    { id: 'CR-2026-015', tenantId: 't-abc', category: 'certification', status: 'in_progress', title: 'Initial certification · Appendix 10 · 2022', scopeId: 's-cdp', frameworkId: 'fw-a10-2022', workspaceId: 'ws-a10-cdp', serviceFramework: 'Cybersecurity Management Act', serviceFrameworkVersion: 'Appendix 10 · 2022',
      requesterId: 'u-linh', assigneeId: 'u-david', submittedAt: '2026-08-24T09:00:00+08:00', updatedAt: '2026-09-14T11:00:00+08:00', approvedAt: '2026-08-26T10:00:00+08:00', approvedBy: 'u-grace', certType: 'Initial certification', preferredPeriod: 'November 2026', message: 'Hosting is in the Hsinchu data centre; please plan one day on site.' },
    { id: 'CR-2026-012', tenantId: 't-abc', category: 'certification', status: 'audit_completed', title: 'Initial certification · ISO/IEC 27001', scopeId: 's-hq', frameworkId: 'fw-27001-2022', workspaceId: 'ws-27001-hq', serviceFramework: 'ISO/IEC 27001', serviceFrameworkVersion: 'ISO/IEC 27001 · 2022',
      requesterId: 'u-linh', assigneeId: 'u-david', submittedAt: '2026-07-20T09:00:00+08:00', updatedAt: '2026-09-08T17:00:00+08:00', approvedAt: '2026-07-22T10:00:00+08:00', approvedBy: 'u-grace', certType: 'Initial certification', preferredPeriod: 'October 2026', message: 'Please combine with the ISO 22301 surveillance if possible.' },
    { id: 'CR-2026-004', tenantId: 't-formosa', category: 'certification', status: 'certificate_issued', title: 'Initial certification · ISO/IEC 27017', scopeId: 's-fab', serviceFramework: 'ISO/IEC 27017', serviceFrameworkVersion: 'ISO/IEC 27017 · 2015',
      requesterId: 'u-daniel', assigneeId: 'u-kai', submittedAt: '2026-05-10T09:00:00+08:00', updatedAt: '2026-08-30T10:00:00+08:00', approvedAt: '2026-05-12T10:00:00+08:00', approvedBy: 'u-grace', certType: 'Initial certification', preferredPeriod: 'Q3 2026' },
    { id: 'TR-2026-021', tenantId: 't-abc', category: 'training', status: 'submitted', title: 'ISO/IEC 27001 Lead Auditor · 6 people', requesterId: 'u-linh', submittedAt: '2026-09-24T09:00:00+08:00', updatedAt: '2026-09-24T09:00:00+08:00',
      course: 'Lead Auditor Training Course', courseStd: 'ISO/IEC 27001', courseCategory: 'Information Security', participants: 6, format: 'Public class', preferredMonth: 'November 2026', language: '繁體中文' },
    // designs/09 TrainAdminQueue. Lotus has no active user yet (its admin is still invited, designs/02), so the
    // request is recorded against the invited admin. TODO(open-question): data kept as in the design.
    { id: 'TR-2026-022', tenantId: 't-lotus', category: 'training', status: 'submitted', title: 'ISO 22301 Internal Auditor · 15 people', requesterId: 'u-ha', submittedAt: '2026-09-24T08:00:00+08:00', updatedAt: '2026-09-24T08:00:00+08:00',
      course: 'Internal Auditor Training Course', courseStd: 'ISO 22301', courseCategory: 'Business Continuity', participants: 15, format: 'In-house', preferredMonth: 'December 2026', language: 'English' },
    { id: 'TR-2026-015', tenantId: 't-abc', category: 'training', status: 'assigned', title: 'ISO/IEC 42001 Internal Auditor · 12 people', requesterId: 'u-linh', assigneeId: 'u-meichang', submittedAt: '2026-08-29T09:00:00+08:00', updatedAt: '2026-09-02T09:00:00+08:00',
      approvedAt: '2026-09-02T09:00:00+08:00', approvedBy: 'u-minh', sgsMessage: 'I will send you the course dates and the quotation this week.',
      course: 'Internal Auditor Training Course', courseStd: 'ISO/IEC 42001', courseCategory: 'AI', participants: 12, format: 'In-house', preferredMonth: 'October 2026', language: '繁體中文' },
    { id: 'TR-2026-009', tenantId: 't-abc', category: 'training', status: 'rejected', title: 'TISAX Standard Analysis · 3 people', requesterId: 'u-linh', submittedAt: '2026-07-10T09:00:00+08:00', updatedAt: '2026-07-12T09:00:00+08:00',
      rejectReason: 'Other', rejectMessage: 'This course runs with at least 8 participants. Join the public class in Q1 2027 or send a larger group.', rejectedAt: '2026-07-12T09:00:00+08:00', rejectedBy: 'u-minh',
      course: 'Standard Analysis Training Course', courseStd: 'TISAX', courseCategory: 'Information Security', participants: 3, format: 'In-house', preferredMonth: 'Flexible', language: 'English' },
  ],
  srDocuments: [
    { id: 'doc-ga2-rep', requestId: 'GA-2026-002', kind: 'report', title: 'Gap Analysis Report', fileName: 'GA-2026-002 – Gap Analysis Report.pdf', sizeBytes: 2600000, source: 'sgs', uploadedBy: 'u-anna', uploadedAt: '2026-09-24T16:40:00+08:00' },
    { id: 'doc-ga2-att', requestId: 'GA-2026-002', kind: 'attachment', title: 'Attachment · detailed findings', fileName: 'GA-2026-002 – Findings.xlsx', sizeBytes: 480000, source: 'sgs', uploadedBy: 'u-anna', uploadedAt: '2026-09-24T16:40:00+08:00' },
    { id: 'doc-is3-1', requestId: 'IS-2026-003', kind: 'deliverable', title: 'Asset register template', fileName: 'IS-2026-003 – Asset register template.xlsx', sizeBytes: 60000, source: 'sgs', uploadedBy: 'u-anna', uploadedAt: '2026-09-05T10:00:00+08:00' },
    { id: 'doc-is3-2', requestId: 'IS-2026-003', kind: 'deliverable', title: 'Supplier security clauses', fileName: 'IS-2026-003 – Supplier security clauses.docx', sizeBytes: 95000, source: 'sgs', uploadedBy: 'u-anna', uploadedAt: '2026-09-12T10:00:00+08:00' },
    { id: 'doc-is3-3', requestId: 'IS-2026-003', kind: 'deliverable', title: 'Information security policy v4', fileName: 'IS-2026-003 – Information security policy v4.docx', sizeBytes: 180000, source: 'sgs', uploadedBy: 'u-anna', uploadedAt: '2026-09-20T15:00:00+08:00' },
    { id: 'doc-is3-cust', requestId: 'IS-2026-003', kind: 'customer_shared', title: 'Previous assessment report', fileName: 'isms-assessment-2026.pdf', sizeBytes: 2600000, source: 'customer', uploadedBy: 'u-linh', uploadedAt: '2026-08-05T09:00:00+08:00' },
    { id: 'doc-is1-1', requestId: 'IS-2026-001', kind: 'deliverable', title: 'Prototype protection procedure', fileName: 'IS-2026-001 – Prototype protection.docx', sizeBytes: 140000, source: 'sgs', uploadedBy: 'u-weilin', uploadedAt: '2026-03-18T10:00:00+08:00' },
    { id: 'doc-is1-2', requestId: 'IS-2026-001', kind: 'deliverable', title: 'Information security policy', fileName: 'IS-2026-001 – Information security policy.docx', sizeBytes: 210000, source: 'sgs', uploadedBy: 'u-weilin', uploadedAt: '2026-04-02T10:00:00+08:00' },
    { id: 'doc-is1-3', requestId: 'IS-2026-001', kind: 'closing', title: 'Closing summary', fileName: 'IS-2026-001 – Closing summary.pdf', sizeBytes: 420000, source: 'sgs', uploadedBy: 'u-weilin', uploadedAt: '2026-04-28T17:00:00+08:00' },
  ],
  infoRequests: [],
  reviews: [],
  reviewItems: [],
  clarifications: [],
  findings: [],
  reviewNotes: [],
  srNotes: [
    { id: 'sn-1', requestId: 'CR-2026-018', authorId: 'u-grace', at: '2026-09-24T15:10:00+08:00', body: 'Recertification: last cycle had one minor finding on supplier review. Prefer David again for continuity.', visibility: 'internal' },
  ],
  certifications: [],

  notifications: [
    { id: 'n-1', recipientUserId: 'u-linh', tenantId: 't-abc', type: 'review', tone: 'warning', title: '3 items need your response', body: 'David Wu asked for clarification on Appendix 10 · 2022 · Customer data platform.', ref: 'CR-2026-015', createdAt: '2026-09-25T09:10:00+08:00', href: '/reviews' },
    { id: 'n-2', recipientUserId: 'u-linh', tenantId: 't-abc', type: 'status', tone: 'success', title: 'Gap analysis report delivered', body: 'Anna Lee delivered the report for ISO/IEC 27001 · Head office · Taipei.', ref: 'GA-2026-002', createdAt: '2026-09-24T16:40:00+08:00', href: '/service-requests/gap-analysis' },
    { id: 'n-3', recipientUserId: 'u-linh', tenantId: 't-abc', type: 'user', tone: 'info', title: 'Wei Chen activated their account', ref: 'Users', createdAt: '2026-09-21T10:02:00+08:00', readAt: '2026-09-21T11:00:00+08:00', href: '/admin/users' },
    { id: 'n-4', recipientUserId: 'u-wei', tenantId: 't-abc', type: 'review', tone: 'warning', title: 'Clarification requested on R.1.1.4', body: 'Respond by 25 Nov 2026.', ref: 'CR-2026-015', createdAt: '2026-09-25T09:10:00+08:00', href: '/reviews' },
    { id: 'n-5', recipientUserId: 'u-minh', tenantId: 't-abc', type: 'status', tone: 'info', title: 'New gap analysis request', body: 'ABC Trading Co., Ltd. · ISO/IEC 42001 · AI platform', ref: 'GA-2026-005', createdAt: '2026-09-22T08:20:00+08:00', href: '/ops/requests/gap-analysis' },
    { id: 'n-6', recipientUserId: 'u-minh', tenantId: 't-abc', type: 'status', tone: 'info', title: 'New certification request', body: 'ABC Trading Co., Ltd. · ISO/IEC 27001 · Head office · Taipei', ref: 'CR-2026-012', createdAt: '2026-09-23T09:00:00+08:00', href: '/ops/requests/certification' },
    { id: 'n-7', recipientUserId: 'u-anna', tenantId: 't-abc', type: 'assignment', tone: 'info', title: 'You were assigned IS-2026-003', body: 'ABC Trading Co., Ltd. · ISO/IEC 27001 · Head office · Taipei', ref: 'IS-2026-003', createdAt: '2026-09-20T14:00:00+08:00', href: '/ops/my-assignments/implementation-support' },
    { id: 'n-8', recipientUserId: 'u-david', tenantId: 't-abc', type: 'review', tone: 'info', title: 'Response submitted on R.3.1.3', body: 'Kevin Ho submitted a corrective action for F-003.', ref: 'CR-2026-015', createdAt: '2026-09-24T18:00:00+08:00', href: '/ops/audits' },
    { id: 'n-9', recipientUserId: 'u-daniel', tenantId: 't-formosa', type: 'status', tone: 'info', title: 'Consultant assigned', body: 'Minh Tran will run your TISAX gap analysis.', ref: 'GA-2026-006', createdAt: '2026-09-15T10:00:00+08:00', href: '/service-requests/gap-analysis' },
    { id: 'n-10', recipientUserId: 'u-quang', tenantId: 't-saigon', type: 'user', tone: 'info', title: 'Welcome to the Digital Trust Platform', createdAt: '2026-01-16T09:00:00+07:00' },
  ],

  emails: [
    { id: 'em-kevin', kind: 'invitation', to: 'kevin.ho@abc-trading.com', toName: 'Kevin Ho', userId: 'u-kevin', token: 'inv-kevin', subject: 'Linh Tran invited you to ABC Trading on the SGS Digital Trust Platform', sentAt: '2026-09-24T11:20:00+08:00', expiresAt: '2026-10-01', inviterName: 'Linh Tran', inviterRole: 'Customer Admin', orgName: 'ABC Trading Co., Ltd.', portal: 'customer' },
    { id: 'em-ha', kind: 'invitation', to: 'ha.nguyen@lotus.vn', toName: 'Nguyen Thi Ha', userId: 'u-ha', token: 'inv-ha', subject: 'SGS Taiwan invited you to Lotus Cosmetics JSC on the SGS Digital Trust Platform', sentAt: '2026-09-20T10:00:00+08:00', expiresAt: '2026-09-27', inviterName: 'Minh Nguyen', inviterRole: 'SGS Admin', orgName: 'Lotus Cosmetics JSC', portal: 'customer' },
    { id: 'em-tom', kind: 'invitation', to: 'tom.hsu@sgs.com', toName: 'Tom Hsu', userId: 'u-tom', token: 'inv-tom', subject: 'You’re invited to SGS Operations on the Digital Trust Platform', sentAt: '2026-09-24T09:00:00+08:00', expiresAt: '2026-10-01', inviterName: 'Minh Nguyen', inviterRole: 'SGS Admin', orgName: 'SGS Taiwan', portal: 'sgs-ops' },
  ],

  auditEvents: [
    // User history (designs/03 CaUserDetail, CaUserPending)
    { id: 'ae-u1', occurredAt: '2026-09-20T10:00:00+08:00', affiliateId: 'aff-tw', tenantId: 't-abc', actorId: 'u-linh', actorRole: 'customer_admin', action: 'Invited user', category: 'users', objectType: 'User', objectId: 'u-wei', objectLabel: 'Wei Chen', source: 'Customer Portal', newValue: { role: 'Customer User', scopes: ['Head office · Taipei'] } },
    { id: 'ae-u2', occurredAt: '2026-09-22T09:30:00+08:00', affiliateId: 'aff-tw', tenantId: 't-abc', actorId: 'u-linh', actorRole: 'customer_admin', action: 'Changed scope access', category: 'users', objectType: 'User', objectId: 'u-wei', objectLabel: 'Wei Chen', context: 'Customer data platform added', source: 'Customer Portal', previousValue: { scopes: ['Head office · Taipei'] }, newValue: { scopes: ['Head office · Taipei', 'Customer data platform'] } },
    { id: 'ae-u3', occurredAt: '2026-09-24T11:20:00+08:00', affiliateId: 'aff-tw', tenantId: 't-abc', actorId: 'u-linh', actorRole: 'customer_admin', action: 'Invited user', category: 'users', objectType: 'User', objectId: 'u-kevin', objectLabel: 'Kevin Ho', source: 'Customer Portal', newValue: { role: 'Customer User', scopes: ['Head office · Taipei'] } },
    { id: 'ae-u4', occurredAt: '2026-09-10T15:00:00+08:00', affiliateId: 'aff-tw', tenantId: 't-abc', actorId: 'u-linh', actorRole: 'customer_admin', action: 'Invited user', category: 'users', objectType: 'User', objectId: 'u-jason', objectLabel: 'Jason Wu', source: 'Customer Portal', newValue: { role: 'Customer User' } },
    { id: 'ae-u5', occurredAt: '2026-09-24T10:00:00+08:00', affiliateId: 'aff-tw', tenantId: 't-lotus', actorId: 'u-minh', actorRole: 'sgs_admin', action: 'Invited user', category: 'users', objectType: 'User', objectId: 'u-ha', objectLabel: 'Nguyen Thi Ha', source: 'SGS Operations Console', newValue: { role: 'Customer Admin' } },

    { id: 'ae-1', occurredAt: '2026-09-24T18:02:00+08:00', affiliateId: 'aff-tw', tenantId: 't-abc', actorId: 'u-wei', actorRole: 'customer_user', action: 'Replaced evidence with a new version', category: 'evidence', objectType: 'Evidence', objectId: 'ev-isms-policy', objectLabel: 'Information security policy', context: 'A.5.1', source: 'Customer Portal', previousValue: { version: 3 }, newValue: { version: 4 } },
    { id: 'ae-2', occurredAt: '2026-09-22T08:20:00+08:00', affiliateId: 'aff-tw', tenantId: 't-abc', actorId: 'u-linh', actorRole: 'customer_admin', action: 'Submitted service request', category: 'request', objectType: 'Service request', objectId: 'GA-2026-005', objectLabel: 'GA-2026-005', context: 'GA-2026-005', source: 'Customer Portal' },
    { id: 'ae-3', occurredAt: '2026-09-21T10:02:00+08:00', affiliateId: 'aff-tw', tenantId: 't-abc', actorId: 'u-wei', actorRole: 'customer_user', action: 'Activated account', category: 'users', objectType: 'User', objectId: 'u-wei', objectLabel: 'Wei Chen', source: 'Customer Portal' },
    { id: 'ae-4', occurredAt: '2026-09-15T10:00:00+08:00', affiliateId: 'aff-tw', tenantId: 't-formosa', actorId: 'u-minh', actorRole: 'sgs_admin', action: 'Approved and assigned consultant', category: 'request', objectType: 'Service request', objectId: 'GA-2026-006', objectLabel: 'GA-2026-006', context: 'GA-2026-006', source: 'SGS Operations Console' },
  ],
};

// Every seeded account signs in with DEMO_PASSWORD. Wei Chen keeps the used invitation link so the
// "already activated" page (designs/01 ActivateUsed) can be opened.
for (const u of seedDb.users) u.password = u.status === 'active' || u.status === 'deactivated' ? DEMO_PASSWORD : undefined;
Object.assign(seedDb.users.find((u) => u.id === 'u-wei')!, { invitationToken: 'inv-wei', invitationExpiresAt: '2026-09-26' });
Object.assign(seedDb, buildCatalog(seedDb.frameworks));
seedEvidence(seedDb);
seedAudit(seedDb);
seedAuditTrail(seedDb);
export const seed: MockDb = seedDb;
