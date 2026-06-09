# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Tnote (티노트) is a Korean **학원** (private academy) student-management SaaS: students, courses, exams, retakes (재시험), clinic attendance, assignments, consultations, calendar, and SMS messaging. Multi-tenant — every academy is a **workspace**. Next.js 16 App Router + React 19 + Supabase (Postgres). All user-facing strings are Korean.

## Commands

```bash
bun dev            # dev server (Turbopack via next dev)
bun run build      # production build
bun run typecheck  # tsc --noEmit
bun run lint       # biome check (read-only)
bun run lint:fix   # biome check --write (autofix + organize imports)
bun run check      # typecheck + lint + format:check — run this before considering work done
bun test           # run all *.test.ts (node:test API, executed by Bun)
bun test src/shared/lib/utils/date.test.ts   # single test file
```

Notes:
- Tests import from `node:test`/`node:assert` but **must be run with `bun test`**, not `node --test` (the date tests assert against the Asia/Seoul timezone and Bun handles the TS + intl setup transparently).
- Package manager is **Bun** (`bun.lock`). React Compiler is enabled (`reactCompiler: true`) — do not hand-add `useMemo`/`useCallback` purely for referential stability.

## Architecture

### Multi-tenancy is the central invariant
Every domain row carries a `workspace` column. **Every query must filter by `session.workspace`**, and every insert must stamp it. This is enforced in application code, not (solely) by RLS — forgetting it leaks data across academies. The CRUD factories and most handlers apply `.eq("workspace", session.workspace)` for you; preserve that whenever you touch a query by hand.

