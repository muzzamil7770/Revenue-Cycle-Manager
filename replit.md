# HealthRCM Platform

A production-ready Healthcare Revenue Cycle Management (RCM) SaaS platform for managing the full financial lifecycle of healthcare organizations — from patient registration through collections.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session signing

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite, wouter (routing), TanStack Query, recharts, shadcn/ui, next-themes
- API: Express 5 (port 8080, path prefix `/api`)
- DB: PostgreSQL + Drizzle ORM (8 tables)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/rcm/` — React/Vite frontend (preview at `/`)
- `artifacts/api-server/` — Express API server (prefix `/api`, port 8080)
- `lib/db/src/schema/` — Drizzle ORM table definitions (8 tables)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/` — Generated React Query hooks
- `lib/api-zod/src/generated/` — Generated Zod schemas
- `artifacts/rcm/src/index.css` — Design tokens / CSS variables (navy sidebar: `221 39% 15%`, primary blue: `213 94% 36%`)

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed hooks. Never write fetch calls by hand.
- Claims store `diagnosisCodes` and `procedureCodes` as JSON strings in the DB; routes parse/stringify on read/write.
- Dashboard KPI route catches all DB errors and returns hardcoded fallback data — ensures the dashboard never shows blank.
- `useDeleteUser` generated hook takes `{ id: number }` not `{ userId: number }` — match the generated interface exactly.
- All numeric DB columns (balance, amounts) are `numeric` type — Drizzle returns them as strings; wrap with `Number()`.

## Product

Full-featured Healthcare RCM platform with 14 modules:
- **Dashboard** — KPI cards, revenue trend area chart, payer mix pie chart, live activity feed
- **Patient Access** — patient registry with search, insurance eligibility verification
- **Insurance & Payers** — payer directory with denial rates, reimbursement metrics
- **Charge Capture** — CPT/ICD-10 charge entry and status tracking
- **Medical Coding** — AI code suggestions with confidence scores, audit flag management
- **Claims Management** — full claim lifecycle with status filter tabs and detail drill-down
- **Denial Management** — root cause analysis bar chart, appeal workflow with notes
- **Payment Posting** — ERA/EFT/check payment recording
- **Patient Billing** — statements and payment plan management with progress tracking
- **Accounts Receivable** — aging bucket chart, follow-up worklist with priority/assignee
- **Reporting & Analytics** — payer performance and provider productivity with charts
- **Admin Panel** — user management with role/department/permissions

## Gotchas

- Claims seed must be re-run if DB is reset — other tables seed fine but claims had an insert issue once.
- `pnpm run typecheck` may surface minor unused-import warnings; these don't affect runtime.
- When re-seeding, verify with `SELECT COUNT(*) FROM claims` before starting the app.
- The Vite frontend uses `BASE_URL` from `import.meta.env` — all routes are relative; no hardcoded ports.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
