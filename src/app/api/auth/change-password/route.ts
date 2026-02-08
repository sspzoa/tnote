import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { createClient } from "@/shared/lib/supabase/server";
import { validatePassword } from "@/shared/lib/utils/password";

const handlePost = async ({ request, session }: ApiContext) => {
  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "현재 비밀번호와 새 비밀번호를 입력해주세요." }, { status: 400 });
  }

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
  }

  const supabase = await createClient();
  const email = `${session.phoneNumber}@tnote.local`;

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (verifyError) {
    return NextResponse.json({ error: "현재 비밀번호가 일치하지 않습니다." }, { status: 400 });
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) throw updateError;
  return NextResponse.json({
    success: true,
    message: "비밀번호가 변경되었습니다.",
  });
};

export const POST = withLogging(handlePost, { resource: "password-change", action: "update" });
