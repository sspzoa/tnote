import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { clearSession } from "@/shared/lib/supabase/auth";
import { createAdminClient } from "@/shared/lib/supabase/server";

const handleDelete = async ({ session, params }: ApiContext) => {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "워크스페이스 ID가 필요합니다." }, { status: 400 });
  }

  if (id !== session.workspace) {
    return NextResponse.json({ error: "자신의 워크스페이스만 삭제할 수 있습니다." }, { status: 403 });
  }

  const supabase = await createAdminClient();

  const { data: workspace, error: fetchError } = await supabase
    .from("Workspaces")
    .select("id, owner")
    .eq("id", id)
    .single();

  if (fetchError || !workspace) {
    return NextResponse.json({ error: "워크스페이스를 찾을 수 없습니다." }, { status: 404 });
  }

  if (workspace.owner !== session.userId) {
    return NextResponse.json({ error: "워크스페이스 소유자만 삭제할 수 있습니다." }, { status: 403 });
  }

  const { error: deleteError } = await supabase.from("Workspaces").delete().eq("id", id);

  if (deleteError) throw deleteError;

  await clearSession();

  return NextResponse.json({ success: true, message: "워크스페이스가 삭제되었습니다." });
};

export const DELETE = withLogging(handleDelete, {
  resource: "workspaces",
  action: "delete",
  allowedRoles: ["owner"],
});
