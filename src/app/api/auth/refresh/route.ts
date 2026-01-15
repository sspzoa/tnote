import { NextResponse } from "next/server";
import { refreshAccessToken } from "@/shared/lib/supabase/auth";
import { createLogger } from "@/shared/lib/utils/logger";

export async function POST(request: Request) {
  const logger = createLogger(request, null, "auth", "auth");

  try {
    const session = await refreshAccessToken();

    if (!session) {
      await logger.log("warn", 401);
      await logger.flush();
      return NextResponse.json({ error: "토큰 갱신에 실패했습니다. 다시 로그인해주세요." }, { status: 401 });
    }

    const loggerWithSession = createLogger(request, session, "auth", "auth");
    await loggerWithSession.log("info", 200);
    await loggerWithSession.flush();

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
    const err = error instanceof Error ? error : new Error(String(error));
    await logger.log("error", 500, err);
    await logger.flush();
    return NextResponse.json({ error: "토큰 갱신 중 오류가 발생했습니다." }, { status: 500 });
  }
}
