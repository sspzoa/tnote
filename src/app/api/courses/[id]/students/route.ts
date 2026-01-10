import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { supabase, session } = await getAuthenticatedClient();

    const { data: course } = await supabase
      .from("Courses")
      .select("id")
      .eq("id", id)
      .eq("workspace", session.workspace)
      .single();

    if (!course) {
      return NextResponse.json({ error: "수업을 찾을 수 없습니다." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("CourseEnrollments")
      .select(`
        student_id,
        student:Users!CourseEnrollments_student_id_fkey(id, phone_number, name, school, birth_year)
      `)
      .eq("course_id", id);

    if (error) throw error;

    const students = data.map((enrollment) => enrollment.student);

    return NextResponse.json({ data: students });
  } catch (error: any) {
    console.error("Course students fetch error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "학생 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
