import { NextResponse } from "next/server";
import { getSession } from "@/shared/lib/supabase/auth";
import { createClient } from "@/shared/lib/supabase/server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null });
    }

    // 워크스페이스 이름 가져오기
    let workspaceName = null;
    if (session.workspace) {
      const supabase = await createClient();
      const { data: workspace } = await supabase.from("Workspaces").select("name").eq("id", session.workspace).single();
      workspaceName = workspace?.name || null;
    }

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
    console.error("Get session error:", error);
    return NextResponse.json({ error: "세션 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
