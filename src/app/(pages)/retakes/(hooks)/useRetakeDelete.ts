import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRetakeDelete = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (retakeId: string) => {
      const response = await fetch(`/api/retakes/${retakeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete retake");
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retakes"] });
    },
  });

  return {
    deleteRetake: mutateAsync,
    isDeleting: isPending,
  };
};
