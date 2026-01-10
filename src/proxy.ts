import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    const session = request.cookies.get("session");
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("session");

  if (pathname.startsWith("/api/")) {
    const method = request.method;

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

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const sessionData = JSON.parse(sessionCookie.value);
      const role = sessionData.role as "owner" | "admin" | "student";

      const authenticatedApis = ["/api/auth/me", "/api/auth/logout", "/api/auth/change-password"];

      if (authenticatedApis.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
      }

      if (pathname.startsWith("/api/admins")) {
        if (role !== "owner") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.next();
      }

      const adminOnlyApis = ["/api/students", "/api/courses", "/api/exams", "/api/clinics"];
      if (adminOnlyApis.some((path) => pathname.startsWith(path))) {
        if (role === "student") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.next();
      }

      if (pathname.startsWith("/api/calendar")) {
        return NextResponse.next();
      }

      if (pathname.startsWith("/api/retakes")) {
        if (method === "GET") {
          return NextResponse.next();
        }
        if (["POST", "PATCH", "DELETE"].includes(method)) {
          if (role === "student") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
          }
          return NextResponse.next();
        }
      }

      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);

    if (sessionData.role === "student") {
      const studentAllowedPaths = ["/", "/my-retakes"];

      if (!studentAllowedPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    const adminPaths = ["/students", "/courses", "/exams", "/retakes", "/admins", "/clinics"];
    if (adminPaths.some((path) => pathname.startsWith(path))) {
      if (sessionData.role === "student") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    const ownerOnlyPaths = ["/admins"];
    if (ownerOnlyPaths.some((path) => pathname.startsWith(path))) {
      if (sessionData.role !== "owner") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  } catch {
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
