import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";

export const useRetakeUndo = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ retakeId, historyId }: { retakeId: string; historyId: string }) => {
      const response = await fetchWithAuth(`/api/retakes/${retakeId}/history/${historyId}/undo`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to undo action");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retakes"] });
      queryClient.invalidateQueries({ queryKey: ["retake-history"] });
    },
  });

  return {
    undoAction: mutateAsync,
    isUndoing: isPending,
  };
};
