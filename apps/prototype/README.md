# DTP prototype (Customer Portal + SGS Operations)

Clickable prototype built with Next.js (App Router, TypeScript) on `@sgs/graphite` (`packages/graphite`).
Plan: [docs/prototype-plan.md](../../docs/prototype-plan.md) · Decisions: [docs/decisions.md](../../docs/decisions.md) · Questions for the designer: [docs/design-questions.md](../../docs/design-questions.md).

## Run

```bash
pnpm install            # from the repo root
pnpm dev                # http://localhost:3000
```

| URL | What |
|---|---|
| `/_components` | Every Graphite component, rendered from the official DS previews through the TypeScript port |
| `/` | Customer Portal (Home) |
| `/ops` | SGS Operations (Home) |
| `/login`, `/ops/login` | Sign-in screens (designs/01). Every seeded account uses the password `Demo-Password-01` |
| `/mail` | Demo mailbox: invitation emails with their activation links |

The **Demo** pill (top centre) switches persona (role, tenant, portal) without signing in, and resets the mock data to one of five seed scenarios: Before the audit, Audit in progress (default), Ready to close, Audit closed, Certificate issued (decisions D13). It stands in for Entra sign-in and is not part of the design.

## Modules

| Module | Customer Portal | SGS Operations |
|---|---|---|
| 12 Dashboard (Home) | `/` | `/ops` (Admin/User, Consultant, Auditor) |
| 01 Authentication | `/login`, `/activate` | `/ops/login`, `/ops/activate` |
| 03 Users, customers | `/admin/users` | `/ops/admin/users`, `/ops/customers` |
| 04 Frameworks | — | `/ops/frameworks` |
| 05 Scopes, workspaces, evidence | `/scopes`, `/workspaces`, `/documents` | `/ops/customers/[id]/scopes` |
| 06/07 Gap Analysis, Implementation Support | `/service-requests/gap-analysis`, `/service-requests/implementation-support` | `/ops/requests/…`, `/ops/my-assignments/…` (consultant) |
| 08/09 Certification, audit review | `/service-requests/certification`, `/reviews`, `/certifications` | `/ops/requests/certification`, `/ops/audits` (auditor), `/ops/certifications` |
| 09 Training | `/service-requests/training` | `/ops/requests/training` |
| 10 Audit trail | `/audit-logs` (Customer Admin) | `/ops/audit-logs` (SGS Admin) |
| All requests (no design) | `/service-requests` | `/ops/requests` |

Pages marked **Chưa có design** were built without a design; placeholders say which use cases they will cover.

## Layout

```
src/app/                 routes: (customer)/…, ops/…, %5Fcomponents (= /_components)
src/shell/               AppShell template: TopBar + AppSidebar per role, SPA link handling, page heading
src/mock/                mock domain (types from docs/er-model), seed (names from designs/), access rules, store, API
src/demo/                demo persona session + switcher
src/showcase/            /_components; demos/ and registry.ts are generated (pnpm gen:showcase)
e2e/                     Playwright tests
```

## Checks

```bash
pnpm --filter @sgs/graphite typecheck   # port compiles, API/CSS/tokens identical to design-system/graphite/dist
pnpm --filter @sgs/graphite verify      # every DS preview renders identically with the reference bundle and the port,
                                        # and TopBar interactions (menus, callbacks) behave identically in a DOM
pnpm --filter @sgs/prototype typecheck
pnpm --filter @sgs/prototype test       # mock access rules, coverage, scenarios, audit trail (vitest)
pnpm --filter @sgs/prototype e2e        # Playwright (builds and serves on :3100)
pnpm --filter @sgs/prototype visual     # screenshot every design board and compare (visual-results/, table in docs/prototype-plan.md)
```
