import { NextResponse } from "next/server";
import { getAuthenticatedClient, requireAdminOrOwner } from "@/shared/lib/supabase/auth";

// 재시험 연기 (관리자만)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrOwner();
    const { id } = await params;
    const { newDate, note } = await request.json();

    if (!newDate) {
      return NextResponse.json({ error: "새로운 날짜를 입력해주세요." }, { status: 400 });
    }

    const { supabase } = await getAuthenticatedClient();

    // 현재 재시험 정보 조회
    const { data: current, error: fetchError } = await supabase
      .from("RetakeAssignments")
      .select("current_scheduled_date, postpone_count")
      .eq("id", id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: "재시험을 찾을 수 없습니다." }, { status: 404 });
    }

    // 재시험 연기 카운트 증가 및 날짜 업데이트, 상태를 대기중으로 변경
    const { data: updated, error: updateError } = await supabase
      .from("RetakeAssignments")
      .update({
        current_scheduled_date: newDate,
        postpone_count: current.postpone_count + 1,
        status: "pending",
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 이력 기록
    const { error: historyError } = await supabase.from("RetakeHistory").insert({
      retake_assignment_id: id,
      action_type: "postpone",
      previous_date: current.current_scheduled_date,
      new_date: newDate,
      note: note || null,
    });

    if (historyError) throw historyError;

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Postpone error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "재시험 연기 중 오류가 발생했습니다." }, { status: 500 });
  }
}
