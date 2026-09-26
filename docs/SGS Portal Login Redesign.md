# Home dashboards (module 12)

Design: **DTP – Home dashboards** · https://claude.ai/artifact/69xRNqv3bekReMKGM466vY
Graphite DS version: **1790347709-dd39**

## Scope and use cases

| UC | Title | Phase in UC list | Decision |
|---|---|---|---|
| UC-CKP-001 | View Customer Cockpit | Phase 2 · "Suggest to be included in P1" | **Build in P1** as the customer Home, lean version (below) |
| UC-OPS-001 | View SGS Operations Dashboard | Phase 2 · "Suggest to be included in P1" | **Build in P1** as the SGS Admin / SGS User Home |
| UC-CKP-003 | View Assigned Customer Cockpit (SGS assessor/auditor) | PRESALE WBS GAP | **Not built.** Auditor and Consultant get a personal work Home instead (below) |
| UC-CKP-002 | Portfolio matrix | Phase 2 | Not built |
| UC-JRN-004, UC-RDN-001…005 | Journey stages, readiness engine, gap rules | Phase 2 | Not built. Home uses **evidence coverage** only |

> Confirm with the client that CKP-001 and OPS-001 are pulled into P1 in this lean form.

## Routing

`/` (after sign-in) opens the Home for the user's role. Sidebar item **Home** (`id: 'home'`) is active.

| Role | Artboard |
|---|---|
| Customer Admin | `Main.dc.html` (normal) · `CustomerHomeEmpty.dc.html` (tenant has no scope yet) |
| Customer User | `CustomerUserHome.dc.html` |
| SGS Admin, SGS User | `SgsAdminHome.dc.html` |
| SGS Auditor/Certification | `AuditorHome.dc.html` |
| SGS Consultant | `ConsultantHome.dc.html` |

All data is filtered by the normal access rules: tenant; for Customer User only **assigned scopes**; for SGS Admin/User the **affiliate**; for Auditor/Consultant only **requests assigned to them**. Home shows no data a role cannot open elsewhere.

## Customer Admin / Customer User

Layout top to bottom: greeting · 4 KPI tiles · (Needs your attention | Suggested next step) · **Coverage by control group** · Workspaces · Service requests.

**Greeting** — "Good morning, {firstName}" + tenant name. Customer User adds "· workspaces of the scopes assigned to you".

**KPI tiles** (each is a link to the matching list):

| Tile | Value | Sub-line | Links to |
|---|---|---|---|
| Review items to answer | open clarifications + findings needing response, across open reviews | review name(s) | `/reviews` |
| Workspaces | count | "{n} in audit · {n} certified · {n} preparing" | `/workspaces` |
| Service requests in progress | requests not in a final state | service names | `/service-requests` |
| Active certificate(s) | count | nearest expiry "valid to …" | `/certifications` |

**Needs your attention** — list, most urgent first, max 5 + "show all" if more. Item types and order:
1. Findings needing corrective action (Major before Minor), incl. "not accepted – resubmit"
2. Clarification requests waiting for an answer
3. Evidence **expired** / **expiring within 30 days** (only evidence that has `expires_at`)
4. *(Customer Admin only)* invitations not yet activated

Each item: StatusTag (type) · title · context line (review/request, requirement, workspace) · action link ("Respond", "Upload new version", "Resend"). The action opens the same modal/page used elsewhere.
Empty: EmptyState sm "You're all caught up".

**Suggested next step** — one card, deterministic rule (no readiness engine):
- if an open review has items to answer → skip (already in the list)
- else the workspace with the **lowest coverage** that has no open service request → "{workspace} is at {n}% · {missing} requirements still need their mandatory evidence" + "Open workspace"
- else if a workspace is ≥ 100 % coverage and has no certification request → "Ready to request certification?" + "Request certification"
- else hide the card.

**Coverage by control group** — for ONE workspace: the one with an open certification request, else the one with the lowest coverage. One row per top-level group (dimension/clause) of the framework: code chip · group name · ProgressBar · %. % = requirements of that group (within the workspace tier) that have all mandatory evidence ÷ requirements of that group. Link "Open workspace". Hide when the customer has no workspace.

