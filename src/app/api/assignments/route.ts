import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { compareByDatePrefix } from "@/shared/lib/utils/sort";
import {
  getDefaultStudentAssignmentDate,
  STUDENT_ASSIGNMENT_HISTORY_TABLE,
  STUDENT_ASSIGNMENT_TABLE,
} from "@/shared/lib/utils/studentAssignments";

const handleGet = async ({ request, supabase, session }: ApiContext) => {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  let query = supabase
    .from("Assignments")
    .select(`
      *,
      course:Courses!inner(id, name, workspace)
    `)
    .eq("course.workspace", session.workspace);

  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return NextResponse.json({ data: [...(data || [])].sort(compareByDatePrefix) });
};

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const { courseId, name } = await request.json();

  if (!courseId || !name) {
    return NextResponse.json({ error: "필수 정보를 입력해주세요." }, { status: 400 });
  }

  const { data: course } = await supabase
    .from("Courses")
    .select("id")
    .eq("id", courseId)
    .eq("workspace", session.workspace)
    .single();

  if (!course) {
    return NextResponse.json({ error: "코스를 찾을 수 없습니다." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("Assignments")
    .insert({
      course_id: courseId,
      name,
      workspace: session.workspace,
    })
    .select(`
      *,
      course:Courses(id, name)
    `)
    .single();

  if (error) throw error;

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("CourseEnrollments")
    .select("student_id")
    .eq("course_id", courseId);

  if (enrollmentsError) throw enrollmentsError;

  const studentIds = [...new Set((enrollments || []).map((enrollment) => enrollment.student_id))];
  let autoAssignedCount = 0;

  if (studentIds.length > 0) {
    const { data: students, error: studentsError } = await supabase
      .from("Users")
      .select("id, required_clinic_weekdays")
      .in("id", studentIds)
      .eq("workspace", session.workspace)
      .eq("role", "student");

    if (studentsError) throw studentsError;

    const records = (students || []).map((student) => ({
      assignment_id: data.id,
      student_id: student.id,
      current_scheduled_date: getDefaultStudentAssignmentDate(student.required_clinic_weekdays, name),
    }));

    if (records.length > 0) {
      const { data: createdAssignments, error: createAssignmentsError } = await supabase
        .from(STUDENT_ASSIGNMENT_TABLE)
        .insert(records)
        .select("id, current_scheduled_date");

      if (createAssignmentsError) throw createAssignmentsError;

      autoAssignedCount = createdAssignments?.length ?? 0;

      if (createdAssignments && createdAssignments.length > 0) {
        const historyRecords = createdAssignments.map((record) => ({
          student_assignment_id: record.id,
          action_type: "assign",
          new_date: record.current_scheduled_date || null,
          performed_by: session.userId,
        }));

        const { error: historyError } = await supabase.from(STUDENT_ASSIGNMENT_HISTORY_TABLE).insert(historyRecords);

        if (historyError) throw historyError;
      }
    }
  }

  return NextResponse.json({ success: true, data, autoAssignedCount }, { status: 201 });
};

export const GET = withLogging(handleGet, {
  resource: "assignments",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
export const POST = withLogging(handlePost, {
  resource: "assignments",
  action: "create",
  allowedRoles: ["owner", "admin"],
});
