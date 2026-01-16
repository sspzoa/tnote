import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { getTodayKST } from "@/shared/lib/utils/date";

const handlePatch = async ({ request, supabase, session, params }: ApiContext) => {
  const id = params?.id;
  const { note } = await request.json();

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

  const today = getTodayKST();
  const previousDate = current.current_scheduled_date;

  const { data: updated, error: updateError } = await supabase
    .from("RetakeAssignments")
    .update({ status: "completed", current_scheduled_date: today })
    .eq("id", id)
    .select()
    .single();

  if (updateError) throw updateError;

  const { error: historyError } = await supabase.from("RetakeHistory").insert({
    retake_assignment_id: id,
    action_type: "complete",
    previous_date: previousDate,
    new_date: today,
    note: note || null,
    performed_by: session.userId,
  });

  if (historyError) throw historyError;
  return NextResponse.json({ success: true, data: updated });
};

export const PATCH = withLogging(handlePatch, {
  resource: "retake-complete",
  action: "update",
  allowedRoles: ["owner", "admin"],
});
