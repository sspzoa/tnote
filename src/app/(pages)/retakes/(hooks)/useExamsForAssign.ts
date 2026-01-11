import { useQuery } from "@tanstack/react-query";
import type { Exam } from "../(atoms)/useRetakesStore";

export const useExamsForAssign = (courseId: string | null) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["exams-for-assign", courseId],
    queryFn: async () => {
      if (!courseId) return [];

      const response = await fetch(`/api/exams?courseId=${courseId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch exams");
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
