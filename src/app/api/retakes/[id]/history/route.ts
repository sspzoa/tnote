import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session, params }: ApiContext) => {
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

  const { data, error } = await supabase
    .from("RetakeHistory")
    .select(
      "id, retake_assignment_id, action_type, previous_date, new_date, previous_status, new_status, previous_management_status, new_management_status, note, created_at, performed_by:Users!RetakeHistory_performed_by_fkey(id, name)",
    )
    .eq("retake_assignment_id", id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return NextResponse.json({ data });
};

export const GET = withLogging(handleGet, {
  resource: "retake-history",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