**Workspaces** — DataTable: Workspace (framework · version · tier / scope) · Evidence coverage (ProgressBar "x of y") · **Certification progress** stepper `Preparing → Requested → In audit → Certified`. Stage from the workspace's latest certification request: none/Rejected = Preparing · Submitted or Assigned = Requested · In progress or Audit completed = In audit · Certificate issued = Certified. Current stage orange dot + medium weight; passed stages green; `aria-label="Stage: …"` on the list. Caption: "Evidence coverage is preparation progress, not a compliance decision." Link "All workspaces".

**Service requests** — DataTable of requests not in a final state: Request id · Service · Status. Link "All requests".

**New customer (`CustomerHomeEmpty`)** — when the tenant has **no scope**: 3 numbered steps (Create scope → Link framework → Invite users) with buttons. Customer User with no assigned scope: EmptyState "No scopes assigned yet — ask your Customer Admin".

TopBar (Q18): customer TopBar shows only **Request Applications** → `/service-requests`.

## SGS Admin / SGS User

Greeting · 4 KPI tiles · (Team workload | Customer onboarding) · Requests to triage · Audits.

| Tile | Value | Sub-line |
|---|---|---|
| Active customers | tenants in affiliate | "{n} without a Customer Admin yet" |
| Requests to triage | Submitted requests, all services | oldest waiting time |
| Audits open | certification requests Assigned / In progress | "{n} waiting for the customer" |
| Ready for certificate | requests in Audit completed | request id(s) |

**Team workload** — one row per SGS Auditor/Certification, SGS Consultant and SGS Trainer/Assessor in the affiliate: Person (name + role) · Audits (open certification requests assigned) · Consulting (open GA + IS assignments) · Training (open training requests assigned). "—" for 0 or not applicable. Purpose: pick who to assign.

**Customer onboarding** — tenants that are not ready yet, with the first blocking step: *No Customer Admin* (no admin invited) · *Admin not activated* (invitation pending/expired) · *No scope yet* (admin active, no scope). Sub-line: when the tenant/invitation/activation happened. Tenants past these steps are not listed; empty → EmptyState sm "All customers are set up".

**Requests to triage** — Request · Customer + service · Waiting (age) · action button ("Assign auditor" for certification/training, "Review" for GA/IS). Sorted oldest first.
**Audits** — Request · Customer + workspace · Auditor · Reviewed (x/y) · Status (Assigned / In progress / Waiting for customer / Ready for certificate).
SGS Admin never sees requirement or evidence content here (only counts and statuses).

## SGS Auditor/Certification

Tiles: Responses to evaluate · Review in progress · Assigned, not started · Ready to close.
**Needs your attention**: responses submitted (corrective actions, clarification answers) → "Evaluate"; assigned requests not started → "Open request". Most recent first.
**Open findings** (beside Needs your attention) — across the auditor's open reviews: Major nonconformity (open) · Minor nonconformity (open, sub-line: how many have a corrective action to evaluate) · Waiting for the customer (clarifications + findings not answered).
**My audits** table: Request · Customer + workspace + tier · Reviewed · To evaluate · Status.

## SGS Consultant

Tiles: Assignments in progress · Report to upload · Completed this year.
**Next up**: GA assignments without a final report → "Upload report"; IS assignments in progress → "Share deliverable".
**Coming up** (beside Next up) — dates from the consultant's open assignments, soonest first: GA on-site dates ("On site · {customer}") and IS period end ("Support period ends"). Date block = month + day.
**My assignments** table: Request · Customer + service · Dates · Status. Caption: workspaces are read only while an assignment is in progress.

## Not in P1 (keep out)
Only widgets built on P1 business data are included. Out: journey stage engine, portfolio matrix, readiness/gap indicators, charts/trends, pipeline and turnaround analytics, SLA timers, overdue handling (removed), certificate expiry alerts (certificate lifecycle is Phase 2 — "valid to" is shown as text only), auditor calendar (certification audit dates are agreed outside the platform in P1).

## Open questions
1. Client confirmation that UC-CKP-001 and UC-OPS-001 move into P1 (lean version).
2. "Expiring within 30 days" threshold for evidence — confirm 30.
