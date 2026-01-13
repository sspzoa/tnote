import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePatch = async ({ request, supabase, session, logger, params }: ApiContext) => {
  const consultationId = params?.id;
  const body = await request.json();

  const { consultationDate, title, content } = body;

  if (!consultationDate || !title || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ConsultationLogs")
    .update({
      consultation_date: consultationDate,
      title: title,
      content: content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", consultationId)
    .eq("workspace", session.workspace)
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    return NextResponse.json({ error: "Consultation log not found" }, { status: 404 });
  }

  await logger.logUpdate("consultations", consultationId!, `Consultation updated: ${title}`);
  return NextResponse.json({ data });
};

const handleDelete = async ({ supabase, session, logger, params }: ApiContext) => {
  const consultationId = params?.id;

  const { error } = await supabase
    .from("ConsultationLogs")
    .delete()
    .eq("id", consultationId)
    .eq("workspace", session.workspace);

  if (error) {
    throw error;
  }

  await logger.logDelete("consultations", consultationId!, "Consultation deleted");
  return NextResponse.json({ success: true });
};

export const PATCH = withLogging(handlePatch, {
  resource: "consultations",
  action: "update",
  allowedRoles: ["owner", "admin"],
});

export const DELETE = withLogging(handleDelete, {
  resource: "consultations",
  action: "delete",
  allowedRoles: ["owner", "admin"],
});
