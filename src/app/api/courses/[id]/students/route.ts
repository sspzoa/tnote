import { NextResponse } from "next/server";
import { getAuthenticatedClient, requireAdminOrOwner } from "@/shared/lib/supabase/auth";

// 코스에 등록된 학생 목록 조회 (관리자만)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrOwner();
    const { id } = await params;

    const { supabase, session } = await getAuthenticatedClient();

    // 먼저 코스가 현재 사용자의 workspace에 속하는지 확인
    const { data: course } = await supabase
      .from("Courses")
      .select("id")
      .eq("id", id)
      .eq("workspace", session.workspace)
      .single();

    if (!course) {
      return NextResponse.json({ error: "코스를 찾을 수 없습니다." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("CourseEnrollments")
      .select(`
        student_id,
        student:Users!CourseEnrollments_student_id_fkey(id, phone_number, name, school, birth_year)
      `)
      .eq("course_id", id);

    if (error) throw error;

    // student 정보만 추출
    const students = data.map((enrollment) => enrollment.student);

    return NextResponse.json({ data: students });
  } catch (error: any) {
    console.error("Course students fetch error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "학생 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
