# Tnote

학원 학생 관리 시스템

## 기능

- 학생 관리 (CRUD, 상담 기록)
- 반/시험 관리
- 재시험 관리
- 클리닉 출석 관리
- 문자 발송 (Solapi)
- 캘린더

## 기술 스택

- Next.js 16, React 19, TypeScript
- Supabase (PostgreSQL)
- Tailwind CSS, Jotai, React Query

## 실행

```bash
bun install
bun dev
```

## 환경 변수

`.env.local` 파일에 다음 설정 필요:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `SOLAPI_API_KEY`, `SOLAPI_API_SECRET`

## 아키텍처 / 소스 오브 트루스

- 데이터 계층은 Supabase(PostgreSQL) 기반이며, 현재 이 저장소 안에서 스키마 마이그레이션을 직접 관리하지는 않습니다.
- 코드 기준의 핵심 구조는 `src/shared/lib/supabase/auth.ts`, `src/app/api/AGENTS.md`, `src/shared/lib/utils/studentAssignments.ts`를 우선 기준으로 보면 됩니다.
- 학생 과제 흐름의 기준 경로는 `my/assignments`와 `/api/my/assignments`입니다.
