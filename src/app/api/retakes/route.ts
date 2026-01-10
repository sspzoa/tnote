import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

export async function POST(request: Request) {
  try {
    const { examId, studentIds, scheduledDate } = await request.json();

    if (!examId || !studentIds || !Array.isArray(studentIds) || !scheduledDate) {
      return NextResponse.json({ error: "필수 정보를 입력해주세요." }, { status: 400 });
    }

    const { supabase, session } = await getAuthenticatedClient();

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
      current_scheduled_date: scheduledDate,
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
  } catch (error: any) {
    console.error("Retake assignment error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ error: "재시험 할당 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { supabase, session } = await getAuthenticatedClient();

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
      .order("current_scheduled_date", { ascending: true });

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
      console.error("Retake query error:", error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Retake fetch error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ error: "재시험 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
