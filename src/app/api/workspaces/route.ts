import { NextResponse } from "next/server";
import { type PublicApiContext, withPublicLogging } from "@/shared/lib/api/withLogging";
import { createAdminClient } from "@/shared/lib/supabase/server";

const handleGet = async (_context: PublicApiContext) => {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.from("Workspaces").select("id, name").order("name", { ascending: true });

  if (error) throw error;

  return NextResponse.json({ data });
};

export const GET = withPublicLogging(handleGet, {
  resource: "workspaces",
  action: "read",
});
