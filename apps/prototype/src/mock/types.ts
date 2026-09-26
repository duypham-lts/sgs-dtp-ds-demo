// Mock domain model. Names and fields follow docs/er-model.md (DTP_MVP_ER_Overview) where the ER defines them;
// fields the ER does not have yet are marked "not in ER" (see docs/decisions.md G2).

export type Portal = 'customer' | 'sgs-ops';

export type CustomerRole = 'customer_admin' | 'customer_user' | 'customer_viewer';
export type SgsRole = 'sgs_admin' | 'sgs_user' | 'sgs_consultant' | 'sgs_auditor';
export type Role = CustomerRole | SgsRole;

export const ROLE_LABEL: Record<Role, string> = {
  customer_admin: 'Customer Admin',
  customer_user: 'Customer User',
  customer_viewer: 'Customer Viewer',
  sgs_admin: 'SGS Admin',
  sgs_user: 'SGS User',
  sgs_consultant: 'SGS Consultant',
  sgs_auditor: 'SGS Auditor/Certification',
};

export function portalOf(role: Role): Portal {
  return role.startsWith('customer_') ? 'customer' : 'sgs-ops';
}

/** AFFILIATE */
export interface Affiliate { id: string; name: string; legalName: string; region: string }

/** TENANT (customer account). status values follow designs/03 (TenantList). */
export type TenantStatus = 'no_admin' | 'admin_invited' | 'active';
export interface Tenant {
  id: string; affiliateId: string; name: string; country: string; status: TenantStatus;
  internalNote?: string; // not in ER
  createdAt: string; createdBy?: string;
}

/** APP_USER. status values follow designs/03 (Users). */
export type UserStatus = 'invited' | 'expired' | 'active' | 'deactivated';
export interface AppUser {
  id: string; affiliateId: string; tenantId: string | null; email: string; displayName: string; role: Role; status: UserStatus;
  title?: string; // job title shown in designs, not in ER
  invitedAt?: string; invitedBy?: string; activatedAt?: string; lastSignInAt?: string; deactivatedAt?: string;
  // Sign-in (UC-AUTH-001) and invitation (UC-AUTH-005). Real credentials live in Entra; the mock keeps a
  // demo password so the login screens can be exercised.
  password?: string; failedSignIns?: number; lockedUntil?: string;
  invitationToken?: string; invitationExpiresAt?: string;
}

/** Outgoing email, kept for the demo mailbox. Only invitation emails exist in the MVP (email notifications are P2, D11). */
export interface MockEmail {
  id: string; kind: 'invitation'; to: string; toName: string; userId: string; token: string;
  subject: string; sentAt: string; expiresAt: string; inviterName: string; inviterRole: string; orgName: string; portal: Portal;
}

/** USER_SCOPE */
export interface UserScope { userId: string; scopeId: string; tenantId: string; grantedBy: string; grantedAt: string }

/** SGS_ASSIGNMENT: SGS personnel assigned to a customer account (UC-ACC-006). */
export interface SgsAssignment {
  id: string; affiliateId: string; userId: string; tenantId: string; roleContext: SgsRole;
  validFrom: string; validTo?: string; isActive: boolean;
}

/** SCOPE */
export type ScopeType = 'organization' | 'product' | 'system';
export interface Scope {
  id: string; tenantId: string; type: ScopeType; name: string; description: string; outOfScope?: string;
  parentOrgScopeId?: string; parentProductScopeId?: string; status: 'active'; createdAt: string;
}

/** FRAMEWORK (one row per framework version, as in designs/04). */
export interface Tier { code: string; label: string; rank: number; total: number; localLabel?: string; hint?: string }
export interface Framework {
  id: string; code: string; name: string; shortName: string;
  version: string;        // "2022", "amended version", "ISA 6.0"
  versionLabel: string;   // Version column of designs/04 Main ("Appendix 10 · 2022", "2022")
  versionFull: string;    // page header subtitle ("Appendix 10 per Article 11 – amended version")
  issuedBy: string; description: string; effectiveDate?: string;
  status: 'draft' | 'active' | 'discarded'; tiers: Tier[]; requirementCount: number; updatedAt: string;
  sourceFile?: string; importedBy?: string; activatedAt?: string; activatedBy?: string;
  groupLabel: [string, string]; // how the top level is called: ['dimension', 'dimensions'] or ['clause', 'clauses']
}

/** REQUIREMENT: grouping rows (dimension, control measure) and assessable requirements. */
export interface Requirement {
  id: string; frameworkId: string; code: string; title: string; statement: string;
  groupCode: string; groupTitle: string; measureCode?: string; measureTitle?: string;
  minTier?: string; // lowest tier the requirement applies to (tiered frameworks)
  sortOrder: number; source?: string;
}
/** EXPECTED_EVIDENCE */
export interface ExpectedEvidence { id: string; requirementId: string; code: string; name: string; description: string; mandatory: boolean }

