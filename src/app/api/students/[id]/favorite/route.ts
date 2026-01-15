import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePatch = async ({ request, supabase, session, params }: ApiContext) => {
  const id = params?.id;
  const { is_favorite } = await request.json();

  if (typeof is_favorite !== "boolean") {
    return NextResponse.json({ error: "is_favorite must be a boolean" }, { status: 400 });
  }

  const { data: student, error: fetchError } = await supabase
    .from("Users")
    .select("id, workspace")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .eq("role", "student")
    .single();

  if (fetchError || !student) {
    return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("Users")
    .update({ is_favorite })
    .eq("id", id)
    .eq("workspace", session.workspace);

  if (updateError) {
    throw updateError;
  }
  return NextResponse.json({ success: true });
};

export const PATCH = withLogging(handlePatch, {
  resource: "student-favorite",
  action: "update",
  allowedRoles: ["owner", "admin"],
});
