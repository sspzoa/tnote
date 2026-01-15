import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

interface ExamWithCourse {
  id: string;
  course: {
    workspace: string;
  };
}

const handleGet = async ({ supabase, session, params }: ApiContext) => {
  const examId = params?.id;

  const { data: exam } = await supabase
    .from("Exams")
    .select("id, course:Courses!inner(workspace)")
    .eq("id", examId)
    .single();

  const typedExam = exam as unknown as ExamWithCourse | null;
  if (!typedExam || typedExam.course.workspace !== session.workspace) {
    return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("CourseAssignments")
    .select(`
      id,
      status,
      note,
      student:Users!CourseAssignments_student_id_fkey(id, name, phone_number, school)
    `)
    .eq("exam_id", examId);

  if (error) throw error;
  return NextResponse.json({ data });
};

interface AssignmentInput {
  studentId: string;
  status: string;
  note?: string;
}

const handlePost = async ({ request, supabase, session, params }: ApiContext) => {
  const examId = params?.id;
  const { assignments } = (await request.json()) as { assignments: AssignmentInput[] };

  if (!assignments || !Array.isArray(assignments)) {
    return NextResponse.json({ error: "과제 데이터가 필요합니다." }, { status: 400 });
  }

  const { data: exam } = await supabase
    .from("Exams")
    .select("id, course:Courses!inner(workspace)")
    .eq("id", examId)
    .single();

  const typedExam = exam as unknown as ExamWithCourse | null;
  if (!typedExam || typedExam.course.workspace !== session.workspace) {
    return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
  }

  const validStatuses = ["완료", "미흡", "미제출"];
  for (const assignment of assignments) {
    if (!assignment.studentId || !validStatuses.includes(assignment.status)) {
      return NextResponse.json({ error: "잘못된 과제 데이터 형식입니다." }, { status: 400 });
    }
  }

  const { data: existingRecords, error: fetchError } = await supabase
    .from("CourseAssignments")
    .select("id, student_id")
    .eq("exam_id", examId);

  if (fetchError) throw fetchError;

  const newStudentIds = new Set(assignments.map((a) => a.studentId));
  const toDelete = existingRecords?.filter((r) => !newStudentIds.has(r.student_id)).map((r) => r.id) || [];

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from("CourseAssignments").delete().in("id", toDelete);
    if (deleteError) throw deleteError;
  }

  if (assignments.length > 0) {
    const records = assignments.map((a) => ({
      exam_id: examId,
      student_id: a.studentId,
      status: a.status,
      note: a.note || null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("CourseAssignments").upsert(records, { onConflict: "exam_id,student_id" });

    if (error) throw error;
  }
  return NextResponse.json({ success: true, removed: toDelete.length, total: assignments.length });
};

export const GET = withLogging(handleGet, { resource: "exam-assignments", action: "read" });
export const POST = withLogging(handlePost, { resource: "exam-assignments", action: "create" });
