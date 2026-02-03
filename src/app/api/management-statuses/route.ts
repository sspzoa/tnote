import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const VALID_COLORS = ["success", "warning", "danger", "info", "neutral"] as const;

const handleGet = async ({ supabase, session }: ApiContext) => {
  const { data, error } = await supabase
    .from("ManagementStatuses")
    .select("id, name, display_order, color, created_at")
    .eq("workspace", session.workspace)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return NextResponse.json({ data });
};

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const { name, color } = await request.json();

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "상태 이름은 필수입니다." }, { status: 400 });
  }

  if (name.length > 30) {
    return NextResponse.json({ error: "상태 이름은 30자 이하여야 합니다." }, { status: 400 });
  }

  if (!color || !VALID_COLORS.includes(color)) {
    return NextResponse.json({ error: "유효한 색상을 선택해주세요." }, { status: 400 });
  }

  const { data: maxOrderData } = await supabase
    .from("ManagementStatuses")
    .select("display_order")
    .eq("workspace", session.workspace)
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrderData?.display_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("ManagementStatuses")
    .insert({
      workspace: session.workspace,
      name: name.trim(),
      color,
      display_order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "이미 존재하는 상태 이름입니다." }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
};

export const GET = withLogging(handleGet, {
  resource: "management-statuses",
  action: "read",
  allowedRoles: ["owner", "admin"],
});

export const POST = withLogging(handlePost, {
  resource: "management-statuses",
  action: "create",
  allowedRoles: ["owner", "admin"],
});
