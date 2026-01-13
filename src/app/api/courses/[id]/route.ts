import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session, logger, params }: ApiContext) => {
  const id = params?.id;

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

  await logger.info("read", "courses", `Retrieved course: ${data.name}`, { resourceId: id });
  return NextResponse.json({ data: courseData });
};

const handlePatch = async ({ request, supabase, session, logger, params }: ApiContext) => {
  const id = params?.id;
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

  const updateData: Record<string, unknown> = { name };
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

  await logger.logUpdate("courses", id!, `Course updated: ${name}`);
  return NextResponse.json({ success: true, data });
};

const handleDelete = async ({ supabase, session, logger, params }: ApiContext) => {
  const id = params?.id;

  const { error } = await supabase.from("Courses").delete().eq("id", id).eq("workspace", session.workspace);

  if (error) throw error;

  await logger.logDelete("courses", id!, "Course deleted");
  return NextResponse.json({ success: true });
};

export const GET = withLogging(handleGet, { resource: "courses", action: "read" });
export const PATCH = withLogging(handlePatch, { resource: "courses", action: "update" });
export const DELETE = withLogging(handleDelete, { resource: "courses", action: "delete" });
