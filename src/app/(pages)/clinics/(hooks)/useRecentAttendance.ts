import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface RecentAttendanceItem {
  id: string;
  attendance_date: string;
  note: string | null;
  student: { id: string; name: string; school: string | null };
  clinic: { id: string; name: string };
}

export const useRecentAttendance = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.clinics.recentAttendance,
    queryFn: async () => {
      const response = await fetchWithAuth("/api/clinics/attendance/recent");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "최근 출석 기록을 불러오는데 실패했습니다.");
      return result.data as RecentAttendanceItem[];
    },
  });

  return {
    recentAttendance: data || [],
    isLoading,
    error,
    refetch,
  };
};
