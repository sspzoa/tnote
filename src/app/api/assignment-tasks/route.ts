import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const parseClassDate = (assignmentName: string): Date => {
  const koreaFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" });
  const koreaToday = new Date(`${koreaFormatter.format(new Date())}T12:00:00`);

  const match = assignmentName.match(/^(\d{1,2})\/(\d{1,2})/);
  if (!match) return koreaToday;

  const month = Number.parseInt(match[1], 10);
  const day = Number.parseInt(match[2], 10);
  const classDate = new Date(koreaToday.getFullYear(), month - 1, day, 12, 0, 0);

  const threeMonthsLater = new Date(koreaToday);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  if (classDate > threeMonthsLater) {
    classDate.setFullYear(classDate.getFullYear() - 1);
  }

  return classDate;
};

// 수업날 기준 일주일 뒤 수업이 지나고 가장 가까운 필참 클리닉 요일
const getNextClinicDate = (clinicWeekdays: number[], assignmentName: string): string | null => {
  if (!clinicWeekdays || clinicWeekdays.length === 0) return null;

  const classDay = parseClassDate(assignmentName);
  const oneWeekLater = new Date(classDay);
  oneWeekLater.setDate(classDay.getDate() + 7);

  for (let i = 1; i <= 7; i++) {
    const date = new Date(oneWeekLater);
    date.setDate(oneWeekLater.getDate() + i);
    if (clinicWeekdays.includes(date.getDay())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }
  return null;
};

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const { assignmentId, studentIds, scheduledDate } = await request.json();

  if (!assignmentId) {
    return NextResponse.json({ error: "필수 정보를 입력해주세요." }, { status: 400 });
  }

  if (!studentIds || !Array.isArray(studentIds)) {
    return NextResponse.json({ error: "필수 정보를 입력해주세요." }, { status: 400 });
  }

  const { data: assignment } = await supabase
    .from("Assignments")
    .select("id, name, course:Courses!inner(workspace)")
    .eq("id", assignmentId)
    .eq("course.workspace", session.workspace)
    .single();

  if (!assignment) {
    return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: students } = await supabase
    .from("Users")
    .select("id, required_clinic_weekdays")
    .in("id", studentIds)
    .eq("workspace", session.workspace)
    .eq("role", "student");

  if (!students || students.length !== studentIds.length) {
    return NextResponse.json({ error: "일부 학생을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: defaultStatus } = await supabase
    .from("ManagementStatuses")
    .select("name")
    .eq("workspace", session.workspace)
    .eq("category", "assignment")
    .eq("display_order", 1)
    .single();

  const assignmentName = (assignment as unknown as { name: string }).name;
  const studentClinicDateMap = new Map<string, string | null>();
  if (!scheduledDate) {
    for (const student of students) {
      studentClinicDateMap.set(student.id, getNextClinicDate(student.required_clinic_weekdays, assignmentName));
    }
  }

  const records = studentIds.map((studentId: string) => ({
    assignment_id: assignmentId,
    student_id: studentId,
    current_scheduled_date: scheduledDate || studentClinicDateMap.get(studentId) || null,
    management_status: defaultStatus?.name ?? null,
  }));

  const { data, error } = await supabase
    .from("AssignmentTasks")
    .insert(records)
    .select(`
      *,
      assignment:Assignments!inner(id, name, course:Courses!inner(id, name)),
      student:Users!AssignmentTasks_student_id_fkey!inner(id, phone_number, name)
    `);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "이미 과제가 할당된 학생이 있습니다." }, { status: 409 });
    }
    throw error;
  }

  if (data && data.length > 0) {
    const historyRecords = data.map((record) => ({
      assignment_task_id: record.id,
      action_type: "assign",
      new_date: record.current_scheduled_date || null,
      performed_by: session.userId,
    }));

    await supabase.from("AssignmentTaskHistory").insert(historyRecords);
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
};

const handleGet = async ({ request, supabase, session }: ApiContext) => {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  let studentId = searchParams.get("studentId");
  const status = searchParams.get("status");
  const managementStatus = searchParams.get("managementStatus");

  if (session.role === "student") {
    studentId = session.userId;
  }

  let query = supabase
    .from("AssignmentTasks")
    .select(`
      *,
      assignment:Assignments!inner(id, name, course:Courses!inner(id, name, workspace)),
      student:Users!AssignmentTasks_student_id_fkey!inner(
        id, phone_number, name, school, workspace, parent_phone_number,
        tags:StudentTagAssignments(id, tag_id, start_date, end_date, tag:StudentTags(id, name, color))
      )
    `)
    .eq("student.workspace", session.workspace);

  if (courseId) {
    query = query.eq("assignment.course_id", courseId);
  }
  if (studentId) {
    query = query.eq("student_id", studentId);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (managementStatus) {
    query = query.eq("management_status", managementStatus);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return NextResponse.json({ data });
};

export const POST = withLogging(handlePost, {
  resource: "assignment-tasks",
  action: "create",
  allowedRoles: ["owner", "admin"],
});
export const GET = withLogging(handleGet, {
  resource: "assignment-tasks",
  action: "read",
  allowedRoles: ["owner", "admin", "student"],
});
