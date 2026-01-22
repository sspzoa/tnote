import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import {
  checkSMSService,
  getSenderPhoneNumber,
  type MessageRecipient,
  sendMessagesWithHistory,
} from "@/shared/lib/services/messageSender";
import { getTodayKorean } from "@/shared/lib/utils/date";
import { removePhoneHyphens } from "@/shared/lib/utils/phone";

interface RetakeWithDetails {
  id: string;
  current_scheduled_date: string | null;
  status: string;
  exam: {
    id: string;
    name: string;
    exam_number: number;
    course: {
      id: string;
      name: string;
      workspace?: string;
    };
  };
  student: {
    id: string;
    name: string;
    phone_number: string;
    parent_phone_number: string | null;
  };
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "미정";
  const date = new Date(dateString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
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

  const { retakeIds, recipientType, messageTemplate } = await request.json();

  if (!retakeIds || !Array.isArray(retakeIds) || retakeIds.length === 0) {
    return NextResponse.json({ error: "재시험 정보가 필요합니다." }, { status: 400 });
  }

  if (!recipientType || !["student", "parent", "both"].includes(recipientType)) {
    return NextResponse.json({ error: "올바른 수신자 유형이 아닙니다." }, { status: 400 });
  }

  const { data: retakes, error: retakesError } = await supabase
    .from("RetakeAssignments")
    .select(`
      id,
      current_scheduled_date,
      status,
      exam:Exams!inner(
        id,
        name,
        exam_number,
        course:Courses!inner(id, name, workspace)
      ),
      student:Users!RetakeAssignments_student_id_fkey(
        id,
        name,
        phone_number,
        parent_phone_number
      )
    `)
    .in("id", retakeIds);

  if (retakesError) throw retakesError;

  if (!retakes || retakes.length === 0) {
    return NextResponse.json({ error: "유효한 재시험 정보가 없습니다." }, { status: 400 });
  }

  const typedRetakes = retakes as unknown as RetakeWithDetails[];

  const validRetakes = typedRetakes.filter(
    (r) => r.exam?.course && (r.exam.course as { workspace?: string }).workspace === session.workspace,
  );

  if (validRetakes.length === 0) {
    return NextResponse.json({ error: "접근 권한이 없습니다." }, { status: 403 });
  }

  const todayStr = getTodayKorean();
  const recipients: MessageRecipient[] = [];

  for (const retake of validRetakes) {
    const text = (messageTemplate || "")
      .replace(/{이름}/g, retake.student.name)
      .replace(/{수업명}/g, retake.exam.course.name)
      .replace(/{시험명}/g, retake.exam.name)
      .replace(/{회차}/g, String(retake.exam.exam_number))
      .replace(/{예정일}/g, formatDate(retake.current_scheduled_date))
      .replace(/{상태}/g, retake.status === "pending" ? "예정" : retake.status === "completed" ? "완료" : "불참")
      .replace(/{오늘날짜}/g, todayStr);

    if (recipientType === "student" || recipientType === "both") {
      const phone = removePhoneHyphens(retake.student.phone_number);
      if (phone) {
        recipients.push({
          phone,
          name: retake.student.name,
          studentId: retake.student.id,
          targetType: "student",
          text,
        });
      }
    }

    if ((recipientType === "parent" || recipientType === "both") && retake.student.parent_phone_number) {
      const parentPhone = removePhoneHyphens(retake.student.parent_phone_number);
      if (parentPhone && !recipients.some((r) => r.phone === parentPhone && r.text === text)) {
        recipients.push({
          phone: parentPhone,
          name: `${retake.student.name} 학부모`,
          studentId: retake.student.id,
          targetType: "parent",
          text,
        });
      }
    }
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: "발송 가능한 전화번호가 없습니다." }, { status: 400 });
  }

  const result = await sendMessagesWithHistory({
    supabase,
    workspace: session.workspace,
    userId: session.userId,
    messageType: "retake",
    recipients,
    senderPhoneNumber: senderResult.phone,
  });

  if (result.successCount === 0) {
    return NextResponse.json(
      {
        error: "문자 발송에 실패했습니다.",
        total: result.total,
        successCount: result.successCount,
        failCount: result.failCount,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      total: result.total,
      successCount: result.successCount,
      failCount: result.failCount,
    },
  });
};

export const POST = withLogging(handlePost, {
  resource: "messages-retake-notice",
  action: "create",
  allowedRoles: ["owner", "admin"],
});
