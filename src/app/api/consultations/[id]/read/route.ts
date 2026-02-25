import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePost = async ({ supabase, session, params }: ApiContext) => {
  const consultationId = params?.id;
  if (!consultationId) {
    return NextResponse.json({ error: "상담일지 ID가 필요합니다." }, { status: 400 });
  }

  const { error } = await supabase.from("ConsultationReadReceipts").upsert(
    {
      consultation_id: consultationId,
      user_id: session.userId,
      read_at: new Date().toISOString(),
    },
    { onConflict: "consultation_id,user_id" },
  );

  if (error) {
    throw error;
  }

  return NextResponse.json({ success: true });
};

export const POST = withLogging(handlePost, {
  resource: "consultation-read",
  action: "create",
  allowedRoles: ["owner", "admin"],
});
