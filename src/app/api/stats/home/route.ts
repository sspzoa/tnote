import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const [courseResult, studentResult, retakeResult] = await Promise.all([
    supabase.from("Courses").select("id", { count: "exact", head: true }).eq("workspace", session.workspace),
    supabase
      .from("Users")
      .select("id", { count: "exact", head: true })
      .eq("workspace", session.workspace)
      .eq("role", "student"),
    supabase
      .from("RetakeAssignments")
      .select("id, student:Users!inner(workspace)", { count: "exact", head: true })
      .eq("student.workspace", session.workspace)
      .eq("status", "pending"),
  ]);

  if (courseResult.error) throw courseResult.error;
  if (studentResult.error) throw studentResult.error;
  if (retakeResult.error) throw retakeResult.error;

  return NextResponse.json({
    data: {
      courseCount: courseResult.count ?? 0,
      studentCount: studentResult.count ?? 0,
      pendingRetakeCount: retakeResult.count ?? 0,
    },
  });
};

export const GET = withLogging(handleGet, { resource: "home-stats", action: "read" });
