import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface CreateConsultationData {
  studentId: string;
  title: string;
  content: string;
}

export const useConsultationCreate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ studentId, ...data }: CreateConsultationData) => {
      const response = await fetchWithAuth(`/api/students/${studentId}/consultations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create consultation");
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["consultations", variables.studentId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.consultations.all });
    },
  });

  return {
    createConsultation: mutateAsync,
    isCreating: isPending,
  };
};
