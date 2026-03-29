import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export const useAssignmentTaskUndo = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ taskId, historyId }: { taskId: string; historyId: string }) => {
      const response = await fetchWithAuth(`/api/assignment-tasks/${taskId}/history/${historyId}/undo`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "되돌리기에 실패했습니다.");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignmentTasks.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignmentTasks.historyAll });
      queryClient.invalidateQueries({ queryKey: ["students", "detail"] });
    },
  });

  return {
    undoAction: mutateAsync,
    isUndoing: isPending,
  };
};
