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

  const studentIds = data.map((enrollment) => enrollment.student_id);

  const { data: tagsData, error: tagsError } = await supabase
    .from("StudentTagAssignments")
    .select(`
      student_id,
      id,
      tag_id,
      start_date,
      end_date,
      created_at,
      tag:StudentTags!inner(id, name, color, workspace)
    `)
    .in("student_id", studentIds)
    .eq("tag.workspace", session.workspace);

  if (tagsError) throw tagsError;

  const tagsMap = new Map<string, typeof tagsData>();
  for (const assignment of tagsData) {
    const existing = tagsMap.get(assignment.student_id) || [];
    existing.push(assignment);
    tagsMap.set(assignment.student_id, existing);
  }

  const students = data.map((enrollment) => {
    const student = enrollment.student as unknown as { id: string; name: string; [key: string]: unknown };
    return {
      ...student,
      tags: tagsMap.get(student.id) || [],
    };
  });
  return NextResponse.json({ data: students });
};

export const GET = withLogging(handleGet, {
  resource: "course-students",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
