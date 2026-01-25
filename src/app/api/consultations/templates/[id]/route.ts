import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleDelete = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ error: "템플릿 ID가 필요합니다." }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("ConsultationTemplates")
    .select("id")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "템플릿을 찾을 수 없습니다." }, { status: 404 });
  }

  const { error } = await supabase
    .from("ConsultationTemplates")
    .delete()
    .eq("id", id)
    .eq("workspace", session.workspace);

  if (error) throw error;

  return NextResponse.json({ success: true });
};

export const DELETE = withLogging(handleDelete, {
  resource: "consultation-templates",
  action: "delete",
});
