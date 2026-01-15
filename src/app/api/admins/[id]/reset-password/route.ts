import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePost = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;

  if (id === session.userId) {
    return NextResponse.json({ error: "본인 비밀번호는 이 기능으로 초기화할 수 없습니다." }, { status: 400 });
  }

  const { data: admin, error: fetchError } = await supabase
    .from("Users")
    .select("phone_number, role")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .in("role", ["admin", "owner"])
    .single();

  if (fetchError || !admin) {
    return NextResponse.json({ error: "관리자를 찾을 수 없습니다." }, { status: 404 });
  }

  if (admin.role === "owner") {
    return NextResponse.json({ error: "소유자의 비밀번호는 초기화할 수 없습니다." }, { status: 403 });
  }

  const hashedPassword = await bcrypt.hash(admin.phone_number, 10);

  const { error: updateError } = await supabase
    .from("Users")
    .update({ password: hashedPassword })
    .eq("id", id)
    .eq("workspace", session.workspace);

  if (updateError) throw updateError;
  return NextResponse.json({
    success: true,
    message: "비밀번호가 전화번호로 초기화되었습니다.",
  });
};

export const POST = withLogging(handlePost, {
  resource: "admin-password",
  action: "update",
  allowedRoles: ["owner"],
});
