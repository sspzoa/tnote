import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const VALID_STATUSES = ["pending", "completed"] as const;

const handlePatch = async ({ request, supabase, session, params }: ApiContext) => {
  const id = params?.id;
  const { status, note } = await request.json();

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "유효하지 않은 상태입니다." }, { status: 400 });
  }

  const { data: task, error: fetchError } = await supabase
    .from("AssignmentTasks")
    .select(`*, student:Users!AssignmentTasks_student_id_fkey(workspace)`)
    .eq("id", id)
    .single();

  if (fetchError || !task) {
    return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 });
  }

  if (task.student.workspace !== session.workspace) {
    return NextResponse.json({ error: "접근 권한이 없습니다." }, { status: 403 });
  }

  const updateData: { status: string; note?: string } = { status };
  if (note !== undefined) {
    updateData.note = note;
  }

  const { error: updateError } = await supabase.from("AssignmentTasks").update(updateData).eq("id", id);

  if (updateError) {
    throw updateError;
  }

  await supabase.from("AssignmentTaskHistory").insert({
    assignment_task_id: id,
    action_type: "status_change",
    previous_status: task.status,
    new_status: status,
    note: note || null,
    performed_by: session.userId,
  });
  return NextResponse.json({ success: true });
};

export const PATCH = withLogging(handlePatch, {
  resource: "assignment-task-status",
  action: "update",
  allowedRoles: ["owner", "admin"],
});
