import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useClinicDelete = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (clinicId: string) => {
      const response = await fetch(`/api/clinics/${clinicId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete clinic");
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
    },
  });

  return {
    deleteClinic: mutateAsync,
    isDeleting: isPending,
  };
};
