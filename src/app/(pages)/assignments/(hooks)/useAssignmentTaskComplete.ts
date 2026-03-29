import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface CompleteData {
  note?: string | null;
}

export const useAssignmentTaskComplete = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: CompleteData }) => {
      const response = await fetchWithAuth(`/api/assignment-tasks/${taskId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "완료 처리에 실패했습니다.");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignmentTasks.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignmentTasks.historyAll });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.calendar.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.home.stats });
      queryClient.invalidateQueries({ queryKey: ["students", "detail"] });
    },
  });

  return {
    completeTask: mutateAsync,
    isCompleting: isPending,
  };
};
