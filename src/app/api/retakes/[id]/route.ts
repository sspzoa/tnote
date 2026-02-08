import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;

  let query = supabase
    .from("RetakeAssignments")
    .select(`
      *,
      exam:Exams!inner(id, name, exam_number, course:Courses!inner(id, name, workspace)),
      student:Users!RetakeAssignments_student_id_fkey!inner(id, phone_number, name, school, workspace)
    `)
    .eq("id", id)
    .eq("exam.course.workspace", session.workspace)
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

  const { data: retake } = await supabase
    .from("RetakeAssignments")
    .select(`
      id,
      exam:Exams!inner(course:Courses!inner(workspace)),
      student:Users!RetakeAssignments_student_id_fkey!inner(workspace)
    `)
    .eq("id", id)
    .eq("exam.course.workspace", session.workspace)
    .eq("student.workspace", session.workspace)
    .single();

  if (!retake) {
    return NextResponse.json({ error: "재시험을 찾을 수 없습니다." }, { status: 404 });
  }

  const { error } = await supabase.from("RetakeAssignments").delete().eq("id", id);

  if (error) throw error;
  return NextResponse.json({ success: true });
};

export const GET = withLogging(handleGet, {
  resource: "retakes",
  action: "read",
  allowedRoles: ["owner", "admin", "student"],
});
export const DELETE = withLogging(handleDelete, {
  resource: "retakes",
  action: "delete",
  allowedRoles: ["owner", "admin"],
});
