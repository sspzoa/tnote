import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

// GET - 시험의 모든 점수 조회
const handleGet = async ({ supabase, session, logger, params }: ApiContext) => {
  const examId = params?.id;

  // 먼저 시험이 해당 워크스페이스에 속하는지 확인
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

  // 해당 시험의 모든 점수 조회
  const { data: scores, error } = await supabase
    .from("ExamScores")
    .select(`
      id,
      score,
      student_id,
      created_at,
      updated_at,
      student:Users(id, name, phone_number, school)
    `)
    .eq("exam_id", examId);

  if (error) throw error;

  await logger.info("read", "exam-scores", `Retrieved ${scores?.length || 0} scores for exam: ${exam.name}`, {
    resourceId: examId,
  });

  return NextResponse.json({
    data: {
      exam: {
        id: exam.id,
        name: exam.name,
        exam_number: exam.exam_number,
        max_score: exam.max_score,
        cutline: exam.cutline,
      },
      scores: scores || [],
    },
  });
};

// POST - 점수 저장/업데이트 (upsert)
const handlePost = async ({ request, supabase, session, logger, params }: ApiContext) => {
  const examId = params?.id;
  const { scores } = await request.json();

  // scores는 [{ studentId: string, score: number }] 형태

  if (!Array.isArray(scores) || scores.length === 0) {
    return NextResponse.json({ error: "점수 데이터가 필요합니다." }, { status: 400 });
  }

  // 먼저 시험이 해당 워크스페이스에 속하는지 확인
  const { data: exam, error: examError } = await supabase
    .from("Exams")
    .select(`
      id,
      name,
      course:Courses!inner(id, workspace)
    `)
    .eq("id", examId)
    .eq("course.workspace", session.workspace)
    .single();

  if (examError || !exam) {
    return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
  }

  // 점수 데이터 유효성 검사
  for (const scoreData of scores) {
    if (!scoreData.studentId || typeof scoreData.score !== "number") {
      return NextResponse.json({ error: "잘못된 점수 데이터 형식입니다." }, { status: 400 });
    }
    if (scoreData.score < 0) {
      return NextResponse.json({ error: "점수는 0 이상이어야 합니다." }, { status: 400 });
    }
  }

  // upsert 수행
  const upsertData = scores.map((s: { studentId: string; score: number }) => ({
    exam_id: examId,
    student_id: s.studentId,
    score: s.score,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("ExamScores")
    .upsert(upsertData, {
      onConflict: "exam_id,student_id",
    })
    .select(`
      id,
      score,
      student_id,
      student:Users(id, name)
    `);

  if (error) throw error;

  await logger.info("update", "exam-scores", `Updated ${scores.length} scores for exam: ${exam.name}`, {
    resourceId: examId,
  });

  return NextResponse.json({ success: true, data });
};

// DELETE - 특정 학생의 점수 삭제
const handleDelete = async ({ request, supabase, session, logger, params }: ApiContext) => {
  const examId = params?.id;
  const { studentId } = await request.json();

  if (!studentId) {
    return NextResponse.json({ error: "학생 ID가 필요합니다." }, { status: 400 });
  }

  // 먼저 시험이 해당 워크스페이스에 속하는지 확인
  const { data: exam, error: examError } = await supabase
    .from("Exams")
    .select(`
      id,
      name,
      course:Courses!inner(id, workspace)
    `)
    .eq("id", examId)
    .eq("course.workspace", session.workspace)
    .single();

  if (examError || !exam) {
    return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
  }

  const { error } = await supabase.from("ExamScores").delete().eq("exam_id", examId).eq("student_id", studentId);

  if (error) throw error;

  await logger.logDelete("exam-scores", examId!, `Deleted score for student ${studentId} from exam: ${exam.name}`);

  return NextResponse.json({ success: true });
};

export const GET = withLogging(handleGet, { resource: "exam-scores", action: "read" });
export const POST = withLogging(handlePost, { resource: "exam-scores", action: "update" });
export const DELETE = withLogging(handleDelete, { resource: "exam-scores", action: "delete" });
