import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { isSMSServiceAvailable, sendSMS } from "@/shared/lib/services/sms";
import { getTodayKorean } from "@/shared/lib/utils/date";
import { removePhoneHyphens } from "@/shared/lib/utils/phone";

interface RecipientInfo {
  phone: string;
  name: string;
  studentId: string;
  targetType: "student" | "parent";
}

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  if (!isSMSServiceAvailable()) {
    return NextResponse.json({ error: "SMS 서비스가 설정되지 않았습니다." }, { status: 503 });
  }

  const { recipientType, recipientIds, text, subject } = await request.json();

  if (!recipientType || !recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
    return NextResponse.json({ error: "수신자 정보가 필요합니다." }, { status: 400 });
  }

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "메시지 내용이 필요합니다." }, { status: 400 });
  }

  if (recipientIds.length > 100) {
    return NextResponse.json({ error: "한 번에 최대 100명까지 발송할 수 있습니다." }, { status: 400 });
  }

  const { data: students, error } = await supabase
    .from("Users")
    .select("id, name, phone_number, parent_phone_number")
    .eq("role", "student")
    .eq("workspace", session.workspace)
    .in("id", recipientIds);

  if (error) throw error;

  if (!students || students.length === 0) {
    return NextResponse.json({ error: "유효한 수신자가 없습니다." }, { status: 400 });
  }

  const recipients: RecipientInfo[] = [];

  for (const student of students) {
    if (recipientType === "student" || recipientType === "both") {
      const phone = removePhoneHyphens(student.phone_number);
      if (phone) {
        recipients.push({
          phone,
          name: student.name,
          studentId: student.id,
          targetType: "student",
        });
      }
    }
    if (recipientType === "parent" || recipientType === "both") {
      if (student.parent_phone_number) {
        const phone = removePhoneHyphens(student.parent_phone_number);
        if (phone && !recipients.some((r) => r.phone === phone)) {
          recipients.push({
            phone,
            name: `${student.name} 학부모`,
            studentId: student.id,
            targetType: "parent",
          });
        }
      }
    }
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: "발송 가능한 전화번호가 없습니다." }, { status: 400 });
  }

  const todayStr = getTodayKorean();
  const messageTemplate = text.trim();
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

  for (const recipient of recipients) {
    const messageContent = messageTemplate.replace(/{이름}/g, recipient.name).replace(/{오늘날짜}/g, todayStr);

    const result = await sendSMS({
      to: recipient.phone,
      text: messageContent,
      subject: subject?.trim(),
    });

    historyRecords.push({
      workspace: session.workspace,
      batch_id: batchId,
      group_id: result.groupId || null,
      message_type: "general",
      recipient_type: recipient.targetType,
      recipient_phone: recipient.phone,
      recipient_name: recipient.name,
      student_id: recipient.studentId,
      message_content: messageContent,
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

  if (successCount === 0) {
    return NextResponse.json(
      {
        error: "문자 발송에 실패했습니다.",
        total: recipients.length,
        successCount,
        failCount,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      total: recipients.length,
      successCount,
      failCount,
    },
  });
};

export const POST = withLogging(handlePost, {
  resource: "messages",
  action: "create",
  allowedRoles: ["owner", "admin"],
});
