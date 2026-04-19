import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const { data: clinicIds, error: clinicError } = await supabase
    .from("Clinics")
    .select("id")
    .eq("workspace", session.workspace);

  if (clinicError) throw clinicError;
  if (!clinicIds || clinicIds.length === 0) {
    return NextResponse.json({ data: [], voluntaryAttendance: [] });
  }

  const ids = clinicIds.map((c) => c.id);

  const { data, error } = await supabase
    .from("ClinicAttendance")
    .select(`
      id,
      attendance_date,
      note,
      student:Users!ClinicAttendance_student_id_fkey(id, name, school),
      clinic:Clinics!ClinicAttendance_clinic_id_fkey(id, name)
    `)
    .in("clinic_id", ids)
    .eq("is_required", true)
    .eq("status", "absent")
    .order("attendance_date", { ascending: false });

  if (error) throw error;

  // biome-ignore lint/suspicious/noExplicitAny: supabase join returns dynamic shape
  const absentStudentIds = [
    ...new Set((data || []).map((d: any) => d.student?.id ?? d.student?.[0]?.id).filter(Boolean)),
  ];

  // biome-ignore lint/suspicious/noExplicitAny: supabase join returns dynamic shape
  let voluntaryAttendance: any[] = [];

  if (absentStudentIds.length > 0) {
    const { data: voluntary, error: volError } = await supabase
      .from("ClinicAttendance")
      .select(`
        id,
        attendance_date,
        student:Users!ClinicAttendance_student_id_fkey(id, name),
        clinic:Clinics!ClinicAttendance_clinic_id_fkey(id, name)
      `)
      .in("clinic_id", ids)
      .in("student_id", absentStudentIds)
      .eq("is_required", false)
      .eq("status", "attended")
      .order("attendance_date", { ascending: false });

    if (volError) throw volError;
    voluntaryAttendance = voluntary || [];
  }

  return NextResponse.json({ data, voluntaryAttendance });
};

export const GET = withLogging(handleGet, {
  resource: "clinic-attendance-required-absent",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
