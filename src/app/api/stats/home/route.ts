import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { STUDENT_ASSIGNMENT_OPEN_STATUSES, STUDENT_ASSIGNMENT_TABLE } from "@/shared/lib/utils/studentAssignments";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const today = new Date().toISOString().split("T")[0];

  const [courseResult, studentResult, retakeResult, assignmentTaskResult, clinicResult] = await Promise.all([
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
    supabase
      .from(STUDENT_ASSIGNMENT_TABLE)
      .select("id, assignment:Assignments!inner(course:Courses!inner(workspace))", { count: "exact", head: true })
      .eq("assignment.course.workspace", session.workspace)
      .in("status", [...STUDENT_ASSIGNMENT_OPEN_STATUSES]),
    supabase
      .from("Clinics")
      .select("id", { count: "exact", head: true })
      .eq("workspace", session.workspace)
      .or(`end_date.is.null,end_date.gte.${today}`),
  ]);

  if (courseResult.error) throw courseResult.error;
  if (studentResult.error) throw studentResult.error;
  if (retakeResult.error) throw retakeResult.error;
  if (assignmentTaskResult.error) throw assignmentTaskResult.error;
  if (clinicResult.error) throw clinicResult.error;

  return NextResponse.json({
    data: {
      courseCount: courseResult.count ?? 0,
      studentCount: studentResult.count ?? 0,
      pendingRetakeCount: retakeResult.count ?? 0,
      pendingAssignmentTaskCount: assignmentTaskResult.count ?? 0,
      activeClinicCount: clinicResult.count ?? 0,
    },
  });
};

export const GET = withLogging(handleGet, { resource: "home-stats", action: "read", allowedRoles: ["owner", "admin"] });
