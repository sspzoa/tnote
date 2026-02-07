import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface CompleteData {
  note?: string | null;
}

export const useRetakeComplete = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ retakeId, data }: { retakeId: string; data: CompleteData }) => {
      const response = await fetchWithAuth(`/api/retakes/${retakeId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to mark as complete");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retakes.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retakes.historyAll });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.calendar.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.home.stats });
    },
  });

  return {
    completeRetake: mutateAsync,
    isCompleting: isPending,
  };
};
