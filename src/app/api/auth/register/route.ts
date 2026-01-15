import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/lib/supabase/server";
import { createLogger } from "@/shared/lib/utils/logger";

export async function POST(request: Request) {
  const logger = createLogger(request, null, "create", "auth");

  try {
    const { name, phoneNumber, password, workspaceName } = await request.json();

    if (!name || !phoneNumber || !password || !workspaceName) {
      await logger.log("warn", 400);
      await logger.flush();
      return NextResponse.json({ error: "모든 필수 정보를 입력해주세요." }, { status: 400 });
    }

    if (password.length < 8) {
      await logger.log("warn", 400);
      await logger.flush();
      return NextResponse.json({ error: "비밀번호는 최소 8자 이상이어야 합니다." }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const { data: existingUser } = await supabase
      .from("Users")
      .select("phone_number")
      .eq("phone_number", phoneNumber)
      .single();

    if (existingUser) {
      await logger.log("warn", 409);
      await logger.flush();
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

    await logger.log("info", 200, undefined, newUser.id);
    await logger.flush();
    return NextResponse.json({ success: true, message: "회원가입이 완료되었습니다. 로그인해주세요." });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    await logger.log("error", 500, err);
    await logger.flush();
    return NextResponse.json({ error: "회원가입 중 오류가 발생했습니다." }, { status: 500 });
  }
}
