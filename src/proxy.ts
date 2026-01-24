import * as jose from "jose";
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

interface PublicRoute {
  path: string;
  methods: string[];
}

const PUBLIC_APIS: PublicRoute[] = [
  { path: "/api/auth/login", methods: ["POST"] },
  { path: "/api/auth/register", methods: ["POST"] },
  { path: "/api/auth/refresh", methods: ["POST"] },
  { path: "/api/workspaces", methods: ["GET"] },
];

const PUBLIC_PAGES = ["/login", "/terms", "/privacy"];

const STUDENT_ALLOWED_PAGES = ["/", "/calendar"];

const ADMIN_ONLY_PAGES = ["/students", "/courses", "/retakes", "/clinics", "/messages", "/admins"];

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

const getJwtSecret = (): Uint8Array => {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret not configured");
  }
  return new TextEncoder().encode(secret);
};

const getRefreshSecret = (): Uint8Array => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error("JWT refresh secret not configured");
  }
  return new TextEncoder().encode(secret);
};

const verifyToken = async (token: string, secret: Uint8Array): Promise<TokenPayload | null> => {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
};

const getSessionFromTokens = async (
  request: NextRequest,
): Promise<{ payload: TokenPayload | null; needsRefresh: boolean }> => {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken) {
    const payload = await verifyToken(accessToken, getJwtSecret());
    if (payload) {
      return { payload, needsRefresh: false };
    }
  }

  if (refreshToken) {
    const payload = await verifyToken(refreshToken, getRefreshSecret());
    if (payload) {
      return { payload, needsRefresh: true };
    }
  }

  return { payload: null, needsRefresh: false };
};

const isPublicApi = (pathname: string, method: string): boolean => {
  return PUBLIC_APIS.some((api) => pathname.startsWith(api.path) && api.methods.includes(method));
};

const isPublicPage = (pathname: string): boolean => {
  return PUBLIC_PAGES.some((page) => pathname === page);
};

const matchesPath = (pathname: string, paths: string[]): boolean => {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
};

const handleApiRoute = (request: NextRequest, pathname: string, payload: TokenPayload | null): NextResponse => {
  if (isPublicApi(pathname, request.method)) {
    return NextResponse.next();
  }

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
};

const handlePageRoute = (request: NextRequest, payload: TokenPayload): NextResponse | null => {
  const { pathname } = request.nextUrl;
  const { role } = payload;

  if (role === "student" && !matchesPath(pathname, STUDENT_ALLOWED_PAGES)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (matchesPath(pathname, ADMIN_ONLY_PAGES) && role === "student") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return null;
};

export const proxy = async (request: NextRequest): Promise<NextResponse> => {
  const { pathname } = request.nextUrl;

  if (isPublicPage(pathname)) {
    const { payload } = await getSessionFromTokens(request);
    if (pathname === "/login" && payload) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const { payload, needsRefresh } = await getSessionFromTokens(request);

  if (pathname.startsWith("/api/")) {
    return handleApiRoute(request, pathname, payload);
  }

  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const redirectResponse = handlePageRoute(request, payload);
  if (redirectResponse) {
    return redirectResponse;
  }

  const response = NextResponse.next();
  if (needsRefresh) {
    response.headers.set("X-Token-Refresh-Required", "true");
  }

  return response;
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
