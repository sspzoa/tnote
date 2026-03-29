import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface MyAssignmentTask {
  id: string;
  status: string;
  managementStatus: string;
  scheduledDate: string | null;
  postponeCount: number;
  assignment: {
    id: string;
    name: string;
    course: { id: string; name: string };
  };
}

interface RawAssignmentTask {
  id: string;
  status: string;
  management_status: string;
  current_scheduled_date: string | null;
  postpone_count: number;
  assignment: {
    id: string;
    name: string;
    course: { id: string; name: string; workspace: string };
  };
}

export const useMyAssignmentTasks = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.my.assignmentTasks,
    queryFn: async () => {
      const res = await fetchWithAuth("/api/my/assignment-tasks");
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return ((result.data as RawAssignmentTask[]) || []).map((t) => ({
        id: t.id,
        status: t.status,
        managementStatus: t.management_status,
        scheduledDate: t.current_scheduled_date,
        postponeCount: t.postpone_count,
        assignment: {
          id: t.assignment.id,
          name: t.assignment.name,
          course: { id: t.assignment.course.id, name: t.assignment.course.name },
        },
      })) as MyAssignmentTask[];
    },
  });

  return { tasks: data || [], isLoading, error };
};
