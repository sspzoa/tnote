import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/lib/supabase/server";
import { createLogger } from "@/shared/lib/utils/logger";

export async function POST(request: Request) {
  const logger = createLogger(request, null);

  try {
    const { name, phoneNumber, password, workspaceName } = await request.json();

    if (!name || !phoneNumber || !password || !workspaceName) {
      return NextResponse.json({ error: "모든 필수 정보를 입력해주세요." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "비밀번호는 최소 8자 이상이어야 합니다." }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const { data: existingUser } = await supabase
      .from("Users")
      .select("phone_number")
      .eq("phone_number", phoneNumber)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "이미 등록된 전화번호입니다." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newWorkspace, error: workspaceError } = await supabase
      .from("Workspaces")
      .insert({
        name: workspaceName,
        owner: null,
      })
      .select()
      .single();

    if (workspaceError) throw workspaceError;

    const { data: newUser, error: userError } = await supabase
      .from("Users")
      .insert({
        name,
        phone_number: phoneNumber,
        password: hashedPassword,
        role: "owner",
        workspace: newWorkspace.id,
      })
      .select()
      .single();

    if (userError) {
      await supabase.from("Workspaces").delete().eq("id", newWorkspace.id);
      throw userError;
    }

    await supabase.from("Workspaces").update({ owner: newUser.id }).eq("id", newWorkspace.id);

    await logger.info("create", "auth", `New workspace registered: ${workspaceName} by ${name}`, {
      resourceId: newWorkspace.id,
      metadata: { userId: newUser.id, workspaceName },
    });

    return NextResponse.json({
      success: true,
      message: "회원가입이 완료되었습니다. 로그인해주세요.",
    });
  } catch (error) {
    await logger.logError("auth", error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json({ error: "회원가입 중 오류가 발생했습니다." }, { status: 500 });
  }
}
