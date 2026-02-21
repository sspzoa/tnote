import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface MyRetake {
  id: string;
  status: "pending" | "completed" | "absent";
  managementStatus: string;
  scheduledDate: string | null;
  postponeCount: number;
  absentCount: number;
  exam: {
    id: string;
    name: string;
    examNumber: number;
    course: {
      id: string;
      name: string;
    };
  };
}

export const useMyRetakes = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.my.retakes,
    queryFn: async () => {
      const res = await fetchWithAuth("/api/my/retakes");
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result.data as MyRetake[];
    },
  });

  return { retakes: data || [], isLoading, error };
};
