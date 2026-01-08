import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { requireOwner } from "@/shared/lib/supabase/auth";
import { createAdminClient } from "@/shared/lib/supabase/server";

// 관리자 목록 조회 (Owner만 가능)
export async function GET() {
  try {
    const session = await requireOwner();

    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("Users")
      .select("id, phone_number, name, role, created_at")
      .eq("workspace", session.workspace)
      .in("role", ["owner", "admin"])
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Admins fetch error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "관리자 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 관리자 초대 (Owner만 가능)
export async function POST(request: Request) {
  try {
    const session = await requireOwner();

    const { name, phoneNumber, password } = await request.json();

    if (!name || !phoneNumber || !password) {
      return NextResponse.json({ error: "모든 필수 정보를 입력해주세요." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "비밀번호는 최소 8자 이상이어야 합니다." }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // 전화번호 중복 체크
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

    // 관리자 계정 생성
    const { data: newAdmin, error: adminError } = await supabase
      .from("Users")
      .insert({
        name,
        phone_number: phoneNumber,
        password: hashedPassword,
        role: "admin",
        workspace: session.workspace,
      })
      .select("id, phone_number, name, role, created_at")
      .single();

    if (adminError) throw adminError;

    return NextResponse.json({ success: true, data: newAdmin });
  } catch (error: any) {
    console.error("Admin creation error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "관리자 추가 중 오류가 발생했습니다." }, { status: 500 });
  }
}
