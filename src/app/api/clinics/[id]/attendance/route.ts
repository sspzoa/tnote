import { NextResponse } from "next/server";
import { getAuthenticatedClient, getSession, requireAdminOrOwner } from "@/shared/lib/supabase/auth";

// 클리닉 출석 조회
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id: clinicId } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const studentId = searchParams.get("studentId");

    const { supabase } = await getAuthenticatedClient();

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

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Clinic attendance fetch error:", error);
    return NextResponse.json({ error: "출석 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 출석 기록 (관리자만)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrOwner();
    const { id: clinicId } = await params;
    const { studentIds, date, note } = await request.json();

    if (!studentIds || !Array.isArray(studentIds) || !date) {
      return NextResponse.json({ error: "학생과 날짜를 선택해주세요." }, { status: 400 });
    }

    const { supabase } = await getAuthenticatedClient();

    // Insert attendance records (upsert to handle duplicates)
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

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Clinic attendance creation error:", error);
    return NextResponse.json({ error: "출석 기록 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 출석 목록 동기화 (토글 기능) - 관리자만
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrOwner();
    const { id: clinicId } = await params;
    const { studentIds, date, note } = await request.json();

    if (!Array.isArray(studentIds) || !date) {
      return NextResponse.json({ error: "학생 목록과 날짜를 제공해주세요." }, { status: 400 });
    }

    const { supabase } = await getAuthenticatedClient();

    // 1. 현재 해당 날짜의 모든 출석 기록 조회
    const { data: existingRecords, error: fetchError } = await supabase
      .from("ClinicAttendance")
      .select("id, student_id")
      .eq("clinic_id", clinicId)
      .eq("attendance_date", date);

    if (fetchError) throw fetchError;

    const existingStudentIds = new Set(existingRecords?.map((r) => r.student_id) || []);
    const newStudentIds = new Set(studentIds);

    // 2. 삭제할 기록들 (기존에 있는데 새 목록에 없는 학생들)
    const toDelete = existingRecords?.filter((r) => !newStudentIds.has(r.student_id)).map((r) => r.id) || [];

    // 3. 추가할 학생들 (새 목록에 있는데 기존에 없는 학생들)
    const toAdd = studentIds.filter((id: string) => !existingStudentIds.has(id));

    // 4. 삭제 실행
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase.from("ClinicAttendance").delete().in("id", toDelete);

      if (deleteError) throw deleteError;
    }

    // 5. 추가 실행
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

    return NextResponse.json({
      success: true,
      deleted: toDelete.length,
      added: toAdd.length,
    });
  } catch (error: any) {
    console.error("Clinic attendance sync error:", error);
    return NextResponse.json({ error: "출석 동기화 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 출석 기록 삭제 (관리자만)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrOwner();
    const { id: clinicId } = await params;
    const { searchParams } = new URL(request.url);
    const attendanceId = searchParams.get("attendanceId");

    if (!attendanceId) {
      return NextResponse.json({ error: "출석 ID가 필요합니다." }, { status: 400 });
    }

    const { supabase } = await getAuthenticatedClient();

    const { error } = await supabase.from("ClinicAttendance").delete().eq("id", attendanceId).eq("clinic_id", clinicId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Clinic attendance delete error:", error);
    return NextResponse.json({ error: "출석 삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}
