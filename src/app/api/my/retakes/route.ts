import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

interface RetakeRow {
  id: string;
  status: string;
  management_status: string;
  current_scheduled_date: string | null;
  postpone_count: number;
  absent_count: number;
  exam: {
    id: string;
    name: string;
    exam_number: number;
    course: { id: string; name: string; workspace: string };
  };
}

const handleGet = async ({ supabase, session }: ApiContext) => {
  const { data, error } = await supabase
    .from("RetakeAssignments")
    .select(`
      id,
      status,
      management_status,
      current_scheduled_date,
      postpone_count,
      absent_count,
      exam:Exams!inner(
        id,
        name,
        exam_number,
        course:Courses!inner(id, name, workspace)
      )
    `)
    .eq("student_id", session.userId)
    .eq("exam.course.workspace", session.workspace);

  if (error) throw error;

  const retakes = ((data as unknown as RetakeRow[]) || []).map((record) => ({
    id: record.id,
    status: record.status,
    managementStatus: record.management_status,
    scheduledDate: record.current_scheduled_date,
    postponeCount: record.postpone_count,
    absentCount: record.absent_count,
    exam: {
      id: record.exam.id,
      name: record.exam.name,
      examNumber: record.exam.exam_number,
      course: {
        id: record.exam.course.id,
        name: record.exam.course.name,
      },
    },
  }));

  return NextResponse.json({ data: retakes });
};

export const GET = withLogging(handleGet, {
  resource: "my-retakes",
  action: "read",
  allowedRoles: ["student"],
});
