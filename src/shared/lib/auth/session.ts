import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  phoneNumber: string;
  name: string | null;
  isAdmin: boolean;
  workspace: string | null;
}

export const getSession = async (): Promise<SessionData | null> => {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return null;
    }

    const session = JSON.parse(sessionCookie.value) as SessionData;
    return session;
  } catch {
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete("session");
};
