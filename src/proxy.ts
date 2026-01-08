import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 로그인 페이지는 인증 체크 제외
  if (pathname === "/login") {
    // 이미 로그인한 사용자는 홈으로 리다이렉트
    const session = request.cookies.get("session");
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 세션 체크
  const sessionCookie = request.cookies.get("session");

  // API 경로 처리
  if (pathname.startsWith("/api/")) {
    // 인증 불필요 API 경로 (로그인, 회원가입, 워크스페이스 목록 조회)
    const publicApiPaths = ["/api/auth/login", "/api/auth/register", "/api/workspaces"];
    if (publicApiPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // 세션 필수
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const sessionData = JSON.parse(sessionCookie.value);

      // Owner 전용 API
      if (pathname.startsWith("/api/admins")) {
        if (sessionData.role !== "owner") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }

      // Admin 또는 Owner 전용 API
      const adminOnlyApis = ["/api/students", "/api/courses"];
      if (adminOnlyApis.some((path) => pathname.startsWith(path))) {
        if (sessionData.role === "student") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }

      // retakes는 모든 인증된 사용자 접근 가능 (student도 자신의 데이터 조회)

      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
  }

  // 페이지 경로 처리
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);

    // 학생은 특정 페이지만 접근 가능
    if (sessionData.role === "student") {
      const studentAllowedPaths = ["/", "/my-retakes"];

      if (!studentAllowedPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Owner/Admin만 접근 가능한 관리 페이지
    const adminPaths = ["/students", "/courses", "/exams", "/retakes", "/admins"];
    if (adminPaths.some((path) => pathname.startsWith(path))) {
      if (sessionData.role === "student") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Owner만 접근 가능한 페이지
    const ownerOnlyPaths = ["/admins"];
    if (ownerOnlyPaths.some((path) => pathname.startsWith(path))) {
      if (sessionData.role !== "owner") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    // 세션 파싱 실패 시 로그인 페이지로
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
