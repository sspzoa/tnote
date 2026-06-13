# AGENTS.md — Tnote

이 문서는 Tnote(티노트) 프로젝트를 처음 접하는 AI 코딩 에이전트를 위한 안내서입니다. 프로젝트의 실제 파일과 설정을 기반으로 작성했으며, 추측이 아닌 확인된 사실만 담았습니다.

---

## 프로젝트 개요

Tnote는 학원/교습소를 위한 학생 관리 시스템입니다.

- 주요 기능: 학생·반(수업)·시험·재시험·클리닉 출석·과제·상담 기록 관리, 문자 발송(Solapi), 캘린더, 학생용 마이페이지
- 서비스 형태: 멀티테넌트 SaaS. 모든 데이터는 `workspace` 단위로 격리됩니다.
- 사용자 역할: `owner`, `admin`, `student`

### 기술 스택

- **프레임워크**: Next.js 16 App Router
- **런타임/언어**: React 19, TypeScript 5
- **스타일링**: Tailwind CSS v4, `tw-animate-css`, shadcn/ui (New York 스타일)
- **데이터/인증**: Supabase (PostgreSQL + Auth), `@supabase/ssr` 쿠키 세션
- **상태 관리**: Jotai (로컬 UI 상태), TanStack Query v5 (서버 상태)
- **폼/검증**: React Hook Form + Zod v4
- **외부 연동**: Solapi (문자 발송), Axiom (선택적 로깅), Vercel Analytics / Speed Insights
- **패키지 매니저**: Bun (`bun.lock`)

---

## 저장소 구조

```text
/
├── package.json
├── next.config.ts          # Next.js 설정 (React Compiler, 보안 헤더 등)
├── tsconfig.json           # TypeScript 설정
├── biome.json              # Biome 린트/포맷 설정
├── components.json         # shadcn/ui 설정
├── postcss.config.mjs      # Tailwind v4 PostCSS 플러그인
├── .env.example            # 필수/선택 환경 변수 샘플
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/login    # 로그인/회원가입 페이지
│   │   ├── (legal)/        # /terms, /privacy
│   │   ├── (pages)/        # 실제 앱 화면 (owner/admin/student)
│   │   │   ├── (home)/     # / 대시보드
│   │   │   ├── students/, courses/, retakes/, assignments/,
│   │   │   │   clinics/, calendar/, messages/, admins/
│   │   │   └── my/         # 학생용 화면 (/my/*)
│   │   ├── api/            # API 라우트 핸들러
│   │   └── globals.css     # Tailwind v4 테마 변수, 글꼴, 전역 스타일
│   ├── shared/             # 공통 코드
│   │   ├── components/
│   │   │   ├── common/     # 앱 프레임 컴포넌트 (AppSidebar, CommandBar, PageShell 등)
│   │   │   └── ui/         # shadcn/ui 기반 primitive + tnote 래퍼
│   │   ├── hooks/          # 공통 React Query 커스텀 훅
│   │   ├── lib/
│   │   │   ├── api/        # API 라우트 래퍼 (withLogging, createCrudRoute, fetchWithAuth)
│   │   │   ├── supabase/   # SSR 클라이언트, 어드민 클라이언트, 세션 헬퍼
│   │   │   ├── services/   # Solapi 문자 발송 로직
│   │   │   ├── utils/      # 전화번호, 날짜, 태그, 로깅 등 유틸
│   │   │   ├── hooks/      # createQuery, createMutation 추상화
│   │   │   └── workflow/   # 재시험/과제 워크플로우용 재사용 atoms/queries/mutations
│   │   └── types/          # 공용 TypeScript 타입
│   └── proxy.ts            # (주의) 의도된 middleware 로직이지만 실제 middleware.ts로 마운트되지 않음
```

- Path alias: `@/*` → `src/*`
- 각 페이지는 필요한 컴포넌트/훅/아톰을 `(components)`, `(hooks)`, `(atoms)` 폼더로 옆에 배치합니다.

---

## 아키텍처

### 멀티테넌시

- `Workspaces` 테이블 기준의 테넌시입니다.
- 대부분의 API 라우트는 `session.workspace`를 기준으로 `.eq("workspace", ...)` 필터를 적용합니다.
- `createCrudRoute.ts` 팩토리를 사용하는 라우트는 workspace 필터가 자동으로 들어갑니다.

### 인증

