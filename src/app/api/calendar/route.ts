import { NextResponse } from "next/server";
import { getAuthenticatedClient, getSession } from "@/shared/lib/supabase/auth";

interface CalendarEvent {
  id: string;
  type: "course" | "retake" | "clinic";
  title: string;
  date: string;
  allDay: boolean;
  metadata?: any;
}

function generateClinicSessions(
  clinic: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    operating_days: number[];
  },
  attendanceRecords: Array<{ attendance_date: string; student_id: string }>,
  studentId?: string,
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const start = new Date(clinic.start_date);
  const end = new Date(clinic.end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendanceByDate = new Map<string, Set<string>>();
  for (const record of attendanceRecords) {
    if (!attendanceByDate.has(record.attendance_date)) {
      attendanceByDate.set(record.attendance_date, new Set());
    }
    attendanceByDate.get(record.attendance_date)?.add(record.student_id);
  }

  const processedDates = new Set<string>();

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (clinic.operating_days.includes(dayOfWeek)) {
      const dateStr = d.toISOString().split("T")[0];
      processedDates.add(dateStr);
      const dateObj = new Date(dateStr);

      let status: "attended" | "absent" | "scheduled" = "scheduled";
      const hasAttendance = studentId ? attendanceByDate.get(dateStr)?.has(studentId) : false;

      if (hasAttendance) {
        status = "attended";
      } else if (dateObj < today) {
        status = "absent";
      } else {
        status = "scheduled";
      }

      const statusLabel = status === "attended" ? "출석" : status === "absent" ? "결석" : "예정";

      events.push({
        id: `clinic-${clinic.id}-${dateStr}`,
        type: "clinic",
        title: `${clinic.name} (${statusLabel})`,
        date: dateStr,
        allDay: true,
        metadata: {
          clinicId: clinic.id,
          clinicName: clinic.name,
          status,
        },
      });
    }
  }

  for (const dateStr of attendanceByDate.keys()) {
    if (!processedDates.has(dateStr)) {
      const hasAttendance = studentId ? attendanceByDate.get(dateStr)?.has(studentId) : false;

      if (hasAttendance || !studentId) {
        events.push({
          id: `clinic-${clinic.id}-${dateStr}`,
          type: "clinic",
          title: `${clinic.name} (출석)`,
          date: dateStr,
          allDay: true,
          metadata: {
            clinicId: clinic.id,
            clinicName: clinic.name,
            status: "attended",
          },
        });
      }
    }
  }

  return events;
}

