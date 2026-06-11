# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Tnote (티노트) is a Korean **학원** (private academy) student-management SaaS: students, courses, exams, retakes (재시험), clinic attendance, assignments, consultations, calendar, and SMS messaging. Multi-tenant — every academy is a **workspace**. Next.js 16 App Router + React 19 + Supabase (Postgres). All user-facing strings are Korean.

## Commands

```bash
bun dev            # dev server
bun run build      # production build
bun run typecheck  # tsc --noEmit
bun run lint       # biome check (read-only)
bun run lint:fix   # biome check --write (autofix + organize imports)
bun run check      # typecheck + lint + format:check — run this before considering work done
bun test           # run all *.test.ts (node:test API, executed by Bun)
bun test src/shared/lib/utils/date.test.ts   # single test file
```

Notes:
- Tests import from `node:test`/`node:assert` but **must be run with `bun test`**, not `node --test` (the date tests assert against the Asia/Seoul timezone and Bun handles the TS setup transparently).
- Package manager is **Bun** (`bun.lock`). React Compiler is enabled (`reactCompiler: true` in `next.config.ts`) — do not hand-add `useMemo`/`useCallback` purely for referential stability.

## Architecture

### Multi-tenancy is the central invariant
Every domain row carries a `workspace` column. **Every query must filter by `session.workspace`**, and every insert must stamp it. This is enforced in application code, not (solely) by RLS — forgetting it leaks data across academies. The CRUD factories and most handlers apply `.eq("workspace", session.workspace)` for you; preserve that whenever you touch a query by hand.

