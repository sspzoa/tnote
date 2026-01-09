import { cookies } from "next/headers";
import { createClient } from "./server";

export interface Session {
  userId: string;
  phoneNumber: string;
  name: string;
  role: "owner" | "admin" | "student";
  workspace: string;
}

/**
 * 세션 쿠키에서 사용자 정보 가져오기
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value) as Session;
    return session;
  } catch {
    return null;
  }
}

/**
 * Supabase 클라이언트를 세션 사용자로 인증
 * RLS는 데이터베이스 정책에 의존하지 않고 애플리케이션 레벨에서 필터링
 */
export async function getAuthenticatedClient() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // 애플리케이션 레벨 필터링 사용 (RLS RPC 호출 제거)
  // 모든 쿼리에서 session.workspace로 명시적 필터링 필요

  return { supabase, session };
}

/**
 * 권한 체크
 */
export async function requireAuth(allowedRoles?: Array<"owner" | "admin" | "student">) {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error("Forbidden");
  }

  return session;
}

/**
 * Owner 권한 체크
 */
export async function requireOwner() {
  return requireAuth(["owner"]);
}

/**
 * Admin 또는 Owner 권한 체크
 */
export async function requireAdminOrOwner() {
  return requireAuth(["owner", "admin"]);
}

/**
 * 세션 삭제
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