- Supabase Auth 기반, 쿠키 세션(`@supabase/ssr`)을 사용합니다.
- 전화번호를 `01012345678@tnote.local` 형태의 이메일로 매핑합니다.
- `role`과 `workspace`는 `app_metadata`에 저장되며, 서비스 롤 키로만 수정 가능합니다. 마이그레이션 미완료 계정을 위해 `user_metadata` fallback이 있습니다.
- 세션 획득: `src/shared/lib/supabase/auth.ts`의 `getSession()`.
- 서버 클라이언트:
  - `createClient()` — 일반 SSR 클라이언트 (anon key)
  - `createAdminClient()` — service role key 사용. 관리자 생성/학생 생성 등 권한 상승 작업에만 사용.

### 보호 메커니즘

- **API 라우트**: `withLogging` / `withPublicLogging` 래퍼로 인증, 역할 체크, Axiom 로깅, 에러 응답 통일을 처리합니다.
- **클리언트**: `fetchWithAuth`는 401 응답 시 `/login`으로 리다이렉트합니다.
- **Next.js Middleware**: `src/proxy.ts`에 middleware 로직과 `matcher` config가 있지만, **현재 `middleware.ts` 파일이 없어 실제로 마운트되지 않습니다.** 페이지 레벨 보호는 UI/API에서 각자 처리하고 있습니다.

### 데이터 흐름

- 서버 상태: TanStack Query.
  - 공통 래퍼: `src/shared/lib/hooks/createQuery.ts`, `createMutation.ts`
  - 기능별 훅: 보통 `useXxx.ts`로 API 호출과 query key를 캡슐화
  - Query key 중앙 관리: `src/shared/lib/queryKeys.ts`
- 로컬 상태: Jotai atoms.
  - 모달 on/off, 필터, 폼 값 등에 사용
  - 예: `(atoms)/useModalStore.ts`, `(atoms)/useStudentsStore.ts`
- 워크플로우 재사용: `src/shared/lib/workflow/*`는 재시험(Retake)과 과제(AssignmentTask)의 비슷한 CRUD 흐름을 추상화한 atoms/queries/mutations입니다.

### API 응답 형식

- 성공 조회: `{ data: ... }`
- 성공 쓰기: `{ success: true, data?: ... }` (HTTP 201 등)
- 클라이언트 에러: `{ error: "..." }`

### 문자 발송

- Solapi(`solapi` 패키지)를 사용합니다.
- API 키/시크릿과 발신번호는 `Workspaces` 테이블에 저장됩니다. 환경 변수가 아닙니다.
- 관련 코드: `src/shared/lib/services/sms.ts`, `messageSender.ts`

### 로깅

- `src/shared/lib/utils/logger.ts`의 `ApiLogger` 사용.
- Axiom이 설정되면 `AXIOM_TOKEN`, `AXIOM_DATASET`으로 전송. 토큰이 없으면 콘솔 로깅만 하며 프로덕션에선 콘솔 로깅은 비활성화됩니다.
- `withLogging`은 모든 API 요청의 메서드/경로/상태코드/사용자/워크스페이스/에러를 기록합니다.

---

## 빌드 및 실행 명령어

```bash
# 의존성 설치
bun install

# 환경 변수 세팅
cp .env.example .env.local
# .env.local에 필수 값을 채우세요.

# 개발 서버 (http://localhost:3000)
bun dev

# 프로덕션 빌드 및 실행
bun run build
bun start
```

### package.json scripts

- `bun run dev` — Next.js 개발 서버
- `bun run build` — Next.js 빌드
- `bun run start` — Next.js 프로덕션 서버
- `bun run lint` — Biome 린트 (`biome check`)
- `bun run lint:fix` — Biome 자동 수정 (`biome check --write`)
- `bun run format` — Biome 포맷 적용
- `bun run format:check` — Biome 포맷 체크
- `bun run typecheck` — `tsc --noEmit`
- `bun run check` — typecheck + lint + format check

VS Code / Claude 디버깅용 `.claude/launch.json`도 `bun dev`로 실행하도록 설정되어 있습니다.

---

## 환경 변수

`.env.example` 참고:

| 변수 | 필수 여부 | 설명 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 필수 | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 필수 | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | 필수 | Supabase service role key (서버 전용) |
| `AXIOM_TOKEN` | 선택 | Axiom 로깅 토큰. 없으면 Axiom 전송 비활성화 |
| `AXIOM_DATASET` | 선택 | 기본값 `tnote-logs` |

- Solapi 문자 키는 환경 변수가 아니라 `Workspaces` 테이블에 저장됩니다.
- `.env*.local`과 `.mcp.json`은 `.gitignore`에 포함되어 있어 저장소에 커밋되지 않습니다.

---

## 코드 스타일 가이드라인

### 린트/포맷

