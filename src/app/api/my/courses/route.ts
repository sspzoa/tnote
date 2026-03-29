import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

interface EnrollmentRow {
  enrolled_at: string;
  course: {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    days_of_week: number[] | null;
    workspace: string;
  };
}

interface ExamScoreRow {
  id: string;
  score: number;
  created_at: string;
  exam: {
    id: string;
    name: string;
    exam_number: number;
    max_score: number | null;
    cutline: number | null;
    course: { id: string; name: string; workspace: string };
  };
}

const handleGet = async ({ supabase, session }: ApiContext) => {
  const [enrollmentResult, examScoreResult] = await Promise.all([
    supabase
      .from("CourseEnrollments")
      .select(`
        enrolled_at,
        course:Courses!inner(id, name, start_date, end_date, days_of_week, workspace)
      `)
      .eq("student_id", session.userId)
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
      .eq("student_id", session.userId)
      .eq("exam.course.workspace", session.workspace),
  ]);

  if (enrollmentResult.error) throw enrollmentResult.error;
  if (examScoreResult.error) throw examScoreResult.error;

  const courses = ((enrollmentResult.data as unknown as EnrollmentRow[]) || []).map((e) => ({
    ...e.course,
    enrolledAt: e.enrolled_at,
  }));

  const myScores = (examScoreResult.data as unknown as ExamScoreRow[]) || [];
  const examIds = [...new Set(myScores.map((s) => s.exam.id))];

  const statsMap = new Map<string, { rank: number; total: number; average: number; median: number; highest: number }>();

  if (examIds.length > 0) {
    const { data: allScores, error: allScoresError } = await supabase
      .from("ExamScores")
      .select("exam_id, score")
      .in("exam_id", examIds);

    if (allScoresError) throw allScoresError;

    const scoresByExam = new Map<string, number[]>();
    for (const row of allScores || []) {
      const scores = scoresByExam.get(row.exam_id) || [];
      scores.push(row.score);
      scoresByExam.set(row.exam_id, scores);
    }

    for (const s of myScores) {
      const scores = scoresByExam.get(s.exam.id) || [];
      const total = scores.length;
      const rank = scores.filter((sc) => sc > s.score).length + 1;
      const average = total > 0 ? Math.round((scores.reduce((sum, sc) => sum + sc, 0) / total) * 10) / 10 : 0;
      const highest = total > 0 ? Math.max(...scores) : 0;
      const sorted = [...scores].sort((a, b) => a - b);
      const median =
        total > 0
          ? total % 2 === 1
            ? sorted[Math.floor(total / 2)]
            : Math.round(((sorted[total / 2 - 1] + sorted[total / 2]) / 2) * 10) / 10
          : 0;
      statsMap.set(s.id, { rank, total, average, median, highest });
    }
  }

  const examScores = myScores.map((s) => {
    const stats = statsMap.get(s.id) || { rank: 1, total: 1, average: 0, median: 0, highest: 0 };
    return {
      id: s.id,
      score: s.score,
      maxScore: s.exam.max_score,
      cutline: s.exam.cutline,
      rank: stats.rank,
      totalStudents: stats.total,
      average: stats.average,
      median: stats.median,
      highest: stats.highest,
      createdAt: s.created_at,
      exam: {
        id: s.exam.id,
        name: s.exam.name,
        examNumber: s.exam.exam_number,
        course: {
          id: s.exam.course.id,
          name: s.exam.course.name,
        },
      },
    };
  });

  return NextResponse.json({ data: { courses, examScores } });
};

export const GET = withLogging(handleGet, {
  resource: "my-courses",
  action: "read",
  allowedRoles: ["student"],
});
