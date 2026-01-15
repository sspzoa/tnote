import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

interface ExamData {
  id: string;
  name: string;
  exam_number: number;
  max_score: number | null;
  cutline: number | null;
  course: {
    id: string;
    name: string;
    workspace: string;
  };
}

interface ExamScoreData {
  id: string;
  score: number;
  created_at: string;
  exam: ExamData;
}

interface ClinicData {
  id: string;
  name: string;
  workspace: string;
}

interface ClinicAttendanceData {
  id: string;
  attendance_date: string;
  note: string | null;
  clinic: ClinicData;
}

interface CourseData {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  days_of_week: number[] | null;
}

interface EnrollmentData {
  enrolled_at: string;
  course: CourseData;
}

interface AssignmentData {
  id: string;
  status: string;
  note: string | null;
  exam: {
    id: string;
    name: string;
    exam_number: number;
    course: {
      id: string;
      name: string;
      workspace: string;
    };
  };
}

const handleGet = async ({ supabase, session, params }: ApiContext) => {
  const studentId = params?.id;
  if (!studentId) {
    return NextResponse.json({ error: "학생 ID가 필요합니다." }, { status: 400 });
  }

  const { data: student, error: studentError } = await supabase
    .from("Users")
    .select("id, phone_number, name, parent_phone_number, school, birth_year, is_favorite, created_at")
    .eq("id", studentId)
    .eq("workspace", session.workspace)
    .single();

  if (studentError || !student) {
    return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: enrollments, error: enrollmentError } = await supabase
    .from("CourseEnrollments")
    .select(`
      enrolled_at,
      course:Courses!inner(id, name, start_date, end_date, days_of_week)
    `)
    .eq("student_id", studentId)
    .eq("course.workspace", session.workspace);

  if (enrollmentError) throw enrollmentError;

  const courses = ((enrollments as unknown as EnrollmentData[]) || []).map((e) => ({
    ...e.course,
    enrolled_at: e.enrolled_at,
  }));

  const { data: examScores, error: scoresError } = await supabase
    .from("ExamScores")
    .select(`
      id,
      score,
      created_at,
      exam:Exams!inner(
        id,
        name,
        exam_number,
        max_score,
        cutline,
        course:Courses!inner(id, name, workspace)
      )
    `)
    .eq("student_id", studentId)
    .eq("exam.course.workspace", session.workspace)
    .order("created_at", { ascending: false })
    .limit(5);

  if (scoresError) throw scoresError;

  const scoresWithRank = await Promise.all(
    ((examScores as unknown as ExamScoreData[]) || []).map(async (scoreData) => {
      const examId = scoreData.exam.id;
      const studentScore = scoreData.score;

      const { data: allScores, error: rankError } = await supabase
        .from("ExamScores")
        .select("score")
        .eq("exam_id", examId);

      if (rankError) throw rankError;

      const totalStudents = allScores?.length || 0;
      const rank = (allScores?.filter((s) => s.score > studentScore).length || 0) + 1;

      return {
        id: scoreData.id,
        score: scoreData.score,
        maxScore: scoreData.exam.max_score,
        cutline: scoreData.exam.cutline,
        rank,
        totalStudents,
        createdAt: scoreData.created_at,
        exam: {
          id: scoreData.exam.id,
          name: scoreData.exam.name,
          examNumber: scoreData.exam.exam_number,
          course: {
            id: scoreData.exam.course.id,
            name: scoreData.exam.course.name,
          },
        },
      };
    }),
  );

  const { data: clinicAttendance, error: attendanceError } = await supabase
    .from("ClinicAttendance")
    .select(`
      id,
      attendance_date,
      note,
      clinic:Clinics!inner(id, name, workspace)
    `)
    .eq("student_id", studentId)
    .eq("clinic.workspace", session.workspace)
    .order("attendance_date", { ascending: false })
    .limit(10);

  if (attendanceError) throw attendanceError;

  const clinicHistory = ((clinicAttendance as unknown as ClinicAttendanceData[]) || []).map((record) => ({
    id: record.id,
    attendanceDate: record.attendance_date,
    note: record.note,
    clinic: {
      id: record.clinic.id,
      name: record.clinic.name,
    },
  }));

  const { data: assignments, error: assignmentsError } = await supabase
    .from("CourseAssignments")
    .select(`
      id,
      status,
      note,
      updated_at,
      exam:Exams!inner(
        id,
        name,
        exam_number,
        course:Courses!inner(id, name, workspace)
      )
    `)
    .eq("student_id", studentId)
    .eq("exam.course.workspace", session.workspace)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (assignmentsError) throw assignmentsError;

  const assignmentHistory = ((assignments as unknown as AssignmentData[]) || []).map((record) => ({
    id: record.id,
    status: record.status,
    note: record.note,
    exam: {
      id: record.exam.id,
      name: record.exam.name,
      examNumber: record.exam.exam_number,
      course: {
        id: record.exam.course.id,
        name: record.exam.course.name,
      },
    },
  }));
  return NextResponse.json({
    data: {
      student: {
        id: student.id,
        phoneNumber: student.phone_number,
        name: student.name,
        parentPhoneNumber: student.parent_phone_number,
        school: student.school,
        birthYear: student.birth_year,
        isFavorite: student.is_favorite,
        createdAt: student.created_at,
      },
      courses,
      examScores: scoresWithRank,
      clinicHistory,
      assignmentHistory,
    },
  });
};

export const GET = withLogging(handleGet, {
  resource: "student-detail",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
