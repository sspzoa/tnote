import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { Assignment } from "@/shared/types";

export const useAssignmentsForFilter = (courseId: string | null) => {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.assignments.forAssign(courseId ?? ""),
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/assignments?courseId=${courseId}`);
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "과제 목록을 불러오는데 실패했습니다.");
      }
      return (result.data || []) as Assignment[];
    },
    enabled: !!courseId,
  });

  return { assignments: data ?? [], isLoading };
};
