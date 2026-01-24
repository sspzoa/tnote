import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface CreateClinicData {
  name: string;
  operatingDays: number[];
  startDate: string;
  endDate: string;
}

export const useClinicCreate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: CreateClinicData) => {
      const response = await fetchWithAuth("/api/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create clinic");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clinics.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.calendar.all });
    },
  });

  return {
    createClinic: mutateAsync,
    isCreating: isPending,
  };
};
