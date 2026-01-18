import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ request, supabase, session }: ApiContext) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type && !["general", "exam", "retake"].includes(type)) {
    return NextResponse.json({ error: "올바른 템플릿 타입이 아닙니다." }, { status: 400 });
  }

  let query = supabase
    .from("MessageTemplates")
    .select("id, name, content, type, created_at, created_by")
    .eq("workspace", session.workspace)
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) throw error;

  return NextResponse.json({ data });
};

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const { name, content, type } = await request.json();

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "템플릿 이름이 필요합니다." }, { status: 400 });
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "템플릿 내용이 필요합니다." }, { status: 400 });
  }

  if (!type || !["general", "exam", "retake"].includes(type)) {
    return NextResponse.json({ error: "올바른 템플릿 타입이 아닙니다." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("MessageTemplates")
    .insert({
      workspace: session.workspace,
      name: name.trim(),
      content: content.trim(),
      type,
      created_by: session.userId,
    })
    .select("id, name, content, type, created_at, created_by")
    .single();

  if (error) throw error;

  return NextResponse.json({ data }, { status: 201 });
};

export const GET = withLogging(handleGet, {
  resource: "message-templates",
  action: "read",
});

export const POST = withLogging(handlePost, {
  resource: "message-templates",
  action: "create",
});
