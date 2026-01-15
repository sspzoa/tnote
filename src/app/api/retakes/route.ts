import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const { examId, studentIds, scheduledDate } = await request.json();

  if (!examId || !studentIds || !Array.isArray(studentIds)) {
    return NextResponse.json({ error: "필수 정보를 입력해주세요." }, { status: 400 });
  }

  const { data: exam } = await supabase
    .from("Exams")
    .select("id, course:Courses!inner(workspace)")
    .eq("id", examId)
    .eq("course.workspace", session.workspace)
    .single();

  if (!exam) {
    return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: students } = await supabase
    .from("Users")
    .select("id")
    .in("id", studentIds)
    .eq("workspace", session.workspace)
    .eq("role", "student");

  if (!students || students.length !== studentIds.length) {
    return NextResponse.json({ error: "일부 학생을 찾을 수 없습니다." }, { status: 404 });
  }

  const assignments = studentIds.map((studentId) => ({
    exam_id: examId,
    student_id: studentId,
    current_scheduled_date: scheduledDate || null,
  }));

  const { data, error } = await supabase
    .from("RetakeAssignments")
    .insert(assignments)
    .select(`
      *,
      exam:Exams(id, name, exam_number, course:Courses(id, name)),
      student:Users!RetakeAssignments_student_id_fkey(id, phone_number, name)
    `);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "이미 재시험이 할당된 학생이 있습니다." }, { status: 409 });
    }
    throw error;
  }
  return NextResponse.json({ success: true, data });
};

const handleGet = async ({ request, supabase, session }: ApiContext) => {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  let studentId = searchParams.get("studentId");
  const status = searchParams.get("status");

  if (session.role === "student") {
    studentId = session.userId;
  }

  let query = supabase
    .from("RetakeAssignments")
    .select(`
      *,
      exam:Exams!inner(id, name, exam_number, course:Courses!inner(id, name, workspace)),
      student:Users!RetakeAssignments_student_id_fkey!inner(id, phone_number, name, school, workspace)
    `)
    .eq("student.workspace", session.workspace)
    .order("current_scheduled_date", { ascending: false, nullsFirst: true });

  if (courseId) {
    query = query.eq("exam.course_id", courseId);
  }
  if (studentId) {
    query = query.eq("student_id", studentId);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }
  return NextResponse.json({ data });
};

export const POST = withLogging(handlePost, { resource: "retakes", action: "create" });
export const GET = withLogging(handleGet, { resource: "retakes", action: "read" });
