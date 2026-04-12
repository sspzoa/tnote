import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { STUDENT_ASSIGNMENT_HISTORY_TABLE } from "@/shared/lib/utils/studentAssignments";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const { data: histories, error } = await supabase
    .from(STUDENT_ASSIGNMENT_HISTORY_TABLE)
    .select(
      `
      id,
      assignment_task_id:student_assignment_id,
      action_type,
      previous_date,
      new_date,
      previous_status,
      new_status,
      note,
      created_at,
      performed_by:Users!StudentAssignmentHistory_performed_by_fkey(id, name),
      task:StudentAssignments!StudentAssignmentHistory_student_assignment_id_fkey!inner(
        id,
        student:Users!StudentAssignments_student_id_fkey!inner(id, name, workspace),
        assignment:Assignments!StudentAssignments_assignment_id_fkey!inner(
          id,
          name,
          course:Courses!Assignments_course_id_fkey!inner(id, name, workspace)
        )
      )
    `,
    )
    .eq("task.student.workspace", session.workspace)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return NextResponse.json({ data: histories || [] });
};

export const GET = withLogging(handleGet, {
  resource: "assignment-task-history-all",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
