import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { getTodayKST } from "@/shared/lib/utils/date";
import type { CalendarEvent } from "@/shared/types";

/**
 * Today's agenda for the dashboard — reuses the calendar API with a single-day range
 * (start === end === today, Asia/Seoul). Admin-only; never fires for students.
 */
export const useTodayEvents = (enabled: boolean) => {
  const today = getTodayKST();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.calendar.events(today, today),
    queryFn: async (): Promise<CalendarEvent[]> => {
      const res = await fetchWithAuth(`/api/calendar?start=${today}&end=${today}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "오늘 일정을 불러오는데 실패했습니다.");
      return (result.data ?? []) as CalendarEvent[];
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });

  return { events: data ?? [], isLoading };
};
