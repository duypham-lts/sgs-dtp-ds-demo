// Access boundaries (UC-ROL-001): tenant, SGS affiliate, scope assignment and service assignment.
// Pure functions over the db so they can be unit-tested and later mirrored by RLS policies.
import type { MockDb, Session, ServiceRequest, Workspace } from './types';

const CONSULTING = new Set(['gap_analysis', 'implementation_support']);

/** Tenants the session may see at all. */
export function visibleTenantIds(db: MockDb, s: Session): Set<string> {
  const u = s.user;
  switch (u.role) {
    case 'customer_admin':
    case 'customer_user':
    case 'customer_viewer':
      return new Set(u.tenantId ? [u.tenantId] : []);
    case 'sgs_admin':
    case 'sgs_user':
      return new Set(db.tenants.filter((t) => t.affiliateId === u.affiliateId).map((t) => t.id));
    case 'sgs_consultant':
      // Consultants see only customers assigned to them (UC-ACC-001).
      return new Set(db.sgsAssignments.filter((a) => a.userId === u.id && a.isActive).map((a) => a.tenantId));
    case 'sgs_auditor':
      // Auditors see a customer only through a request assigned to them.
      return new Set(db.serviceRequests.filter((r) => r.assigneeId === u.id).map((r) => r.tenantId));
  }
}

/** Service requests the session may see (UC-SRQ-002). */
export function canSeeRequest(db: MockDb, s: Session, r: ServiceRequest): boolean {
  const u = s.user;
  if (!visibleTenantIds(db, s).has(r.tenantId)) return false;
  switch (u.role) {
    case 'customer_admin':
      return true;
    case 'customer_user':
    case 'customer_viewer':
      // Scope-bound requests follow scope access; requests without a scope (training) are visible to the tenant.
      return !r.scopeId || visibleScopeIds(db, s).has(r.scopeId);
    case 'sgs_admin':
    case 'sgs_user':
      return r.status !== 'draft';
    case 'sgs_consultant':
      return CONSULTING.has(r.category) && r.assigneeId === u.id;
    case 'sgs_auditor':
      return r.category === 'certification' && r.assigneeId === u.id;
  }
}

/** Scopes the session may see. Customer Admin: all of the tenant; users/viewers: assigned (USER_SCOPE). */
export function visibleScopeIds(db: MockDb, s: Session): Set<string> {
  const u = s.user;
  const tenants = visibleTenantIds(db, s);
  if (u.role === 'customer_user' || u.role === 'customer_viewer') {
    return new Set(db.userScopes.filter((x) => x.userId === u.id).map((x) => x.scopeId));
  }
  if (u.role === 'sgs_consultant' || u.role === 'sgs_auditor') {
    // Read-only, and only the scopes their requests are about.
    return new Set(db.serviceRequests.filter((r) => r.assigneeId === u.id && r.scopeId).map((r) => r.scopeId!));
  }
  return new Set(db.scopes.filter((x) => tenants.has(x.tenantId)).map((x) => x.id));
}

/** Users the session may administer or list (UC-USR-001). */
export function visibleUserIds(db: MockDb, s: Session): Set<string> {
  const u = s.user;
  if (u.role === 'customer_admin') return new Set(db.users.filter((x) => x.tenantId === u.tenantId).map((x) => x.id));
  if (u.role === 'sgs_admin') {
    const tenants = visibleTenantIds(db, s);
    return new Set(db.users.filter((x) => x.affiliateId === u.affiliateId && (x.tenantId === null || tenants.has(x.tenantId))).map((x) => x.id));
  }
  return new Set([u.id]);
}

export function isCustomer(s: Session) { return s.portal === 'customer'; }
export function canEdit(s: Session) { return s.user.role !== 'customer_viewer'; }

/** Who can read a workspace and its evidence (UC-EVD-003/020, UC-REV-003):
 * customers through scope access; a consultant while an assigned GA/IS request on it is in progress
 * (access ends when the request is completed, design-questions Q15); an auditor while an assigned
 * certification request on it is in progress. SGS Admin/User never read evidence (designs/03 TenantScopes). */
export function canReadWorkspace(db: MockDb, s: Session, ws: Workspace): boolean {
  const u = s.user;
  if (u.role.startsWith('customer_')) return ws.tenantId === u.tenantId && visibleScopeIds(db, s).has(ws.scopeId);
  if (u.role === 'sgs_consultant') return db.serviceRequests.some((r) => r.workspaceId === ws.id && r.assigneeId === u.id && CONSULTING.has(r.category) && r.status === 'in_progress');
  if (u.role === 'sgs_auditor') return db.serviceRequests.some((r) => r.workspaceId === ws.id && r.assigneeId === u.id && r.category === 'certification' && r.status === 'in_progress');
  return false;
}
/** Customers who can change evidence (not Viewers, not SGS). */
export function canWriteEvidence(s: Session): boolean { return s.user.role === 'customer_admin' || s.user.role === 'customer_user'; }
