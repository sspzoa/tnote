import type { CalendarEvent } from "@/shared/types";

export type { CalendarEvent } from "@/shared/types";

interface CourseSessionParams {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  days_of_week: number[];
}

interface ClinicSessionParams {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  operating_days: number[];
}

interface AttendanceRecord {
  attendance_date: string;
  student_id: string;
}

interface RetakeData {
  id: string;
  current_scheduled_date: string | null;
  status: string;
  exam: { name: string; course: { name: string } };
  student?: { name: string };
}

export const generateCourseSessions = (course: CourseSessionParams): CalendarEvent[] => {
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
};

export const generateClinicSessions = (
  clinic: ClinicSessionParams,
  attendanceRecords: AttendanceRecord[],
  studentId?: string,
): CalendarEvent[] => {
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
      }

      const statusLabel = status === "attended" ? "출석" : status === "absent" ? "결석" : "예정";

      events.push({
        id: `clinic-${clinic.id}-${dateStr}`,
        type: "clinic",
        title: `${clinic.name} (${statusLabel})`,
        date: dateStr,
        allDay: true,
        metadata: { clinicId: clinic.id, clinicName: clinic.name, status },
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
          metadata: { clinicId: clinic.id, clinicName: clinic.name, status: "attended" },
        });
      }
    }
  }

  return events;
};

export const createRetakeEvent = (retake: RetakeData, includeStudentName: boolean): CalendarEvent => {
  const studentName = includeStudentName && retake.student ? `${retake.student.name} - ` : "";
  return {
    id: `retake-${retake.id}`,
    type: "retake",
    title: `재시험: ${studentName}${retake.exam.course.name} ${retake.exam.name}`,
    date: retake.current_scheduled_date as string,
    allDay: true,
    metadata: {
      retakeId: retake.id,
      status: retake.status,
      ...(retake.student && { studentName: retake.student.name }),
      examName: retake.exam.name,
      courseName: retake.exam.course.name,
    },
  };
};
