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

    let query = supabase.from("Users").select("*").eq("phone_number", phoneNumber);

    if (!isTeacher) {
      query = query.eq("workspace", workspaceId).eq("role", "student");
    } else {
      query = query.in("role", ["owner", "admin"]);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      return NextResponse.json({ error: "전화번호 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "전화번호 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    const cookieStore = await cookies();
    const sessionData = {
      userId: user.id,
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
