import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const { data: taskIds } = await supabase
    .from("AssignmentTasks")
    .select(
      `
      id,
      student:Users!AssignmentTasks_student_id_fkey!inner(id, name, workspace),
      assignment:Assignments!inner(
        id,
        name,
        course:Courses!inner(id, name, workspace)
      )
    `,
    )
    .eq("student.workspace", session.workspace);

  if (!taskIds || taskIds.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const ids = taskIds.map((r) => r.id);

  const { data: histories, error } = await supabase
    .from("AssignmentTaskHistory")
    .select(
      `
      id,
      assignment_task_id,
      action_type,
      previous_date,
      new_date,
      previous_status,
      new_status,
      previous_management_status,
      new_management_status,
      note,
      created_at,
      performed_by:Users!AssignmentTaskHistory_performed_by_fkey(id, name)
    `,
    )
    .in("assignment_task_id", ids)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  const taskMap = new Map(taskIds.map((r) => [r.id, r]));
  const data = histories?.map((h) => ({
    ...h,
    task: taskMap.get(h.assignment_task_id),
  }));

  return NextResponse.json({ data });
};

export const GET = withLogging(handleGet, {
  resource: "assignment-task-history-all",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
