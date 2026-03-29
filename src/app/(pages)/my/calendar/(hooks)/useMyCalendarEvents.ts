import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { CalendarEvent } from "@/shared/types";

export const useMyCalendarEvents = (currentDate: Date) => {
  const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.my.calendarEvents(startStr, endStr),
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/my/calendar?start=${startStr}&end=${endStr}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "캘린더 일정을 불러오는데 실패했습니다.");
      }

      return result.data.map((e: CalendarEvent) => ({
        ...e,
        start: new Date(e.date),
        end: new Date(e.date),
      })) as CalendarEvent[];
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    events: data || [],
    isLoading,
    error,
    refetch,
  };
};
