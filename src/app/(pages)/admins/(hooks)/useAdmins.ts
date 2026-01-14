import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import type { Admin } from "../(atoms)/useAdminsStore";

export const useAdmins = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const response = await fetchWithAuth("/api/admins");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "관리자 목록을 불러오는데 실패했습니다.");
      }

      return result.data as Admin[];
    },
  });

  return {
    admins: data || [],
    isLoading,
    error,
    refetch,
  };
};
