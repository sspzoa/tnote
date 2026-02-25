import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { ConsultationWithDetails } from "@/shared/types";

export const useAllConsultations = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.consultations.all,
    queryFn: async () => {
      const response = await fetchWithAuth("/api/consultations");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "상담 내역을 불러오는데 실패했습니다.");
      }

      return result.data as ConsultationWithDetails[];
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (consultationId: string) => {
      const response = await fetchWithAuth(`/api/consultations/${consultationId}/read`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("읽음 처리에 실패했습니다.");
      }
    },
    onMutate: async (consultationId: string) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.consultations.all });

      const previous = queryClient.getQueryData<ConsultationWithDetails[]>(QUERY_KEYS.consultations.all);

      queryClient.setQueryData<ConsultationWithDetails[]>(QUERY_KEYS.consultations.all, (old) =>
        (old || []).map((c) => (c.id === consultationId ? { ...c, is_read: true } : c)),
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.consultations.all, context.previous);
      }
    },
  });

  const unreadCount = (data || []).filter((c) => !c.is_read).length;

  return {
    consultations: data || [],
    isLoading,
    error,
    refetch,
    markAsRead: markAsRead.mutate,
    unreadCount,
  };
};
