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
      const res = await fetchWithAuth("/api/stats/home");
      const result = await res.json();

      return {
        courseCount: result.data?.courseCount || 0,
        studentCount: result.data?.studentCount || 0,
        pendingRetakeCount: result.data?.pendingRetakeCount || 0,
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
