import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { supabase, session } = await getAuthenticatedClient();

    const { data, error } = await supabase
      .from("RetakeAssignments")
      .select(`
        *,
        exam:Exams!inner(id, name, exam_number, course:Courses!inner(id, name, workspace)),
        student:Users!inner!RetakeAssignments_student_id_fkey(id, phone_number, name, school, workspace)
      `)
      .eq("id", id)
      .eq("exam.course.workspace", session.workspace)
      .eq("student.workspace", session.workspace)
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Retake fetch error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "재시험 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { scheduledDate, note, status } = await request.json();

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

    const updateData: any = {};
    if (scheduledDate !== undefined) updateData.current_scheduled_date = scheduledDate;
    if (note !== undefined) updateData.note = note;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from("RetakeAssignments")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        exam:Exams(id, name, exam_number, course:Courses(id, name)),
        student:Users!RetakeAssignments_student_id_fkey(id, phone_number, name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Retake update error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "재시험 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { error } = await supabase.from("RetakeAssignments").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Retake delete error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json({ error: "재시험 삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}
