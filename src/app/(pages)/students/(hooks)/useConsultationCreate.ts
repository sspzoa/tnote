import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateConsultationData {
  studentId: string;
  consultationDate: string;
  title: string;
  content: string;
}

export const useConsultationCreate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ studentId, ...data }: CreateConsultationData) => {
      const response = await fetch(`/api/students/${studentId}/consultations`, {
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
    },
  });

  return {
    createConsultation: mutateAsync,
    isCreating: isPending,
  };
};
