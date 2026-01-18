import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

interface StudentScore {
  student_id: string;
  score: number;
  student: {
    id: string;
    name: string;
    parent_phone_number: string | null;
  };
}

interface StudentAssignment {
  student_id: string;
  status: string;
  student: {
    id: string;
  };
}

interface ExportRow {
  studentId: string;
  name: string;
  parentPhone: string;
  assignmentStatus: string;
  score: number | null;
  rank: number | null;
}

const handleGet = async ({ supabase, session, params }: ApiContext) => {
  const examId = params?.id;

  const { data: exam, error: examError } = await supabase
    .from("Exams")
    .select(`
      id,
      name,
      exam_number,
      max_score,
      cutline,
      course:Courses!inner(id, name, workspace)
    `)
    .eq("id", examId)
    .eq("course.workspace", session.workspace)
    .single();

  if (examError || !exam) {
    return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: scores, error: scoresError } = await supabase
    .from("ExamScores")
    .select(`
      student_id,
      score,
      student:Users(id, name, parent_phone_number)
    `)
    .eq("exam_id", examId);

  if (scoresError) throw scoresError;

  const { data: assignments, error: assignmentsError } = await supabase
    .from("CourseAssignments")
    .select(`
      student_id,
      status,
      student:Users!CourseAssignments_student_id_fkey(id)
    `)
    .eq("exam_id", examId);

  if (assignmentsError) throw assignmentsError;

  const typedScores = (scores || []) as unknown as StudentScore[];
  const sortedScores = [...typedScores].sort((a, b) => b.score - a.score);

  // 동점자는 같은 석차 처리
  const rankMap = new Map<string, number>();
  let currentRank = 1;
  let prevScore: number | null = null;
  let skipCount = 0;

  for (const scoreData of sortedScores) {
    if (prevScore !== null && scoreData.score < prevScore) {
      currentRank += skipCount;
      skipCount = 1;
    } else if (prevScore === null) {
      skipCount = 1;
    } else {
      skipCount++;
    }
    rankMap.set(scoreData.student_id, currentRank);
    prevScore = scoreData.score;
  }

  const typedAssignments = (assignments || []) as unknown as StudentAssignment[];
  const assignmentMap = new Map<string, string>();
  for (const assignment of typedAssignments) {
    assignmentMap.set(assignment.student_id, assignment.status);
  }

  const exportData: ExportRow[] = sortedScores.map((scoreData) => ({
    studentId: scoreData.student_id,
    name: scoreData.student.name,
    parentPhone: scoreData.student.parent_phone_number || "",
    assignmentStatus: assignmentMap.get(scoreData.student_id) || "",
    score: scoreData.score,
    rank: rankMap.get(scoreData.student_id) || null,
  }));

  const courseData = exam.course as unknown as { id: string; name: string; workspace: string };

  return NextResponse.json({
    data: {
      exam: {
        id: exam.id,
        name: exam.name,
        examNumber: exam.exam_number,
        maxScore: exam.max_score,
        cutline: exam.cutline,
        courseName: courseData.name,
      },
      rows: exportData,
      totalCount: exportData.length,
    },
  });
};

export const GET = withLogging(handleGet, {
  resource: "exam-export",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
