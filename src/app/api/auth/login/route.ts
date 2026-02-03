import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { setTokens } from "@/shared/lib/supabase/auth";
import { createAdminClient } from "@/shared/lib/supabase/server";
import { createLogger } from "@/shared/lib/utils/logger";

export async function POST(request: Request) {
  const logger = createLogger(request, null, "login", "auth");

  try {
    const { phoneNumber, password, workspaceId, isTeacher } = await request.json();

    if (!phoneNumber || !password) {
      await logger.log("warn", 400);
      await logger.flush();
      return NextResponse.json({ error: "전화번호와 비밀번호를 입력해주세요." }, { status: 400 });
    }

    if (!isTeacher && !workspaceId) {
      await logger.log("warn", 400);
      await logger.flush();
      return NextResponse.json({ error: "워크스페이스를 선택해주세요." }, { status: 400 });
    }

    const supabase = await createAdminClient();

    let query = supabase
      .from("Users")
      .select("id, phone_number, name, password, role, workspace, school")
      .eq("phone_number", phoneNumber);

    if (!isTeacher) {
      query = query.eq("workspace", workspaceId).eq("role", "student");
    } else {
      query = query.in("role", ["owner", "admin"]);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      await logger.log("warn", 401);
      await logger.flush();
      return NextResponse.json({ error: "전화번호 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await logger.log("warn", 401);
      await logger.flush();
      return NextResponse.json({ error: "전화번호 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    const isDefaultPassword = await bcrypt.compare(user.phone_number, user.password);

    const tokenPayload = {
      userId: user.id,
      phoneNumber: user.phone_number,
      name: user.name,
      role: user.role as "owner" | "admin" | "student",
      workspace: user.workspace,
    };

    await setTokens(tokenPayload);

    const loggerWithSession = createLogger(request, tokenPayload, "login", "auth");
    await loggerWithSession.log("info", 200, undefined, user.id);
    await loggerWithSession.flush();

    return NextResponse.json({
      success: true,
      isDefaultPassword,
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phone_number,
        school: user.school,
        role: user.role,
        workspace: user.workspace,
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    await logger.log("error", 500, err);
    await logger.flush();
    return NextResponse.json({ error: "로그인 중 오류가 발생했습니다." }, { status: 500 });
  }
}
