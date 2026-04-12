import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { STUDENT_ASSIGNMENT_TABLE } from "@/shared/lib/utils/studentAssignments";

const handleGet = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;

  let query = supabase
    .from(STUDENT_ASSIGNMENT_TABLE)
    .select(`
      *,
      assignment:Assignments!inner(id, name, course:Courses!inner(id, name, workspace)),
      student:Users!StudentAssignments_student_id_fkey!inner(id, phone_number, name, school, workspace)
    `)
    .eq("id", id)
    .eq("student.workspace", session.workspace);

  if (session.role === "student") {
    query = query.eq("student_id", session.userId);
  }

  const { data, error } = await query.single();

  if (error) throw error;
  return NextResponse.json({ data });
};

const handleDelete = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;

  const { data: task } = await supabase
    .from(STUDENT_ASSIGNMENT_TABLE)
    .select(`
      id,
      student:Users!StudentAssignments_student_id_fkey!inner(workspace)
    `)
    .eq("id", id)
    .eq("student.workspace", session.workspace)
    .single();

  if (!task) {
    return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 });
  }

  const { error } = await supabase.from(STUDENT_ASSIGNMENT_TABLE).delete().eq("id", id);

  if (error) throw error;
  return NextResponse.json({ success: true });
};

export const GET = withLogging(handleGet, {
  resource: "assignment-tasks",
  action: "read",
  allowedRoles: ["owner", "admin", "student"],
});
export const DELETE = withLogging(handleDelete, {
  resource: "assignment-tasks",
  action: "delete",
  allowedRoles: ["owner", "admin"],
});