- **Biome 2.2.0**이 유일한 린트/포맷 도구입니다.
- `biome.json` 주요 설정:
  - 들여쓰기: 스페이스 2칸
  - 줄 길이: 120자
  - 줄 끝: LF
  - 따옴표: JavaScript/TSX는 더블 쿼트, trailing comma `all`, 세미콜론 항상 사용
  - 화살표 함수 괄호 항상 사용
  - `bracketSameLine: true`
  - 린트: `noUnusedImports`는 `error`, `useArrowFunction`은 `error`
  - CSS 파일은 포맷에서 제외 (`!**/*.css`)

### 컴포넌트 및 스타일

- shadcn/ui 기반 컴포넌트는 `src/shared/components/ui/`에 있습니다.
- tnote 전용 래퍼/복합 컴포넌트도 `ui/`에 함께 있으며, UI 텍스트는 한국어입니다.
- 앱 프레임(AppSidebar, CommandBar, PageShell, MobileBottomNav 등)은 `src/shared/components/common/`에 있습니다.
- Tailwind CSS v4는 `src/app/globals.css`의 `@theme inline`과 CSS 변수로 설정합니다. 별도의 `tailwind.config.ts`는 없습니다.
- 테마: 라이트/다크 모드를 지원하며, `--feature-*`, `--solid-*`, `--chart-*` 등의 토큰이 문서화되어 있습니다.

### 파일/네이밍 규칙

- API 라우트 핸들러는 보통 `handleGet`, `handlePost` 등으로 정의한 뒤 `export const GET = ...` 형태로 노출합니다.
- React Query 커스텀 훅은 `useXxx.ts` 형태입니다.
- Jotai atoms 파일은 보통 `useXxxStore.ts` 또는 `useXxxAtoms.ts` 형태입니다.
- 유틸리티 함수 파일은 칼맥락에 맞는 이름(`date.ts`, `phone.ts`, `cn.ts` 등)을 사용합니다.

### 타입

- 공용 타입: `src/shared/types/index.ts`, `src/shared/types/api.ts`
- API 응답은 `{ data }` / `{ success, data }` / `{ error }` 형태로 통일합니다.
- Zod 스키마는 주로 페이지/컴포넌트 난이도에서 직접 정의해 사용합니다.

---

## 테스트

- 별도의 테스트 스크립트(`package.json`)는 없습니다.
- 테스트는 **Node.js 내장 테스트 러너**(`node:test`, `node:assert/strict`)를 사용합니다.
- 현재 존재하는 테스트:
  - `src/shared/lib/utils/phone.test.ts`
  - `src/shared/lib/utils/date.test.ts`
- 실행 예시:
  ```bash
  bun test
  # 또는
  node --test
  ```
- CI/CD 설정(`.github/workflows`, `vercel.json` 등)과 E2E/커버리지 도구는 현재 없습니다.

---

## 보안 및 운영 고려사항

- **Service Role Key**: `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트로 노출되면 안 됩니다. `createAdminClient()`는 API 라우트 핸들러 난이도에서만 사용됩니다.
- **Rate Limiting**: `src/shared/lib/utils/rateLimit.ts`는 인증 엔드포인트에 대한 메모리 기반 IP 단위 레이트 리미팅을 제공합니다. 다중 인스턴스/서버리스 환경에서는 공유 저장소 기반 제한으로 대체해야 할 수 있습니다.
- **보안 헤더**: `next.config.ts`에서 `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy` 등을 설정합니다.
- **Middleware**: `src/proxy.ts`는 middleware 로직을 담고 있지만 현재 `middleware.ts`로 연결되어 있지 않습니다. Edge 레벨 인증/리다이렉트가 필요하다면 별도로 마운트해야 합니다.
- **DB 마이그레이션**: 이 저장소에는 Supabase 마이그레이션 파일이 없습니다. 스키마는 Supabase 콘솔 또는 외부 방식으로 관리됩니다. 코드에서 참조하는 테이블 이름을 기준으로 작업하세요.
- **로깅**: Axiom 토큰이 없으면 외부 로깅이 비활성화됩니다. 민감한 개인정보(PII)를 로그에 남기지 않도록 주의하세요.
- **학생 권한**: `proxy.ts`의 의도상 학생(`student`)은 `/`, `/my/*` 페이지와 `/api/auth/*`, `/api/my/*` API만 접근 가능합니다. UI/API에서도 동일한 제한이 있는지 함께 확인해야 합니다.

---

## 유용한 참고

- shadcn/ui alias:
  - `components` → `@/shared/components`
  - `ui` → `@/shared/components/ui`
  - `lib` → `@/shared/lib`
  - `utils` → `@/shared/lib/utils/cn`
  - `hooks` → `@/shared/hooks`
- `.mcp.json`은 Supabase MCP 서버(`mcp.supabase.com`)를 참조하며, `.claude/settings.local.json`에서 활성화합니다. 이 파일은 gitignored이므로 새 환경에서는 재설정이 필요할 수 있습니다.
