import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session, logger, params }: ApiContext) => {
  const id = params?.id;

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

  await logger.info("read", "exams", `Retrieved exam: ${data.name}`, { resourceId: id });
  return NextResponse.json({ data });
};

const handlePatch = async ({ request, supabase, session, logger, params }: ApiContext) => {
  const id = params?.id;
  const { examNumber, name } = await request.json();

  const updateData: Record<string, unknown> = {};
  if (examNumber !== undefined) updateData.exam_number = examNumber;
  if (name !== undefined) updateData.name = name;

  const { data: exam } = await supabase
    .from("Exams")
    .select("id, course_id, course:Courses!inner(workspace)")
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
    .eq("course_id", exam.course_id)
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

  await logger.logUpdate("exams", id!, `Exam updated: ${data.name}`);
  return NextResponse.json({ success: true, data });
};

const handleDelete = async ({ supabase, session, logger, params }: ApiContext) => {
  const id = params?.id;

  const { data: exam } = await supabase
    .from("Exams")
    .select("id, course_id, name, course:Courses!inner(workspace)")
    .eq("id", id)
    .eq("course.workspace", session.workspace)
    .single();

  if (!exam) {
    return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
  }

  const { error } = await supabase.from("Exams").delete().eq("id", id).eq("course_id", exam.course_id);

  if (error) throw error;

  await logger.logDelete("exams", id!, `Exam deleted: ${exam.name}`);
  return NextResponse.json({ success: true });
};

export const GET = withLogging(handleGet, { resource: "exams", action: "read" });
export const PATCH = withLogging(handlePatch, { resource: "exams", action: "update" });
export const DELETE = withLogging(handleDelete, { resource: "exams", action: "delete" });
