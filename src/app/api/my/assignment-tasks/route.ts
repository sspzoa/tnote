import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const { data, error } = await supabase
    .from("AssignmentTasks")
    .select(`
      id,
      status,
      management_status,
      current_scheduled_date,
      postpone_count,
      assignment:Assignments!inner(
        id, name,
        course:Courses!inner(id, name, workspace)
      )
    `)
    .eq("student_id", session.userId)
    .eq("assignment.course.workspace", session.workspace);

  if (error) throw error;
  return NextResponse.json({ data });
};

export const GET = withLogging(handleGet, {
  resource: "my-assignment-tasks",
  action: "read",
  allowedRoles: ["student"],
});
