import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const { data: clinicIds, error: clinicError } = await supabase
    .from("Clinics")
    .select("id")
    .eq("workspace", session.workspace);

  if (clinicError) throw clinicError;
  if (!clinicIds || clinicIds.length === 0) {
    return NextResponse.json({ data: [] });
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
  return NextResponse.json({ data });
};

export const GET = withLogging(handleGet, {
  resource: "clinic-attendance-required-absent",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
