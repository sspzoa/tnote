import { useQuery } from "@tanstack/react-query";
import type { Retake } from "../(atoms)/useRetakesStore";

export const useRetakes = (filter: "all" | "pending" | "completed" | "absent") => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["retakes", filter],
    queryFn: async () => {
      const url = filter === "all" ? "/api/retakes" : `/api/retakes?status=${filter}`;
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "재시험 목록을 불러오는데 실패했습니다.");
      }

      return result.data as Retake[];
    },
  });

  return {
    retakes: data || [],
    isLoading,
    error,
    refetch,
  };
};
