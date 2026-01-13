import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ request, supabase, session, logger }: ApiContext) => {
  const { searchParams } = new URL(request.url);

  // 쿼리 파라미터
  const level = searchParams.get("level");
  const action = searchParams.get("action");
  const resource = searchParams.get("resource");
  const userId = searchParams.get("userId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const limit = Math.min(Number.parseInt(searchParams.get("limit") || "100"), 500);
  const offset = Number.parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("ApiLogs")
    .select("*", { count: "exact" })
    .eq("workspace", session.workspace)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (level) {
    query = query.eq("level", level);
  }
  if (action) {
    query = query.eq("action", action);
  }
  if (resource) {
    query = query.eq("resource", resource);
  }
  if (userId) {
    query = query.eq("user_id", userId);
  }
  if (startDate) {
    query = query.gte("created_at", startDate);
  }
  if (endDate) {
    query = query.lte("created_at", endDate);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  await logger.info("read", "logs", `Retrieved ${data.length} log entries`);

  return NextResponse.json({
    data,
    pagination: {
      total: count,
      limit,
      offset,
      hasMore: count ? offset + limit < count : false,
    },
  });
};

export const GET = withLogging(handleGet, {
  resource: "logs",
  action: "read",
  allowedRoles: ["owner"],
});
