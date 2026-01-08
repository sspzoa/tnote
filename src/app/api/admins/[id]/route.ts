import { NextResponse } from "next/server";
import { getAuthenticatedClient, requireOwner } from "@/shared/lib/supabase/auth";

// 관리자 삭제 (Owner만 가능, Owner 본인은 삭제 불가)
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireOwner();
    const { id } = await params;

    // Owner 본인 삭제 방지
    if (id === session.userId) {
      return NextResponse.json({ error: "본인 계정은 삭제할 수 없습니다." }, { status: 400 });
    }

    const { supabase } = await getAuthenticatedClient();

    // RLS가 workspace 필터링을 자동으로 처리
    // 같은 workspace의 사용자인지 확인
    const { data: targetUser } = await supabase.from("Users").select("id, role").eq("id", id).single();

    if (!targetUser) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    // Owner는 삭제할 수 없음
    if (targetUser.role === "owner") {
      return NextResponse.json({ error: "워크스페이스 소유자는 삭제할 수 없습니다." }, { status: 400 });
    }

    // 관리자 삭제 (RLS가 workspace 안전성 보장)
    const { error: deleteError } = await supabase.from("Users").delete().eq("id", id);

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
