import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { createAdminClient } from "@/shared/lib/supabase/server";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const { data, error } = await supabase
    .from("Users")
    .select("id, phone_number, name, role, created_at")
    .in("role", ["owner", "admin"])
    .eq("workspace", session.workspace);

  if (error) throw error;
  return NextResponse.json({ data });
};

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const { name, phoneNumber } = await request.json();

  if (!name || !phoneNumber) {
    return NextResponse.json({ error: "이름과 전화번호를 입력해주세요." }, { status: 400 });
  }

  const { data: existingUser } = await supabase
    .from("Users")
    .select("phone_number")
    .eq("phone_number", phoneNumber)
    .eq("workspace", session.workspace)
    .single();

  if (existingUser) {
    return NextResponse.json({ error: "이미 등록된 전화번호입니다." }, { status: 409 });
  }

  const adminSupabase = createAdminClient();
  const email = `${phoneNumber}@tnote.local`;

  const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password: phoneNumber,
    email_confirm: true,
    user_metadata: {
      name,
      role: "admin",
      workspace: session.workspace,
    },
  });

  if (authError) throw authError;

  const { data: newAdmin, error: adminError } = await supabase
    .from("Users")
    .insert({
      id: authUser.user.id,
      name,
      phone_number: phoneNumber,
      role: "admin",
      workspace: session.workspace,
    })
    .select("id, phone_number, name, role, created_at")
    .single();

  if (adminError) {
    await adminSupabase.auth.admin.deleteUser(authUser.user.id);
    if (adminError.code === "23505") {
      return NextResponse.json({ error: "이미 등록된 전화번호입니다." }, { status: 409 });
    }
    throw adminError;
  }

  return NextResponse.json({ success: true, data: newAdmin }, { status: 201 });
};

export const GET = withLogging(handleGet, { resource: "admins", action: "read", allowedRoles: ["owner", "admin"] });
export const POST = withLogging(handlePost, { resource: "admins", action: "create", allowedRoles: ["owner"] });
