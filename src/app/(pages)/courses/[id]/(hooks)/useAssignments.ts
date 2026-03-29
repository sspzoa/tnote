import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface Assignment {
  id: string;
  course_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const useAssignments = (courseId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.assignments.byCourse(courseId),
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/assignments?courseId=${courseId}`);
      const result = await response.json();
      return (result.data || []) as Assignment[];
    },
    enabled: !!courseId,
  });

  return { assignments: data ?? [], isLoading, error, refetch };
};
