import { NextResponse } from "next/server";
import { getAuthenticatedClient, requireAdminOrOwner } from "@/shared/lib/supabase/auth";

// 코스 정보 조회 (관리자만)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrOwner();
    const { id } = await params;

    const { supabase, session } = await getAuthenticatedClient();

    const { data, error } = await supabase
      .from("Courses")
      .select(`
        *,
        student_count:CourseEnrollments(count)
      `)
      .eq("id", id)
      .eq("workspace", session.workspace)
      .single();

    if (error) throw error;

    // student_count 형식 변환
    const courseData = {
      ...data,
      student_count: data.student_count?.[0]?.count || 0,
    };

    return NextResponse.json({ data: courseData });
  } catch (error: any) {
    console.error("Course fetch error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "코스 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 코스 정보 수정 (관리자만)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrOwner();
    const { id } = await params;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "코스 이름을 입력해주세요." }, { status: 400 });
    }

    const { supabase, session } = await getAuthenticatedClient();

    const { data, error } = await supabase
      .from("Courses")
      .update({ name })
      .eq("id", id)
      .eq("workspace", session.workspace)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Course update error:", error);
    return NextResponse.json({ error: "코스 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 코스 삭제 (관리자만)
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrOwner();
    const { id } = await params;

    const { supabase, session } = await getAuthenticatedClient();

    const { error } = await supabase.from("Courses").delete().eq("id", id).eq("workspace", session.workspace);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Course delete error:", error);
    return NextResponse.json({ error: "코스 삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}
