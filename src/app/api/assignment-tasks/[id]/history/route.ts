import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;

  const { data: task } = await supabase
    .from("AssignmentTasks")
    .select(`
      id,
      assignment:Assignments!inner(course:Courses!inner(workspace)),
      student:Users!AssignmentTasks_student_id_fkey!inner(workspace)
    `)
    .eq("id", id)
    .eq("assignment.course.workspace", session.workspace)
    .eq("student.workspace", session.workspace)
    .single();

  if (!task) {
    return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("AssignmentTaskHistory")
    .select(
      "id, assignment_task_id, action_type, previous_date, new_date, previous_status, new_status, previous_management_status, new_management_status, note, created_at, performed_by:Users!AssignmentTaskHistory_performed_by_fkey(id, name)",
    )
    .eq("assignment_task_id", id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return NextResponse.json({ data });
};

export const GET = withLogging(handleGet, {
  resource: "assignment-task-history",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
