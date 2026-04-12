import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { STUDENT_ASSIGNMENT_HISTORY_TABLE, STUDENT_ASSIGNMENT_TABLE } from "@/shared/lib/utils/studentAssignments";

const handleGet = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;

  const { data: task } = await supabase
    .from(STUDENT_ASSIGNMENT_TABLE)
    .select(`
      id,
      assignment:Assignments!inner(course:Courses!inner(workspace)),
      student:Users!StudentAssignments_student_id_fkey!inner(workspace)
    `)
    .eq("id", id)
    .eq("assignment.course.workspace", session.workspace)
    .eq("student.workspace", session.workspace)
    .single();

  if (!task) {
    return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from(STUDENT_ASSIGNMENT_HISTORY_TABLE)
    .select(
      "id, assignment_task_id:student_assignment_id, action_type, previous_date, new_date, previous_status, new_status, note, created_at, performed_by:Users!StudentAssignmentHistory_performed_by_fkey(id, name)",
    )
    .eq("student_assignment_id", id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return NextResponse.json({ data });
};

export const GET = withLogging(handleGet, {
  resource: "assignment-task-history",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
