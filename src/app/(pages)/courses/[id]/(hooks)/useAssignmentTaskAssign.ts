import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export const useAssignmentTaskAssign = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ assignmentId, studentIds }: { assignmentId: string; studentIds: string[] }) => {
      const response = await fetchWithAuth("/api/assignment-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, studentIds, scheduledDate: null }),
      });
      if (response.status === 409) {
        throw new Error("CONFLICT");
      }
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "과제 할당에 실패했습니다.");
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignments.submissions(variables.assignmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignmentTasks.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignmentTasks.historyAll });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.home.stats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.calendar.all });
    },
  });
  return { assignTasks: mutateAsync, isPending };
};
