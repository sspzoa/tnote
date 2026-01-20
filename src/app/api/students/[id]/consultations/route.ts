import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session, params }: ApiContext) => {
  const studentId = params?.id;

  const { data, error } = await supabase
    .from("ConsultationLogs")
    .select(`
      *,
      creator:Users!ConsultationLogs_created_by_fkey(id, name)
    `)
    .eq("student_id", studentId)
    .eq("workspace", session.workspace)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }
  return NextResponse.json({ data });
};

const handlePost = async ({ request, supabase, session, params }: ApiContext) => {
  const studentId = params?.id;
  const body = await request.json();

  const { title, content } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
  }

  const { data: student, error: studentError } = await supabase
    .from("Users")
    .select("id")
    .eq("id", studentId)
    .eq("workspace", session.workspace)
    .eq("role", "student")
    .single();

  if (studentError || !student) {
    return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("ConsultationLogs")
    .insert({
      student_id: studentId,
      title: title,
      content: content,
      workspace: session.workspace,
      created_by: session.userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return NextResponse.json({ data }, { status: 201 });
};

export const GET = withLogging(handleGet, {
  resource: "consultations",
  action: "read",
  allowedRoles: ["owner", "admin"],
});

export const POST = withLogging(handlePost, {
  resource: "consultations",
  action: "create",
  allowedRoles: ["owner", "admin"],
});
