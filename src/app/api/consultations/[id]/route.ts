import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePatch = async ({ request, supabase, session, params }: ApiContext) => {
  const consultationId = params?.id;
  if (!consultationId) {
    return NextResponse.json({ error: "상담일지 ID가 필요합니다." }, { status: 400 });
  }

  const body = await request.json();
  const { consultationDate, title, content } = body;

  // 필수 필드 검증
  if (!consultationDate) {
    return NextResponse.json({ error: "상담 날짜를 입력해주세요." }, { status: 400 });
  }

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
  }

  if (title.length > 200) {
    return NextResponse.json({ error: "제목은 200자 이하여야 합니다." }, { status: 400 });
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }

  if (content.length > 5000) {
    return NextResponse.json({ error: "내용은 5000자 이하여야 합니다." }, { status: 400 });
  }

  // 날짜 형식 검증
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(consultationDate)) {
    return NextResponse.json({ error: "올바른 날짜 형식이 아닙니다." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ConsultationLogs")
    .update({
      consultation_date: consultationDate,
      title: title.trim(),
      content: content.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", consultationId)
    .eq("workspace", session.workspace)
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    return NextResponse.json({ error: "상담일지를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ data });
};

const handleDelete = async ({ supabase, session, params }: ApiContext) => {
  const consultationId = params?.id;
  if (!consultationId) {
    return NextResponse.json({ error: "상담일지 ID가 필요합니다." }, { status: 400 });
  }

  const { error } = await supabase
    .from("ConsultationLogs")
    .delete()
    .eq("id", consultationId)
    .eq("workspace", session.workspace);

  if (error) {
    throw error;
  }
  return NextResponse.json({ success: true });
};

export const PATCH = withLogging(handlePatch, {
  resource: "consultations",
  action: "update",
  allowedRoles: ["owner", "admin"],
});

export const DELETE = withLogging(handleDelete, {
  resource: "consultations",
  action: "delete",
  allowedRoles: ["owner", "admin"],
});
