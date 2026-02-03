import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const isOwner = session.role === "owner";

  if (isOwner) {
    const { data, error } = await supabase
      .from("Users")
      .select("id, phone_number, name, role, created_at, password")
      .in("role", ["owner", "admin"])
      .eq("workspace", session.workspace);

    if (error) throw error;

    const adminsWithPasswordStatus = await Promise.all(
      (data ?? []).map(async (admin) => {
        const isDefaultPassword = await bcrypt.compare(admin.phone_number, admin.password);
        return {
          id: admin.id,
          phone_number: admin.phone_number,
          name: admin.name,
          role: admin.role,
          created_at: admin.created_at,
          is_default_password: isDefaultPassword,
        };
      }),
    );
    return NextResponse.json({ data: adminsWithPasswordStatus });
  }

  const { data, error } = await supabase
    .from("Users")
    .select("id, phone_number, name, role, created_at")
    .in("role", ["owner", "admin"])
    .eq("workspace", session.workspace);

  if (error) throw error;
  return NextResponse.json({ data });
};

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const { name, phoneNumber, password } = await request.json();

  if (!name || !phoneNumber || !password) {
    return NextResponse.json({ error: "모든 필수 정보를 입력해주세요." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "비밀번호는 최소 8자 이상이어야 합니다." }, { status: 400 });
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

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: newAdmin, error: adminError } = await supabase
    .from("Users")
    .insert({
      name,
      phone_number: phoneNumber,
      password: hashedPassword,
      role: "admin",
      workspace: session.workspace,
    })
    .select("id, phone_number, name, role, created_at")
    .single();

  if (adminError) {
    if (adminError.code === "23505") {
      return NextResponse.json({ error: "이미 등록된 전화번호입니다." }, { status: 409 });
    }
    throw adminError;
  }
  return NextResponse.json({ success: true, data: newAdmin }, { status: 201 });
};

export const GET = withLogging(handleGet, { resource: "admins", action: "read", allowedRoles: ["owner", "admin"] });
export const POST = withLogging(handlePost, { resource: "admins", action: "create", allowedRoles: ["owner"] });
