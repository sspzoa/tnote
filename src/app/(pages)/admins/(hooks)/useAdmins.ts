import { useQuery } from "@tanstack/react-query";
import type { Admin } from "../(atoms)/useAdminsStore";

export const useAdmins = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const response = await fetch("/api/admins");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch admins");
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
