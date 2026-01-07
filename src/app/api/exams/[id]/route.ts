import { NextResponse } from "next/server";
import { getAuthenticatedClient, requireAdminOrOwner } from "@/shared/lib/supabase/auth";

// 시험 정보 조회 (관리자만)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrOwner();
    const { id } = await params;

    const { supabase, session } = await getAuthenticatedClient();

    const { data, error } = await supabase
      .from("Exams")
      .select(`
        *,
        course:Courses!inner(id, name, workspace)
      `)
      .eq("id", id)
      .eq("course.workspace", session.workspace)
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Exam fetch error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "시험 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 시험 정보 수정 (관리자만)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrOwner();
    const { id } = await params;
    const { examNumber, name } = await request.json();

    const { supabase, session } = await getAuthenticatedClient();

    const updateData: any = {};
    if (examNumber !== undefined) updateData.exam_number = examNumber;
    if (name !== undefined) updateData.name = name;

    // 먼저 시험이 현재 workspace에 속하는지 확인
    const { data: exam } = await supabase
      .from("Exams")
      .select("id, course:Courses!inner(workspace)")
      .eq("id", id)
      .eq("course.workspace", session.workspace)
      .single();

    if (!exam) {
      return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("Exams")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        course:Courses(id, name)
      `)
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "이미 같은 회차의 시험이 존재합니다." }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Exam update error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "시험 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 시험 삭제 (관리자만)
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrOwner();
    const { id } = await params;

    const { supabase, session } = await getAuthenticatedClient();

    // 먼저 시험이 현재 workspace에 속하는지 확인
    const { data: exam } = await supabase
      .from("Exams")
      .select("id, course:Courses!inner(workspace)")
      .eq("id", id)
      .eq("course.workspace", session.workspace)
      .single();

    if (!exam) {
      return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
    }

    const { error } = await supabase.from("Exams").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Exam delete error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "시험 삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}
