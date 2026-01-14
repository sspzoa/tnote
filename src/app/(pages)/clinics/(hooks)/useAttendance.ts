import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import type { AttendanceRecord } from "../(atoms)/useClinicsStore";

export const useAttendance = (clinicId: string | null, date: string | null) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["attendance", clinicId, date],
    queryFn: async () => {
      if (!clinicId || !date) return [];

      const response = await fetchWithAuth(`/api/clinics/${clinicId}/attendance?date=${date}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "출석 정보를 불러오는데 실패했습니다.");
      }

      return result.data as AttendanceRecord[];
    },
    enabled: !!clinicId && !!date,
  });

  return {
    attendance: data || [],
    isLoading,
    error,
    refetch,
  };
};
