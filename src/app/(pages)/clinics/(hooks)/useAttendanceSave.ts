import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface SaveAttendanceData {
  clinicId: string;
  studentIds: string[];
  date: string;
}

export const useAttendanceSave = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ clinicId, studentIds, date }: SaveAttendanceData) => {
      const response = await fetchWithAuth(`/api/clinics/${clinicId}/attendance`, {
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clinics.attendance(variables.clinicId, variables.date) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.calendar.all });
    },
  });

  return {
    saveAttendance: mutateAsync,
    isSaving: isPending,
  };
};
