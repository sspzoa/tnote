import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import type { RecipientType, SendMessageResponse } from "@/shared/types";

interface SendMessageData {
  recipientType: RecipientType;
  recipientIds: string[];
  text: string;
  subject?: string;
}

export const useSendMessage = () => {
  const { mutateAsync, isPending } = useMutation({
    retry: false,
    mutationFn: async (data: SendMessageData): Promise<SendMessageResponse> => {
      const response = await fetchWithAuth("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "문자 발송에 실패했습니다.");
      }

      return result;
    },
  });

  return {
    sendMessage: mutateAsync,
    isSending: isPending,
  };
};

interface SendExamResultsData {
  examId: string;
  recipientType: RecipientType;
  studentIds?: string[];
  messageTemplate?: string;
}

interface SendExamResultsResponse {
  success: boolean;
  data?: {
    total: number;
    successCount: number;
    failCount: number;
    studentCount: number;
  };
  error?: string;
}

export const useSendExamResults = () => {
  const { mutateAsync, isPending } = useMutation({
    retry: false,
    mutationFn: async (data: SendExamResultsData): Promise<SendExamResultsResponse> => {
      const response = await fetchWithAuth("/api/messages/exam-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "문자 발송에 실패했습니다.");
      }

      return result;
    },
  });

  return {
    sendExamResults: mutateAsync,
    isSending: isPending,
  };
};

interface SendRetakeNoticeData {
  retakeIds: string[];
  recipientType: RecipientType;
  messageTemplate?: string;
}

interface SendRetakeNoticeResponse {
  success: boolean;
  data?: {
    total: number;
    successCount: number;
    failCount: number;
  };
  error?: string;
}

export const useSendRetakeNotice = () => {
  const { mutateAsync, isPending } = useMutation({
    retry: false,
    mutationFn: async (data: SendRetakeNoticeData): Promise<SendRetakeNoticeResponse> => {
      const response = await fetchWithAuth("/api/messages/retake-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "문자 발송에 실패했습니다.");
      }

      return result;
    },
  });

  return {
    sendRetakeNotice: mutateAsync,
    isSending: isPending,
  };
};
