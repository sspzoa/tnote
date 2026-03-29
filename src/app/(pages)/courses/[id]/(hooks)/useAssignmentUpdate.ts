import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface UpdateAssignmentParams {
  assignmentId: string;
  name: string;
}

export const useAssignmentUpdate = (courseId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ assignmentId, name }: UpdateAssignmentParams) => {
      const response = await fetchWithAuth(`/api/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "과제 수정에 실패했습니다.");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignments.byCourse(courseId) });
    },
  });

  return { updateAssignment: mutateAsync, isPending };
};
