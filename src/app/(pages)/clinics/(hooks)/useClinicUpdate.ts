import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateClinicData {
  clinicId: string;
  name: string;
  operatingDays: number[];
  startDate: string;
  endDate: string;
}

export const useClinicUpdate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ clinicId, ...data }: UpdateClinicData) => {
      const response = await fetch(`/api/clinics/${clinicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update clinic");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
    },
  });

  return {
    updateClinic: mutateAsync,
    isUpdating: isPending,
  };
};
