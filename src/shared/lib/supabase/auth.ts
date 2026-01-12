import { cookies } from "next/headers";
import { createClient } from "./server";

export interface Session {
  userId: string;
  phoneNumber: string;
  name: string;
  role: "owner" | "admin" | "student";
  workspace: string;
}

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
  cookieStore.delete("session");
}
