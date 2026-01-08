import { NextResponse } from "next/server";
import { getAuthenticatedClient, requireAdminOrOwner } from "@/shared/lib/supabase/auth";

// 코스 목록 조회 (관리자만)
export async function GET() {
  try {
    await requireAdminOrOwner();
    const { supabase } = await getAuthenticatedClient();

    // RLS가 workspace 필터링을 자동으로 처리
    const { data, error } = await supabase
      .from("Courses")
      .select(`
        *,
        enrollments:CourseEnrollments(count)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // 학생 수 계산
    const coursesWithCount = data.map((course: any) => ({
      ...course,
      student_count: course.enrollments[0]?.count || 0,
      enrollments: undefined,
    }));

    return NextResponse.json({ data: coursesWithCount });
  } catch (error: any) {
    console.error("Courses fetch error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ error: "수업 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 코스 생성 (관리자만)
export async function POST(request: Request) {
  try {
    await requireAdminOrOwner();
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "수업 이름을 입력해주세요." }, { status: 400 });
    }

    const { supabase, session } = await getAuthenticatedClient();

    const { data, error } = await supabase
      .from("Courses")
      .insert({ name, workspace: session.workspace })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Course creation error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ error: "수업 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
