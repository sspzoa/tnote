import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const VALID_COLORS = ["success", "warning", "danger", "info", "neutral"] as const;

const handlePatch = async ({ request, supabase, session, params }: ApiContext) => {
  const id = params?.id;
  const body = await request.json();

  const { data: existing, error: fetchError } = await supabase
    .from("ManagementStatuses")
    .select("*")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "관리 상태를 찾을 수 없습니다." }, { status: 404 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "상태 이름은 필수입니다." }, { status: 400 });
    }
    if (body.name.length > 30) {
      return NextResponse.json({ error: "상태 이름은 30자 이하여야 합니다." }, { status: 400 });
    }
    updates.name = body.name.trim();
  }

  if (body.color !== undefined) {
    if (!VALID_COLORS.includes(body.color)) {
      return NextResponse.json({ error: "유효한 색상을 선택해주세요." }, { status: 400 });
    }
    updates.color = body.color;
  }

  const { data, error } = await supabase.from("ManagementStatuses").update(updates).eq("id", id).select().single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "이미 존재하는 상태 이름입니다." }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({ success: true, data });
};

const handleDelete = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;

  const { data: existing, error: fetchError } = await supabase
    .from("ManagementStatuses")
    .select("id")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "관리 상태를 찾을 수 없습니다." }, { status: 404 });
  }

  const { error: deleteError } = await supabase.from("ManagementStatuses").delete().eq("id", id);

  if (deleteError) throw deleteError;

  return NextResponse.json({ success: true });
};

export const PATCH = withLogging(handlePatch, {
  resource: "management-statuses",
  action: "update",
  allowedRoles: ["owner", "admin"],
});

export const DELETE = withLogging(handleDelete, {
  resource: "management-statuses",
  action: "delete",
  allowedRoles: ["owner", "admin"],
});
