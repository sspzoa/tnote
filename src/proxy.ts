import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type Role = "owner" | "admin" | "student";

interface TokenPayload {
  userId: string;
  phoneNumber: string;
  name: string;
  role: Role;
  workspace: string;
  iat: number;
  exp: number;
}

interface PublicApi {
  path: string;
  methods: string[];
}

const PUBLIC_APIS: PublicApi[] = [
  { path: "/api/auth/login", methods: ["POST"] },
  { path: "/api/auth/register", methods: ["POST"] },
  { path: "/api/auth/refresh", methods: ["POST"] },
  { path: "/api/workspaces", methods: ["GET"] },
];

const AUTHENTICATED_APIS = ["/api/auth/me", "/api/auth/logout", "/api/auth/change-password"];
const ADMIN_ONLY_APIS = ["/api/students", "/api/courses", "/api/exams", "/api/clinics", "/api/consultations"];
const OWNER_ONLY_APIS: string[] = [];
const STUDENT_ALLOWED_PATHS = ["/", "/my-retakes", "/calendar"];
const ADMIN_PATHS = ["/students", "/courses", "/exams", "/retakes", "/admins", "/clinics"];
const OWNER_ONLY_PATHS: string[] = [];

const MUTATING_METHODS = ["POST", "PATCH", "DELETE"];

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

/**
 * JWT 토큰을 디코딩합니다 (검증 없이 페이로드만 추출)
 * 실제 검증은 서버사이드에서 수행됩니다
 */
const decodeToken = (token: string): TokenPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
    return payload as TokenPayload;
  } catch {
    return null;
  }
};

/**
 * 토큰이 만료되었는지 확인합니다
 */
const isTokenExpired = (payload: TokenPayload): boolean => {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
};

/**
 * 세션 데이터를 가져옵니다 (access_token 또는 refresh_token에서)
 */
const getSessionFromTokens = (request: NextRequest): { payload: TokenPayload | null; needsRefresh: boolean } => {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // Access token 확인
  if (accessToken) {
    const payload = decodeToken(accessToken);
    if (payload && !isTokenExpired(payload)) {
      return { payload, needsRefresh: false };
    }
  }

  // Refresh token 확인 (access token이 없거나 만료된 경우)
  if (refreshToken) {
    const payload = decodeToken(refreshToken);
    if (payload && !isTokenExpired(payload)) {
      return { payload, needsRefresh: true };
    }
  }

  return { payload: null, needsRefresh: false };
};

const isPublicApi = (pathname: string, method: string): boolean => {
  return PUBLIC_APIS.some((api) => pathname.startsWith(api.path) && api.methods.includes(method));
};

const handleApiRoute = (request: NextRequest, pathname: string, payload: TokenPayload | null): NextResponse => {
  const method = request.method;

  if (isPublicApi(pathname, method)) {
    return NextResponse.next();
  }

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = payload;

  if (AUTHENTICATED_APIS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admins")) {
    if (method === "GET") {
      return role === "student" ? NextResponse.json({ error: "Forbidden" }, { status: 403 }) : NextResponse.next();
    }
    return role === "owner" ? NextResponse.next() : NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (OWNER_ONLY_APIS.some((path) => pathname.startsWith(path))) {
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

const handlePageRoute = (request: NextRequest, payload: TokenPayload): NextResponse | null => {
  const { pathname } = request.nextUrl;
  const { role } = payload;

  if (role === "student") {
    if (!STUDENT_ALLOWED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (ADMIN_PATHS.some((path) => pathname.startsWith(`/${path.replace("/", "")}`))) {
    if (role === "student") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (OWNER_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
    if (role !== "owner") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return null;
};

export const proxy = (request: NextRequest): NextResponse => {
  const { pathname } = request.nextUrl;
  const { payload, needsRefresh } = getSessionFromTokens(request);

  // 로그인 페이지 처리
  if (pathname === "/login") {
    return payload ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }

  // API 라우트 처리
  if (pathname.startsWith("/api/")) {
    return handleApiRoute(request, pathname, payload);
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 페이지 접근 권한 확인
  const redirectResponse = handlePageRoute(request, payload);
  if (redirectResponse) {
    return redirectResponse;
  }

  // 토큰 갱신이 필요한 경우 헤더에 표시 (클라이언트에서 처리)
  const response = NextResponse.next();
  if (needsRefresh) {
    response.headers.set("X-Token-Refresh-Required", "true");
  }

  return response;
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
