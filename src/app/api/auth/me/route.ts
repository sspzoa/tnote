import { NextResponse } from "next/server";
import { type PublicApiContext, withPublicLogging } from "@/shared/lib/api/withLogging";
import { createClient } from "@/shared/lib/supabase/server";

const handleGet = async ({ session }: PublicApiContext) => {
  if (!session) {
    return NextResponse.json({ user: null });
  }

  let workspaceName = null;
  let requiredClinicWeekdays: number[] | null = null;
  const supabase = await createClient();

  if (session.workspace) {
    const { data: workspace } = await supabase.from("Workspaces").select("name").eq("id", session.workspace).single();
    workspaceName = workspace?.name || null;
  }

  if (session.role === "student") {
    const { data: userData } = await supabase
      .from("Users")
      .select("required_clinic_weekdays")
      .eq("id", session.userId)
      .single();
    requiredClinicWeekdays = userData?.required_clinic_weekdays || null;
  }

  return NextResponse.json({
    user: {
      id: session.userId,
      name: session.name,
      phoneNumber: session.phoneNumber,
      role: session.role,
      workspace: session.workspace,
      workspaceName,
      requiredClinicWeekdays,
    },
  });
};

export const GET = withPublicLogging(handleGet, {
  resource: "auth-me",
  action: "read",
});
