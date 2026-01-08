import { NextResponse } from "next/server";
import { requireOwner } from "@/shared/lib/supabase/auth";
import { createAdminClient } from "@/shared/lib/supabase/server";

// 관리자 삭제 (Owner만 가능, Owner 본인은 삭제 불가)
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireOwner();
    const { id } = await params;

    // Owner 본인 삭제 방지
    if (id === session.userId) {
      return NextResponse.json({ error: "본인 계정은 삭제할 수 없습니다." }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // 같은 workspace의 관리자인지 확인
    const { data: targetUser } = await supabase.from("Users").select("id, role, workspace").eq("id", id).single();

    if (!targetUser) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    if (targetUser.workspace !== session.workspace) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // Owner는 삭제할 수 없음
    if (targetUser.role === "owner") {
      return NextResponse.json({ error: "워크스페이스 소유자는 삭제할 수 없습니다." }, { status: 400 });
    }

    // 관리자 삭제 (workspace 조건 추가로 안전성 확보)
    const { error: deleteError } = await supabase
      .from("Users")
      .delete()
      .eq("id", id)
      .eq("workspace", session.workspace);

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