/** EVIDENCE_WORKSPACE. One per scope + framework + cycle; created when a framework is linked (UC-SCP-006). */
export type WorkspaceStatus = 'preparing' | 'audit_in_progress' | 'audited';
export interface Workspace {
  id: string; tenantId: string; scopeId: string; frameworkId: string; tier?: string; cycleLabel: string;
  status: WorkspaceStatus; createdBy: string; createdAt: string;
  lockedByRequestId?: string; auditedAt?: string; // audit review in progress / closed (designs/08)
}

/** EVIDENCE: a file that belongs to one workspace (designs/05 "Each file belongs to one workspace"). */
export type EvidenceReview = 'not_reviewed' | 'in_review' | 'accepted' | 'under_review';
export interface Evidence {
  id: string; tenantId: string; workspaceId: string; name: string; currentVersion: number;
  validFrom?: string; validUntil?: string; scanState: 'scanning' | 'clean';
  review: EvidenceReview; createdBy: string; createdAt: string;
}
/** EVIDENCE_VERSION */
export interface EvidenceVersion { id: string; evidenceId: string; versionNo: number; fileName: string; sizeBytes: number; uploadedBy: string; uploadedAt: string }
/** EVIDENCE_MAPPING: evidence used for a requirement's expected evidence item. */
export interface EvidenceMapping { id: string; evidenceId: string; workspaceId: string; requirementId: string; expectedEvidenceId: string; linkedBy: string; linkedAt: string }
/** Requirement owner in a workspace (UC-EVD-016, D6). The ER keeps it on EVIDENCE_MAPPING.requirement_owner_id. */
export interface RequirementOwner { workspaceId: string; requirementId: string; ownerUserId: string; setBy: string; setAt: string }

/** SERVICE_REQUEST. Statuses: docs/prototype-plan.md §3.1 and docs/decisions.md D2–D4. Fields the ER does
 * not have yet (delivery details, rejection reason…) are kept on the request here; see decisions G2. */
export type SrCategory = 'certification' | 'training' | 'gap_analysis' | 'implementation_support';
export type SrStatus =
  | 'draft' | 'submitted' | 'information_requested' | 'assigned' | 'in_progress'
  | 'audit_completed' | 'completed' | 'certificate_issued' | 'rejected' | 'withdrawn';
export type Delivery = 'on_site' | 'remote' | 'hybrid';
export interface ServiceRequest {
  id: string; tenantId: string; category: SrCategory; status: SrStatus;
  previousStatus?: SrStatus; // status to return to after information_requested (D3)
  title: string; scopeId?: string; frameworkId?: string; workspaceId?: string;
  /** Service catalogue framework (docs/book-a-service.md); may exist without a platform framework. */
  serviceFramework?: string; serviceFrameworkVersion?: string;
  requesterId: string; assigneeId?: string; submittedAt?: string; updatedAt: string; createdAt?: string;
  // Request details (GA, IS)
  goal?: string; delivery?: Delivery; earliestStart?: string; contactUserId?: string; contactTitle?: string;
  supportNeeded?: string[]; preferredStart?: string; preferredEnd?: string; consentWorkspace?: boolean; attested?: boolean;
  // Certification request (designs/08, 09)
  certType?: 'Initial certification' | 'Recertification' | 'Transfer from another body'; preferredPeriod?: string; message?: string;
  // Training request (designs/09)
  course?: string; courseStd?: string; courseCategory?: string; participants?: number; format?: 'Public class' | 'In-house' | 'Online'; preferredMonth?: string; language?: '繁體中文' | 'English';
  // Triage
  approvedAt?: string; approvedBy?: string; periodFrom?: string; periodTo?: string; siteLabel?: string; sgsMessage?: string;
  rejectReason?: string; rejectMessage?: string; rejectedAt?: string; rejectedBy?: string;
  withdrawReason?: string; withdrawComment?: string; withdrawnAt?: string;
  completedAt?: string; completedBy?: string; closingNote?: string;
  /** Set on "Request again": the rejected request this one was copied from. */
  copiedFrom?: string;
}

/** SR_DOCUMENT (proposed in decisions D5, not in the ER yet): files attached to a request. */
export type SrDocumentKind = 'report' | 'attachment' | 'deliverable' | 'closing' | 'customer_shared';
export interface SrDocument {
  id: string; requestId: string; kind: SrDocumentKind; title: string; fileName: string; sizeBytes: number;
  source: 'customer' | 'sgs'; uploadedBy: string; uploadedAt: string; note?: string;
}

/** Information request on a service request (UC-SRQ-009/010, decisions D3). */
export interface InfoRequest {
  id: string; requestId: string; question: string; askedBy: string; askedAt: string; dueOn?: string;
  answer?: string; answeredBy?: string; answeredAt?: string; files?: { fileName: string; sizeBytes: number }[];
}

