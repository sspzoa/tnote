import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

// 클리닉 정보 수정 (권한: middleware에서 이미 체크됨)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, operatingDays, startDate, endDate } = await request.json();

    const updateData: any = {};
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

    const { supabase, session } = await getAuthenticatedClient();

    const { data, error } = await supabase
      .from("Clinics")
      .update(updateData)
      .eq("id", id)
      .eq("workspace", session.workspace)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Clinic update error:", error);
    return NextResponse.json({ error: "클리닉 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 클리닉 삭제 (권한: middleware에서 이미 체크됨)
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { supabase, session } = await getAuthenticatedClient();

    const { error } = await supabase.from("Clinics").delete().eq("id", id).eq("workspace", session.workspace);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clinic delete error:", error);
    return NextResponse.json({ error: "클리닉 삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}
