import { NextResponse } from "next/server";
import { getAuthenticatedClient, requireAdminOrOwner, getSession } from "@/shared/lib/supabase/auth";

// 재시험 할당 (관리자만)
export async function POST(request: Request) {
  try {
    await requireAdminOrOwner();
    const { examId, studentIds, scheduledDate, note } = await request.json();

    if (!examId || !studentIds || !Array.isArray(studentIds) || !scheduledDate) {
      return NextResponse.json({ error: "필수 정보를 입력해주세요." }, { status: 400 });
    }

    const { supabase } = await getAuthenticatedClient();

    // 각 학생에게 재시험 할당
    const assignments = studentIds.map((studentId) => ({
      exam_id: examId,
      student_id: studentId,
      current_scheduled_date: scheduledDate,
      note: note || null,
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
      // 중복 할당 처리
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

// 재시험 목록 조회 (관리자는 전체, 학생은 본인 것만)
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    let studentId = searchParams.get("studentId");
    const status = searchParams.get("status");

    // 학생은 본인의 재시험만 조회 가능
    if (session.role === "student") {
      studentId = session.userId;
    }

    const { supabase } = await getAuthenticatedClient();

    let query = supabase
      .from("RetakeAssignments")
      .select(`
        *,
        exam:Exams!inner(id, name, exam_number, course:Courses!inner(id, name, workspace)),
        student:Users!inner!RetakeAssignments_student_id_fkey(id, phone_number, name, school, workspace)
      `)
      .eq("exam.course.workspace", session.workspace)
      .eq("student.workspace", session.workspace)
      .order("current_scheduled_date", { ascending: true });

    // 필터 적용
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

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Retake fetch error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ error: "재시험 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
