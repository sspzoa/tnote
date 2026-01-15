import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface HomeStats {
  courseCount: number;
  studentCount: number;
  pendingRetakeCount: number;
}

export const useHomeStats = (enabled: boolean) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.home.stats,
    queryFn: async (): Promise<HomeStats> => {
      const [coursesRes, studentsRes, retakesRes] = await Promise.all([
        fetchWithAuth("/api/courses"),
        fetchWithAuth("/api/students"),
        fetchWithAuth("/api/retakes?status=pending"),
      ]);

      const [coursesData, studentsData, retakesData] = await Promise.all([
        coursesRes.json(),
        studentsRes.json(),
        retakesRes.json(),
      ]);

      return {
        courseCount: coursesData.data?.length || 0,
        studentCount: studentsData.data?.length || 0,
        pendingRetakeCount: retakesData.data?.length || 0,
      };
    },
    enabled,
    staleTime: 1000 * 60,
  });

  return {
    stats: data ?? null,
    isLoading,
    error,
  };
};
