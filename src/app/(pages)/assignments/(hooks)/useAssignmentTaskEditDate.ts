import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export const useAssignmentTaskEditDate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ taskId, newDate }: { taskId: string; newDate: string }) => {
      const response = await fetchWithAuth(`/api/assignment-tasks/${taskId}/edit-date`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newDate }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "날짜 수정에 실패했습니다.");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignmentTasks.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignmentTasks.historyAll });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.calendar.all });
      queryClient.invalidateQueries({ queryKey: ["students", "detail"] });
    },
  });

  return {
    editDate: mutateAsync,
    isEditing: isPending,
  };
};
