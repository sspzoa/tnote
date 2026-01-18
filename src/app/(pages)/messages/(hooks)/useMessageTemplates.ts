"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  type: "general" | "exam" | "retake";
  created_at: string;
  created_by: string;
}

export const useMessageTemplates = (type: "general" | "exam" | "retake") => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["message-templates", type],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/messages/templates?type=${type}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "템플릿 목록을 불러오는데 실패했습니다.");
      }

      return result.data as MessageTemplate[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ name, content }: { name: string; content: string }) => {
      const response = await fetchWithAuth("/api/messages/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content, type }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "템플릿 저장에 실패했습니다.");
      }

      return result.data as MessageTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates", type] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchWithAuth(`/api/messages/templates/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "템플릿 삭제에 실패했습니다.");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates", type] });
    },
  });

  const addTemplate = (name: string, content: string) => {
    return createMutation.mutateAsync({ name, content });
  };

  const deleteTemplate = (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    templates: data || [],
    isLoading,
    addTemplate,
    deleteTemplate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
