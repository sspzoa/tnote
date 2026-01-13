import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ request, supabase, session, logger, params }: ApiContext) => {
  const clinicId = params?.id;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const studentId = searchParams.get("studentId");

  const { data: clinic } = await supabase
    .from("Clinics")
    .select("id")
    .eq("id", clinicId)
    .eq("workspace", session.workspace)
    .single();

  if (!clinic) {
    return NextResponse.json({ error: "클리닉을 찾을 수 없습니다." }, { status: 404 });
  }

  let query = supabase
    .from("ClinicAttendance")
    .select(`
      *,
      student:Users!ClinicAttendance_student_id_fkey(id, name, phone_number, school)
    `)
    .eq("clinic_id", clinicId)
    .order("attendance_date", { ascending: false });

  if (date) {
    query = query.eq("attendance_date", date);
  }

  if (studentId) {
    query = query.eq("student_id", studentId);
  }

  const { data, error } = await query;

  if (error) throw error;

  await logger.info("read", "clinic-attendance", `Retrieved ${data.length} attendance records for clinic ${clinicId}`, {
    resourceId: clinicId,
  });
  return NextResponse.json({ data });
};

const handlePost = async ({ request, supabase, session, logger, params }: ApiContext) => {
  const clinicId = params?.id;
  const { studentIds, date, note } = await request.json();

  if (!studentIds || !Array.isArray(studentIds) || !date) {
    return NextResponse.json({ error: "학생과 날짜를 선택해주세요." }, { status: 400 });
  }

  const { data: clinic } = await supabase
    .from("Clinics")
    .select("id")
    .eq("id", clinicId)
    .eq("workspace", session.workspace)
    .single();

  if (!clinic) {
    return NextResponse.json({ error: "클리닉을 찾을 수 없습니다." }, { status: 404 });
  }

  const records = studentIds.map((studentId: string) => ({
    clinic_id: clinicId,
    student_id: studentId,
    attendance_date: date,
    note: note || null,
  }));

  const { data, error } = await supabase
    .from("ClinicAttendance")
    .upsert(records, { onConflict: "clinic_id,student_id,attendance_date" })
    .select();

  if (error) throw error;

  await logger.logCreate(
    "clinic-attendance",
    clinicId!,
    `Attendance recorded for ${studentIds.length} students on ${date}`,
  );
  return NextResponse.json({ success: true, data });
};

const handlePatch = async ({ request, supabase, session, logger, params }: ApiContext) => {
  const clinicId = params?.id;
  const { studentIds, date, note } = await request.json();

  if (!Array.isArray(studentIds) || !date) {
    return NextResponse.json({ error: "학생 목록과 날짜를 제공해주세요." }, { status: 400 });
  }

  const { data: clinic } = await supabase
    .from("Clinics")
    .select("id")
    .eq("id", clinicId)
    .eq("workspace", session.workspace)
    .single();

  if (!clinic) {
    return NextResponse.json({ error: "클리닉을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: existingRecords, error: fetchError } = await supabase
    .from("ClinicAttendance")
    .select("id, student_id")
    .eq("clinic_id", clinicId)
    .eq("attendance_date", date);

  if (fetchError) throw fetchError;

  const existingStudentIds = new Set(existingRecords?.map((r) => r.student_id) || []);
  const newStudentIds = new Set(studentIds);

  const toDelete = existingRecords?.filter((r) => !newStudentIds.has(r.student_id)).map((r) => r.id) || [];
  const toAdd = studentIds.filter((id: string) => !existingStudentIds.has(id));

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from("ClinicAttendance").delete().in("id", toDelete);

    if (deleteError) throw deleteError;
  }

  if (toAdd.length > 0) {
    const records = toAdd.map((studentId: string) => ({
      clinic_id: clinicId,
      student_id: studentId,
      attendance_date: date,
      note: note || null,
    }));

    const { error: insertError } = await supabase.from("ClinicAttendance").insert(records);

    if (insertError) throw insertError;
  }

  await logger.logUpdate(
    "clinic-attendance",
    clinicId!,
    `Attendance synced for ${date}: ${toAdd.length} added, ${toDelete.length} removed`,
  );
  return NextResponse.json({
    success: true,
    deleted: toDelete.length,
    added: toAdd.length,
  });
};

const handleDelete = async ({ request, supabase, session, logger, params }: ApiContext) => {
  const clinicId = params?.id;
  const { searchParams } = new URL(request.url);
  const attendanceId = searchParams.get("attendanceId");

  if (!attendanceId) {
    return NextResponse.json({ error: "출석 ID가 필요합니다." }, { status: 400 });
  }

  const { data: clinic } = await supabase
    .from("Clinics")
    .select("id")
    .eq("id", clinicId)
    .eq("workspace", session.workspace)
    .single();

  if (!clinic) {
    return NextResponse.json({ error: "클리닉을 찾을 수 없습니다." }, { status: 404 });
  }

  const { error } = await supabase.from("ClinicAttendance").delete().eq("id", attendanceId).eq("clinic_id", clinicId);

  if (error) throw error;

  await logger.logDelete("clinic-attendance", attendanceId, `Attendance record deleted from clinic ${clinicId}`);
  return NextResponse.json({ success: true });
};

export const GET = withLogging(handleGet, { resource: "clinic-attendance", action: "read" });
export const POST = withLogging(handlePost, { resource: "clinic-attendance", action: "create" });
export const PATCH = withLogging(handlePatch, { resource: "clinic-attendance", action: "update" });
export const DELETE = withLogging(handleDelete, { resource: "clinic-attendance", action: "delete" });
