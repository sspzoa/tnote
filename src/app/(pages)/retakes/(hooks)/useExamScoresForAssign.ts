import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface ExamScore {
  student_id: string;
  score: number;
}

export const useExamScoresForAssign = (examId: string | null) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.exams.scoresForAssign(examId || ""),
    queryFn: async () => {
      if (!examId) return [];
      const response = await fetchWithAuth(`/api/exams/${examId}/scores`);
      const result = await response.json();
      if (response.ok && result.data) {
        return (result.data.scores || []) as ExamScore[];
      }
      return [];
    },
    enabled: !!examId,
  });

  return {
    examScores: data || [],
    isLoading,
    error,
  };
};
