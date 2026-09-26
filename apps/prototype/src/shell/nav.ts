// Sidebar navigation per role: the unified nav from docs/prototype-plan.md §2.2, built from the
// AppSidebar data arrays in designs/ (ids, labels and icons copied from the .dc.html files).
import type { SidebarItem } from '@sgs/graphite';
import type { Role } from '@/mock';

type Section = { label?: string; items: SidebarItem[] };

const customerRequests = (): SidebarItem => ({
  id: 'sr', label: 'Service Requests', icon: 'task', children: [
    { id: 'sr-all', label: 'All requests', href: '/service-requests' },
    { id: 'sr-cert', label: 'Certification Services', href: '/service-requests/certification' },
    { id: 'sr-train', label: 'Training Courses', href: '/service-requests/training' },
    { type: 'label', label: 'Other services' },
    { id: 'sr-gap', label: 'Gap Analysis', href: '/service-requests/gap-analysis' },
    { id: 'sr-impl', label: 'Implementation Support', href: '/service-requests/implementation-support' },
  ],
});

function customerNav(role: Role): Section[] {
  const main: SidebarItem[] = [
    { id: 'home', label: 'Home', icon: 'dashboard', href: '/' },
    { id: 'scopes', label: 'Scopes', icon: 'category', href: '/scopes' },
    { id: 'ws', label: 'Workspaces', icon: 'folders', href: '/workspaces' },
    { id: 'docs', label: 'Documents', icon: 'document--multiple-01', href: '/documents' },
    { id: 'reviews', label: 'Reviews', icon: 'view', href: '/reviews' },
    customerRequests(),
    { id: 'certs', label: 'Certifications', icon: 'checkmark', href: '/certifications' },
    { id: 'training', label: 'Training', icon: 'education', href: '/training' },
  ];
  // UC-AUD-004 (own organisation activity log) is Customer Admin only (design-questions Q24, confirmed).
  if (role === 'customer_admin') main.push({ id: 'audit', label: 'Audit Logs', icon: 'catalog', href: '/audit-logs' });
  main.push({ id: 'settings', label: 'Settings', icon: 'settings', href: '/settings' });
  const sections: Section[] = [{ items: main }];
  if (role === 'customer_admin') {
    // No "Workspace access": access is granted per scope (design-questions Q17, confirmed).
    sections.push({ label: 'Administration', items: [
      { id: 'users', label: 'Users', icon: 'user--multiple', href: '/admin/users' },
    ] });
  }
  return sections;
}

function sgsNav(role: Role): Section[] {
  if (role === 'sgs_consultant') {
    return [{ items: [
      { id: 'home', label: 'Home', icon: 'dashboard', href: '/ops' },
      { id: 'asg', label: 'My assignments', icon: 'user--access', children: [
        { id: 'asg-gap', label: 'Gap Analysis', href: '/ops/my-assignments/gap-analysis' },
        { id: 'asg-impl', label: 'Implementation Support', href: '/ops/my-assignments/implementation-support' },
      ] },
      { id: 'fw', label: 'Frameworks', icon: 'catalog', href: '/ops/frameworks' },
      { id: 'settings', label: 'Settings', icon: 'settings', href: '/ops/settings' },
    ] }];
  }
  if (role === 'sgs_auditor') {
    return [{ items: [
      { id: 'home', label: 'Home', icon: 'dashboard', href: '/ops' },
      { id: 'aud', label: 'My audits', icon: 'task', href: '/ops/audits' },
      { id: 'settings', label: 'Settings', icon: 'settings', href: '/ops/settings' },
    ] }];
  }
  const sections: Section[] = [{ items: [
    { id: 'home', label: 'Home', icon: 'dashboard', href: '/ops' },
    { id: 'req', label: 'Requests', icon: 'task', children: [
      { id: 'req-all', label: 'All requests', href: '/ops/requests' },
      { id: 'req-cert', label: 'Certification', href: '/ops/requests/certification' },
      { id: 'req-train', label: 'Training', href: '/ops/requests/training' },
      { type: 'label', label: 'Other services' },
      { id: 'req-gap', label: 'Gap Analysis', href: '/ops/requests/gap-analysis' },
      { id: 'req-impl', label: 'Implementation Support', href: '/ops/requests/implementation-support' },
    ] },
    { id: 'certs', label: 'Certifications', icon: 'checkmark', href: '/ops/certifications' },
    { id: 'cust', label: 'Customers', icon: 'user--multiple', href: '/ops/customers' },
    { id: 'fw', label: 'Frameworks', icon: 'catalog', href: '/ops/frameworks' },
    { id: 'asg', label: 'Assignments', icon: 'user--access', href: '/ops/assignments' },
    // Audit trail is SGS Admin only (UC-AUD-002).
    ...(role === 'sgs_admin' ? [{ id: 'audit', label: 'Audit Logs', icon: 'document' as const, href: '/ops/audit-logs' }] : []),
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/ops/settings' },
  ] }];
  // User administration is SGS Admin only (UC-USR-001).
  if (role === 'sgs_admin') sections.push({ label: 'Administration', items: [{ id: 'users', label: 'Users', icon: 'user--multiple', href: '/ops/admin/users' }] });
  return sections;
}

