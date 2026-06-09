import { format } from "date-fns";
import type { CalendarEvent } from "@/shared/types";
import CalendarEventItem from "./CalendarEventItem";

interface Props {
  day: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isExpanded: boolean;
  isLastColumn: boolean;
  isLastRow: boolean;
  onEventClick: (event: CalendarEvent) => void;
  onToggleExpand: () => void;
}

const MAX_VISIBLE_EVENTS = 3;

export default function CalendarDayCell({
  day,
  events,
  isCurrentMonth,
  isToday,
  isExpanded,
  isLastColumn,
  isLastRow,
  onEventClick,
  onToggleExpand,
}: Props) {
  const hasMoreEvents = events.length > MAX_VISIBLE_EVENTS;
  const visibleEvents = isExpanded ? events : events.slice(0, MAX_VISIBLE_EVENTS);

  return (
    <div
      className={`relative flex min-h-[120px] flex-col gap-1 border-border border-r border-b p-2 transition-colors duration-150 hover:bg-muted/50 ${
        isLastColumn ? "border-r-0" : ""
      } ${isLastRow ? "border-b-0" : ""} ${!isCurrentMonth ? "bg-muted/50" : ""} ${isToday ? "bg-accent" : ""}`}>
      <div
        className={`text-right text-xs ${
          !isCurrentMonth
            ? "text-muted-foreground/60"
            : isToday
              ? "font-semibold text-primary"
              : "text-muted-foreground"
        }`}>
        {isToday ? (
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {format(day, "d")}
          </span>
        ) : (
          format(day, "d")
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        {visibleEvents.map((event) => (
          <CalendarEventItem key={event.id} event={event} onClick={() => onEventClick(event)} />
        ))}

        {hasMoreEvents && (
          <button
            type="button"
            onClick={onToggleExpand}
            className={`rounded-sm px-1.5 py-0.5 text-left text-xs transition-all duration-150 ${
              isExpanded ? "text-muted-foreground hover:bg-muted hover:text-foreground" : "text-primary hover:bg-accent"
            }`}>
            {isExpanded ? "접기" : `+${events.length - MAX_VISIBLE_EVENTS}`}
          </button>
        )}
      </div>
    </div>
  );
}
