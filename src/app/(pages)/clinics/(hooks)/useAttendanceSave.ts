import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SaveAttendanceData {
  clinicId: string;
  studentIds: string[];
  date: string;
}

export const useAttendanceSave = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ clinicId, studentIds, date }: SaveAttendanceData) => {
      const response = await fetch(`/api/clinics/${clinicId}/attendance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds, date }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save attendance");
      }

      return result.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendance", variables.clinicId, variables.date] });
    },
  });

  return {
    saveAttendance: mutateAsync,
    isSaving: isPending,
  };
};
