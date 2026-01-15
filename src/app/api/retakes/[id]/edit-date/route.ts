import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePatch = async ({ request, supabase, session, params }: ApiContext) => {
  const id = params?.id;
  const { newDate } = await request.json();

  if (!newDate) {
    return NextResponse.json({ error: "새로운 날짜를 입력해주세요." }, { status: 400 });
  }

  const { data: current, error: fetchError } = await supabase
    .from("RetakeAssignments")
    .select(`
      current_scheduled_date,
      exam:Exams!inner(course:Courses!inner(workspace)),
      student:Users!RetakeAssignments_student_id_fkey!inner(workspace)
    `)
    .eq("id", id)
    .eq("exam.course.workspace", session.workspace)
    .eq("student.workspace", session.workspace)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ error: "재시험을 찾을 수 없습니다." }, { status: 404 });
  }

  const previousDate = current.current_scheduled_date;

  // 날짜가 같으면 변경하지 않음
  if (previousDate === newDate) {
    return NextResponse.json({ error: "날짜가 변경되지 않았습니다." }, { status: 400 });
  }

  const { data: updated, error: updateError } = await supabase
    .from("RetakeAssignments")
    .update({
      current_scheduled_date: newDate,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    throw new Error(`재시험 업데이트 실패: ${updateError.message}`);
  }

  // 이력에 날짜 수정으로 기록 (연기 횟수 증가 없이)
  const { error: historyError } = await supabase.from("RetakeHistory").insert({
    retake_assignment_id: id,
    action_type: "date_edit",
    previous_date: previousDate,
    new_date: newDate,
    note: null,
  });

  if (historyError) {
    throw new Error(`이력 저장 실패: ${historyError.message}`);
  }
  return NextResponse.json({ success: true, data: updated });
};

export const PATCH = withLogging(handlePatch, { resource: "retake-edit-date", action: "update" });
