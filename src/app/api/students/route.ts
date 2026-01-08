import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { getAuthenticatedClient, requireAdminOrOwner } from "@/shared/lib/supabase/auth";

// 학생 목록 조회 (관리자만)
export async function GET(request: Request) {
  try {
    await requireAdminOrOwner();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const { supabase, session } = await getAuthenticatedClient();

    if (courseId) {
      // 특정 코스의 학생만 조회
      const { data, error } = await supabase
        .from("CourseEnrollments")
        .select(`
          student_id,
          enrolled_at,
          student:Users!CourseEnrollments_student_id_fkey(
            id,
            phone_number,
            name,
            parent_phone_number,
            school,
            birth_year
          )
        `)
        .eq("course_id", courseId)
        .order("enrolled_at", { ascending: true });

      if (error) throw error;

      const students = data.map((enrollment) => ({
        ...enrollment.student,
        enrolled_at: enrollment.enrolled_at,
      }));

      return NextResponse.json({ data: students });
    }

    // 전체 학생 조회 (role = student, 현재 사용자의 workspace)
    const { data, error } = await supabase
      .from("Users")
      .select("id, phone_number, name, parent_phone_number, school, birth_year, created_at")
      .eq("role", "student")
      .eq("workspace", session.workspace)
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Students fetch error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ error: "학생 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 학생 생성 (관리자만)
export async function POST(request: Request) {
  try {
    await requireAdminOrOwner();
    const { name, phoneNumber, parentPhoneNumber, school, birthYear } = await request.json();

    if (!name || !phoneNumber) {
      return NextResponse.json({ error: "이름과 전화번호는 필수입니다." }, { status: 400 });
    }

    const { supabase, session } = await getAuthenticatedClient();

    // 전화번호를 비밀번호로 해싱
    const hashedPassword = await bcrypt.hash(phoneNumber, 10);

    const { data, error } = await supabase
      .from("Users")
      .insert({
        name,
        phone_number: phoneNumber,
        parent_phone_number: parentPhoneNumber || null,
        school: school || null,
        birth_year: birthYear ? Number.parseInt(birthYear) : null,
        password: hashedPassword,
        role: "student",
        workspace: session.workspace,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "이미 등록된 전화번호입니다." }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Student creation error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ error: "학생 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