/** REVIEW (audit review of a workspace for a certification request, designs/08, UC-REV-*). */
export interface Review {
  id: string; requestId: string; workspaceId: string; tenantId: string; auditorId: string; tier?: string;
  startedAt: string; closedAt?: string; reportFileName?: string; reportSizeBytes?: number;
}
/** REVIEW_ITEM: one per requirement of the workspace tier. */
export type ReviewItemStatus = 'not_reviewed' | 'accepted' | 'clarification_requested' | 'response_submitted' | 'finding_raised' | 'closed_with_finding';
export interface ReviewItem { id: string; reviewId: string; requirementId: string; status: ReviewItemStatus; decidedAt?: string; decidedBy?: string }
/** Clarification requested on a review item (UC-REV-007/012). */
export interface Clarification {
  id: string; itemId: string; question: string; expect: 'answer_files' | 'answer'; dueOn: string; askedAt: string; askedBy: string;
  answer?: string; answeredBy?: string; answeredAt?: string; files?: string[]; // evidence ids added with the answer
}
/** FINDING (UC-REV-008/013/014). */
export type FindingClass = 'major' | 'minor' | 'observation' | 'ofi';
export interface CorrectiveAction {
  id: string; actionTaken: string; completedOn: string; files: string[]; note?: string; submittedAt: string; submittedBy: string;
  decision?: 'accepted' | 'not_accepted'; comment?: string; decidedAt?: string;
}
export interface Finding {
  id: string; code: string; reviewId: string; itemId: string; classification: FindingClass; text: string; relatedEvidenceIds: string[];
  correctiveRequired: boolean; dueOn?: string; internalNote?: string; status: 'open' | 'response_submitted' | 'closed';
  raisedAt: string; raisedBy: string; closedAt?: string; actions: CorrectiveAction[]; dueChanges: { from: string; to: string; reason: string; at: string }[];
}
/** Internal notes of a review: SGS only, never sent to a customer session. */
export interface ReviewNote { id: string; reviewId: string; authorId: string; at: string; body: string }
/**
 * SERVICE_REQUEST_COMMENT (designs/11, decisions D7). Only `internal` for now: SGS notes the customer never
 * sees. Shared messages wait for the client (D7); customers answer SGS through information requests (D3).
 */
export interface SrNote { id: string; requestId: string; authorId: string; at: string; body: string; visibility: 'internal' }

/** CERTIFICATION (UC-CRT-001/003). Only "Active" in the MVP; expired is derived from valid_to. */
export interface Certification {
  id: string; number: string; tenantId: string; affiliateId: string; scopeId: string; frameworkLabel: string; frameworkId?: string; tier?: string;
  requestId?: string; accreditation: 'TAF' | 'UKAS' | 'Not accredited'; certificateDate: string; validTo: string;
  certificateScope: string; sites: string[]; contractNumber?: string; certifiedBy: string; createdBy?: string; createdAt: string;
}

/** NOTIFICATION (UC-NTF-001/002). Shape matches Graphite NotificationItem. */
export interface Notification {
  id: string; recipientUserId: string; tenantId: string | null;
  type: 'status' | 'review' | 'certificate' | 'assignment' | 'user' | 'document';
  tone: 'success' | 'warning' | 'error' | 'info';
  title: string; body?: string; ref?: string; createdAt: string; readAt?: string; href?: string;
}

/** AUDIT_EVENT (append-only). */
export interface AuditEvent {
  id: string; occurredAt: string; affiliateId: string; tenantId: string | null;
  actorId: string | null; actorRole: Role | 'system'; action: string; category: string;
  objectType: string; objectId: string; objectLabel: string; context?: string; source: 'Customer Portal' | 'SGS Operations Console' | 'System';
  previousValue?: Record<string, unknown>; newValue?: Record<string, unknown>;
  /** Groups the events of one user action (designs/10 SgsAuditDetail). */
  correlationId?: string;
}

export interface MockDb {
  version: number;
  affiliates: Affiliate[];
  tenants: Tenant[];
  users: AppUser[];
  userScopes: UserScope[];
  sgsAssignments: SgsAssignment[];
  scopes: Scope[];
  frameworks: Framework[];
  requirements: Requirement[];
  expectedEvidence: ExpectedEvidence[];
  workspaces: Workspace[];
  evidence: Evidence[];
  evidenceVersions: EvidenceVersion[];
  evidenceMappings: EvidenceMapping[];
  requirementOwners: RequirementOwner[];
  serviceRequests: ServiceRequest[];
  srDocuments: SrDocument[];
  reviews: Review[];
  reviewItems: ReviewItem[];
  clarifications: Clarification[];
  findings: Finding[];
  reviewNotes: ReviewNote[];
  srNotes: SrNote[];
  certifications: Certification[];
  infoRequests: InfoRequest[];
  notifications: Notification[];
  auditEvents: AuditEvent[];
  emails: MockEmail[];
}

/** A demo persona is simply a user id; the session is resolved from the user record. */
export interface Session { user: AppUser; portal: Portal; tenant: Tenant | null; affiliate: Affiliate }
