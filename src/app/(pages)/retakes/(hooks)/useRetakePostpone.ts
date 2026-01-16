import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface PostponeData {
  newDate: string;
  note?: string | null;
}

export const useRetakePostpone = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ retakeId, data }: { retakeId: string; data: PostponeData }) => {
      const response = await fetchWithAuth(`/api/retakes/${retakeId}/postpone`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to postpone retake");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retakes"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retakes.historyAll });
    },
  });

  return {
    postponeRetake: mutateAsync,
    isPostponing: isPending,
  };
};
