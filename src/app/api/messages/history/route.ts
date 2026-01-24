import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import type { MessageHistoryGroupedBatch, MessageHistoryQueryResult } from "@/shared/types/api";

const handleGet = async ({ request, supabase, session }: ApiContext) => {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit")) || 50;
  const messageType = searchParams.get("type");

  let query = supabase
    .from("MessageHistory")
    .select(
      `
      id,
      batch_id,
      group_id,
      message_type,
      recipient_type,
      recipient_phone,
      recipient_name,
      student_id,
      message_content,
      status_code,
      status_message,
      is_success,
      error_message,
      sent_by,
      sent_at,
      created_at,
      sender:Users!MessageHistory_sent_by_fkey(id, name)
    `,
    )
    .eq("workspace", session.workspace)
    .order("created_at", { ascending: false });

  if (messageType) {
    query = query.eq("message_type", messageType);
  }

  const { data, error } = await query;

  if (error) throw error;

  const records = (data || []) as unknown as MessageHistoryQueryResult[];

  const batchMap = new Map<string, MessageHistoryGroupedBatch>();

  for (const record of records) {
    const batchKey = record.batch_id || record.id;

    if (!batchMap.has(batchKey)) {
      batchMap.set(batchKey, {
        batch_id: batchKey,
        message_type: record.message_type,
        message_content: record.message_content,
        created_at: record.created_at,
        sender: record.sender,
        total_count: 0,
        success_count: 0,
        fail_count: 0,
        recipients: [],
      });
    }

    const batch = batchMap.get(batchKey)!;
    batch.total_count++;
    if (record.is_success) {
      batch.success_count++;
    } else {
      batch.fail_count++;
    }
    batch.recipients.push({
      id: record.id,
      recipient_name: record.recipient_name,
      recipient_phone: record.recipient_phone,
      recipient_type: record.recipient_type,
      is_success: record.is_success,
      error_message: record.error_message,
    });
  }

  const groupedData = Array.from(batchMap.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);

  return NextResponse.json({
    data: groupedData,
  });
};

export const GET = withLogging(handleGet, {
  resource: "message-history",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
