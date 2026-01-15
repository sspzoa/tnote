import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;

  const { data: course } = await supabase
    .from("Courses")
    .select("id")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .single();

  if (!course) {
    return NextResponse.json({ error: "수업을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("CourseEnrollments")
    .select(`
      student_id,
      student:Users!CourseEnrollments_student_id_fkey(id, phone_number, name, school, birth_year)
    `)
    .eq("course_id", id);

  if (error) throw error;

  const students = data.map((enrollment) => enrollment.student);
  return NextResponse.json({ data: students });
};

export const GET = withLogging(handleGet, {
  resource: "course-students",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
