import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
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

    const supabase = await createClient();
    const email = `${phoneNumber}@tnote.local`;

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !authData.user) {
      await logger.log("warn", 401);
      await logger.flush();
      return NextResponse.json({ error: "전화번호 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    const metadata = authData.user.user_metadata;
    const role = metadata.role as string;
    const workspace = metadata.workspace as string;

    if (isTeacher && !["owner", "admin"].includes(role)) {
      await supabase.auth.signOut();
      await logger.log("warn", 401);
      await logger.flush();
      return NextResponse.json({ error: "전화번호 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    if (!isTeacher && (role !== "student" || workspace !== workspaceId)) {
      await supabase.auth.signOut();
      await logger.log("warn", 401);
      await logger.flush();
      return NextResponse.json({ error: "전화번호 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    const isDefaultPassword = password === phoneNumber;

    const logSession = {
      userId: authData.user.id,
      phoneNumber,
      name: metadata.name as string,
      role: role as "owner" | "admin" | "student",
      workspace,
    };

    const loggerWithSession = createLogger(request, logSession, "login", "auth");
    await loggerWithSession.log("info", 200, undefined, logSession.userId);
    await loggerWithSession.flush();

    return NextResponse.json({
      success: true,
      isDefaultPassword,
      user: {
        id: logSession.userId,
        name: logSession.name,
        phoneNumber,
        role,
        workspace,
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    await logger.log("error", 500, err);
    await logger.flush();
    return NextResponse.json({ error: "로그인 중 오류가 발생했습니다." }, { status: 500 });
  }
}
