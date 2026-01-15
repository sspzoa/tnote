import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePost = async ({ supabase, session, params }: ApiContext) => {
  const retakeId = params?.id;
  const historyId = params?.historyId;

  if (!retakeId || !historyId) {
    return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
  }

  // 재시험 권한 확인
  const { data: retake, error: retakeError } = await supabase
    .from("RetakeAssignments")
    .select(`
      *,
      exam:Exams!inner(course:Courses!inner(workspace)),
      student:Users!RetakeAssignments_student_id_fkey!inner(workspace)
    `)
    .eq("id", retakeId)
    .eq("exam.course.workspace", session.workspace)
    .eq("student.workspace", session.workspace)
    .single();

  if (retakeError || !retake) {
    return NextResponse.json({ error: "재시험을 찾을 수 없습니다." }, { status: 404 });
  }

  // 가장 최근 이력 조회
  const { data: latestHistory, error: latestHistoryError } = await supabase
    .from("RetakeHistory")
    .select("*")
    .eq("retake_assignment_id", retakeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (latestHistoryError || !latestHistory) {
    return NextResponse.json({ error: "이력을 찾을 수 없습니다." }, { status: 404 });
  }

  // 요청한 이력이 가장 최근 이력인지 확인
  if (latestHistory.id !== historyId) {
    return NextResponse.json({ error: "가장 최근 이력만 되돌릴 수 있습니다." }, { status: 400 });
  }

  const history = latestHistory;

  // 되돌릴 데이터 준비
  const undoData: Record<string, unknown> = {};

  // 날짜 관련 작업 되돌리기 (postpone, date_edit)
  if (history.action_type === "postpone" || history.action_type === "date_edit") {
    // previous_date가 null이면 미지정으로 되돌림
    undoData.current_scheduled_date = history.previous_date;

    // postpone의 경우 횟수도 되돌리기 + 이전 상태로 복원
    if (history.action_type === "postpone") {
      if (retake.postpone_count > 0) {
        undoData.postpone_count = retake.postpone_count - 1;
      }
      // 이전 상태가 저장되어 있으면 복원
      if (history.previous_status) {
        undoData.status = history.previous_status;
      }
    }
  }

  // 결석 되돌리기
  if (history.action_type === "absent") {
    undoData.status = "pending";

    if (retake.absent_count > 0) {
      undoData.absent_count = retake.absent_count - 1;
    }
  }

  // 완료 되돌리기
  if (history.action_type === "complete") {
    undoData.status = "pending";
  }

  // 상태 변경 되돌리기
  if (history.action_type === "status_change") {
    if (!history.previous_status) {
      return NextResponse.json({ error: "이전 상태 정보가 없어 되돌릴 수 없습니다." }, { status: 400 });
    }
    undoData.status = history.previous_status;
  }

  // 관리 상태 변경 되돌리기
  if (history.action_type === "management_status_change") {
    if (!history.previous_management_status) {
      return NextResponse.json({ error: "이전 관리 상태 정보가 없어 되돌릴 수 없습니다." }, { status: 400 });
    }
    undoData.management_status = history.previous_management_status;
  }

  // 업데이트 실행
  if (Object.keys(undoData).length === 0) {
    return NextResponse.json({ error: "되돌릴 수 있는 데이터가 없습니다." }, { status: 400 });
  }

  const { error: updateError } = await supabase.from("RetakeAssignments").update(undoData).eq("id", retakeId);

  if (updateError) {
    throw new Error(`재시험 업데이트 실패: ${updateError.message}`);
  }

  // 이력 삭제
  const { error: deleteError } = await supabase.from("RetakeHistory").delete().eq("id", historyId);

  if (deleteError) {
    throw new Error(`이력 삭제 실패: ${deleteError.message}`);
  }
  return NextResponse.json({ success: true });
};

export const POST = withLogging(handlePost, { resource: "retake-undo", action: "update" });
