import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const { data, error } = await supabase
    .from("Courses")
    .select(`
      *,
      enrollments:CourseEnrollments(count)
    `)
    .eq("workspace", session.workspace);

  if (error) throw error;

  const coursesWithCount = data.map((course: Record<string, unknown>) => ({
    ...course,
    student_count: (course.enrollments as Array<{ count: number }>)[0]?.count || 0,
    enrollments: undefined,
  }));
  return NextResponse.json({ data: coursesWithCount });
};

const handlePost = async ({ request, supabase, session }: ApiContext) => {
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
};

export const GET = withLogging(handleGet, { resource: "courses", action: "read", allowedRoles: ["owner", "admin"] });
export const POST = withLogging(handlePost, {
  resource: "courses",
  action: "create",
  allowedRoles: ["owner", "admin"],
});
