import { cookies } from "next/headers";
import {
  type DecodedToken,
  generateTokens,
  type TokenPayload,
  verifyAccessToken,
  verifyRefreshToken,
} from "../auth/jwt";
import { createClient } from "./server";

export type Session = TokenPayload;

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setTokens(payload: TokenPayload): Promise<void> {
  const cookieStore = await cookies();
  const { accessToken, refreshToken } = generateTokens(payload);

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 15, // 15 minutes
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const accessTokenCookie = cookieStore.get(ACCESS_TOKEN_COOKIE);
  const refreshTokenCookie = cookieStore.get(REFRESH_TOKEN_COOKIE);

  // Try access token first
  if (accessTokenCookie) {
    const decoded = verifyAccessToken(accessTokenCookie.value);
    if (decoded) {
      return extractSessionFromToken(decoded);
    }
  }

  // If access token is invalid/expired, try refresh token
  if (refreshTokenCookie) {
    const decoded = verifyRefreshToken(refreshTokenCookie.value);
    if (decoded) {
      // Refresh tokens
      const payload = extractSessionFromToken(decoded);
      await setTokens(payload);
      return payload;
    }
  }

  return null;
}

const extractSessionFromToken = (decoded: DecodedToken): Session => ({
  userId: decoded.userId,
  phoneNumber: decoded.phoneNumber,
  name: decoded.name,
  role: decoded.role,
  workspace: decoded.workspace,
});

export async function getAuthenticatedClient() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  return { supabase, session };
}

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

export async function requireOwner() {
  return requireAuth(["owner"]);
}

export async function requireAdminOrOwner() {
  return requireAuth(["owner", "admin"]);
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function refreshAccessToken(): Promise<Session | null> {
  const cookieStore = await cookies();
  const refreshTokenCookie = cookieStore.get(REFRESH_TOKEN_COOKIE);

  if (!refreshTokenCookie) {
    return null;
  }

  const decoded = verifyRefreshToken(refreshTokenCookie.value);
  if (!decoded) {
    return null;
  }

  const payload = extractSessionFromToken(decoded);
  await setTokens(payload);
  return payload;
}
