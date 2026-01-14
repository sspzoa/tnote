import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import type { CalendarEvent } from "@/shared/types";

export const useCalendarEvents = (currentDate: Date) => {
  const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["calendarEvents", start.toISOString().split("T")[0], end.toISOString().split("T")[0]],
    queryFn: async () => {
      const response = await fetchWithAuth(
        `/api/calendar?start=${start.toISOString().split("T")[0]}&end=${end.toISOString().split("T")[0]}`,
      );
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    events: data || [],
    isLoading,
    error,
    refetch,
  };
};
