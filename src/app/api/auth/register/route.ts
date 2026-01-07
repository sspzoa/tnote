import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { name, phoneNumber, password, workspaceName } = await request.json();

    // 입력 검증
    if (!name || !phoneNumber || !password || !workspaceName) {
      return NextResponse.json({ error: "모든 필수 정보를 입력해주세요." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "비밀번호는 최소 8자 이상이어야 합니다." }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // 전화번호 중복 확인
    const { data: existingUser } = await supabase
      .from("Users")
      .select("phone_number")
      .eq("phone_number", phoneNumber)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "이미 등록된 전화번호입니다." }, { status: 409 });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 워크스페이스 생성
    const { data: newWorkspace, error: workspaceError } = await supabase
      .from("Workspaces")
      .insert({
        name: workspaceName,
      })
      .select()
      .single();

    if (workspaceError) throw workspaceError;

    // 오너 계정 생성
    const { data: newUser, error: userError } = await supabase
      .from("Users")
      .insert({
        name,
        phone_number: phoneNumber,
        password: hashedPassword,
        isAdmin: true,
        role: "owner",
        workspace: newWorkspace.id,
      })
      .select()
      .single();

    if (userError) {
      // 사용자 생성 실패 시 워크스페이스 롤백
      await supabase.from("Workspaces").delete().eq("id", newWorkspace.id);
      throw userError;
    }

    // 워크스페이스 owner 업데이트
    await supabase.from("Workspaces").update({ owner: newUser.id }).eq("id", newWorkspace.id);

    return NextResponse.json({
      success: true,
      message: "회원가입이 완료되었습니다. 로그인해주세요.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "회원가입 중 오류가 발생했습니다." }, { status: 500 });
  }
}
