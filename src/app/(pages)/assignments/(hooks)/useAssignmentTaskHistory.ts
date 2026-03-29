import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { RetakeHistory } from "@/shared/types";

export const useAssignmentTaskHistory = (taskId: string | null) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: taskId ? QUERY_KEYS.assignmentTasks.history(taskId) : ["assignment-task-history", null],
    queryFn: async () => {
      if (!taskId) return [];

      const response = await fetchWithAuth(`/api/assignment-tasks/${taskId}/history`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "이력을 불러오는데 실패했습니다.");
      }

      return result.data as RetakeHistory[];
    },
    enabled: !!taskId,
  });

  return {
    history: data || [],
    isLoading,
    error,
    refetch,
  };
};
