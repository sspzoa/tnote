import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session, logger }: ApiContext) => {
  const { data, error } = await supabase
    .from("Clinics")
    .select("*")
    .eq("workspace", session.workspace)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  await logger.info("read", "clinics", `Retrieved ${data.length} clinics`);
  return NextResponse.json({ data });
};

const handlePost = async ({ request, supabase, session, logger }: ApiContext) => {
  const body = await request.json();
  const { name, operatingDays, startDate, endDate } = body;

  if (!name || !operatingDays || !Array.isArray(operatingDays) || operatingDays.length === 0) {
    return NextResponse.json({ error: "클리닉 이름과 운영 요일을 입력해주세요." }, { status: 400 });
  }

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "시작 날짜와 종료 날짜를 입력해주세요." }, { status: 400 });
  }

  if (new Date(startDate) > new Date(endDate)) {
    return NextResponse.json({ error: "시작 날짜는 종료 날짜보다 이전이어야 합니다." }, { status: 400 });
  }

  if (!operatingDays.every((d: number) => d >= 0 && d <= 6)) {
    return NextResponse.json({ error: "올바른 요일을 선택해주세요." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("Clinics")
    .insert({
      name,
      operating_days: operatingDays,
      start_date: startDate,
      end_date: endDate,
      workspace: session.workspace,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logger.logCreate("clinics", data.id, `Clinic created: ${name}`);
  return NextResponse.json({ success: true, data });
};

export const GET = withLogging(handleGet, { resource: "clinics", action: "read" });
export const POST = withLogging(handlePost, { resource: "clinics", action: "create" });
