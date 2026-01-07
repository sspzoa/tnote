import { NextResponse } from "next/server";
import { getAuthenticatedClient, requireAdminOrOwner } from "@/shared/lib/supabase/auth";

// 재시험 이력 조회 (관리자만)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrOwner();
    const { id } = await params;

    const { supabase } = await getAuthenticatedClient();

    const { data, error } = await supabase
      .from("RetakeHistory")
      .select("*")
      .eq("retake_assignment_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("History fetch error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "이력 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
