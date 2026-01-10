import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { supabase, session } = await getAuthenticatedClient();

    const { data: retake } = await supabase
      .from("RetakeAssignments")
      .select(`
        id,
        exam:Exams!inner(course:Courses!inner(workspace)),
        student:Users!inner!RetakeAssignments_student_id_fkey(workspace)
      `)
      .eq("id", id)
      .eq("exam.course.workspace", session.workspace)
      .eq("student.workspace", session.workspace)
      .single();

    if (!retake) {
      return NextResponse.json({ error: "재시험을 찾을 수 없습니다." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("RetakeHistory")
      .select("*")
      .eq("retake_assignment_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("History fetch error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "이력 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
