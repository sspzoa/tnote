import { NextResponse } from "next/server";
import { refreshAccessToken } from "@/shared/lib/supabase/auth";
import { createLogger } from "@/shared/lib/utils/logger";

export async function POST(request: Request) {
  const logger = createLogger(request, null);

  try {
    const session = await refreshAccessToken();

    if (!session) {
      return NextResponse.json({ error: "토큰 갱신에 실패했습니다. 다시 로그인해주세요." }, { status: 401 });
    }

    const loggerWithSession = createLogger(request, session);
    await loggerWithSession.info("auth", "refresh", "Token refreshed successfully");

    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        name: session.name,
        phoneNumber: session.phoneNumber,
        role: session.role,
        workspace: session.workspace,
      },
    });
  } catch (error) {
    await logger.logError("auth", error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json({ error: "토큰 갱신 중 오류가 발생했습니다." }, { status: 500 });
  }
}
