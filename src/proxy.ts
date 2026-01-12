import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type Role = "owner" | "admin" | "student";

interface SessionData {
  role: Role;
}

interface PublicApi {
  path: string;
  methods: string[];
}

const PUBLIC_APIS: PublicApi[] = [
  { path: "/api/auth/login", methods: ["POST"] },
  { path: "/api/auth/register", methods: ["POST"] },
  { path: "/api/workspaces", methods: ["GET"] },
];

const AUTHENTICATED_APIS = ["/api/auth/me", "/api/auth/logout", "/api/auth/change-password"];
const ADMIN_ONLY_APIS = ["/api/students", "/api/courses", "/api/exams", "/api/clinics", "/api/consultations"];
const STUDENT_ALLOWED_PATHS = ["/", "/my-retakes"];
const ADMIN_PATHS = ["/students", "/courses", "/exams", "/retakes", "/admins", "/clinics"];
const OWNER_ONLY_PATHS = ["/admins"];

const MUTATING_METHODS = ["POST", "PATCH", "DELETE"];

const getSessionData = (sessionCookie: string): SessionData | null => {
  try {
    return JSON.parse(sessionCookie) as SessionData;
  } catch {
    return null;
  }
};

const isPublicApi = (pathname: string, method: string): boolean => {
  return PUBLIC_APIS.some((api) => pathname.startsWith(api.path) && api.methods.includes(method));
};

const handleApiRoute = (request: NextRequest, pathname: string, sessionCookie: string | undefined): NextResponse => {
  const method = request.method;

  if (isPublicApi(pathname, method)) {
    return NextResponse.next();
  }

  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionData = getSessionData(sessionCookie);
  if (!sessionData) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { role } = sessionData;

  if (AUTHENTICATED_APIS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admins")) {
    return role === "owner" ? NextResponse.next() : NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (ADMIN_ONLY_APIS.some((path) => pathname.startsWith(path))) {
    return role === "student" ? NextResponse.json({ error: "Forbidden" }, { status: 403 }) : NextResponse.next();
  }

  if (pathname.startsWith("/api/calendar")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/retakes")) {
    if (method === "GET") {
      return NextResponse.next();
    }
    if (MUTATING_METHODS.includes(method)) {
      return role === "student" ? NextResponse.json({ error: "Forbidden" }, { status: 403 }) : NextResponse.next();
    }
  }

  return NextResponse.json({ error: "Not Found" }, { status: 404 });
};

const handlePageRoute = (pathname: string, sessionData: SessionData): NextResponse | null => {
  const { role } = sessionData;

  if (role === "student") {
    if (!STUDENT_ALLOWED_PATHS.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/", "http://temp.com"));
    }
  }

  if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    if (role === "student") {
      return NextResponse.redirect(new URL("/", "http://temp.com"));
    }
  }

  if (OWNER_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
    if (role !== "owner") {
      return NextResponse.redirect(new URL("/", "http://temp.com"));
    }
  }

  return null;
};

export const proxy = (request: NextRequest): NextResponse => {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session");

  if (pathname === "/login") {
    return sessionCookie ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return handleApiRoute(request, pathname, sessionCookie?.value);
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const sessionData = getSessionData(sessionCookie.value);
  if (!sessionData) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const redirectResponse = handlePageRoute(pathname, sessionData);
  if (redirectResponse) {
    return NextResponse.redirect(new URL(redirectResponse.headers.get("location") || "/", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
