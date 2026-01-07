import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
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

  // API 라우트는 middleware에서 체크하지 않음 (각 API에서 처리)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Public 경로 (인증 불필요)
  const publicPaths = ["/login"];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // 세션 체크
  const session = request.cookies.get("session");
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const sessionData = JSON.parse(session.value);

    // 학생은 특정 페이지만 접근 가능
    if (sessionData.role === "student") {
      const studentAllowedPaths = ["/", "/my-retakes"]; // 학생용 페이지 추가 예정

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
