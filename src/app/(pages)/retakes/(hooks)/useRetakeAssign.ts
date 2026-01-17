import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface AssignData {
  examId: string;
  studentIds: string[];
  scheduledDate: string | null;
}

export const useRetakeAssign = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: AssignData) => {
      const response = await fetchWithAuth("/api/retakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to assign retake");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retakes"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retakes.historyAll });
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.home.stats });
    },
  });

  return {
    assignRetake: mutateAsync,
    isAssigning: isPending,
  };
};
