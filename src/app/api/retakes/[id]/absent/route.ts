import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

// 재시험 결석 처리 (권한: middleware에서 이미 체크됨)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { note } = await request.json();

    const { supabase, session } = await getAuthenticatedClient();

    // 현재 재시험 정보 조회 (workspace 확인 포함)
    const { data: current, error: fetchError } = await supabase
      .from("RetakeAssignments")
      .select(`
        absent_count,
        current_scheduled_date,
        exam:Exams!inner(course:Courses!inner(workspace)),
        student:Users!inner!RetakeAssignments_student_id_fkey(workspace)
      `)
      .eq("id", id)
      .eq("exam.course.workspace", session.workspace)
      .eq("student.workspace", session.workspace)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: "재시험을 찾을 수 없습니다." }, { status: 404 });
    }

    // 결석 카운트 증가 및 상태 업데이트
    const { data: updated, error: updateError } = await supabase
      .from("RetakeAssignments")
      .update({
        absent_count: current.absent_count + 1,
        status: "absent",
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 이력 기록
    const { error: historyError } = await supabase.from("RetakeHistory").insert({
      retake_assignment_id: id,
      action_type: "absent",
      previous_date: current.current_scheduled_date,
      note: note || null,
    });

    if (historyError) throw historyError;

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Absent error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "결석 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
