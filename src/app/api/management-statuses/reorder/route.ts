import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const { orderedIds } = await request.json();

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json({ error: "순서 정보가 필요합니다." }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("ManagementStatuses")
    .select("id")
    .eq("workspace", session.workspace);

  if (fetchError) throw fetchError;

  const existingIds = new Set(existing?.map((s) => s.id) ?? []);
  const validIds = orderedIds.filter((id: string) => existingIds.has(id));

  if (validIds.length !== existingIds.size) {
    return NextResponse.json({ error: "일부 상태 ID가 유효하지 않습니다." }, { status: 400 });
  }

  const updates = validIds.map((id: string, index: number) =>
    supabase
      .from("ManagementStatuses")
      .update({ display_order: index + 1, updated_at: new Date().toISOString() })
      .eq("id", id),
  );

  await Promise.all(updates);

  return NextResponse.json({ success: true });
};

export const POST = withLogging(handlePost, {
  resource: "management-statuses",
  action: "update",
  allowedRoles: ["owner", "admin"],
});
