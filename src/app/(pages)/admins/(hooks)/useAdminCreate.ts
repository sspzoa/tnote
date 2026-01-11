import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateAdminData {
  name: string;
  phoneNumber: string;
  password: string;
}

export const useAdminCreate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: CreateAdminData) => {
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create admin");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });

  return {
    createAdmin: mutateAsync,
    isCreating: isPending,
  };
};
