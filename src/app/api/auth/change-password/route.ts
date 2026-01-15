import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "현재 비밀번호와 새 비밀번호를 입력해주세요." }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "새 비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
  }

  const { data: user, error: fetchError } = await supabase
    .from("Users")
    .select("password")
    .eq("id", session.userId)
    .single();

  if (fetchError || !user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword) {
    return NextResponse.json({ error: "현재 비밀번호가 일치하지 않습니다." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from("Users")
    .update({ password: hashedPassword })
    .eq("id", session.userId);

  if (updateError) throw updateError;
  return NextResponse.json({
    success: true,
    message: "비밀번호가 변경되었습니다.",
  });
};

export const POST = withLogging(handlePost, { resource: "password-change", action: "update" });
