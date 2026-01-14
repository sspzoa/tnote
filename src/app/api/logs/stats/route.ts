import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ request, supabase, session, logger }: ApiContext) => {
  const { searchParams } = new URL(request.url);
  const days = Number.parseInt(searchParams.get("days") || "7");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString();

  // 전체 로그 수 (count only)
  const { count: totalCount, error: totalError } = await supabase
    .from("ApiLogs")
    .select("*", { count: "exact", head: true })
    .eq("workspace", session.workspace)
    .gte("created_at", startDateStr);

  if (totalError) throw totalError;

  // 레벨별 통계 - 각 레벨별로 count 쿼리
  const levels = ["info", "warn", "error", "debug"];
  const levelCounts: Record<string, number> = {};

  for (const level of levels) {
    const { count, error } = await supabase
      .from("ApiLogs")
      .select("*", { count: "exact", head: true })
      .eq("workspace", session.workspace)
      .eq("level", level)
      .gte("created_at", startDateStr);

    if (error) throw error;
    if (count && count > 0) {
      levelCounts[level] = count;
    }
  }

  // 액션별 통계 - RPC 또는 group by 대신 주요 액션만 count
  const actions = ["create", "read", "update", "delete", "login", "logout", "auth", "error"];
  const actionCounts: Record<string, number> = {};

  for (const action of actions) {
    const { count, error } = await supabase
      .from("ApiLogs")
      .select("*", { count: "exact", head: true })
      .eq("workspace", session.workspace)
      .eq("action", action)
      .gte("created_at", startDateStr);

    if (error) throw error;
    if (count && count > 0) {
      actionCounts[action] = count;
    }
  }

  // 리소스별 통계 - 주요 리소스만
  const resources = [
    "students",
    "courses",
    "retakes",
    "clinics",
    "consultations",
    "exams",
    "admins",
    "auth",
    "calendar",
  ];
  const resourceCounts: Record<string, number> = {};

  for (const resource of resources) {
    const { count, error } = await supabase
      .from("ApiLogs")
      .select("*", { count: "exact", head: true })
      .eq("workspace", session.workspace)
      .eq("resource", resource)
      .gte("created_at", startDateStr);

    if (error) throw error;
    if (count && count > 0) {
      resourceCounts[resource] = count;
    }
  }

  // 일별 통계 - 각 날짜별로 count
  const dailyCounts: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayStart = `${dateStr}T00:00:00.000Z`;
    const dayEnd = `${dateStr}T23:59:59.999Z`;

    const { count, error } = await supabase
      .from("ApiLogs")
      .select("*", { count: "exact", head: true })
      .eq("workspace", session.workspace)
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd);

    if (error) throw error;
    dailyCounts[dateStr] = count || 0;
  }

  // 에러 로그 (최근 10개)
  const { data: recentErrors, error: errorsError } = await supabase
    .from("ApiLogs")
    .select("*")
    .eq("workspace", session.workspace)
    .eq("level", "error")
    .gte("created_at", startDateStr)
    .order("created_at", { ascending: false })
    .limit(10);

  if (errorsError) throw errorsError;

  await logger.info("read", "log-stats", `Retrieved log statistics for ${days} days`);

  return NextResponse.json({
    data: {
      period: {
        days,
        startDate: startDateStr,
        endDate: new Date().toISOString(),
      },
      summary: {
        total: totalCount || 0,
        byLevel: levelCounts,
        byAction: actionCounts,
        byResource: resourceCounts,
      },
      dailyActivity: dailyCounts,
      recentErrors: recentErrors || [],
    },
  });
};

export const GET = withLogging(handleGet, {
  resource: "log-stats",
  action: "read",
  allowedRoles: ["owner"],
});
