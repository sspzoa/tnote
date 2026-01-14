import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { Student } from "@/shared/types";

export const useAllStudents = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.students.all,
    queryFn: async () => {
      const response = await fetchWithAuth("/api/students");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "학생 목록을 불러오는데 실패했습니다.");
      }

      return result.data as Student[];
    },
  });

  return {
    students: data || [],
    isLoading,
    error,
    refetch,
  };
};
