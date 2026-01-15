import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "수업 ID가 필요합니다." }, { status: 400 });
  }

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
};

const handlePatch = async ({ request, supabase, session, params }: ApiContext) => {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "수업 ID가 필요합니다." }, { status: 400 });
  }

  const { name, startDate, endDate, daysOfWeek } = await request.json();

  // 이름 검증
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "수업 이름을 입력해주세요." }, { status: 400 });
    }
    if (name.length > 100) {
      return NextResponse.json({ error: "수업 이름은 100자 이하여야 합니다." }, { status: 400 });
    }
  }

  // 날짜 검증
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return NextResponse.json({ error: "시작일은 종료일보다 앞서야 합니다." }, { status: 400 });
  }

  // 요일 검증
  if (
    daysOfWeek !== undefined &&
    daysOfWeek !== null &&
    (!Array.isArray(daysOfWeek) || !daysOfWeek.every((d: number) => Number.isInteger(d) && d >= 0 && d <= 6))
  ) {
    return NextResponse.json({ error: "올바른 요일을 선택해주세요." }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name.trim();
  if (startDate !== undefined) updateData.start_date = startDate || null;
  if (endDate !== undefined) updateData.end_date = endDate || null;
  if (daysOfWeek !== undefined) updateData.days_of_week = daysOfWeek || null;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "수정할 항목이 없습니다." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("Courses")
    .update(updateData)
    .eq("id", id)
    .eq("workspace", session.workspace)
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json({ success: true, data });
};

const handleDelete = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "수업 ID가 필요합니다." }, { status: 400 });
  }

  const { error } = await supabase.from("Courses").delete().eq("id", id).eq("workspace", session.workspace);

  if (error) throw error;
  return NextResponse.json({ success: true });
};

export const GET = withLogging(handleGet, { resource: "courses", action: "read", allowedRoles: ["owner", "admin"] });
export const PATCH = withLogging(handlePatch, {
  resource: "courses",
  action: "update",
  allowedRoles: ["owner", "admin"],
});
export const DELETE = withLogging(handleDelete, {
  resource: "courses",
  action: "delete",
  allowedRoles: ["owner", "admin"],
});
