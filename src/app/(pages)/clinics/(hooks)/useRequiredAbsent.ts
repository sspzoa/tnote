import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface RequiredAbsentItem {
  id: string;
  attendance_date: string;
  note: string | null;
  student: { id: string; name: string; school: string | null };
  clinic: { id: string; name: string };
}

export interface VoluntaryAttendanceItem {
  id: string;
  attendance_date: string;
  student: { id: string; name: string };
  clinic: { id: string; name: string };
}

export const useRequiredAbsent = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.clinics.requiredAbsent,
    queryFn: async () => {
      const response = await fetchWithAuth("/api/clinics/attendance/required-absent");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "데이터를 불러오는데 실패했습니다.");
      return {
        data: (result.data || []) as RequiredAbsentItem[],
        voluntaryAttendance: (result.voluntaryAttendance || []) as VoluntaryAttendanceItem[],
      };
    },
  });

  return {
    requiredAbsent: data?.data ?? [],
    voluntaryAttendance: data?.voluntaryAttendance ?? [],
    isLoading,
    error,
    refetch,
  };
};
