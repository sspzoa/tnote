import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface AbsentData {
  note?: string | null;
}

export const useRetakeAbsent = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ retakeId, data }: { retakeId: string; data: AbsentData }) => {
      const response = await fetchWithAuth(`/api/retakes/${retakeId}/absent`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to mark as absent");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retakes.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retakes.historyAll });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.calendar.events("", "") });
    },
  });

  return {
    markAbsent: mutateAsync,
    isMarkingAbsent: isPending,
  };
};
