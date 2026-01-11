import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AbsentData {
  note?: string | null;
}

export const useRetakeAbsent = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ retakeId, data }: { retakeId: string; data: AbsentData }) => {
      const response = await fetch(`/api/retakes/${retakeId}/absent`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to mark as absent");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retakes"] });
    },
  });

  return {
    markAbsent: mutateAsync,
    isMarkingAbsent: isPending,
  };
};
