import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

// 학생 정보 조회 (권한: middleware에서 이미 체크됨)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { supabase, session } = await getAuthenticatedClient();

    // workspace 필터링으로 다른 workspace의 학생 접근 방지
    const { data, error } = await supabase
      .from("Users")
      .select("id, phone_number, name, parent_phone_number, school, birth_year")
      .eq("id", id)
      .eq("workspace", session.workspace)
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Student fetch error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "학생 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 학생 정보 수정 (권한: middleware에서 이미 체크됨)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, phoneNumber, parentPhoneNumber, school, birthYear } = await request.json();

    const { supabase, session } = await getAuthenticatedClient();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phoneNumber !== undefined) updateData.phone_number = phoneNumber;
    if (parentPhoneNumber !== undefined) updateData.parent_phone_number = parentPhoneNumber;
    if (school !== undefined) updateData.school = school;
    if (birthYear !== undefined) updateData.birth_year = birthYear;

    // workspace 필터링으로 다른 workspace의 학생 수정 방지
    const { data, error } = await supabase
      .from("Users")
      .update(updateData)
      .eq("id", id)
      .eq("workspace", session.workspace)
      .select("id, phone_number, name, parent_phone_number, school, birth_year")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Student update error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "학생 정보 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 학생 삭제 (권한: middleware에서 이미 체크됨)
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { supabase, session } = await getAuthenticatedClient();

    // workspace 필터링으로 다른 workspace의 학생 삭제 방지
    // CASCADE 외래 키로 관련 데이터 자동 삭제
    const { error } = await supabase.from("Users").delete().eq("id", id).eq("workspace", session.workspace);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Student delete error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "학생 삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}
