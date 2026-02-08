import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { createClient } from "@/shared/lib/supabase/server";

const handlePost = async (_context: ApiContext) => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
};

export const POST = withLogging(handlePost, {
  resource: "auth-logout",
  action: "delete",
});
