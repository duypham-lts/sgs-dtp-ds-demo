# SGS Digital Trust Platform (DTP) — instructions for Claude Code

Read this file first in every session. The team speaks Vietnamese; answer in Vietnamese unless asked otherwise. Code, identifiers and commit messages stay in English.

## What we are building

SGS DTP is a B2B assurance-journey platform (a lightweight GRC, not a full GRC). Customers define scopes, activate frameworks (ISO/IEC 27001, 42001, 27701, 22301, TISAX…), collect evidence per control, book SGS services (certification, training, gap analysis, implementation support), respond to SGS reviews, and share certificates through a Digital Trust Passport. The system never concludes compliance on its own: readiness is an indicator, SGS auditors decide.

Two portals, one component library:

- **Customer Portal** (`data-theme="customer"`): Customer Admin, Customer User, Customer Viewer.
- **SGS Operations** (`data-theme="sgs-ops"`): SGS Admin, SGS User, SGS Auditor/Assessor, SGS Consultant.

Access is always limited by tenant, SGS affiliate and scope/service assignment. Full context: `docs/product-context.md`. MVP scope: `docs/use-cases.md` — sheet **UC List** is in scope; **Future Release** and **OOS** are not. Do not build Phase 2 items unless asked.

## Target stack (baseline)

Next.js (App Router, TypeScript) front end · NestJS modular monolith + worker · PostgreSQL with row-level security per tenant · Azure Blob Storage for evidence · Redis · Entra External ID for auth · Azure Container Apps. Data model: `docs/er-model.md` (tables AFFILIATE, TENANT, APP_USER, SCOPE, FRAMEWORK, REQUIREMENT, EVIDENCE_WORKSPACE, EVIDENCE, SERVICE_REQUEST, REVIEW, FINDING, CERTIFICATION…). Every write to a sensitive object also writes an AUDIT_EVENT.

## Sources of truth, in order

1. **Figma** (not in this repo). If a Figma link or screenshot is provided, it wins.
2. **`designs/`** — the approved screen designs, one folder per module. Start with `designs/<module>/INDEX.md`, look at `screenshots/*.png`, then read the matching `*.dc.html` for exact props and copy.
3. **`design-system/graphite/`** — Graphite DS: tokens, component docs and the reference component bundle.
4. **`docs/ui-guidelines.md`** (EP UI Guidelines) plus `docs/typography-4x4.md`, `docs/spacing-tokens.md`, `docs/status-icons.md`, `docs/brand-colors-and-tokens.md`.
5. **`prototype/index.html`** — an early clickable prototype. Use it for interaction ideas only (flows, empty states, snackbars). Where it differs from `designs/` (top bar items, sidebar, spacing), `designs/` is right.

Unresolved design questions live in `design-system/graphite/Open-questions.md`. When code depends on one of them, pick the documented default and leave a `// TODO(open-question #N)` comment.

## How to read a design file (`*.dc.html`)

- `<x-import component-from-global-scope="Graphite.TopBar" variant="home" …>` = use the Graphite component `TopBar` with those props. Attribute names are kebab-case versions of the props in `design-system/graphite/dist/components/index.d.ts`.
- `{{name}}` values are bound data defined in the file's script/data block; treat them as sample data.
- Inline `style` on plain `<div>`s is layout (flex, gaps, widths). Translate it to CSS modules or the layout primitives, keeping the pixel values.
- `data-theme` on a wrapper switches the portal theme.
- The `.dc.html` files need the Design canvas runtime to render, which is not included. Use the PNG screenshots to see them.

## Porting the Graphite components

`design-system/graphite/dist/components/bundle.js` + `bundle.css` are the reference implementation (React, global `Graphite` namespace); `index.d.ts` is the public API; `components/<Name>/README.md` has usage rules. When starting the Next.js app, port them into a `packages/graphite` (or `src/components/graphite`) TypeScript library with the same names and props, and import tokens from `dist/tokens.css` / `tokens.json`. Keep the API identical so designs map 1:1.

## Non-negotiable UI rules

- Font Roboto; Chinese/Arabic/Hebrew fall back to Noto Sans (Noto Sans TC for Traditional Chinese — the first market is Taiwan).
- 4×4 type grid: font-size and line-height divisible by 4; only exception 14/20. Use the type tokens, never ad-hoc sizes.
- Orange `#CA4300` = action: primary CTA, links, the required `*`, and **form validation errors**. Red `#DA1E28` = record status (Missing Info, Rejected). Never swap them.
- Input labels and help text: `#3C525D`, Regular weight, never bold. One message under a field at a time; the error replaces the help text and disappears as soon as the user edits.
- No borders/strokes on containers, top bar, menus or sections unless the design has one. Separate with layer backgrounds.
- Disabled = the standard disabled tokens only.
- Field widths come from tokens (S / M / L / XL), never stretch with the screen, max ~640px. Inside a container, align fields to the widest one.
- Feedback after an action = Snackbar, bottom centre, auto-dismiss. Modals dim the whole background.
- SR create/edit/detail pages: three columns; only the middle column scrolls. Breakpoints and column widths: `docs/ui-guidelines.md` → Responsiveness and Breakpoints (1440–1980, 1280–1439, 1178–1279, 768–1177, mobile 412/320). Big area min 960px, max 1980px, content 95%.
- Status is never colour-only: icon + text, or an `aria-label` + tooltip when icon-only. Every icon-only control has an accessible name. Touch targets ≥ 48px.

## Working agreements

- Before building a screen, list the design files you are implementing and the use-case IDs (UC-xxx-000) it covers.
- Compare your rendered page against the screenshot before calling a screen done.
- Do not publish `docs/` or `designs/*.dc.html` anywhere public: they contain client material. The preview site (`scripts/build-site.sh`) only ships the prototype and screenshots, behind Entra sign-in.
- Never commit secrets. Configuration goes through environment variables.
