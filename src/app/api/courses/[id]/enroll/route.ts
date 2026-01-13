import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePost = async ({ request, supabase, session, logger, params }: ApiContext) => {
  const id = params?.id;
  const { studentId } = await request.json();

  if (!studentId) {
    return NextResponse.json({ error: "학생 ID를 입력해주세요." }, { status: 400 });
  }

  const { data: course } = await supabase
    .from("Courses")
    .select("id")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .single();

  if (!course) {
    return NextResponse.json({ error: "수업을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: student } = await supabase
    .from("Users")
    .select("id")
    .eq("id", studentId)
    .eq("workspace", session.workspace)
    .eq("role", "student")
    .single();

  if (!student) {
    return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("CourseEnrollments")
    .insert({
      course_id: id,
      student_id: studentId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "이미 등록된 학생입니다." }, { status: 409 });
    }
    throw error;
  }

  await logger.logCreate("course-enrollment", data.id, `Student ${studentId} enrolled to course ${id}`);
  return NextResponse.json({ success: true, data });
};

const handleDelete = async ({ request, supabase, session, logger, params }: ApiContext) => {
  const id = params?.id;
  const { studentId } = await request.json();

  if (!studentId) {
    return NextResponse.json({ error: "학생 ID를 입력해주세요." }, { status: 400 });
  }

  const { data: course } = await supabase
    .from("Courses")
    .select("id")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .single();

  if (!course) {
    return NextResponse.json({ error: "수업을 찾을 수 없습니다." }, { status: 404 });
  }

  const { error } = await supabase.from("CourseEnrollments").delete().eq("course_id", id).eq("student_id", studentId);

  if (error) throw error;

  await logger.logDelete("course-enrollment", `${id}-${studentId}`, `Student ${studentId} removed from course ${id}`);
  return NextResponse.json({ success: true });
};

export const POST = withLogging(handlePost, { resource: "course-enrollment", action: "create" });
export const DELETE = withLogging(handleDelete, { resource: "course-enrollment", action: "delete" });
