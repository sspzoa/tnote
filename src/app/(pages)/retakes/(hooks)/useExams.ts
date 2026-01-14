import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import type { Exam } from "../(atoms)/useRetakesStore";

export const useExams = (courseId: string | null) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["exams", courseId],
    queryFn: async () => {
      const url = courseId && courseId !== "all" ? `/api/exams?courseId=${courseId}` : "/api/exams";
      const response = await fetchWithAuth(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "시험 목록을 불러오는데 실패했습니다.");
      }

      return result.data as Exam[];
    },
  });

  return {
    exams: data || [],
    isLoading,
    error,
  };
};
