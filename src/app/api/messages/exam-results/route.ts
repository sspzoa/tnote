import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import {
  buildRecipientList,
  checkSMSService,
  getSenderPhoneNumber,
  sendMessagesWithHistory,
  validateRecipientType,
} from "@/shared/lib/services/messageSender";
import { getTodayKorean } from "@/shared/lib/utils/date";

import type { ExamAssignment, ExamScoreWithStudent, ExamWithCourseWorkspace } from "@/shared/types/api";

const getAssignmentStatusText = (status: string): string => {
  switch (status) {
    case "완료":
      return "완료";
    case "미흡":
      return "미흡";
    case "미제출":
      return "미제출";
    default:
      return "-";
  }
};

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const smsCheck = checkSMSService();
  if (!smsCheck.available) {
    return NextResponse.json({ error: smsCheck.error }, { status: 503 });
  }

  const senderResult = await getSenderPhoneNumber(supabase, session.workspace);
  if (!senderResult.phone) {
    return NextResponse.json({ error: senderResult.error }, { status: 400 });
  }

  const { examId, recipientType, studentIds, messageTemplate } = await request.json();

  if (!examId) {
    return NextResponse.json({ error: "시험 ID가 필요합니다." }, { status: 400 });
  }

  if (!validateRecipientType(recipientType)) {
    return NextResponse.json({ error: "올바른 수신자 유형이 아닙니다." }, { status: 400 });
  }

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

  const typedExam = exam as unknown as ExamWithCourseWorkspace;

  let scoresQuery = supabase
    .from("ExamScores")
    .select(`
      student_id,
      score,
      student:Users(id, name, phone_number, parent_phone_number)
    `)
    .eq("exam_id", examId);

  if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
    scoresQuery = scoresQuery.in("student_id", studentIds);
  }

  const { data: scores, error: scoresError } = await scoresQuery;

  if (scoresError) throw scoresError;

  if (!scores || scores.length === 0) {
    return NextResponse.json({ error: "발송할 점수 데이터가 없습니다." }, { status: 400 });
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("CourseAssignments")
    .select("student_id, status")
    .eq("exam_id", examId);

  if (assignmentsError) throw assignmentsError;

  const typedScores = scores as unknown as ExamScoreWithStudent[];
  const typedAssignments = (assignments || []) as unknown as ExamAssignment[];

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

  const totalStudents = sortedScores.length;
  const todayStr = getTodayKorean();

  const studentsForRecipients = typedScores.map((scoreData) => ({
    id: scoreData.student.id,
    name: scoreData.student.name,
    phone_number: scoreData.student.phone_number,
    parent_phone_number: scoreData.student.parent_phone_number,
    _score: scoreData.score,
    _rank: rankMap.get(scoreData.student_id) || 0,
    _assignment: assignmentMap.get(scoreData.student_id) || "-",
  }));

  const recipients = buildRecipientList(studentsForRecipients, recipientType, (student) => {
    const s = student as (typeof studentsForRecipients)[number];
    return (messageTemplate || "")
      .replace(/{이름}/g, s.name)
      .replace(/{수업명}/g, typedExam.course.name)
      .replace(/{시험명}/g, typedExam.name)
      .replace(/{회차}/g, String(typedExam.exam_number))
      .replace(/{과제검사}/g, getAssignmentStatusText(s._assignment))
      .replace(/{점수}/g, String(s._score))
      .replace(/{만점}/g, String(typedExam.max_score))
      .replace(/{석차}/g, String(s._rank))
      .replace(/{전체인원}/g, String(totalStudents))
      .replace(/{커트라인}/g, String(typedExam.cutline))
      .replace(/{오늘날짜}/g, todayStr);
  });

  if (recipients.length === 0) {
    return NextResponse.json({ error: "발송 가능한 전화번호가 없습니다." }, { status: 400 });
  }

  const result = await sendMessagesWithHistory({
    supabase,
    workspace: session.workspace,
    userId: session.userId,
    messageType: "exam",
    recipients,
    senderPhoneNumber: senderResult.phone,
  });

  return NextResponse.json({
    success: result.failCount === 0,
    data: {
      total: result.total,
      successCount: result.successCount,
      failCount: result.failCount,
      studentCount: typedScores.length,
    },
  });
};

export const POST = withLogging(handlePost, {
  resource: "messages-exam-results",
  action: "create",
  allowedRoles: ["owner", "admin"],
});
