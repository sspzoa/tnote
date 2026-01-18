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
