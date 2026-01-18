import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { isSMSServiceAvailable, sendSMS } from "@/shared/lib/services/sms";
import { getTodayKorean } from "@/shared/lib/utils/date";
import { removePhoneHyphens } from "@/shared/lib/utils/phone";

interface StudentScore {
  student_id: string;
  score: number;
  student: {
    id: string;
    name: string;
    phone_number: string;
    parent_phone_number: string | null;
  };
}

interface StudentAssignment {
  student_id: string;
  status: string;
}

interface ExamData {
  id: string;
  name: string;
  exam_number: number;
  max_score: number;
  cutline: number;
  course: {
    id: string;
    name: string;
    workspace: string;
  };
}

interface MessageInfo {
  phone: string;
  text: string;
  studentId: string;
  studentName: string;
  targetType: "student" | "parent";
}

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
  if (!isSMSServiceAvailable()) {
    return NextResponse.json({ error: "SMS 서비스가 설정되지 않았습니다." }, { status: 503 });
  }

  const { examId, recipientType, studentIds, messageTemplate } = await request.json();

  if (!examId) {
    return NextResponse.json({ error: "시험 ID가 필요합니다." }, { status: 400 });
  }

  if (!recipientType || !["student", "parent", "both"].includes(recipientType)) {
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
    .single();

  if (examError || !exam) {
    return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
  }

  const typedExam = exam as unknown as ExamData;
  if (typedExam.course.workspace !== session.workspace) {
    return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
  }

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

  const typedScores = scores as unknown as StudentScore[];
  const typedAssignments = (assignments || []) as unknown as StudentAssignment[];

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
  const messages: MessageInfo[] = [];

  for (const scoreData of typedScores) {
    const rank = rankMap.get(scoreData.student_id) || 0;
    const assignmentStatus = assignmentMap.get(scoreData.student_id) || "-";

    let text = messageTemplate || "";

    const todayStr = getTodayKorean();

    text = text
      .replace(/{이름}/g, scoreData.student.name)
      .replace(/{수업명}/g, typedExam.course.name)
      .replace(/{시험명}/g, typedExam.name)
      .replace(/{회차}/g, String(typedExam.exam_number))
      .replace(/{과제검사}/g, getAssignmentStatusText(assignmentStatus))
      .replace(/{점수}/g, String(scoreData.score))
      .replace(/{만점}/g, String(typedExam.max_score))
      .replace(/{석차}/g, String(rank))
      .replace(/{전체인원}/g, String(totalStudents))
      .replace(/{커트라인}/g, String(typedExam.cutline))
      .replace(/{오늘날짜}/g, todayStr);

    if (recipientType === "student" || recipientType === "both") {
      messages.push({
        phone: removePhoneHyphens(scoreData.student.phone_number),
        text,
        studentId: scoreData.student.id,
        studentName: scoreData.student.name,
        targetType: "student",
      });
    }

    if ((recipientType === "parent" || recipientType === "both") && scoreData.student.parent_phone_number) {
      const parentPhone = removePhoneHyphens(scoreData.student.parent_phone_number);
      if (!messages.some((m) => m.phone === parentPhone && m.text === text)) {
        messages.push({
          phone: parentPhone,
          text,
          studentId: scoreData.student.id,
          studentName: `${scoreData.student.name} 학부모`,
          targetType: "parent",
        });
      }
    }
  }

  if (messages.length === 0) {
    return NextResponse.json({ error: "발송 가능한 전화번호가 없습니다." }, { status: 400 });
  }

  const uniqueMessages = messages.filter(
    (msg, index, self) => index === self.findIndex((m) => m.phone === msg.phone && m.text === msg.text),
  );

  const batchId = crypto.randomUUID();
  const historyRecords: Array<{
    workspace: string;
    batch_id: string;
    group_id: string | null;
    message_type: string;
    recipient_type: string;
    recipient_phone: string;
    recipient_name: string;
    student_id: string;
    message_content: string;
    status_code: string | null;
    status_message: string | null;
    is_success: boolean;
    error_message: string | null;
    sent_by: string;
  }> = [];

  let successCount = 0;
  let failCount = 0;

  for (const msg of uniqueMessages) {
    const result = await sendSMS({
      to: msg.phone,
      text: msg.text,
    });

    historyRecords.push({
      workspace: session.workspace,
      batch_id: batchId,
      group_id: result.groupId || null,
      message_type: "exam",
      recipient_type: msg.targetType,
      recipient_phone: msg.phone,
      recipient_name: msg.studentName,
      student_id: msg.studentId,
      message_content: msg.text,
      status_code: result.statusCode || null,
      status_message: result.statusMessage || null,
      is_success: result.success,
      error_message: result.error || null,
      sent_by: session.userId,
    });

    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  if (historyRecords.length > 0) {
    const { error: historyError } = await supabase.from("MessageHistory").insert(historyRecords);
    if (historyError) {
      console.error("Failed to save message history:", historyError);
    }
  }

  return NextResponse.json({
    success: failCount === 0,
    data: {
      total: uniqueMessages.length,
      successCount,
      failCount,
      studentCount: typedScores.length,
    },
  });
};

export const POST = withLogging(handlePost, {
  resource: "messages-exam-results",
  action: "create",
  allowedRoles: ["owner", "admin"],
});
