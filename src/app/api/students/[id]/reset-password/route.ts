import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePost = async ({ supabase, session, logger, params }: ApiContext) => {
  const id = params?.id;

  const { data: student, error: fetchError } = await supabase
    .from("Users")
    .select("phone_number")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .single();

  if (fetchError || !student) {
    return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });
  }

  const hashedPassword = await bcrypt.hash(student.phone_number, 10);

  const { error: updateError } = await supabase
    .from("Users")
    .update({ password: hashedPassword })
    .eq("id", id)
    .eq("workspace", session.workspace);

  if (updateError) throw updateError;

  await logger.logUpdate("student-password", id!, "Student password reset to phone number");
  return NextResponse.json({
    success: true,
    message: "비밀번호가 전화번호로 초기화되었습니다.",
  });
};

export const POST = withLogging(handlePost, { resource: "student-password", action: "update" });
