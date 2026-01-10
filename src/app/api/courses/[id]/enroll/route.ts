import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

// 학생 등록 (권한: middleware에서 이미 체크됨)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json({ error: "학생 ID를 입력해주세요." }, { status: 400 });
    }

    const { supabase, session } = await getAuthenticatedClient();

    // 코스와 학생이 모두 현재 workspace에 속하는지 확인
    const { data: course } = await supabase
      .from("Courses")
      .select("id")
      .eq("id", id)
      .eq("workspace", session.workspace)
      .single();

    if (!course) {
      return NextResponse.json({ error: "수업을 찾을 수 없습니다." }, { status: 404 });
    }

    const { data: student } = await supabase
      .from("Users")
      .select("id")
      .eq("id", studentId)
      .eq("workspace", session.workspace)
      .eq("role", "student")
      .single();

    if (!student) {
      return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("CourseEnrollments")
      .insert({
        course_id: id,
        student_id: studentId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "이미 등록된 학생입니다." }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Student enroll error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "학생 등록 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 학생 제거 (권한: middleware에서 이미 체크됨)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json({ error: "학생 ID를 입력해주세요." }, { status: 400 });
    }

    const { supabase, session } = await getAuthenticatedClient();

    // 코스가 현재 workspace에 속하는지 확인
    const { data: course } = await supabase
      .from("Courses")
      .select("id")
      .eq("id", id)
      .eq("workspace", session.workspace)
      .single();

    if (!course) {
      return NextResponse.json({ error: "수업을 찾을 수 없습니다." }, { status: 404 });
    }

    const { error } = await supabase.from("CourseEnrollments").delete().eq("course_id", id).eq("student_id", studentId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Student remove error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "학생 제거 중 오류가 발생했습니다." }, { status: 500 });
  }
}
