import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePatch = async ({ request, supabase, session, logger, params }: ApiContext) => {
  const id = params?.id;
  const { name, operatingDays, startDate, endDate } = await request.json();

  const updateData: Record<string, unknown> = {};
  if (name) updateData.name = name;
  if (operatingDays) {
    if (!Array.isArray(operatingDays) || !operatingDays.every((d: number) => d >= 0 && d <= 6)) {
      return NextResponse.json({ error: "올바른 요일을 선택해주세요." }, { status: 400 });
    }
    updateData.operating_days = operatingDays;
  }
  if (startDate) updateData.start_date = startDate;
  if (endDate) updateData.end_date = endDate;

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return NextResponse.json({ error: "시작 날짜는 종료 날짜보다 이전이어야 합니다." }, { status: 400 });
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

  await logger.logUpdate("clinics", id!, `Clinic updated: ${data.name}`);
  return NextResponse.json({ success: true, data });
};

const handleDelete = async ({ supabase, session, logger, params }: ApiContext) => {
  const id = params?.id;

  const { error } = await supabase.from("Clinics").delete().eq("id", id).eq("workspace", session.workspace);

  if (error) throw error;

  await logger.logDelete("clinics", id!, "Clinic deleted");
  return NextResponse.json({ success: true });
};

export const PATCH = withLogging(handlePatch, { resource: "clinics", action: "update" });
export const DELETE = withLogging(handleDelete, { resource: "clinics", action: "delete" });
