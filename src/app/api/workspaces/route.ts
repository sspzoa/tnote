import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/lib/supabase/server";
import { createLogger } from "@/shared/lib/utils/logger";

export async function GET(request: Request) {
  const logger = createLogger(request, null, "read", "workspaces");

  try {
    const supabase = await createAdminClient();

    const { data, error } = await supabase.from("Workspaces").select("id, name").order("name", { ascending: true });

    if (error) throw error;

    await logger.log("info", 200);
    await logger.flush();
    return NextResponse.json({ data });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    await logger.log("error", 500, err);
    await logger.flush();
    return NextResponse.json({ error: "워크스페이스 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
