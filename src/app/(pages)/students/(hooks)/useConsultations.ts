import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { ConsultationLog } from "../(atoms)/useConsultationStore";

export const useConsultations = (studentId: string | null) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.consultations.byStudent(studentId || ""),
    queryFn: async () => {
      if (!studentId) return [];

      const response = await fetchWithAuth(`/api/students/${studentId}/consultations`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "상담일지를 불러오는데 실패했습니다.");
      }

      return result.data as ConsultationLog[];
    },
    enabled: !!studentId,
  });

  return {
    consultations: data || [],
    isLoading,
    error,
    refetch,
  };
};
