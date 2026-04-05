import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import {
  type CalendarEvent,
  createAssignmentTaskEvent,
  createRetakeEvent,
  generateAdminClinicSessions,
  generateCourseSessions,
} from "@/shared/lib/utils/calendar";

import type {
  CalendarAssignmentTaskData,
  CalendarClinicData,
  CalendarCourseData,
  CalendarRetakeData,
} from "@/shared/types/api";

const fetchCourses = async (supabase: ApiContext["supabase"], workspace: string): Promise<CalendarCourseData[]> => {
  const { data: courses, error } = await supabase
    .from("Courses")
    .select("id, name, start_date, end_date, days_of_week")
    .eq("workspace", workspace)
    .not("start_date", "is", null)
    .not("end_date", "is", null);

  if (error) throw error;
  return (courses as CalendarCourseData[]) || [];
};

const fetchRetakes = async (supabase: ApiContext["supabase"], workspace: string): Promise<CalendarRetakeData[]> => {
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

const fetchAssignmentTasks = async (
  supabase: ApiContext["supabase"],
  workspace: string,
): Promise<CalendarAssignmentTaskData[]> => {
  const { data, error } = await supabase
    .from("AssignmentTasks")
    .select(`
      id, current_scheduled_date, status,
      student:Users!AssignmentTasks_student_id_fkey!inner(name, workspace),
      assignment:Assignments!inner(id, name, course:Courses!inner(id, name))
    `)
    .eq("student.workspace", workspace);

  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.id,
    current_scheduled_date: r.current_scheduled_date,
    status: r.status,
    assignment: r.assignment as unknown as { name: string; course: { name: string } },
    student: r.student as unknown as { name: string },
  }));
};

const fetchClinics = async (supabase: ApiContext["supabase"], workspace: string): Promise<CalendarClinicData[]> => {
  const { data, error } = await supabase
    .from("Clinics")
    .select("id, name, start_date, end_date, operating_days")
    .eq("workspace", workspace)
    .not("start_date", "is", null)
    .not("end_date", "is", null);

  if (error) throw error;
  return (data as CalendarClinicData[]) || [];
};

const handleGet = async ({ request, supabase, session }: ApiContext) => {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  const events: CalendarEvent[] = [];

  const [courses, retakes, assignmentTasks, clinics, requiredStudentsResult] = await Promise.all([
    fetchCourses(supabase, session.workspace),
    fetchRetakes(supabase, session.workspace),
    fetchAssignmentTasks(supabase, session.workspace),
    fetchClinics(supabase, session.workspace),
    supabase
      .from("Users")
      .select("id, name, required_clinic_weekdays, birth_year")
      .eq("workspace", session.workspace)
      .eq("role", "student")
      .not("required_clinic_weekdays", "is", null),
  ]);

  if (requiredStudentsResult.error) throw requiredStudentsResult.error;
  const requiredStudents = (requiredStudentsResult.data || []) as {
    id: string;
    name: string;
    required_clinic_weekdays: number[];
    birth_year: number | null;
  }[];

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
      events.push(createRetakeEvent(retake, true));
    }
  }

  for (const task of assignmentTasks) {
    if (task.current_scheduled_date) {
      events.push(createAssignmentTaskEvent(task, true));
    }
  }

  for (const clinic of clinics) {
    if (clinic.start_date && clinic.end_date && clinic.operating_days) {
      events.push(
        ...generateAdminClinicSessions(
          {
            id: clinic.id,
            name: clinic.name,
            start_date: clinic.start_date,
            end_date: clinic.end_date,
            operating_days: clinic.operating_days,
          },
          requiredStudents,
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

export const GET = withLogging(handleGet, { resource: "calendar", action: "read", allowedRoles: ["owner", "admin"] });
