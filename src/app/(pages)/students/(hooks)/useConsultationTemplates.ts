"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { ConsultationTemplate } from "@/shared/types";

export const useConsultationTemplates = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.consultations.templates,
    queryFn: async () => {
      const response = await fetchWithAuth("/api/consultations/templates");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "템플릿 목록을 불러오는데 실패했습니다.");
      }

      return result.data as ConsultationTemplate[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ name, content }: { name: string; content: string }) => {
      const response = await fetchWithAuth("/api/consultations/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "템플릿 저장에 실패했습니다.");
      }

      return result.data as ConsultationTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.consultations.templates });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchWithAuth(`/api/consultations/templates/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "템플릿 삭제에 실패했습니다.");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.consultations.templates });
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
