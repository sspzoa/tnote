import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { ConsultationWithDetails } from "@/shared/types";

export const useAllConsultations = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.consultations.all,
    queryFn: async () => {
      const response = await fetch("/api/consultations");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "상담 내역을 불러오는데 실패했습니다.");
      }

      return result.data as ConsultationWithDetails[];
    },
  });

  return {
    consultations: data || [],
    isLoading,
    error,
    refetch,
  };
};
