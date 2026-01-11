import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteConsultationData {
  consultationId: string;
  studentId: string;
}

export const useConsultationDelete = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ consultationId }: DeleteConsultationData) => {
      const response = await fetch(`/api/consultations/${consultationId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete consultation");
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["consultations", variables.studentId] });
    },
  });

  return {
    deleteConsultation: mutateAsync,
    isDeleting: isPending,
  };
};
