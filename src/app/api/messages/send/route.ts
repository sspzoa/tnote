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

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const smsCheck = checkSMSService();
  if (!smsCheck.available) {
    return NextResponse.json({ error: smsCheck.error }, { status: 503 });
  }

  const senderResult = await getSenderPhoneNumber(supabase, session.workspace);
  if (!senderResult.phone) {
    return NextResponse.json({ error: senderResult.error }, { status: 400 });
  }

  const { recipientType, recipientIds, text } = await request.json();

  if (
    !validateRecipientType(recipientType) ||
    !recipientIds ||
    !Array.isArray(recipientIds) ||
    recipientIds.length === 0
  ) {
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

  const todayStr = getTodayKorean();
  const messageTemplate = text.trim();

  const recipients = buildRecipientList(students, recipientType, (student) =>
    messageTemplate.replace(/{이름}/g, student.name).replace(/{오늘날짜}/g, todayStr),
  );

  if (recipients.length === 0) {
    return NextResponse.json({ error: "발송 가능한 전화번호가 없습니다." }, { status: 400 });
  }

  const result = await sendMessagesWithHistory({
    supabase,
    workspace: session.workspace,
    userId: session.userId,
    messageType: "general",
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
  resource: "messages",
  action: "create",
  allowedRoles: ["owner", "admin"],
});
