import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { AssignmentTask } from "../(atoms)/useAssignmentTaskStore";

export const useAssignmentTasks = (filter: "all" | "pending" | "completed" | "absent") => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.assignmentTasks.byFilter(filter),
    queryFn: async () => {
      const url = filter !== "all" ? `/api/assignment-tasks?status=${filter}` : "/api/assignment-tasks";
      const response = await fetchWithAuth(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "과제 목록을 불러오는데 실패했습니다.");
      }

      return result.data as AssignmentTask[];
    },
  });

  return {
    tasks: data || [],
    isLoading,
    error,
    refetch,
  };
};
