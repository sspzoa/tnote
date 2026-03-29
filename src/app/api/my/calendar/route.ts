import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import {
  type CalendarEvent,
  createAssignmentTaskEvent,
  createRetakeEvent,
  generateClinicSessions,
  generateCourseSessions,
} from "@/shared/lib/utils/calendar";

import type {
  CalendarAssignmentTaskData,
  CalendarAttendanceRecord,
  CalendarClinicData,
  CalendarCourseData,
  CalendarRetakeData,
} from "@/shared/types/api";

const handleGet = async ({ request, supabase, session }: ApiContext) => {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  const studentId = session.userId;

  const [enrollments, retakesData, assignmentTasksData, clinicsResult] = await Promise.all([
    supabase
      .from("CourseEnrollments")
      .select("course:Courses!inner(id, name, start_date, end_date, days_of_week)")
      .eq("student_id", studentId),

    supabase
      .from("RetakeAssignments")
      .select(
        "id, current_scheduled_date, status, exam:Exams!inner(id, name, exam_number, course:Courses!inner(id, name))",
      )
      .eq("student_id", studentId),

    supabase
      .from("AssignmentTasks")
      .select(
        "id, current_scheduled_date, status, assignment:Assignments!inner(id, name, course:Courses!inner(id, name))",
      )
      .eq("student_id", studentId),

    supabase
      .from("Clinics")
      .select("id, name, start_date, end_date, operating_days")
      .eq("workspace", session.workspace)
      .not("start_date", "is", null)
      .not("end_date", "is", null),
  ]);

  if (enrollments.error) throw enrollments.error;
  if (retakesData.error) throw retakesData.error;
  if (assignmentTasksData.error) throw assignmentTasksData.error;
  if (clinicsResult.error) throw clinicsResult.error;

  const courses = (enrollments.data || []).map((e) => e.course as unknown as CalendarCourseData);
  const retakes: CalendarRetakeData[] = (retakesData.data || []).map((r) => ({
    id: r.id,
    current_scheduled_date: r.current_scheduled_date,
    status: r.status,
    exam: r.exam as unknown as { name: string; course: { name: string } },
  }));
  const assignmentTasks: CalendarAssignmentTaskData[] = (assignmentTasksData.data || []).map((r) => ({
    id: r.id,
    current_scheduled_date: r.current_scheduled_date,
    status: r.status,
    assignment: r.assignment as unknown as { name: string; course: { name: string } },
  }));
  const clinics = (clinicsResult.data as CalendarClinicData[]) || [];

  let attendance: CalendarAttendanceRecord[] = [];
  if (clinics.length > 0) {
    const attendanceResult = await supabase
      .from("ClinicAttendance")
      .select("attendance_date, student_id, clinic_id")
      .eq("student_id", studentId)
      .in(
        "clinic_id",
        clinics.map((c) => c.id),
      );

    if (attendanceResult.error) throw attendanceResult.error;
    attendance = (attendanceResult.data as CalendarAttendanceRecord[]) || [];
  }

  const events: CalendarEvent[] = [];

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
      events.push(createRetakeEvent(retake, false));
    }
  }

  for (const task of assignmentTasks) {
    if (task.current_scheduled_date) {
      events.push(createAssignmentTaskEvent(task, false));
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

export const GET = withLogging(handleGet, {
  resource: "my-calendar",
  action: "read",
  allowedRoles: ["student"],
});
