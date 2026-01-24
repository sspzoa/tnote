import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

interface ScoreData {
  score: number;
}

interface ExamWithScores {
  id: string;
  course_id: string;
  exam_number: number;
  name: string;
  max_score: number;
  cutline: number;
  created_at: string;
  course: {
    id: string;
    name: string;
    workspace: string;
  };
  scores: ScoreData[];
}

const calculateStats = (scores: ScoreData[], cutline: number) => {
  if (scores.length === 0) {
    return {
      average_score: null,
      highest_score: null,
      median_score: null,
      below_cutline_count: null,
      total_score_count: null,
    };
  }

  const scoreValues = scores.map((s) => s.score);
  const avg = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
  const highest = Math.max(...scoreValues);

  const sorted = [...scoreValues].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  const belowCutlineCount = scoreValues.filter((s) => s < cutline).length;

  return {
    average_score: Math.round(avg * 10) / 10,
    highest_score: highest,
    median_score: Math.round(median * 10) / 10,
    below_cutline_count: belowCutlineCount,
    total_score_count: scoreValues.length,
  };
};

const handleGet = async ({ request, supabase, session }: ApiContext) => {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  const includeStats = searchParams.get("include") === "stats";

  if (includeStats) {
    let query = supabase
      .from("Exams")
      .select(
        `
        *,
        course:Courses!inner(id, name, workspace),
        scores:ExamScores(score)
      `,
      )
      .eq("course.workspace", session.workspace);

    if (courseId) {
      query = query.eq("course_id", courseId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const examsWithStats = (data as ExamWithScores[]).map((exam) => {
      const { scores, ...examData } = exam;
      const stats = calculateStats(scores, exam.cutline || 4);
      return { ...examData, ...stats };
    });

    return NextResponse.json({ data: examsWithStats });
  }

  let query = supabase
    .from("Exams")
    .select(
      `
      *,
      course:Courses!inner(id, name, workspace)
    `,
    )
    .eq("course.workspace", session.workspace);

  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return NextResponse.json({ data });
};

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const { courseId, examNumber, name, maxScore, cutline } = await request.json();

  if (!courseId || !examNumber || !name) {
    return NextResponse.json({ error: "필수 정보를 입력해주세요." }, { status: 400 });
  }

  const { data: course } = await supabase
    .from("Courses")
    .select("id")
    .eq("id", courseId)
    .eq("workspace", session.workspace)
    .single();

  if (!course) {
    return NextResponse.json({ error: "코스를 찾을 수 없습니다." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("Exams")
    .insert({
      course_id: courseId,
      exam_number: examNumber,
      name,
      max_score: maxScore || 100,
      cutline: cutline || 80,
    })
    .select(
      `
      *,
      course:Courses(id, name)
    `,
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "이미 같은 회차의 시험이 존재합니다." }, { status: 409 });
    }
    throw error;
  }
  return NextResponse.json({ success: true, data });
};

export const GET = withLogging(handleGet, { resource: "exams", action: "read", allowedRoles: ["owner", "admin"] });
export const POST = withLogging(handlePost, { resource: "exams", action: "create", allowedRoles: ["owner", "admin"] });
