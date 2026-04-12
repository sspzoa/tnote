import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { STUDENT_ASSIGNMENT_HISTORY_TABLE, STUDENT_ASSIGNMENT_TABLE } from "@/shared/lib/utils/studentAssignments";

const handlePatch = async ({ request, supabase, session, params }: ApiContext) => {
  const id = params?.id;
  const { note } = await request.json();

  const { data: current, error: fetchError } = await supabase
    .from(STUDENT_ASSIGNMENT_TABLE)
    .select(`
      status,
      assignment:Assignments!inner(course:Courses!inner(workspace)),
      student:Users!StudentAssignments_student_id_fkey!inner(workspace)
    `)
    .eq("id", id)
    .eq("assignment.course.workspace", session.workspace)
    .eq("student.workspace", session.workspace)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: updated, error: updateError } = await supabase
    .from(STUDENT_ASSIGNMENT_TABLE)
    .update({ status: "insufficient" })
    .eq("id", id)
    .select()
    .single();

  if (updateError) throw updateError;

  const { error: historyError } = await supabase.from(STUDENT_ASSIGNMENT_HISTORY_TABLE).insert({
    student_assignment_id: id,
    action_type: "insufficient",
    previous_status: current.status,
    new_status: "insufficient",
    note: note || null,
    performed_by: session.userId,
  });

  if (historyError) throw historyError;
  return NextResponse.json({ success: true, data: updated });
};

export const PATCH = withLogging(handlePatch, {
  resource: "assignment-task-insufficient",
  action: "update",
  allowedRoles: ["owner", "admin"],
});
