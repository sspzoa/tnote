import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const { data, error } = await supabase
    .from("ConsultationTemplates")
    .select("id, name, content, created_at, created_by")
    .eq("workspace", session.workspace)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return NextResponse.json({ data });
};

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const { name, content } = await request.json();

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "템플릿 이름이 필요합니다." }, { status: 400 });
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "템플릿 내용이 필요합니다." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ConsultationTemplates")
    .insert({
      workspace: session.workspace,
      name: name.trim(),
      content: content.trim(),
      created_by: session.userId,
    })
    .select("id, name, content, created_at, created_by")
    .single();

  if (error) throw error;

  return NextResponse.json({ data }, { status: 201 });
};

export const GET = withLogging(handleGet, {
  resource: "consultation-templates",
  action: "read",
});

export const POST = withLogging(handlePost, {
  resource: "consultation-templates",
  action: "create",
});
