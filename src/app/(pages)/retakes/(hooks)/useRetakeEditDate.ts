import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRetakeEditDate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ retakeId, newDate }: { retakeId: string; newDate: string }) => {
      const response = await fetch(`/api/retakes/${retakeId}/edit-date`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newDate }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to edit retake date");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retakes"] });
      queryClient.invalidateQueries({ queryKey: ["retake-history"] });
    },
  });

  return {
    editDate: mutateAsync,
    isEditing: isPending,
  };
};
