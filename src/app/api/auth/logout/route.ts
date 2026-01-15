import { NextResponse } from "next/server";
import { clearSession, getSession } from "@/shared/lib/supabase/auth";
import { createLogger } from "@/shared/lib/utils/logger";

export async function POST(request: Request) {
  const session = await getSession();
  const logger = createLogger(request, session, "logout", "auth");

  try {
    await clearSession();
    await logger.log("info", 200);
    await logger.flush();
    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    await logger.log("error", 500, err);
    await logger.flush();
    return NextResponse.json({ error: "로그아웃 중 오류가 발생했습니다." }, { status: 500 });
  }
}
