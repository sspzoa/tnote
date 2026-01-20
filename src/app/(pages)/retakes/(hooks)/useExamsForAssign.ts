import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { Exam } from "../(atoms)/useRetakesStore";

export const useExamsForAssign = (courseId: string | null) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.exams.forAssign(courseId || ""),
    queryFn: async () => {
      if (!courseId) return [];

      const response = await fetchWithAuth(`/api/exams?courseId=${courseId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "시험 목록을 불러오는데 실패했습니다.");
      }

      return result.data as Exam[];
    },
    enabled: !!courseId,
  });

  return {
    exams: data || [],
    isLoading,
    error,
  };
};
