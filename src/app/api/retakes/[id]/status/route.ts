import { NextResponse } from "next/server";
import { getAuthenticatedClient, requireAdminOrOwner } from "@/shared/lib/supabase/auth";

const VALID_STATUSES = ["pending", "completed", "absent"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminOrOwner();
    const { supabase } = await getAuthenticatedClient();
    const { status, note } = await request.json();
    const { id } = await params;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "유효하지 않은 상태입니다." }, { status: 400 });
    }

    const { data: retake, error: fetchError } = await supabase
      .from("RetakeAssignments")
      .select("*, student:Users!RetakeAssignments_student_id_fkey(workspace)")
      .eq("id", id)
      .single();

    if (fetchError || !retake) {
      return NextResponse.json({ error: "재시험을 찾을 수 없습니다." }, { status: 404 });
    }

    if (retake.student.workspace !== session.workspace) {
      return NextResponse.json({ error: "접근 권한이 없습니다." }, { status: 403 });
    }

    const updateData: { status: string; note?: string } = { status };
    if (note !== undefined) {
      updateData.note = note;
    }

    const { error: updateError } = await supabase.from("RetakeAssignments").update(updateData).eq("id", id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: "상태 변경에 실패했습니다." }, { status: 500 });
    }

    // Create history record
    await supabase.from("RetakeHistory").insert({
      retake_assignment_id: id,
      action_type: "status_change",
      previous_status: retake.status,
      new_status: status,
      note: note || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
