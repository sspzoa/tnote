import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePatch = async ({ request, supabase, session, params }: ApiContext) => {
  const id = params?.id;
  const { management_status } = await request.json();

  if (!management_status || typeof management_status !== "string") {
    return NextResponse.json({ error: "관리 상태는 필수입니다." }, { status: 400 });
  }

  const { data: validStatuses } = await supabase
    .from("ManagementStatuses")
    .select("name")
    .eq("workspace", session.workspace)
    .eq("category", "assignment");

  const validNames = validStatuses?.map((s) => s.name) ?? [];

  if (!validNames.includes(management_status)) {
    return NextResponse.json({ error: "유효하지 않은 관리 상태입니다." }, { status: 400 });
  }

  const { data: task, error: fetchError } = await supabase
    .from("AssignmentTasks")
    .select(`
      *,
      assignment:Assignments!inner(course:Courses!inner(workspace)),
      student:Users!AssignmentTasks_student_id_fkey!inner(workspace)
    `)
    .eq("id", id)
    .eq("assignment.course.workspace", session.workspace)
    .eq("student.workspace", session.workspace)
    .single();

  if (fetchError || !task) {
    return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 });
  }

  const { error: updateError } = await supabase.from("AssignmentTasks").update({ management_status }).eq("id", id);

  if (updateError) {
    throw updateError;
  }

  await supabase.from("AssignmentTaskHistory").insert({
    assignment_task_id: id,
    action_type: "management_status_change",
    previous_management_status: task.management_status,
    new_management_status: management_status,
    performed_by: session.userId,
  });

  return NextResponse.json({ success: true });
};

export const PATCH = withLogging(handlePatch, {
  resource: "assignment-task-management-status",
  action: "update",
  allowedRoles: ["owner", "admin"],
});
