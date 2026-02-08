import { createClient } from "./server";

export interface Session {
  userId: string;
  phoneNumber: string;
  name: string;
  role: "owner" | "admin" | "student";
  workspace: string;
}

export async function getSession(): Promise<Session | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const metadata = user.user_metadata;
  if (!metadata?.role || !metadata?.workspace) {
    return null;
  }

  return {
    userId: user.id,
    phoneNumber: (user.email ?? "").replace("@tnote.local", ""),
    name: (metadata.name as string) ?? "",
    role: metadata.role as "owner" | "admin" | "student",
    workspace: metadata.workspace as string,
  };
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
