import { NextResponse } from "next/server";
import { clearSession, getSession } from "@/shared/lib/supabase/auth";
import { createLogger } from "@/shared/lib/utils/logger";

export async function POST(request: Request) {
  const session = await getSession();
  const logger = createLogger(request, session);

  try {
    await logger.logAuth("logout", `User logged out: ${session?.name || "unknown"}`, true);
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    await logger.logError("auth", error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json({ error: "로그아웃 중 오류가 발생했습니다." }, { status: 500 });
  }
}
