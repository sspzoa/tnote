import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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
    return NextResponse.json({ error: "수업 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, startDate, endDate, daysOfWeek } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "수업 이름을 입력해주세요." }, { status: 400 });
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return NextResponse.json({ error: "시작일은 종료일보다 앞서야 합니다." }, { status: 400 });
    }

    if (
      daysOfWeek !== undefined &&
      daysOfWeek !== null &&
      (!Array.isArray(daysOfWeek) || !daysOfWeek.every((d: number) => d >= 0 && d <= 6))
    ) {
      return NextResponse.json({ error: "올바른 요일을 선택해주세요." }, { status: 400 });
    }

    const { supabase, session } = await getAuthenticatedClient();

    const updateData: any = { name };
    if (startDate !== undefined) updateData.start_date = startDate || null;
    if (endDate !== undefined) updateData.end_date = endDate || null;
    if (daysOfWeek !== undefined) updateData.days_of_week = daysOfWeek || null;

    const { data, error } = await supabase
      .from("Courses")
      .update(updateData)
      .eq("id", id)
      .eq("workspace", session.workspace)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Course update error:", error);
    return NextResponse.json({ error: "수업 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { supabase, session } = await getAuthenticatedClient();

    const { error } = await supabase.from("Courses").delete().eq("id", id).eq("workspace", session.workspace);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Course delete error:", error);
    return NextResponse.json({ error: "수업 삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}
