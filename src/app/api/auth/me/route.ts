import { NextResponse } from "next/server";
import { getAuthenticatedClient, getSession } from "@/shared/lib/supabase/auth";
import { createLogger } from "@/shared/lib/utils/logger";

export async function GET(request: Request) {
  const session = await getSession();
  const logger = createLogger(request, session);

  try {
    if (!session) {
      return NextResponse.json({ user: null });
    }

    let workspaceName = null;
    if (session.workspace) {
      const { supabase } = await getAuthenticatedClient();
      const { data: workspace } = await supabase.from("Workspaces").select("name").eq("id", session.workspace).single();
      workspaceName = workspace?.name || null;
    }

    await logger.info("read", "auth", "Session retrieved");

    return NextResponse.json({
      user: {
        id: session.userId,
        name: session.name,
        phoneNumber: session.phoneNumber,
        role: session.role,
        workspace: session.workspace,
        workspaceName: workspaceName,
      },
    });
  } catch (error) {
    await logger.logError("auth", error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json({ error: "세션 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
