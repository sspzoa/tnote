import { useQuery } from "@tanstack/react-query";
import type { History } from "../(atoms)/useRetakesStore";

export const useRetakeHistory = (retakeId: string | null) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["retake-history", retakeId],
    queryFn: async () => {
      if (!retakeId) return [];

      const response = await fetch(`/api/retakes/${retakeId}/history`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch history");
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
