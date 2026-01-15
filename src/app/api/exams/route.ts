import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ request, supabase, session }: ApiContext) => {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

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
};

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const { courseId, examNumber, name, maxScore, cutline } = await request.json();

  if (!courseId || !examNumber || !name) {
    return NextResponse.json({ error: "필수 정보를 입력해주세요." }, { status: 400 });
  }

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
      max_score: maxScore || 100,
      cutline: cutline || 80,
    })
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
};

export const GET = withLogging(handleGet, { resource: "exams", action: "read" });
export const POST = withLogging(handlePost, { resource: "exams", action: "create" });
