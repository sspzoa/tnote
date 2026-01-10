import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

export async function GET() {
  try {
    const { supabase, session } = await getAuthenticatedClient();

    const { data, error } = await supabase
      .from("Courses")
      .select(`
        *,
        enrollments:CourseEnrollments(count)
      `)
      .eq("workspace", session.workspace)
      .order("created_at", { ascending: false });

    if (error) throw error;

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

export async function POST(request: Request) {
  try {
    const { name, startDate, endDate, daysOfWeek } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "수업 이름을 입력해주세요." }, { status: 400 });
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return NextResponse.json({ error: "시작일은 종료일보다 앞서야 합니다." }, { status: 400 });
    }

    if (daysOfWeek && (!Array.isArray(daysOfWeek) || !daysOfWeek.every((d: number) => d >= 0 && d <= 6))) {
      return NextResponse.json({ error: "올바른 요일을 선택해주세요." }, { status: 400 });
    }

    const { supabase, session } = await getAuthenticatedClient();

    const { data, error } = await supabase
      .from("Courses")
      .insert({
        name,
        workspace: session.workspace,
        start_date: startDate || null,
        end_date: endDate || null,
        days_of_week: daysOfWeek || null,
      })
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
