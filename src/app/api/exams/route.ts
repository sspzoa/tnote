import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

// 시험 목록 조회 (권한: middleware에서 이미 체크됨)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const { supabase, session } = await getAuthenticatedClient();

    let query = supabase
      .from("Exams")
      .select(`
        *,
        course:Courses!inner(id, name, workspace)
      `)
      .eq("course.workspace", session.workspace)
      .order("exam_number", { ascending: true });

    if (courseId) {
      query = query.eq("course_id", courseId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Exams fetch error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ error: "시험 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 시험 생성 (권한: middleware에서 이미 체크됨)
export async function POST(request: Request) {
  try {
    const { courseId, examNumber, name } = await request.json();

    if (!courseId || !examNumber || !name) {
      return NextResponse.json({ error: "필수 정보를 입력해주세요." }, { status: 400 });
    }

    const { supabase, session } = await getAuthenticatedClient();

    // 코스가 현재 workspace에 속하는지 확인
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
      .from("Exams")
      .insert({
        course_id: courseId,
        exam_number: examNumber,
        name,
      })
      .select(`
        *,
        course:Courses(id, name)
      `)
      .single();

    if (error) {
      // 중복 시험 처리
      if (error.code === "23505") {
        return NextResponse.json({ error: "이미 같은 회차의 시험이 존재합니다." }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Exam creation error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ error: "시험 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
