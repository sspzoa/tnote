import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { supabase, session } = await getAuthenticatedClient();

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

    return NextResponse.json({
      success: true,
      message: "비밀번호가 전화번호로 초기화되었습니다.",
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "비밀번호 재설정 중 오류가 발생했습니다." }, { status: 500 });
  }
}
