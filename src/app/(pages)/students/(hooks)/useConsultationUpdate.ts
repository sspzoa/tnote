import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";

interface UpdateConsultationData {
  consultationId: string;
  studentId: string;
  consultationDate: string;
  title: string;
  content: string;
}

export const useConsultationUpdate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ consultationId, studentId, ...data }: UpdateConsultationData) => {
      const response = await fetchWithAuth(`/api/consultations/${consultationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update consultation");
      }

      return { result, studentId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["consultations", data.studentId] });
    },
  });

  return {
    updateConsultation: mutateAsync,
    isUpdating: isPending,
  };
};
