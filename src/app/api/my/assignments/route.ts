import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { STUDENT_ASSIGNMENT_TABLE } from "@/shared/lib/utils/studentAssignments";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const { data, error } = await supabase
    .from(STUDENT_ASSIGNMENT_TABLE)
    .select(`
      id,
      status,
      updated_at,
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
  resource: "my-assignments",
  action: "read",
  allowedRoles: ["student"],
});
