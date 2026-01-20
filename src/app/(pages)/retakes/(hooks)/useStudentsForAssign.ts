import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { AssignStudent } from "../(atoms)/useRetakesStore";

export const useStudentsForAssign = (courseId: string | null) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.students.forAssign(courseId || ""),
    queryFn: async () => {
      if (!courseId) return [];

      const response = await fetchWithAuth(`/api/courses/${courseId}/students`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "학생 목록을 불러오는데 실패했습니다.");
      }

      return result.data as AssignStudent[];
    },
    enabled: !!courseId,
  });

  return {
    students: data || [],
    isLoading,
    error,
  };
};
