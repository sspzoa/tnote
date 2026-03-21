import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { StudentActivity } from "../(atoms)/useFormStore";

interface AttendeeData {
  studentId: string;
  retakeExam: boolean;
  homeworkCheck: boolean;
  qa: boolean;
  isRequired: boolean;
}

interface SaveAttendanceData {
  clinicId: string;
  attendees: AttendeeData[];
  date: string;
}

export const useAttendanceSave = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ clinicId, attendees, date }: SaveAttendanceData) => {
      const response = await fetchWithAuth(`/api/clinics/${clinicId}/attendance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendees, date }),
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

  const save = (
    clinicId: string,
    studentIds: string[],
    activities: Record<string, StudentActivity>,
    date: string,
    requiredStudentIds: Set<string>,
  ) => {
    const attendees: AttendeeData[] = studentIds.map((id) => ({
      studentId: id,
      retakeExam: activities[id]?.retakeExam ?? false,
      homeworkCheck: activities[id]?.homeworkCheck ?? false,
      qa: activities[id]?.qa ?? false,
      isRequired: requiredStudentIds.has(id),
    }));
    return mutateAsync({ clinicId, attendees, date });
  };

  return {
    saveAttendance: save,
    isSaving: isPending,
  };
};