### Auth = Supabase Auth (not custom JWT)
There is **no custom JWT and no `jsonwebtoken` dependency**. Auth is Supabase Auth via cookie sessions (`@supabase/ssr`):
- Users have no real email — login maps phone → `` `${phoneNumber}@tnote.local` ``. `getSession()` strips the `@tnote.local` suffix back to a phone number.
- `role` (`"owner" | "admin" | "student"`) and `workspace` live in Supabase `user_metadata`, read via `getSession()` in `src/shared/lib/supabase/auth.ts`.
- Centralized request gating lives in **`src/proxy.ts`** (Next.js 16's renamed middleware). It refreshes the Supabase session on every request, returns 401 for unauthenticated API calls / redirects pages to `/login`, and confines `student`-role users to `/`, `/my/*`, and the `/api/my/*` + `/api/auth/*` endpoints. Handlers still re-check auth/roles via `withLogging`.

### Two Supabase clients — pick deliberately (`src/shared/lib/supabase/`)
- `createClient()` (server, anon key, cookie-scoped) — the default. Subject to RLS and the logged-in user's permissions. Used inside `withLogging` handlers as `ctx.supabase`.
- `createAdminClient()` (service-role key, **bypasses RLS**) — only for privileged operations: creating/deleting Supabase Auth users (`auth.admin.*`), registration, password resets. When you use it, you are responsible for workspace scoping manually.
- `createClient()` in `client.ts` is the browser client (rarely used directly; data flows through the API + React Query instead).

### API layer (`src/app/api/**` + `src/shared/lib/api/`)
Route handlers are wrapped, never bare:
- **`withLogging(handler, { resource, action, allowedRoles, requireAuth })`** — resolves the session, enforces `allowedRoles`, injects `ApiContext { request, session, supabase, params }`, and logs every request to Axiom via `after()`. Throwing `new Error("Unauthorized")` / `"Forbidden")"` inside a handler is converted to 401/403 with Korean messages; any other throw becomes a 500. Return Korean error bodies as `NextResponse.json({ error }, { status })`. `withPublicLogging` is the unauthenticated variant.
- **`createCrudRoute.ts`** factories — `createListHandler`, `createDetailHandler`, `createCreateHandler`, `createUpdateHandler`, `createDeleteHandler`. Use these for standard table CRUD; they auto-apply the workspace filter/stamp, map Postgres `23505` → 409, and standardize response shapes (`{ data }` for reads, `{ success, data }` for writes). Reach for a hand-written handler only when logic exceeds a simple table op (see `api/students/route.ts` for the pattern).
- Role guards: `["owner", "admin"]` for teacher/staff endpoints; `["student"]` (or include it) for the student-facing `my/*` endpoints.

### Frontend data layer
- **React Query** for all server state. `createQuery`/`createMutation` (`src/shared/lib/hooks/`) are thin factories over `fetchWithAuth`; simpler features use them, complex ones write `useQuery`/`useMutation` directly (often with optimistic `onMutate`).
- **`fetchWithAuth`** (`src/shared/lib/api/fetchWithAuth.ts`) is the only fetch wrapper — sends cookies and hard-redirects to `/login` on 401. Always go through it, never raw `fetch`.
- **`QUERY_KEYS`** (`src/shared/lib/queryKeys.ts`) is the single source of truth for query keys and cache invalidation. Add new keys here; mutations invalidate by referencing them.
- **Jotai** for ephemeral client/UI state (modals, form drafts, filters).

### Feature-folder convention (`src/app/(pages)/<feature>/`)
Route groups `(auth)`, `(legal)`, `(pages)` organize URLs without path segments. Within a feature:
- `(atoms)/` — Jotai atoms (modal/form/filter state)
- `(hooks)/` — React Query hooks (one file per query/mutation)
- `(components)/` — feature-local components
Shared/cross-feature code lives in `src/shared/` (`components/ui`, `components/common`, `lib/`, `types/`, `hooks/`). Import via the `@/` alias (→ `src/`).

### The shared "workflow" abstraction (`src/shared/lib/workflow/`)
**Retakes** (재시험) and **assignment-tasks** are two instances of one generic lifecycle: list → postpone → complete → absent → edit-date → history → undo, plus management-status. `workflow/` exports factories (`createWorkflowList`, `createWorkflowComplete`, `createWorkflowPostpone`, `createWorkflowModalAtoms`, …) that both `(pages)/retakes` and `(pages)/assignments` build their hooks/atoms on top of. When changing one of these lifecycles, check whether the change belongs in the shared factory (affecting both) or the feature wrapper (one only). Their API routes mirror each other: `api/retakes/[id]/*` and `api/assignment-tasks/[id]/*`.

### Assignment status duality (`src/shared/lib/utils/studentAssignments.ts`)
The DB (`StudentAssignments`/`StudentAssignmentHistory`) stores English statuses (`pending|completed|absent|insufficient|not_submitted`) while the UI/submission flow uses Korean labels (`검사예정|완료|결석|미흡|미제출`). `toStudentAssignmentStatus` / `toAssignmentSubmissionStatus` convert between them — route status values through these helpers rather than hardcoding either vocabulary.

### Cross-cutting infrastructure (`src/shared/lib/`)
- **Logging** (`utils/logger.ts`) — structured logs to Axiom (when `AXIOM_TOKEN` set), console only in dev. Emitted via `after()` so it never blocks the response. `withLogging` wires this automatically.
- **SMS** (`services/sms.ts`, `services/messageSender.ts`) — Solapi. Credentials are **per-workspace, stored in the DB** (managed at `/api/settings/solapi`), passed explicitly as `SolapiCredentials` — they are **not** global env vars.
- **Pagination** (`supabase/pagination.ts`) — `fetchAllRows(build)` loops `.range()` to defeat Supabase's 1000-row REST cap. Use it for any unbounded workspace-wide read; the builder must apply a stable `.order()`.
- **Rate limiting** (`utils/rateLimit.ts`) — in-memory sliding window, applied to auth endpoints (`checkAuthRateLimit`).
- **Validation/format utils** (`utils/`) — `phone.ts` (normalize/validate, strip hyphens — phone numbers are stored without hyphens), `password.ts`, `date.ts` (Korean/Asia-Seoul formatting). Prefer these over inline logic.

### Styling & theming
Tailwind CSS v4 (config in `tailwind.config.ts`, imported from `globals.css`). Colors are CSS-variable **design tokens** (`--solid-*`, `--background-*`, `--text-*`, etc.) defined in `globals.css` with light/dark values; use the semantic Tailwind classes, not raw hex. Dark mode is class-based with an inline FOUC-prevention script in `layout.tsx` reading `localStorage["tnote-theme"]`.

#### "Toss풍" design system (2026-06 redesign — keep these invariants)
Friendly / rounded / colorful / soft. Floating white cards on a warm off-white page; the look comes from soft colored shadows + big radius + per-feature pastel accents + generous type. All values are oklch tokens in `globals.css` (`@theme inline` + `:root`/`.dark`). Light/dark/print must all keep working.
- **Floating cards + big radius.** `--radius: 1rem` (ladder: sm10 / md12 / lg16 / xl24 / 2xl32). Cards/inputs/dialogs use the named radii; **buttons / chips / badges / search are `rounded-full` pills** (but never tall inputs — that reads toy-like). Surfaces lean on shadow, not borders (`border-transparent` + shadow on Card/DataTable/SectionCard).
- **Soft elevation, 4 tiers + brand glow.** `--shadow-xs/-sm/-md/-lg` + `--shadow-brand` (mode-aware via `--elevation-*`; light = soft brand-tinted, dark = deep black + top-highlight inset). Tier-1 resting card = `shadow-sm`; interactive hover = `shadow-md + -translate-y-0.5`; Tier-2 (Dialog/Sheet/Popover) = `shadow-lg`; primary CTA / today-pill add `shadow-brand`. Never freelance a shadow.
- **Color is welcome, but channeled.** Brand blue + a per-feature pastel set: `--feature-{calendar|messages|retakes|assignments|students|courses|clinics|admins}` (+`-soft`). These are **chrome accents only** (icon wells / section headers / nav-active / empty-state gradients) via the shared `toneWell` map (`ui/featureTone.ts`) used by `StatCard` / `SectionCard` / `IconBadge`. The `--solid-*` 11-hue palette stays **tags-only** — the two channels never cross. Soft semantic tints: `--{success|warning|destructive}-soft`, `--primary-soft` (pastel bg; text uses the solid hue or `*-soft-foreground` for AA).
- **Saturation/meaning rules kept.** Charts use `--chart-1..5` / `--chart-grid` / `--sparkline-fill` (no inline hex). Calendar events map to tokens (course→primary, retake→`--feature-retakes`/destructive, assignment→`--feature-assignments`/warning, clinic→`--event-clinic`; completed→success, absent→neutral). Pastel = background only, never text-on-pastel below AA.
- **Generous type.** Page title `text-2xl font-bold tracking-[-0.02em]`; section/card title `text-base font-semibold`; big metric `text-3xl font-bold tabular-nums`; body/table `text-sm`; reading surfaces `text-[15px]`; meta `text-xs`. `font-bold` is fine for titles/metrics/display; chrome default is `font-semibold`. Numbers tabular by default (`@layer base`; `numeric` flag on `DataTable` columns).
- **Soft motion.** `--motion-fast/base/slow` + `--ease-spring` (gentle overshoot) / `--ease-out-soft`. Buttons press `active:scale-[0.97]`; cards hover-lift; focus is always `focus-visible:ring-[3px] ring-ring/50`. All transforms gated by the `prefers-reduced-motion` block.
- **Filled inputs.** Input/Select/Textarea/Search rest as `bg-muted/60 border-transparent` and brighten to `bg-card border-ring` on focus.
- **Shell + IA.** Desktop = restyled `Sidebar` (pill active `bg-primary-soft text-primary`, grouped sections, `shadow-brand` logo well); mobile (`<md`) = `MobileBottomNav` (top destinations + "더보기" opens the sidebar Sheet for overflow/user-menu). `Container` has a `width="narrow"` reading variant and bottom padding for the mobile nav.
- **Reusable primitives:** `StatCard`(=`StatTile` alias; `tone` + optional chart slot), `SectionCard`, `IconBadge`, `Chip`-style `FilterButton` (pill, `aria-pressed`), `MetricBadge`, `DateChip`, gradient `EmptyState` (`tone`). Verify every elevation/color change in **light + dark + print** (print forces white bg, strips shadows).

## Environment variables

Actually consumed by the code (the README's `JWT_*` and `SOLAPI_*` entries are stale — JWT is unused, Solapi creds are per-workspace in the DB):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase client
- `SUPABASE_SERVICE_ROLE_KEY` — admin client (server only)
- `AXIOM_TOKEN`, `AXIOM_DATASET` (optional) — logging; logging is a no-op without the token

## Database

Schema is **managed in Supabase, not in this repo** (no migrations directory). A Supabase MCP server is configured (`.mcp.json`) for inspecting/querying the live schema. Tables are PascalCase (`Users`, `Workspaces`, `Courses`, `CourseEnrollments`, `ConsultationLogs`, `StudentTags`, `StudentTagAssignments`, `StudentAssignments`, `StudentAssignmentHistory`, `Retakes`, `Exams`, `Clinics`, …). Students and staff are both rows in `Users` distinguished by `role`.

## Conventions

- **Code style**: Biome (`biome.json`) — 2-space indent, 120-col, double quotes, semicolons, trailing commas. `noExplicitAny` is **off** (the factories use `any` deliberately); `useExhaustiveDependencies` is off (React Compiler). Run `bun run lint:fix` before finishing.
- `CLAUDE.md`, `.claude/`, and `.mcp.json` are gitignored — this file is local-only.
