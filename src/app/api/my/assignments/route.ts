import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const { data, error } = await supabase
    .from("CourseAssignments")
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
