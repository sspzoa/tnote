import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

interface AssignmentWorkspaceOnly {
  id: string;
  course: {
    workspace: string;
  };
}

const handleGet = async ({ supabase, session, params }: ApiContext) => {
  const assignmentId = params?.id;

  const { data: assignment } = await supabase
    .from("Assignments")
    .select("id, course:Courses!inner(workspace)")
    .eq("id", assignmentId)
    .single();

  const typedAssignment = assignment as unknown as AssignmentWorkspaceOnly | null;
  if (!typedAssignment || typedAssignment.course.workspace !== session.workspace) {
    return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("CourseAssignments")
    .select(`
      id,
      status,
      student:Users!CourseAssignments_student_id_fkey(id, name, phone_number, school)
    `)
    .eq("assignment_id", assignmentId);

  if (error) throw error;
  return NextResponse.json({ data });
};

interface SubmissionInput {
  studentId: string;
  status: string;
}

const handlePost = async ({ request, supabase, session, params }: ApiContext) => {
  const assignmentId = params?.id;
  const { submissions } = (await request.json()) as { submissions: SubmissionInput[] };

  if (!submissions || !Array.isArray(submissions)) {
    return NextResponse.json({ error: "과제 데이터가 필요합니다." }, { status: 400 });
  }

  const { data: assignment } = await supabase
    .from("Assignments")
    .select("id, course:Courses!inner(workspace)")
    .eq("id", assignmentId)
    .single();

  const typedAssignment = assignment as unknown as AssignmentWorkspaceOnly | null;
  if (!typedAssignment || typedAssignment.course.workspace !== session.workspace) {
    return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 });
  }

  const validStatuses = ["완료", "미흡", "미제출", "검사예정"];
  for (const submission of submissions) {
    if (!submission.studentId || !validStatuses.includes(submission.status)) {
      return NextResponse.json({ error: "잘못된 과제 데이터 형식입니다." }, { status: 400 });
    }
  }

  const { data: existingRecords, error: fetchError } = await supabase
    .from("CourseAssignments")
    .select("id, student_id")
    .eq("assignment_id", assignmentId);

  if (fetchError) throw fetchError;

  const newStudentIds = new Set(submissions.map((s) => s.studentId));
  const toDelete = existingRecords?.filter((r) => !newStudentIds.has(r.student_id)).map((r) => r.id) || [];

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from("CourseAssignments").delete().in("id", toDelete);
    if (deleteError) throw deleteError;
  }

  if (submissions.length > 0) {
    const records = submissions.map((s) => ({
      assignment_id: assignmentId,
      student_id: s.studentId,
      status: s.status,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("CourseAssignments")
      .upsert(records, { onConflict: "assignment_id,student_id" });

    if (error) throw error;
  }

  return NextResponse.json({ success: true, removed: toDelete.length, total: submissions.length });
};

export const GET = withLogging(handleGet, {
  resource: "assignment-submissions",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
export const POST = withLogging(handlePost, {
  resource: "assignment-submissions",
  action: "create",
  allowedRoles: ["owner", "admin"],
});
