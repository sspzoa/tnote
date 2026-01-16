import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export const useRetakeEditDate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ retakeId, newDate }: { retakeId: string; newDate: string }) => {
      const response = await fetchWithAuth(`/api/retakes/${retakeId}/edit-date`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newDate }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to edit retake date");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retakes"] });
      queryClient.invalidateQueries({ queryKey: ["retake-history"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retakes.historyAll });
    },
  });

  return {
    editDate: mutateAsync,
    isEditing: isPending,
  };
};
