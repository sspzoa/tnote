import { useQuery } from "@tanstack/react-query";
import type { ConsultationLog } from "../(atoms)/useConsultationStore";

export const useConsultations = (studentId: string | null) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["consultations", studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const response = await fetch(`/api/students/${studentId}/consultations`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch consultations");
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
