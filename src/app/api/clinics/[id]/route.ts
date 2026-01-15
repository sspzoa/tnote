import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePatch = async ({ request, supabase, session, params }: ApiContext) => {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "클리닉 ID가 필요합니다." }, { status: 400 });
  }

  const { name, operatingDays, startDate, endDate } = await request.json();

  const updateData: Record<string, unknown> = {};

  // 이름 검증
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "클리닉 이름을 입력해주세요." }, { status: 400 });
    }
    if (name.length > 100) {
      return NextResponse.json({ error: "클리닉 이름은 100자 이하여야 합니다." }, { status: 400 });
    }
    updateData.name = name.trim();
  }

  // 요일 검증
  if (operatingDays !== undefined) {
    if (
      operatingDays !== null &&
      (!Array.isArray(operatingDays) || !operatingDays.every((d: number) => Number.isInteger(d) && d >= 0 && d <= 6))
    ) {
      return NextResponse.json({ error: "올바른 요일을 선택해주세요." }, { status: 400 });
    }
    updateData.operating_days = operatingDays;
  }

  // 날짜 검증
  if (startDate !== undefined) updateData.start_date = startDate || null;
  if (endDate !== undefined) updateData.end_date = endDate || null;

  const effectiveStartDate = startDate !== undefined ? startDate : null;
  const effectiveEndDate = endDate !== undefined ? endDate : null;

  if (effectiveStartDate && effectiveEndDate && new Date(effectiveStartDate) > new Date(effectiveEndDate)) {
    return NextResponse.json({ error: "시작 날짜는 종료 날짜보다 이전이어야 합니다." }, { status: 400 });
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "수정할 항목이 없습니다." }, { status: 400 });
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("Clinics")
    .update(updateData)
    .eq("id", id)
    .eq("workspace", session.workspace)
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json({ success: true, data });
};

const handleDelete = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "클리닉 ID가 필요합니다." }, { status: 400 });
  }

  const { error } = await supabase.from("Clinics").delete().eq("id", id).eq("workspace", session.workspace);

  if (error) throw error;
  return NextResponse.json({ success: true });
};

export const PATCH = withLogging(handlePatch, {
  resource: "clinics",
  action: "update",
  allowedRoles: ["owner", "admin"],
});
export const DELETE = withLogging(handleDelete, {
  resource: "clinics",
  action: "delete",
  allowedRoles: ["owner", "admin"],
});
