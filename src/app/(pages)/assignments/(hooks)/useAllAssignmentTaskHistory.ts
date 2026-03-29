import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface AssignmentTaskHistoryItem {
  id: string;
  action_type: string;
  previous_date: string | null;
  new_date: string | null;
  previous_status: string | null;
  new_status: string | null;
  previous_management_status: string | null;
  new_management_status: string | null;
  note: string | null;
  created_at: string;
  performed_by: { id: string; name: string } | null;
  task: {
    id: string;
    student: { id: string; name: string };
    assignment: {
      id: string;
      name: string;
      course: { id: string; name: string };
    };
  };
}

export const useAllAssignmentTaskHistory = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.assignmentTasks.historyAll,
    queryFn: async () => {
      const res = await fetchWithAuth("/api/assignment-tasks/history");
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result.data as AssignmentTaskHistoryItem[];
    },
  });

  return {
    history: data || [],
    isLoading,
    error,
    refetch,
  };
};
