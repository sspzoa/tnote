import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AssignData {
  examId: string;
  studentIds: string[];
  scheduledDate: string;
}

export const useRetakeAssign = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: AssignData) => {
      const response = await fetch("/api/retakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to assign retake");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retakes"] });
    },
  });

  return {
    assignRetake: mutateAsync,
    isAssigning: isPending,
  };
};
