import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export const useStudentDelete = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await fetchWithAuth(`/api/students/${studentId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete student");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.consultations.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.home.stats });
    },
  });

  return {
    deleteStudent: mutateAsync,
    isDeleting: isPending,
  };
};
