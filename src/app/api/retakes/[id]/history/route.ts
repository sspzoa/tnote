import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session, logger, params }: ApiContext) => {
  const id = params?.id;

  const { data: retake } = await supabase
    .from("RetakeAssignments")
    .select(`
      id,
      exam:Exams!inner(course:Courses!inner(workspace)),
      student:Users!RetakeAssignments_student_id_fkey!inner(workspace)
    `)
    .eq("id", id)
    .eq("exam.course.workspace", session.workspace)
    .eq("student.workspace", session.workspace)
    .single();

  if (!retake) {
    return NextResponse.json({ error: "재시험을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("RetakeHistory")
    .select("*")
    .eq("retake_assignment_id", id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  await logger.info("read", "retake-history", `Retrieved ${data.length} history entries for retake ${id}`, {
    resourceId: id,
  });
  return NextResponse.json({ data });
};

export const GET = withLogging(handleGet, { resource: "retake-history", action: "read" });
