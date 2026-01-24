import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export const useClinicDelete = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (clinicId: string) => {
      const response = await fetchWithAuth(`/api/clinics/${clinicId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete clinic");
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clinics.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.calendar.all });
    },
  });

  return {
    deleteClinic: mutateAsync,
    isDeleting: isPending,
  };
};
