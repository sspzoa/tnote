import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { CalendarEvent } from "@/shared/types";
import CalendarDayCell from "./CalendarDayCell";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  expandedDay: Date | null;
  onEventClick: (event: CalendarEvent) => void;
  onExpandDay: (day: Date | null) => void;
}

export default function CalendarGrid({ currentDate, events, expandedDay, onEventClick, onExpandDay }: Props) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => events.filter((event) => isSameDay(new Date(event.date), day));

  return (
    <div className="overflow-hidden rounded-radius-300 border border-line-outline">
      <div className="grid grid-cols-7 border-line-outline border-b bg-components-fill-standard-secondary">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="border-line-outline border-r px-spacing-200 py-spacing-300 text-center font-semibold text-content-standard-secondary text-label last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
          const isExpanded = expandedDay ? isSameDay(day, expandedDay) : false;
          const isLastColumn = idx % 7 === 6;
          const isLastRow = idx >= calendarDays.length - 7;

          return (
            <CalendarDayCell
              key={day.toISOString()}
              day={day}
              events={dayEvents}
              isCurrentMonth={isCurrentMonth}
              isToday={isTodayDate}
              isExpanded={isExpanded}
              isLastColumn={isLastColumn}
              isLastRow={isLastRow}
              onEventClick={onEventClick}
              onExpand={() => onExpandDay(day)}
              onCollapse={() => onExpandDay(null)}
            />
          );
        })}
      </div>
    </div>
  );
}
