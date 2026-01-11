import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAdminDelete = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (adminId: string) => {
      const response = await fetch(`/api/admins/${adminId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete admin");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });

  return {
    deleteAdmin: mutateAsync,
    isDeleting: isPending,
  };
};
