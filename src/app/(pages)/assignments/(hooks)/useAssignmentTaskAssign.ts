import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface AssignData {
  assignmentId: string;
  studentIds: string[];
  scheduledDate: string | null;
}

export const useAssignmentTaskAssign = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: AssignData) => {
      const response = await fetchWithAuth("/api/assignment-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "과제 할당에 실패했습니다.");
      }

      return result.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignmentTasks.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignmentTasks.historyAll });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.calendar.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.home.stats });
      for (const studentId of variables.studentIds) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.detail(studentId) });
      }
    },
  });

  return {
    assignTask: mutateAsync,
    isAssigning: isPending,
  };
};
