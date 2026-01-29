import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

interface ExamScore {
  student_id: string;
  score: number;
  student: {
    id: string;
    name: string;
    phone_number: string;
    parent_phone_number: string | null;
    school: string | null;
  };
}

interface CourseAssignment {
  student_id: string;
  status: string;
}

interface TagAssignment {
  student_id: string;
  id: string;
  tag_id: string;
  start_date: string;
  end_date: string | null;
  tag: {
    id: string;
    name: string;
    color: string;
    workspace: string;
  };
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
      student:Users(id, name, phone_number, parent_phone_number, school)
    `)
    .eq("exam_id", examId);

  if (scoresError) throw scoresError;

  const { data: assignments, error: assignmentsError } = await supabase
    .from("CourseAssignments")
    .select("student_id, status")
    .eq("exam_id", examId);

  if (assignmentsError) throw assignmentsError;

  const typedScores = (scores || []) as unknown as ExamScore[];
  const typedAssignments = (assignments || []) as unknown as CourseAssignment[];

  const studentIds = typedScores.map((s) => s.student_id);

  const { data: tagAssignments, error: tagsError } = await supabase
    .from("StudentTagAssignments")
    .select(`
      student_id,
      id,
      tag_id,
      start_date,
      end_date,
      tag:StudentTags!inner(id, name, color, workspace)
    `)
    .in("student_id", studentIds)
    .eq("tag.workspace", session.workspace);

  if (tagsError) throw tagsError;

  const typedTags = (tagAssignments || []) as unknown as TagAssignment[];
  const tagsMap = new Map<string, TagAssignment[]>();
  for (const assignment of typedTags) {
    const existing = tagsMap.get(assignment.student_id) || [];
    existing.push(assignment);
    tagsMap.set(assignment.student_id, existing);
  }

  const sortedScores = [...typedScores].sort((a, b) => b.score - a.score);
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

  const assignmentMap = new Map<string, string>();
  for (const assignment of typedAssignments) {
    assignmentMap.set(assignment.student_id, assignment.status);
  }

  const course = exam.course as unknown as { id: string; name: string; workspace: string };

  const rows = typedScores.map((scoreData) => ({
    studentId: scoreData.student.id,
    name: scoreData.student.name,
    phoneNumber: scoreData.student.phone_number,
    parentPhone: scoreData.student.parent_phone_number || "",
    school: scoreData.student.school || "",
    assignmentStatus: assignmentMap.get(scoreData.student_id) || "-",
    score: scoreData.score,
    rank: rankMap.get(scoreData.student_id) || null,
    tags: (tagsMap.get(scoreData.student_id) || []).map((t) => ({
      id: t.id,
      tag_id: t.tag_id,
      start_date: t.start_date,
      end_date: t.end_date,
      tag: t.tag,
    })),
  }));

  return NextResponse.json({
    success: true,
    data: {
      exam: {
        id: exam.id,
        name: exam.name,
        examNumber: exam.exam_number,
        maxScore: exam.max_score,
        cutline: exam.cutline,
        courseName: course.name,
      },
      rows,
      totalCount: rows.length,
    },
  });
};

export const GET = withLogging(handleGet, {
  resource: "exam-export",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
