import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const { data, error } = await supabase
    .from("ConsultationLogs")
    .select(`
      *,
      student:Users!ConsultationLogs_student_id_fkey(id, name, phone_number, school),
      creator:Users!ConsultationLogs_created_by_fkey(id, name),
      updater:Users!ConsultationLogs_updated_by_fkey(id, name)
    `)
    .eq("workspace", session.workspace)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  const consultationIds = (data || []).map((c: { id: string }) => c.id);

  let readSet = new Set<string>();
  if (consultationIds.length > 0) {
    const { data: readReceipts } = await supabase
      .from("ConsultationReadReceipts")
      .select("consultation_id")
      .eq("user_id", session.userId)
      .in("consultation_id", consultationIds);

    readSet = new Set((readReceipts || []).map((r: { consultation_id: string }) => r.consultation_id));
  }

  const enrichedData = (data || []).map((c: { id: string }) => ({
    ...c,
    is_read: readSet.has(c.id),
  }));

  return NextResponse.json({ data: enrichedData });
};

export const GET = withLogging(handleGet, {
  resource: "consultations",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
