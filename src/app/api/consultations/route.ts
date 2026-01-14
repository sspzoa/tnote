import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session, logger }: ApiContext) => {
  const { data, error } = await supabase
    .from("ConsultationLogs")
    .select(`
      *,
      student:Users!ConsultationLogs_student_id_fkey(id, name, phone_number, school),
      creator:Users!ConsultationLogs_created_by_fkey(id, name)
    `)
    .eq("workspace", session.workspace)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  await logger.info("read", "consultations", `Retrieved ${data.length} consultations`);
  return NextResponse.json({ data });
};

export const GET = withLogging(handleGet, {
  resource: "consultations",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
