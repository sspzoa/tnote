import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/lib/supabase/server";

// 워크스페이스 목록 조회
export async function GET() {
  try {
    const supabase = await createAdminClient();

    const { data, error } = await supabase.from("Workspaces").select("id, name").order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Workspaces fetch error:", error);
    return NextResponse.json({ error: "워크스페이스 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
