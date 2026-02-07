import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { createAdminClient } from "@/shared/lib/supabase/server";

const handlePost = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;

  const { data: student, error: fetchError } = await supabase
    .from("Users")
    .select("phone_number, auth_id")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .single();

  if (fetchError || !student) {
    return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });
  }

  if (!student.auth_id) {
    return NextResponse.json({ error: "인증 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  const adminSupabase = createAdminClient();
  const { error: updateError } = await adminSupabase.auth.admin.updateUserById(student.auth_id, {
    password: student.phone_number,
  });

  if (updateError) throw updateError;
  return NextResponse.json({
    success: true,
    message: "비밀번호가 전화번호로 초기화되었습니다.",
  });
};

export const POST = withLogging(handlePost, {
  resource: "student-password",
  action: "update",
  allowedRoles: ["owner", "admin"],
});
