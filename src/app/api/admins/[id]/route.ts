import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { createAdminClient } from "@/shared/lib/supabase/server";

const handleDelete = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "관리자 ID가 필요합니다." }, { status: 400 });
  }

  if (id === session.userId) {
    return NextResponse.json({ error: "본인 계정은 삭제할 수 없습니다." }, { status: 400 });
  }

  const { data: targetUser } = await supabase
    .from("Users")
    .select("id, role, name")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .single();

  if (!targetUser) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  if (targetUser.role === "owner") {
    return NextResponse.json({ error: "워크스페이스 소유자는 삭제할 수 없습니다." }, { status: 400 });
  }

  const { error: deleteError } = await supabase.from("Users").delete().eq("id", id).eq("workspace", session.workspace);

  if (deleteError) throw deleteError;

  const adminSupabase = createAdminClient();
  await adminSupabase.auth.admin.deleteUser(id!);

  return NextResponse.json({ success: true });
};

export const DELETE = withLogging(handleDelete, {
  resource: "admins",
  action: "delete",
  allowedRoles: ["owner"],
});
