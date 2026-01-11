import { NextResponse } from "next/server";
import { getAuthenticatedClient, requireAdminOrOwner } from "@/shared/lib/supabase/auth";

const VALID_MANAGEMENT_STATUSES = [
  "재시 안내 예정",
  "재시 안내 완료",
  "클리닉 1회 불참 연락 필요",
  "클리닉 1회 불참 연락 완료",
  "클리닉 2회 불참 연락 필요",
  "클리닉 2회 불참 연락 완료",
  "실장 집중 상담 필요",
  "실장 집중 상담 진행 중",
  "실장 집중 상담 완료",
] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminOrOwner();
    const { supabase } = await getAuthenticatedClient();
    const { management_status } = await request.json();
    const { id } = await params;

    if (!management_status || !VALID_MANAGEMENT_STATUSES.includes(management_status)) {
      return NextResponse.json({ error: "유효하지 않은 관리 상태입니다." }, { status: 400 });
    }

    const { data: retake, error: fetchError } = await supabase
      .from("RetakeAssignments")
      .select("*, student:Users!RetakeAssignments_student_id_fkey(workspace)")
      .eq("id", id)
      .single();

    if (fetchError || !retake) {
      return NextResponse.json({ error: "재시험을 찾을 수 없습니다." }, { status: 404 });
    }

    if (retake.student.workspace !== session.workspace) {
      return NextResponse.json({ error: "접근 권한이 없습니다." }, { status: 403 });
    }

    const { error: updateError } = await supabase.from("RetakeAssignments").update({ management_status }).eq("id", id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: "관리 상태 변경에 실패했습니다." }, { status: 500 });
    }

    // Create history record
    await supabase.from("RetakeHistory").insert({
      retake_assignment_id: id,
      action_type: "management_status_change",
      previous_management_status: retake.management_status,
      new_management_status: management_status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Management status update error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
