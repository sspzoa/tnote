import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface UpdateExamParams {
  examId: string;
  examNumber: number;
  name: string;
  maxScore: number;
  cutline: number;
}

export const useExamUpdate = (courseId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ examId, ...params }: UpdateExamParams) => {
      const response = await fetchWithAuth(`/api/exams/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "시험 수정에 실패했습니다.");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.exams.byCourse(courseId) });
    },
  });

  return { updateExam: mutateAsync, isPending };
};
