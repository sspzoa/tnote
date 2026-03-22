import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const studentId = session.userId;

  const { data, error } = await supabase
    .from("ClinicAttendance")
    .select(`
      id,
      attendance_date,
      note,
      status,
      did_retake_exam,
      did_homework_check,
      did_qa,
      is_required,
      clinic:Clinics!inner(id, name, workspace)
    `)
    .eq("student_id", studentId)
    .eq("clinic.workspace", session.workspace)
    .order("attendance_date", { ascending: false })
    .limit(20);

  if (error) throw error;

  interface ClinicRow {
    id: string;
    attendance_date: string;
    note: string | null;
    status: "attended" | "absent";
    did_retake_exam: boolean;
    did_homework_check: boolean;
    did_qa: boolean;
    is_required: boolean;
    clinic: { id: string; name: string; workspace: string };
  }

  const records = ((data as unknown as ClinicRow[]) || []).map((record) => ({
    id: record.id,
    attendanceDate: record.attendance_date,
    note: record.note,
    status: record.status,
    didRetakeExam: record.did_retake_exam,
    didHomeworkCheck: record.did_homework_check,
    didQa: record.did_qa,
    isRequired: record.is_required,
    clinic: {
      id: record.clinic.id,
      name: record.clinic.name,
    },
  }));

  return NextResponse.json({ data: records });
};

export const GET = withLogging(handleGet, {
  resource: "my-clinics",
  action: "read",
  allowedRoles: ["student"],
});
