import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { STUDENT_ASSIGNMENT_HISTORY_TABLE, STUDENT_ASSIGNMENT_TABLE } from "@/shared/lib/utils/studentAssignments";

const handlePost = async ({ supabase, session, params }: ApiContext) => {
  const taskId = params?.id;
  const historyId = params?.historyId;

  if (!taskId || !historyId) {
    return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
  }

  const { data: task, error: taskError } = await supabase
    .from(STUDENT_ASSIGNMENT_TABLE)
    .select(`
      id,
      status,
      postpone_count,
      absent_count,
      current_scheduled_date,
      assignment:Assignments!inner(course:Courses!inner(workspace)),
      student:Users!StudentAssignments_student_id_fkey!inner(workspace)
    `)
    .eq("id", taskId)
    .eq("assignment.course.workspace", session.workspace)
    .eq("student.workspace", session.workspace)
    .single();

  if (taskError || !task) {
    return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: latestHistory, error: latestHistoryError } = await supabase
    .from(STUDENT_ASSIGNMENT_HISTORY_TABLE)
    .select(`
      id,
      action_type,
      previous_date,
      new_date,
      previous_status,
      new_status
    `)
    .eq("student_assignment_id", taskId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (latestHistoryError || !latestHistory) {
    return NextResponse.json({ error: "이력을 찾을 수 없습니다." }, { status: 404 });
  }

  if (latestHistory.id !== historyId) {
    return NextResponse.json({ error: "가장 최근 이력만 되돌릴 수 있습니다." }, { status: 400 });
  }

  const history = latestHistory;
  const undoData: Record<string, unknown> = {};

  if (history.action_type === "postpone" || history.action_type === "date_edit") {
    undoData.current_scheduled_date = history.previous_date;

    if (history.action_type === "postpone") {
      if (task.postpone_count > 0) {
        undoData.postpone_count = task.postpone_count - 1;
      }
      if (history.previous_status) {
        undoData.status = history.previous_status;
      }
    }
  }

  if (history.action_type === "absent") {
    undoData.status = history.previous_status ?? "pending";

    if (task.absent_count > 0) {
      undoData.absent_count = task.absent_count - 1;
    }
  }

  if (history.action_type === "complete") {
    undoData.status = history.previous_status ?? "pending";
    undoData.current_scheduled_date = history.previous_date;
  }

  if (history.action_type === "insufficient") {
    if (!history.previous_status) {
      return NextResponse.json({ error: "이전 상태 정보가 없어 되돌릴 수 없습니다." }, { status: 400 });
    }

    undoData.status = history.previous_status;
  }

  if (history.action_type === "not_submitted") {
    if (!history.previous_status) {
      return NextResponse.json({ error: "이전 상태 정보가 없어 되돌릴 수 없습니다." }, { status: 400 });
    }

    undoData.status = history.previous_status;
  }

  if (history.action_type === "status_change") {
    if (!history.previous_status) {
      return NextResponse.json({ error: "이전 상태 정보가 없어 되돌릴 수 없습니다." }, { status: 400 });
    }
    undoData.status = history.previous_status;
  }

  if (Object.keys(undoData).length === 0) {
    return NextResponse.json({ error: "되돌릴 수 있는 데이터가 없습니다." }, { status: 400 });
  }

  const { error: updateError } = await supabase.from(STUDENT_ASSIGNMENT_TABLE).update(undoData).eq("id", taskId);

  if (updateError) {
    throw new Error(`과제 업데이트 실패: ${updateError.message}`);
  }

  const { error: deleteError } = await supabase.from(STUDENT_ASSIGNMENT_HISTORY_TABLE).delete().eq("id", historyId);

  if (deleteError) {
    throw new Error(`이력 삭제 실패: ${deleteError.message}`);
  }

  return NextResponse.json({ success: true });
};

export const POST = withLogging(handlePost, {
  resource: "assignment-task-undo",
  action: "update",
  allowedRoles: ["owner", "admin"],
});
