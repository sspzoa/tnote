import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handlePatch = async ({ request, supabase, session, params }: ApiContext) => {
  const id = params?.id;
  const { note } = await request.json();

  const { data: current, error: fetchError } = await supabase
    .from("AssignmentTasks")
    .select(`
      status,
      absent_count,
      current_scheduled_date,
      assignment:Assignments!inner(course:Courses!inner(workspace)),
      student:Users!AssignmentTasks_student_id_fkey!inner(workspace)
    `)
    .eq("id", id)
    .eq("assignment.course.workspace", session.workspace)
    .eq("student.workspace", session.workspace)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: updated, error: updateError } = await supabase
    .from("AssignmentTasks")
    .update({
      status: "absent",
      absent_count: (current.absent_count ?? 0) + 1,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) throw updateError;

  const { error: historyError } = await supabase.from("AssignmentTaskHistory").insert({
    assignment_task_id: id,
    action_type: "absent",
    previous_date: current.current_scheduled_date,
    previous_status: current.status,
    new_status: "absent",
    note: note || null,
    performed_by: session.userId,
  });

  if (historyError) throw historyError;
  return NextResponse.json({ success: true, data: updated });
};

export const PATCH = withLogging(handlePatch, {
  resource: "assignment-task-absent",
  action: "update",
  allowedRoles: ["owner", "admin"],
});
