import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePatch = async ({ request, supabase, session, logger, params }: ApiContext) => {
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

  await logger.logUpdate("retake-complete", id!, "Retake marked as completed");
  return NextResponse.json({ success: true, data: updated });
};

export const PATCH = withLogging(handlePatch, { resource: "retake-complete", action: "update" });
