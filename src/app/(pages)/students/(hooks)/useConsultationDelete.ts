import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface DeleteConsultationData {
  consultationId: string;
  studentId: string;
}

export const useConsultationDelete = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ consultationId }: DeleteConsultationData) => {
      const response = await fetchWithAuth(`/api/consultations/${consultationId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete consultation");
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.consultations.byStudent(variables.studentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.consultations.all });
    },
  });

  return {
    deleteConsultation: mutateAsync,
    isDeleting: isPending,
  };
};
