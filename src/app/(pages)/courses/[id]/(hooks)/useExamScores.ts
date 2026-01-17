import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface Score {
  student_id: string;
  score: number;
}

export const useExamScores = (examId: string, enabled: boolean) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.exams.scores(examId),
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/exams/${examId}/scores`);
      const result = await res.json();
      return (result.data?.scores || []) as Score[];
    },
    enabled: enabled && !!examId,
  });

  return { scores: data ?? [], isLoading, error };
};

interface SaveScoresParams {
  examId: string;
  scores: { studentId: string; score: number }[];
  toDelete: string[];
}

export const useExamScoresSave = (courseId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ examId, scores, toDelete }: SaveScoresParams) => {
      for (const studentId of toDelete) {
        await fetchWithAuth(`/api/exams/${examId}/scores`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId }),
        });
      }

      if (scores.length > 0) {
        const response = await fetchWithAuth(`/api/exams/${examId}/scores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scores }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "점수 저장에 실패했습니다.");
        }
      }
    },
    onSuccess: (_, { examId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.exams.scores(examId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.exams.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.exams.export(examId) });
    },
  });

  return { saveScores: mutateAsync, isPending };
};
