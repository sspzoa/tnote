import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export const useRetakeDelete = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (retakeId: string) => {
      const response = await fetchWithAuth(`/api/retakes/${retakeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete retake");
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retakes"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retakes.historyAll });
    },
  });

  return {
    deleteRetake: mutateAsync,
    isDeleting: isPending,
  };
};
