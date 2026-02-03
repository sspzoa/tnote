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

  const now = new Date().toISOString();

  // Step 1: 임시 순서(음수)로 먼저 업데이트 - unique constraint 충돌 방지
  const tempUpdates = validIds.map((id: string, index: number) =>
    supabase
      .from("ManagementStatuses")
      .update({ display_order: -(index + 1), updated_at: now })
      .eq("id", id)
      .eq("workspace", session.workspace),
  );

  const tempResults = await Promise.all(tempUpdates);
  const tempError = tempResults.find((r) => r.error)?.error;
  if (tempError) throw tempError;

  // Step 2: 최종 순서로 업데이트
  const finalUpdates = validIds.map((id: string, index: number) =>
    supabase
      .from("ManagementStatuses")
      .update({ display_order: index + 1 })
      .eq("id", id)
      .eq("workspace", session.workspace),
  );

  const finalResults = await Promise.all(finalUpdates);
  const finalError = finalResults.find((r) => r.error)?.error;
  if (finalError) throw finalError;

  return NextResponse.json({ success: true });
};

export const POST = withLogging(handlePost, {
  resource: "management-statuses",
  action: "update",
  allowedRoles: ["owner", "admin"],
});
