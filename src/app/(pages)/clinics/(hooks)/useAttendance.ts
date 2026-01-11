import { useQuery } from "@tanstack/react-query";
import type { AttendanceRecord } from "../(atoms)/useClinicsStore";

export const useAttendance = (clinicId: string | null, date: string | null) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["attendance", clinicId, date],
    queryFn: async () => {
      if (!clinicId || !date) return [];

      const response = await fetch(`/api/clinics/${clinicId}/attendance?date=${date}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch attendance");
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
