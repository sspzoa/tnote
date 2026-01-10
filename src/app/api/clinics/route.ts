import { NextResponse } from "next/server";
import { getAuthenticatedClient, getSession } from "@/shared/lib/supabase/auth";

export async function GET() {
  try {
    const session = await getSession();

    const { supabase } = await getAuthenticatedClient();

    const { data, error } = await supabase
      .from("Clinics")
      .select("*")
      .eq("workspace", session.workspace)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (_error: any) {
    return NextResponse.json({ error: "클리닉 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    const { supabase, session } = await getAuthenticatedClient();

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

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ error: "클리닉 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
