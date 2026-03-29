import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export const useRetakeAssignFromExam = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ examId, studentIds }: { examId: string; studentIds: string[] }) => {
      const response = await fetchWithAuth("/api/retakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, studentIds }),
      });
      if (!response.ok) {
        const result = await response.json();
        if (response.status === 409) {
          throw new Error("이미 재시험이 할당된 학생이 있습니다.");
        }
        throw new Error(result.error || "재시험 할당에 실패했습니다.");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retakes.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retakes.historyAll });
    },
  });
  return { assignRetakes: mutateAsync, isPending };
};