### Auth = Supabase Auth (not custom JWT)
Auth is Supabase Auth via cookie sessions (`@supabase/ssr`); there is no custom JWT:
- Users have no real email — login maps phone → `` `${phoneNumber}@tnote.local` ``. `getSession()` strips the `@tnote.local` suffix back to a phone number.
- `role` (`"owner" | "admin" | "student"`) and `workspace` live in Supabase `user_metadata`, read via `getSession()` in `src/shared/lib/supabase/auth.ts`.
- Centralized request gating lives in **`src/proxy.ts`** (Next.js 16's renamed middleware). It refreshes the Supabase session on every request, returns 401 for unauthenticated API calls / redirects pages to `/login`, and confines `student`-role users to `/`, `/my/*`, and the `/api/my/*` + `/api/auth/*` endpoints. Handlers still re-check auth/roles via `withLogging`.

### Two Supabase clients — pick deliberately (`src/shared/lib/supabase/server.ts`)
- `createClient()` (anon key, cookie-scoped) — the default. Subject to RLS and the logged-in user's permissions. Available inside `withLogging` handlers as `ctx.supabase`.
- `createAdminClient()` (service-role key, **bypasses RLS**) — only for privileged operations: creating/deleting Supabase Auth users (`auth.admin.*`), registration, password resets. When you use it, you are responsible for workspace scoping manually.
- There is no browser Supabase client — all client data flows through the API routes + React Query.

### API layer (`src/app/api/**` + `src/shared/lib/api/`)
Route handlers are wrapped, never bare:
- **`withLogging(handler, { resource, action, allowedRoles, requireAuth })`** — resolves the session, enforces `allowedRoles`, injects `ApiContext { request, session, supabase, params }`, and logs every request to Axiom via `after()`. Throwing `new Error("Unauthorized")` / `"Forbidden"` inside a handler is converted to 401/403 with Korean messages; any other throw becomes a 500. Return Korean error bodies as `NextResponse.json({ error }, { status })`. `withPublicLogging` is the unauthenticated variant.
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

### App frame & page composition ("Operations Desk" structural IA — 2026-06)
Every `(pages)/*` screen is a **view inside one persistent frame**, not a standalone document. `(pages)/layout.tsx` = `SidebarProvider` › `AppSidebar` (counts-aware rail) + `SidebarInset`[ `PageChromeProvider` › `CommandBar` + page + `MobileBottomNav` ]. There is **no more `AppHeader` and no per-page `<Container>`/`<Header>`** — they were replaced.
- **`CommandBar`** (`common/CommandBar.tsx`) — the persistent top band (`h-14`, sticky): sidebar trigger · pathname-derived breadcrumb (+ record crumb) · the page's teleported primary action slot · `ThemeToggle` · `UserMenu` (hoisted out of the sidebar footer).
- **`PageShell`** (`common/PageShell.tsx`) — replaces `Container`+`Header`. Renders the in-body title/subtitle (or a custom `header` band) + optional `stats` ribbon + the body (`width="desk"` max-w-1600 / `"narrow"` max-w-3xl). It **teleports `actions` into the CommandBar** and pushes `crumb` via **`PageChrome`** (`common/pageChrome.tsx`, a portal-slot context — NOT a data flow). The incremental-migration seam: an un-migrated page is never chrome-less, a migrated one never renders chrome twice (delete its old `Header` action+backLink on migration).
- **`AppSidebar`** count pills on `/retakes` + `/assignments` come from `useHomeStats` (shared cache, **`enabled: isAdmin`** — never fires for students).
- **List archetype** (replaces the old 5-floating-block scaffold on retakes/assignments/students/courses/clinics): `ViewTabs` (`ui/viewTabs.tsx`, counted saved-view spine that absorbs the MetricBadge count row) over `CollectionView` (`ui/collectionView.tsx`, ONE bordered panel fusing toolbar + search + a collapsible advanced-filter region + the flush `DataTable`). Each `XFilters` now renders **only its `FilterRow`s** (no `FilterBar` card, no standalone search); the search binds to the page's search atom in the toolbar; `XList` takes `isLoading`/`empty` and renders `<DataTable flush isLoading empty/>`. The retakes page is the canonical exemplar.
- **Detail archetype** (`common/DetailLayout.tsx`): `DetailHeader` (avatar + name + badges + meta + actions) over `DetailGrid` (two-column: main tables + a `~20rem` MetaSidebar of `StatStrip` + context cards) — replaces the single-column `DashboardCard` stack. Used by students/[id] + courses/[id], passed to `PageShell` via the `header` prop.
- **Dashboard** (`(home)`) is an action-first launchpad: a `StatStrip` ribbon (`ui/statStrip.tsx`, counts→chrome) + "처리 대기" `QueueCard`s (count + CTA into a pre-filtered list) + quick-links + an **"오늘 일정" agenda** (`(home)/(components)/TodayAgenda.tsx` via `(hooks)/useTodayEvents.ts` — reuses `/api/calendar` with start===end===`getTodayKST()`, admin-only; feature-color dots, not icon chips). (The old overview bar chart was removed 2026-06-12 and replaced by this agenda.)
- **Data-atom design language** (the per-item layer): **no avatar/initial chips** — the `Avatar` primitive was tried and removed per preference; identity cells are name-first (font-medium name + stacked muted meta line / tag badges). Every history/activity feed (retake/assignment/clinic history, consultations, message log, required-absent) is built from `FeedItem` (`common/FeedItem.tsx`, a tone-coded **lucide icon** node on a connecting rail + title + meta + description + detail-chip slot) with `TransitionChip` for before→after changes — those nodes are action/status glyphs, NOT person avatars. Action/status → `{label, Badge variant, lucide icon, FeatureTone}` config maps (see `RetakeHistoryPanel`). Semantic state uses `*-soft` tokens, never `--solid-*` (tags-only).
- **Modal internals** ride the same item language (audited all 44; redrew 23): action-confirm modals (postpone/absent/complete/edit-date) open with a **record-summary band** (accent `IconBadge` + name + status `Badge` + context + a live `TransitionChip` current→new preview) over the form; history modals (`RetakeHistoryModal`/`AssignmentTaskHistoryModal`) reuse the `FeedItem` timeline; data-grid modals (`ScoreInputModal`/`SubmissionModal`/`AttendanceModal`) are name rosters with a `StatStrip` summary header + refined inputs; info modals (`StudentInfoModal`) are a name header + grouped `StatStrip` sections. (No avatar chips — see the data-atom note.) The `Modal` primitive's header/scroll-body/footer is unchanged — only the children were recomposed.
- **Deferred (not yet built; documented in the design spec):** ⌘K command palette, the row→RowDrawer master-detail flow (rows still open the existing Jotai-atom modals), full `useWorkQueues` fan-out + `AttentionStrip`, route-level `error.tsx`/`loading.tsx`/`not-found.tsx`. The workflow lifecycle modals were intentionally kept (not collapsed into drawers) to avoid Dialog-over-Sheet stacking.

### Styling & theming
Tailwind CSS v4 — no `tailwind.config.ts`; all config lives in `src/app/globals.css` (`@theme inline` + `:root`/`.dark` token blocks). Colors are CSS-variable **design tokens** (`--solid-*`, `--feature-*`, `--background-*`, etc.); use the semantic Tailwind classes, not raw hex. Dark mode is class-based with an inline FOUC-prevention script in `layout.tsx` reading `localStorage["tnote-theme"]`.

#### "Refined precision workspace" design system (2026-06 redraw — keep these invariants)
Calm / crisp / professional / dense — a deliberate departure from the prior playful "Toss풍" look. Pure-white surfaces are defined by **hairline borders first, shadow second** on a cool near-white page; a single confident **deep-indigo** brand carries the chrome, with per-feature accents used sparingly. All values are oklch tokens in `globals.css`. Light/dark/print must all keep working.
- **Crisp radius, no pills.** `--radius: 0.625rem` (ladder: sm6 / md8 / lg10 / xl14 / 2xl20). Cards/dialogs use `rounded-xl`; **buttons / search / nav / filter-chips are `rounded-lg`, badges/menu-items `rounded-md`** — NOT `rounded-full`. `rounded-full` is reserved for genuine circles only (avatars, status dots, count pills, swatches, spinners).
- **Border-first surfaces + tight neutral elevation.** Card/DataTable/SectionCard/StatTile rest as `border-border` + `shadow-xs` (not `border-transparent` + glow). `--shadow-xs/-sm/-md/-lg` are tight & neutral cool-gray (dark = deep black + top-highlight inset). `--shadow-brand` exists but is used sparingly (logo well only) — **the primary button does NOT use a colored glow** (`shadow-xs` → hover `shadow-sm`). Tier-2 (Dialog/Sheet/Popover/Select) = `shadow-lg`. Never freelance a shadow.
- **Deep-indigo brand, channeled color.** `--primary` is a confident deep indigo (`oklch(0.54 0.2 269)`, was a warm 256° blue). Per-feature accents `--feature-{calendar|messages|retakes|assignments|students|courses|clinics|admins}` (+`-soft`) are **sparing chrome only** (icon wells / section headers / nav-active / empty-state gradients) via the shared `toneWell` map (`ui/featureTone.ts`) used by `StatCard` / `SectionCard` / `IconBadge`. The `--solid-*` 11-hue palette stays **tags-only** — the two channels never cross. Danger/success surfaces use `--{success|warning|destructive}-soft` + the solid hue as text/icon (never `*-soft` tag colors for semantics). Semantic solids are deepened so the hue reads legibly as text on its own `/10` tint.
- **Saturation/meaning rules kept.** Charts use `--chart-1..5` / `--chart-grid` / `--sparkline-fill` (no inline hex). Calendar events map to tokens (course→primary, retake→`--feature-retakes`/destructive, assignment→`--feature-assignments`/warning, clinic→`--event-clinic`; completed→success, absent→neutral). Tinted bg only, never text-on-tint below AA.
- **Generous type.** Page title `text-2xl font-bold tracking-[-0.02em]`; section/card title `text-base font-semibold`; big metric `text-3xl font-bold tabular-nums`; body/table `text-sm`; reading surfaces `text-[15px]`; meta `text-xs`. Body sets a subtle `letter-spacing:-0.005em` + optimizeLegibility. Numbers tabular by default (`@layer base`; `numeric` flag on `DataTable` columns).
- **Restrained motion.** `--motion-fast/base/slow` + `--ease-spring` (now a snappy ease-out, **no overshoot**) / `--ease-out-soft`. Buttons press `active:scale-[0.98]`; interactive cards hover-lift `-translate-y-0.5` + `shadow-md`; focus is always `focus-visible:ring-[3px] ring-ring/50`. All transforms gated by the `prefers-reduced-motion` block.
- **Filled-but-bordered inputs.** Input/Select/Textarea/Search rest as `bg-muted/50 border-input` (subtle visible border) and brighten to `bg-card border-ring` on focus. Form controls = `h-10` (sm `h-9`); filter-row controls (FilterButton/FilterSelect/SearchInput) = `h-9`.
- **Shell + IA.** Desktop = `Sidebar` (active item `bg-primary-soft text-primary` `rounded-md`, grouped sections, squared `rounded-lg` logo/avatar wells); mobile (`<md`) = `MobileBottomNav` (top destinations + "더보기" opens the sidebar Sheet for overflow/user-menu). `Container` (`gap-6`) has a `width="narrow"` reading variant and bottom padding for the mobile nav.
- **Reusable primitives:** `StatCard`(=`StatTile` alias; `tone` + optional chart slot), `SectionCard`, `IconBadge`, pill-free `FilterButton` (`aria-pressed`), `MetricBadge`, `DateChip`, gradient `EmptyState` (`tone`, squircle well). Verify every elevation/color change in **light + dark + print** (the `@media print` block in `globals.css` forces white bg + `print-color-adjust:exact`). Note: there is **no in-app print feature** — the student-detail 인쇄 옵션 modal/`window.print()` flow was removed 2026-06-12 (don't reintroduce a print button/report generator without being asked).

## Environment variables

See `.env.example`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase client (required)
- `SUPABASE_SERVICE_ROLE_KEY` — admin client, server only (required)
- `AXIOM_TOKEN`, `AXIOM_DATASET` (optional) — logging is a no-op without the token

Solapi (SMS) credentials are not env vars — they are stored per-workspace in the DB.

## Database

Schema is **managed in Supabase, not in this repo** (no migrations directory). A Supabase MCP server is configured (`.mcp.json`, gitignored) for inspecting/querying the live schema. Tables are PascalCase (`Users`, `Workspaces`, `Courses`, `CourseEnrollments`, `ConsultationLogs`, `StudentTags`, `StudentTagAssignments`, `StudentAssignments`, `StudentAssignmentHistory`, `Retakes`, `Exams`, `Clinics`, …). Students and staff are both rows in `Users` distinguished by `role`.

## Conventions

- **Code style**: Biome (`biome.json`) — 2-space indent, 120-col, double quotes, semicolons, trailing commas. `noExplicitAny` is **off** (the factories use `any` deliberately); `useExhaustiveDependencies` is off (React Compiler). Run `bun run lint:fix` before finishing.
