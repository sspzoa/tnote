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
    const method = request.method;

    // 인증 불필요 API (public)
    const publicApis = [
      { path: "/api/auth/login", methods: ["POST"] },
      { path: "/api/auth/register", methods: ["POST"] },
      { path: "/api/workspaces", methods: ["GET"] },
    ];

    for (const api of publicApis) {
      if (pathname.startsWith(api.path) && api.methods.includes(method)) {
        return NextResponse.next();
      }
    }

    // 세션 필수 - 인증 체크
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const sessionData = JSON.parse(sessionCookie.value);
      const role = sessionData.role as "owner" | "admin" | "student";

      // 모든 인증된 사용자 접근 가능 API
      const authenticatedApis = ["/api/auth/me", "/api/auth/logout", "/api/auth/change-password"];

      if (authenticatedApis.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
      }

      // Owner 전용 API
      if (pathname.startsWith("/api/admins")) {
        if (role !== "owner") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.next();
      }

      // Admin/Owner 전용 API (모든 메서드)
      const adminOnlyApis = ["/api/students", "/api/courses", "/api/exams"];
      if (adminOnlyApis.some((path) => pathname.startsWith(path))) {
        if (role === "student") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.next();
      }

      // Retakes API - 메서드별 권한
      if (pathname.startsWith("/api/retakes")) {
        // GET: 모든 인증된 사용자 (학생은 본인 것만, API에서 처리)
        if (method === "GET") {
          return NextResponse.next();
        }
        // POST, PATCH, DELETE: Admin/Owner만
        if (["POST", "PATCH", "DELETE"].includes(method)) {
          if (role === "student") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
          }
          return NextResponse.next();
        }
      }

      // 알 수 없는 API 경로
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
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
