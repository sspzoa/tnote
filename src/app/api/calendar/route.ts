import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import {
  type CalendarEvent,
  createRetakeEvent,
  generateClinicSessions,
  generateCourseSessions,
} from "@/shared/lib/utils/calendar";

import type {
  CalendarAttendanceRecord,
  CalendarClinicData,
  CalendarCourseData,
  CalendarRetakeData,
} from "@/shared/types/api";

const fetchCourses = async (
  supabase: ApiContext["supabase"],
  workspace: string,
  studentId?: string,
): Promise<CalendarCourseData[]> => {
  if (studentId) {
    const { data: enrollments, error } = await supabase
      .from("CourseEnrollments")
      .select(`course:Courses!inner(id, name, start_date, end_date, days_of_week)`)
      .eq("student_id", studentId);

    if (error) throw error;
    return (enrollments || []).map((e) => e.course as unknown as CalendarCourseData);
  }

  const { data: courses, error } = await supabase
    .from("Courses")
    .select("id, name, start_date, end_date, days_of_week")
    .eq("workspace", workspace)
    .not("start_date", "is", null)
    .not("end_date", "is", null);

  if (error) throw error;
  return (courses as CalendarCourseData[]) || [];
};

const fetchRetakes = async (
  supabase: ApiContext["supabase"],
  workspace: string,
  studentId?: string,
): Promise<CalendarRetakeData[]> => {
  if (studentId) {
    const { data, error } = await supabase
      .from("RetakeAssignments")
      .select(
        `id, current_scheduled_date, status, exam:Exams!inner(id, name, exam_number, course:Courses!inner(id, name))`,
      )
      .eq("student_id", studentId);

    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      current_scheduled_date: r.current_scheduled_date,
      status: r.status,
      exam: r.exam as unknown as { name: string; course: { name: string } },
    }));
  }

  const { data, error } = await supabase
    .from("RetakeAssignments")
    .select(`
      id, current_scheduled_date, status,
      student:Users!RetakeAssignments_student_id_fkey!inner(name, workspace),
      exam:Exams!inner(id, name, exam_number, course:Courses!inner(id, name))
    `)
    .eq("student.workspace", workspace);

  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.id,
    current_scheduled_date: r.current_scheduled_date,
    status: r.status,
    exam: r.exam as unknown as { name: string; course: { name: string } },
    student: r.student as unknown as { name: string },
  }));
};

const fetchClinicsWithAttendance = async (
  supabase: ApiContext["supabase"],
  workspace: string,
): Promise<{ clinics: CalendarClinicData[]; attendance: CalendarAttendanceRecord[] }> => {
  const [clinicsResult, attendanceResult] = await Promise.all([
    supabase
      .from("Clinics")
      .select("id, name, start_date, end_date, operating_days")
      .eq("workspace", workspace)
      .not("start_date", "is", null)
      .not("end_date", "is", null),
    supabase.from("ClinicAttendance").select("attendance_date, student_id, clinic_id"),
  ]);

  if (clinicsResult.error) throw clinicsResult.error;
  if (attendanceResult.error) throw attendanceResult.error;

  const clinics = (clinicsResult.data as CalendarClinicData[]) || [];
  const clinicIds = new Set(clinics.map((c) => c.id));
  const attendance = ((attendanceResult.data as CalendarAttendanceRecord[]) || []).filter(
    (a) => a.clinic_id && clinicIds.has(a.clinic_id),
  );

  return { clinics, attendance };
};

const handleGet = async ({ request, supabase, session }: ApiContext) => {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  const events: CalendarEvent[] = [];
  const isStudent = session.role === "student";
  const studentId = isStudent ? session.userId : undefined;

  const [courses, retakes, { clinics, attendance }] = await Promise.all([
    fetchCourses(supabase, session.workspace, studentId),
    fetchRetakes(supabase, session.workspace, studentId),
    fetchClinicsWithAttendance(supabase, session.workspace),
  ]);

  for (const course of courses) {
    if (course.start_date && course.end_date && course.days_of_week) {
      events.push(
        ...generateCourseSessions({
          id: course.id,
          name: course.name,
          start_date: course.start_date,
          end_date: course.end_date,
          days_of_week: course.days_of_week,
        }),
      );
    }
  }

  for (const retake of retakes) {
    if (retake.current_scheduled_date) {
      events.push(createRetakeEvent(retake, !isStudent));
    }
  }

  for (const clinic of clinics) {
    if (clinic.start_date && clinic.end_date && clinic.operating_days) {
      const clinicAttendance = attendance.filter((a) => a.clinic_id === clinic.id);
      events.push(
        ...generateClinicSessions(
          {
            id: clinic.id,
            name: clinic.name,
            start_date: clinic.start_date,
            end_date: clinic.end_date,
            operating_days: clinic.operating_days,
          },
          clinicAttendance,
          studentId,
        ),
      );
    }
  }

  let filteredEvents = events;
  if (startDate && endDate) {
    filteredEvents = events.filter((e) => e.date >= startDate && e.date <= endDate);
  }

  return NextResponse.json({ data: filteredEvents });
};

export const GET = withLogging(handleGet, { resource: "calendar", action: "read" });
