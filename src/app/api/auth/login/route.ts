import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { phoneNumber, password, workspaceId, isTeacher } = await request.json();

    if (!phoneNumber || !password) {
      return NextResponse.json({ error: "전화번호와 비밀번호를 입력해주세요." }, { status: 400 });
    }

    // 학생 로그인 시 워크스페이스 필수
    if (!isTeacher && !workspaceId) {
      return NextResponse.json({ error: "워크스페이스를 선택해주세요." }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // 전화번호로 사용자 조회
    let query = supabase.from("Users").select("*").eq("phone_number", phoneNumber);

    // 학생 로그인: 워크스페이스와 role=student 조건 추가
    if (!isTeacher) {
      query = query.eq("workspace", workspaceId).eq("role", "student");
    } else {
      // 선생님 로그인: role이 owner 또는 admin인 경우
      query = query.in("role", ["owner", "admin"]);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      return NextResponse.json({ error: "전화번호 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    // 비밀번호 검증 (bcrypt 사용)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "전화번호 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    // 세션 쿠키 설정
    const cookieStore = await cookies();
    const sessionData = {
      userId: user.id, // id (uuid)가 primary key
      phoneNumber: user.phone_number,
      name: user.name,
      role: user.role as "owner" | "admin" | "student",
      workspace: user.workspace,
    };

    cookieStore.set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
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
    console.error("Login error:", error);
    return NextResponse.json({ error: "로그인 중 오류가 발생했습니다." }, { status: 500 });
  }
}
