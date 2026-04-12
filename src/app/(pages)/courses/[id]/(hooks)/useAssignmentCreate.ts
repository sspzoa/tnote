import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface CreateAssignmentParams {
  courseId: string;
  name: string;
}

export const useAssignmentCreate = (courseId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (params: CreateAssignmentParams) => {
      const response = await fetchWithAuth("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "과제 생성에 실패했습니다.");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignments.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignmentTasks.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignmentTasks.historyAll });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.home.stats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.calendar.all });
    },
  });

  return { createAssignment: mutateAsync, isPending };
};
