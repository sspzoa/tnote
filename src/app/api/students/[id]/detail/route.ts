import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import type {
  StudentDetailAssignment,
  StudentDetailClinicAttendance,
  StudentDetailEnrollment,
  StudentDetailExamScore,
  StudentDetailRetake,
} from "@/shared/types/api";

const handleGet = async ({ supabase, session, params }: ApiContext) => {
  const studentId = params?.id;
  if (!studentId) {
    return NextResponse.json({ error: "학생 ID가 필요합니다." }, { status: 400 });
  }

  const { data: student, error: studentError } = await supabase
    .from("Users")
    .select("id, phone_number, name, parent_phone_number, school, birth_year, created_at")
    .eq("id", studentId)
    .eq("workspace", session.workspace)
    .single();

  if (studentError || !student) {
    return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });
  }

  interface TagAssignmentRow {
    id: string;
    start_date: string;
    end_date: string | null;
    tag: { id: string; name: string; color: string; workspace: string };
  }

  const [tagResult, enrollmentResult, examScoreResult, clinicResult, assignmentResult, retakeResult] =
    await Promise.all([
      supabase
        .from("StudentTagAssignments")
        .select(`
          id,
          start_date,
          end_date,
          tag:StudentTags!inner(id, name, color, workspace)
        `)
        .eq("student_id", studentId)
        .eq("tag.workspace", session.workspace),
      supabase
        .from("CourseEnrollments")
        .select(`
          enrolled_at,
          course:Courses!inner(id, name, start_date, end_date, days_of_week)
        `)
        .eq("student_id", studentId)
        .eq("course.workspace", session.workspace),
      supabase
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
        .limit(5),
      supabase
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
        .limit(10),
      supabase
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
        .limit(10),
      supabase
        .from("RetakeAssignments")
        .select(`
          id,
          status,
          management_status,
          current_scheduled_date,
          postpone_count,
          absent_count,
          exam:Exams!inner(
            id,
            name,
            exam_number,
            course:Courses!inner(id, name, workspace)
          )
        `)
        .eq("student_id", studentId)
        .eq("exam.course.workspace", session.workspace)
        .order("current_scheduled_date", { ascending: true, nullsFirst: false })
        .limit(10),
    ]);

  if (tagResult.error) throw tagResult.error;
  if (enrollmentResult.error) throw enrollmentResult.error;
  if (examScoreResult.error) throw examScoreResult.error;
  if (clinicResult.error) throw clinicResult.error;
  if (assignmentResult.error) throw assignmentResult.error;
  if (retakeResult.error) throw retakeResult.error;

  const tags = ((tagResult.data as unknown as TagAssignmentRow[]) || []).map((assignment) => ({
    id: assignment.id,
    start_date: assignment.start_date,
    end_date: assignment.end_date,
    tag: {
      id: assignment.tag.id,
      name: assignment.tag.name,
      color: assignment.tag.color,
    },
  }));

  const courses = ((enrollmentResult.data as unknown as StudentDetailEnrollment[]) || []).map((e) => ({
    ...e.course,
    enrolled_at: e.enrolled_at,
  }));

  const examScores = (examScoreResult.data as unknown as StudentDetailExamScore[]) || [];
  const examIds = [...new Set(examScores.map((s) => s.exam.id))];

  const rankMap = new Map<string, { rank: number; total: number }>();
  if (examIds.length > 0) {
    const { data: allScoresForExams, error: rankError } = await supabase
      .from("ExamScores")
      .select("exam_id, score")
      .in("exam_id", examIds);

    if (rankError) throw rankError;

    const scoresByExam = new Map<string, number[]>();
    for (const row of allScoresForExams || []) {
      const scores = scoresByExam.get(row.exam_id) || [];
      scores.push(row.score);
      scoresByExam.set(row.exam_id, scores);
    }

    for (const scoreData of examScores) {
      const scores = scoresByExam.get(scoreData.exam.id) || [];
      const total = scores.length;
      const rank = scores.filter((s) => s > scoreData.score).length + 1;
      rankMap.set(scoreData.id, { rank, total });
    }
  }

  const scoresWithRank = examScores.map((scoreData) => {
    const rankInfo = rankMap.get(scoreData.id) || { rank: 1, total: 1 };
    return {
      id: scoreData.id,
      score: scoreData.score,
      maxScore: scoreData.exam.max_score,
      cutline: scoreData.exam.cutline,
      rank: rankInfo.rank,
      totalStudents: rankInfo.total,
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
  });

  const clinicHistory = ((clinicResult.data as unknown as StudentDetailClinicAttendance[]) || []).map((record) => ({
    id: record.id,
    attendanceDate: record.attendance_date,
    note: record.note,
    clinic: {
      id: record.clinic.id,
      name: record.clinic.name,
    },
  }));

  const assignmentHistory = ((assignmentResult.data as unknown as StudentDetailAssignment[]) || []).map((record) => ({
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

  const retakeHistory = ((retakeResult.data as unknown as StudentDetailRetake[]) || []).map((record) => ({
    id: record.id,
    status: record.status,
    managementStatus: record.management_status,
    scheduledDate: record.current_scheduled_date,
    postponeCount: record.postpone_count,
    absentCount: record.absent_count,
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
        createdAt: student.created_at,
        tags,
      },
      courses,
      examScores: scoresWithRank,
      clinicHistory,
      assignmentHistory,
      retakeHistory,
    },
  });
};

export const GET = withLogging(handleGet, {
  resource: "student-detail",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
