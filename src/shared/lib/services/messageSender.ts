import type { SupabaseClient } from "@supabase/supabase-js";
import { isSMSServiceAvailable, sendSMS } from "./sms";

export interface MessageRecipient {
  phone: string;
  name: string;
  studentId: string;
  targetType: "student" | "parent";
  text: string;
}

export interface MessageHistoryRecord {
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
}

export interface SendMessagesParams {
  supabase: SupabaseClient;
  workspace: string;
  userId: string;
  messageType: "general" | "exam" | "retake";
  recipients: MessageRecipient[];
  senderPhoneNumber: string;
}

export interface SendMessagesResult {
  success: boolean;
  total: number;
  successCount: number;
  failCount: number;
  batchId: string;
}

export const getSenderPhoneNumber = async (
  supabase: SupabaseClient,
  workspace: string,
): Promise<{ phone: string | null; error: string | null }> => {
  const { data, error } = await supabase.from("Workspaces").select("sender_phone_number").eq("id", workspace).single();

  if (error || !data?.sender_phone_number) {
    return {
      phone: null,
      error: "발신번호가 설정되지 않았습니다. 문자 관리에서 발신번호를 먼저 설정해주세요.",
    };
  }

  return { phone: data.sender_phone_number, error: null };
};

export const checkSMSService = (): { available: boolean; error: string | null } => {
  if (!isSMSServiceAvailable()) {
    return { available: false, error: "SMS 서비스가 설정되지 않았습니다." };
  }
  return { available: true, error: null };
};

export const sendMessagesWithHistory = async ({
  supabase,
  workspace,
  userId,
  messageType,
  recipients,
  senderPhoneNumber,
}: SendMessagesParams): Promise<SendMessagesResult> => {
  const batchId = crypto.randomUUID();
  const historyRecords: MessageHistoryRecord[] = [];

  let successCount = 0;
  let failCount = 0;

  for (const recipient of recipients) {
    const result = await sendSMS({
      to: recipient.phone,
      text: recipient.text,
      from: senderPhoneNumber,
    });

    historyRecords.push({
      workspace,
      batch_id: batchId,
      group_id: result.groupId || null,
      message_type: messageType,
      recipient_type: recipient.targetType,
      recipient_phone: recipient.phone,
      recipient_name: recipient.name,
      student_id: recipient.studentId,
      message_content: recipient.text,
      status_code: result.statusCode || null,
      status_message: result.statusMessage || null,
      is_success: result.success,
      error_message: result.error || null,
      sent_by: userId,
    });

    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  if (historyRecords.length > 0) {
    await supabase.from("MessageHistory").insert(historyRecords);
  }

  return {
    success: failCount === 0,
    total: recipients.length,
    successCount,
    failCount,
    batchId,
  };
};