function generateCourseSessions(course: {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  days_of_week: number[];
}): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const start = new Date(course.start_date);
  const end = new Date(course.end_date);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (course.days_of_week.includes(dayOfWeek)) {
      events.push({
        id: `course-${course.id}-${d.toISOString().split("T")[0]}`,
        type: "course",
        title: course.name,
        date: d.toISOString().split("T")[0],
        allDay: true,
        metadata: { courseId: course.id },
      });
    }
  }

  return events;
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start"); // YYYY-MM-DD
    const endDate = searchParams.get("end"); // YYYY-MM-DD

    const { supabase } = await getAuthenticatedClient();

    const events: CalendarEvent[] = [];

    if (session.role === "student") {
      const { data: enrollments, error: enrollError } = await supabase
        .from("CourseEnrollments")
        .select(`
          course:Courses!inner(
            id,
            name,
            start_date,
            end_date,
            days_of_week
          )
        `)
        .eq("student_id", session.userId);

      if (enrollError) throw enrollError;

      enrollments?.forEach((enrollment: any) => {
        const course = enrollment.course;
        if (course.start_date && course.end_date && course.days_of_week) {
          events.push(...generateCourseSessions(course));
        }
      });

      const { data: retakes, error: retakeError } = await supabase
        .from("RetakeAssignments")
        .select(`
          id,
          current_scheduled_date,
          status,
          exam:Exams!inner(
            id,
            name,
            exam_number,
            course:Courses!inner(id, name)
          )
        `)
        .eq("student_id", session.userId);

      if (retakeError) throw retakeError;

      retakes?.forEach((retake: any) => {
        events.push({
          id: `retake-${retake.id}`,
          type: "retake",
          title: `재시험: ${retake.exam.course.name} ${retake.exam.name}`,
          date: retake.current_scheduled_date,
          allDay: true,
          metadata: {
            retakeId: retake.id,
            status: retake.status,
            examName: retake.exam.name,
            courseName: retake.exam.course.name,
          },
        });
      });

      // 3. Get all clinics with schedules (workspace 필터링)
      const { data: clinics, error: clinicsError } = await supabase
        .from("Clinics")
        .select("id, name, start_date, end_date, operating_days")
        .eq("workspace", session.workspace)
        .not("start_date", "is", null)
        .not("end_date", "is", null);

      if (clinicsError) throw clinicsError;

      const { data: allAttendance, error: attendanceError } = await supabase
        .from("ClinicAttendance")
        .select("attendance_date, student_id, clinic_id");

      if (attendanceError) throw attendanceError;

      clinics?.forEach((clinic: any) => {
        if (clinic.start_date && clinic.end_date && clinic.operating_days) {
              const clinicAttendance = allAttendance?.filter((a) => a.clinic_id === clinic.id) || [];
          events.push(...generateClinicSessions(clinic, clinicAttendance, session.userId));
        }
      });
    } else {
      const { data: courses, error: coursesError } = await supabase
        .from("Courses")
        .select("id, name, start_date, end_date, days_of_week")
        .eq("workspace", session.workspace)
        .not("start_date", "is", null)
        .not("end_date", "is", null);

      if (coursesError) throw coursesError;

      courses?.forEach((course: any) => {
        if (course.start_date && course.end_date && course.days_of_week) {
          events.push(...generateCourseSessions(course));
        }
      });

      const { data: retakes, error: retakeError } = await supabase.from("RetakeAssignments").select(`
          id,
          current_scheduled_date,
          status,
          student:Users!RetakeAssignments_student_id_fkey(name),
          exam:Exams!inner(
            id,
            name,
            exam_number,
            course:Courses!inner(id, name)
          )
        `);

      if (retakeError) throw retakeError;

      retakes?.forEach((retake: any) => {
        events.push({
          id: `retake-${retake.id}`,
          type: "retake",
          title: `재시험: ${retake.student.name} - ${retake.exam.course.name} ${retake.exam.name}`,
          date: retake.current_scheduled_date,
          allDay: true,
          metadata: {
            retakeId: retake.id,
            status: retake.status,
            studentName: retake.student.name,
            examName: retake.exam.name,
            courseName: retake.exam.course.name,
          },
        });
      });

      // 3. Get all clinics with schedules (workspace 필터링)
      const { data: clinics, error: clinicsError } = await supabase
        .from("Clinics")
        .select("id, name, start_date, end_date, operating_days")
        .eq("workspace", session.workspace)
        .not("start_date", "is", null)
        .not("end_date", "is", null);

      if (clinicsError) throw clinicsError;

      const { data: allAttendance, error: attendanceError } = await supabase
        .from("ClinicAttendance")
        .select("attendance_date, clinic_id, student_id");

      if (attendanceError) throw attendanceError;

      clinics?.forEach((clinic: any) => {
        if (clinic.start_date && clinic.end_date && clinic.operating_days) {
          const clinicAttendance = allAttendance?.filter((a) => a.clinic_id === clinic.id) || [];
          events.push(...generateClinicSessions(clinic, clinicAttendance));
        }
      });
    }

    let filteredEvents = events;
    if (startDate && endDate) {
      filteredEvents = events.filter((e) => e.date >= startDate && e.date <= endDate);
    }

    return NextResponse.json({ data: filteredEvents });
  } catch (error: any) {
    console.error("Calendar fetch error:", error);
    return NextResponse.json({ error: "캘린더 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
