import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { toAssignmentSubmissionStatus } from "@/shared/lib/utils/studentAssignments";

export interface MyAssignment {
  id: string;
  status: string;
  updatedAt: string;
  assignment: {
    id: string;
    name: string;
    course: {
      id: string;
      name: string;
    };
  };
}

interface RawAssignment {
  id: string;
  status: string;
  updated_at: string;
  assignment: {
    id: string;
    name: string;
    course: { id: string; name: string; workspace: string };
  };
}

export const useMyAssignments = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.my.assignments,
    queryFn: async () => {
      const res = await fetchWithAuth("/api/my/assignments");
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return ((result.data as RawAssignment[]) || []).map((a) => ({
        id: a.id,
        status: toAssignmentSubmissionStatus(a.status),
        updatedAt: a.updated_at,
        assignment: {
          id: a.assignment.id,
          name: a.assignment.name,
          course: { id: a.assignment.course.id, name: a.assignment.course.name },
        },
      })) as MyAssignment[];
    },
  });

  return { assignments: data || [], isLoading, error };
};
