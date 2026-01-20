"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface MessageRecipient {
  id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_type: "student" | "parent";
  is_success: boolean;
  error_message: string | null;
}

export interface MessageBatch {
  batch_id: string;
  message_type: "general" | "exam" | "retake";
  message_content: string;
  created_at: string;
  sender: {
    id: string;
    name: string;
  } | null;
  total_count: number;
  success_count: number;
  fail_count: number;
  recipients: MessageRecipient[];
}

interface MessageHistoryResponse {
  data: MessageBatch[];
}

export const useMessageHistory = (type?: "general" | "exam" | "retake", limit = 50) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.messages.history(type || "all", limit),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      if (type) {
        params.set("type", type);
      }

      const response = await fetchWithAuth(`/api/messages/history?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "발송 이력을 불러오는데 실패했습니다.");
      }

      return result as MessageHistoryResponse;
    },
  });

  return {
    history: data?.data || [],
    isLoading,
    refetch,
  };
};
