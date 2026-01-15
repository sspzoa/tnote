import { NextResponse } from "next/server";
import { getAuthenticatedClient, getSession } from "@/shared/lib/supabase/auth";
import { createLogger } from "@/shared/lib/utils/logger";

export async function GET(request: Request) {
  const session = await getSession();
  const logger = createLogger(request, session, "read", "auth");

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

    await logger.log("info", 200);
    await logger.flush();
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
    const err = error instanceof Error ? error : new Error(String(error));
    await logger.log("error", 500, err);
    await logger.flush();
    return NextResponse.json({ error: "세션 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
