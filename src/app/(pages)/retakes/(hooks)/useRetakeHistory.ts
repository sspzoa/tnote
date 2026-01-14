import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import type { History } from "../(atoms)/useRetakesStore";

export const useRetakeHistory = (retakeId: string | null) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["retake-history", retakeId],
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
