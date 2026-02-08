import { NextResponse } from "next/server";
import { type PublicApiContext, withPublicLogging } from "@/shared/lib/api/withLogging";
import { createClient } from "@/shared/lib/supabase/server";

const handleGet = async ({ session }: PublicApiContext) => {
  if (!session) {
    return NextResponse.json({ user: null });
  }

  let workspaceName = null;
  if (session.workspace) {
    const supabase = await createClient();
    const { data: workspace } = await supabase.from("Workspaces").select("name").eq("id", session.workspace).single();
    workspaceName = workspace?.name || null;
  }

  return NextResponse.json({
    user: {
      id: session.userId,
      name: session.name,
      phoneNumber: session.phoneNumber,
      role: session.role,
      workspace: session.workspace,
      workspaceName,
    },
  });
};

export const GET = withPublicLogging(handleGet, {
  resource: "auth-me",
  action: "read",
});
