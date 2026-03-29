import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export const useAssignmentTaskDelete = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetchWithAuth(`/api/assignment-tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "삭제에 실패했습니다.");
      }

      return true;
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
    deleteTask: mutateAsync,
    isDeleting: isPending,
  };
};
