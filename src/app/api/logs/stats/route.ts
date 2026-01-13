import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ request, supabase, session, logger }: ApiContext) => {
  const { searchParams } = new URL(request.url);
  const days = Number.parseInt(searchParams.get("days") || "7");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // 레벨별 통계
  const { data: levelStats, error: levelError } = await supabase
    .from("ApiLogs")
    .select("level")
    .eq("workspace", session.workspace)
    .gte("created_at", startDate.toISOString());

  if (levelError) throw levelError;

  const levelCounts = levelStats.reduce(
    (acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // 액션별 통계
  const { data: actionStats, error: actionError } = await supabase
    .from("ApiLogs")
    .select("action")
    .eq("workspace", session.workspace)
    .gte("created_at", startDate.toISOString());

  if (actionError) throw actionError;

  const actionCounts = actionStats.reduce(
    (acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // 리소스별 통계
  const { data: resourceStats, error: resourceError } = await supabase
    .from("ApiLogs")
    .select("resource")
    .eq("workspace", session.workspace)
    .gte("created_at", startDate.toISOString());

  if (resourceError) throw resourceError;

  const resourceCounts = resourceStats.reduce(
    (acc, log) => {
      acc[log.resource] = (acc[log.resource] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // 일별 통계
  const { data: dailyStats, error: dailyError } = await supabase
    .from("ApiLogs")
    .select("created_at")
    .eq("workspace", session.workspace)
    .gte("created_at", startDate.toISOString());

  if (dailyError) throw dailyError;

  const dailyCounts = dailyStats.reduce(
    (acc, log) => {
      const date = log.created_at.split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // 에러 로그 (최근 10개)
  const { data: recentErrors, error: errorsError } = await supabase
    .from("ApiLogs")
    .select("*")
    .eq("workspace", session.workspace)
    .eq("level", "error")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false })
    .limit(10);

  if (errorsError) throw errorsError;

  await logger.info("read", "log-stats", `Retrieved log statistics for ${days} days`);

  return NextResponse.json({
    data: {
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
      summary: {
        total: levelStats.length,
        byLevel: levelCounts,
        byAction: actionCounts,
        byResource: resourceCounts,
      },
      dailyActivity: dailyCounts,
      recentErrors,
    },
  });
};

export const GET = withLogging(handleGet, {
  resource: "log-stats",
  action: "read",
  allowedRoles: ["owner"],
});
