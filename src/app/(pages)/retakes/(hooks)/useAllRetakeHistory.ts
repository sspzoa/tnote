import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface RetakeHistoryItem {
  id: string;
  action_type: string;
  previous_date: string | null;
  new_date: string | null;
  previous_status: string | null;
  new_status: string | null;
  previous_management_status: string | null;
  new_management_status: string | null;
  note: string | null;
  created_at: string;
  performed_by: { id: string; name: string } | null;
  retake: {
    id: string;
    student: { id: string; name: string };
    exam: {
      id: string;
      name: string;
      exam_number: number;
      course: { id: string; name: string };
    };
  };
}

export const useAllRetakeHistory = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.retakes.historyAll,
    queryFn: async () => {
      const res = await fetch("/api/retakes/history");
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result.data as RetakeHistoryItem[];
    },
  });

  return {
    history: data || [],
    isLoading,
    error,
    refetch,
  };
};
