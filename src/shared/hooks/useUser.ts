import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  role: "owner" | "admin" | "student";
  workspace: string;
  workspaceName: string | null;
}

export const useUser = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: async () => {
      const res = await fetchWithAuth("/api/auth/me");
      const result = await res.json();
      return result.user as User | null;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    user: data ?? null,
    isLoading,
    error,
    isOwner: data?.role === "owner",
    isAdmin: data?.role === "admin" || data?.role === "owner",
    isStudent: data?.role === "student",
  };
};
