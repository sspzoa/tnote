import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { History } from "../(atoms)/useRetakesStore";

export const useRetakeHistory = (retakeId: string | null) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: retakeId ? QUERY_KEYS.retakes.history(retakeId) : ["retake-history", null],
    queryFn: async () => {
      if (!retakeId) return [];

      const response = await fetchWithAuth(`/api/retakes/${retakeId}/history`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "히스토리를 불러오는데 실패했습니다.");
      }

      return result.data as History[];
    },
    enabled: !!retakeId,
  });

  return {
    history: data || [],
    isLoading,
    error,
    refetch,
  };
};