/** Counts shown as sidebar badges, keyed by nav item id (designs: attention badge + accessible label). */
export type NavBadges = Partial<Record<string, { count: number; label: string }>>;

export function navFor(role: Role, badges: NavBadges = {}): Section[] {
  const sections = role.startsWith('customer_') ? customerNav(role) : sgsNav(role);
  const put = <T extends { id?: string; badge?: unknown; badgeTone?: string; badgeLabel?: string }>(it: T): T => {
    const b = it.id ? badges[it.id] : undefined;
    return b && b.count > 0 ? { ...it, badge: b.count, badgeTone: 'attention', badgeLabel: b.label } : it;
  };
  return sections.map((sec) => ({ ...sec, items: sec.items.map((it) => ({ ...put(it), children: it.children?.map(put) })) }));
}

const SR_NAV: Record<string, { customer: string; sgs: string }> = {
  certification: { customer: 'sr-cert', sgs: 'req-cert' }, training: { customer: 'sr-train', sgs: 'req-train' },
  gap_analysis: { customer: 'sr-gap', sgs: 'req-gap' }, implementation_support: { customer: 'sr-impl', sgs: 'req-impl' },
};

/** Customer: requests waiting for the customer. SGS Admin/User: new requests to triage. Consultant/Auditor: assigned work not started. */
export function badgesFor(role: Role, requests: { category: string; status: string }[], extra: NavBadges = {}): NavBadges {
  const out: NavBadges = { ...extra };
  const add = (id: string, label: string) => { const b = out[id] ?? { count: 0, label }; out[id] = { count: b.count + 1, label }; };
  for (const r of requests) {
    if (role.startsWith('customer_') && r.status === 'information_requested') { add('sr', 'requests need action'); add(SR_NAV[r.category].customer, 'needs action'); }
    if ((role === 'sgs_admin' || role === 'sgs_user') && r.status === 'submitted') { add('req', 'requests need triage'); add(SR_NAV[r.category].sgs, 'to triage'); }
    if (role === 'sgs_auditor' && r.status === 'assigned') add('aud', 'audits to start');
  }
  return out;
}

/** The sidebar item whose href is the longest prefix of the path. */
export function activeNavId(sections: Section[], pathname: string): string | undefined {
  let best: { id: string; len: number } | undefined;
  const consider = (id: string | undefined, href: string | undefined) => {
    if (!id || !href) return;
    const match = href === '/' || href === '/ops' ? pathname === href : pathname === href || pathname.startsWith(href + '/');
    if (match && (!best || href.length > best.len)) best = { id, len: href.length };
  };
  for (const s of sections) for (const it of s.items) {
    consider(it.id, it.href);
    for (const c of it.children ?? []) consider(c.id, c.href);
  }
  return best?.id;
}
