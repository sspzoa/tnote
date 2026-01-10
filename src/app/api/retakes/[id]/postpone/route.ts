import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { newDate, note } = await request.json();

    if (!newDate) {
      return NextResponse.json({ error: "새로운 날짜를 입력해주세요." }, { status: 400 });
    }

    const { supabase, session } = await getAuthenticatedClient();

    const { data: current, error: fetchError } = await supabase
      .from("RetakeAssignments")
      .select(`
        current_scheduled_date,
        postpone_count,
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
