import { NextResponse } from "next/server";
import { getAuthenticatedClient, getSession } from "@/shared/lib/supabase/auth";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (id === session.userId) {
      return NextResponse.json({ error: "본인 계정은 삭제할 수 없습니다." }, { status: 400 });
    }

    const { supabase, session } = await getAuthenticatedClient();

    const { data: targetUser } = await supabase
      .from("Users")
      .select("id, role")
      .eq("id", id)
      .eq("workspace", session.workspace)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    if (targetUser.role === "owner") {
      return NextResponse.json({ error: "워크스페이스 소유자는 삭제할 수 없습니다." }, { status: 400 });
    }

    const { error: deleteError } = await supabase.from("Users").delete().eq("id", id).eq("workspace", session.workspace);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin delete error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "관리자 삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}
