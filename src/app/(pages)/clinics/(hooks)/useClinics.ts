import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { Clinic } from "../(atoms)/useClinicsStore";

export const useClinics = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.clinics.all,
    queryFn: async () => {
      const response = await fetchWithAuth("/api/clinics");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "클리닉 목록을 불러오는데 실패했습니다.");
      }

      return result.data as Clinic[];
    },
  });

  return {
    clinics: data || [],
    isLoading,
    error,
    refetch,
  };
};
