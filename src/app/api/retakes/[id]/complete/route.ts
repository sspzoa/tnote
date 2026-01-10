import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { note } = await request.json();

    const { supabase, session } = await getAuthenticatedClient();

    const { data: current, error: fetchError } = await supabase
      .from("RetakeAssignments")
      .select(`
        current_scheduled_date,
        exam:Exams!inner(course:Courses!inner(workspace)),
        student:Users!RetakeAssignments_student_id_fkey!inner(workspace)
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
      .update({ status: "completed" })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    const { error: historyError } = await supabase.from("RetakeHistory").insert({
      retake_assignment_id: id,
      action_type: "complete",
      previous_date: current.current_scheduled_date,
      note: note || null,
    });

    if (historyError) throw historyError;

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Complete error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "완료 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
