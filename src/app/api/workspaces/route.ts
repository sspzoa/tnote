import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/lib/supabase/server";
import { createLogger } from "@/shared/lib/utils/logger";

export async function GET(request: Request) {
  const logger = createLogger(request, null);

  try {
    const supabase = await createAdminClient();

    const { data, error } = await supabase.from("Workspaces").select("id, name").order("name", { ascending: true });

    if (error) throw error;

    await logger.info("read", "workspaces", `Retrieved ${data.length} workspaces`);
    return NextResponse.json({ data });
  } catch (error) {
    await logger.logError("workspaces", error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json({ error: "워크스페이스 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
