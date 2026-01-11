import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateData {
  scheduledDate: string;
  note?: string | null;
}

export const useRetakeUpdate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ retakeId, data }: { retakeId: string; data: UpdateData }) => {
      const response = await fetch(`/api/retakes/${retakeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update retake");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retakes"] });
    },
  });

  return {
    updateRetake: mutateAsync,
    isUpdating: isPending,
  };
};
