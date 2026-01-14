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
  onExpand: () => void;
  onCollapse: () => void;
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
  onExpand,
  onCollapse,
}: Props) {
  const hasMoreEvents = events.length > MAX_VISIBLE_EVENTS;
  const visibleEvents = isExpanded ? events : events.slice(0, MAX_VISIBLE_EVENTS);

  return (
    <div
      className={`relative flex min-h-[120px] flex-col border-line-outline border-r border-b p-spacing-200 ${
        isLastColumn ? "border-r-0" : ""
      } ${isLastRow ? "border-b-0" : ""} ${!isCurrentMonth ? "bg-components-fill-standard-secondary/50" : ""} ${
        isToday ? "bg-core-accent/10" : ""
      }`}>
      <div
        className={`mb-spacing-100 text-right text-footnote ${
          !isCurrentMonth
            ? "text-content-standard-quaternary"
            : isToday
              ? "font-bold text-core-accent"
              : "text-content-standard-tertiary"
        }`}>
        {format(day, "d")}
      </div>

      <div className="flex flex-1 flex-col gap-spacing-100">
        {visibleEvents.map((event) => (
          <CalendarEventItem key={event.id} event={event} onClick={() => onEventClick(event)} />
        ))}

        {hasMoreEvents && !isExpanded && (
          <button
            type="button"
            onClick={onExpand}
            className="rounded-radius-200 px-spacing-150 py-spacing-50 text-left text-core-accent text-footnote transition-colors hover:bg-core-accent/10">
            +{events.length - MAX_VISIBLE_EVENTS}
          </button>
        )}

        {isExpanded && (
          <button
            type="button"
            onClick={onCollapse}
            className="rounded-radius-200 px-spacing-150 py-spacing-50 text-left text-content-standard-tertiary text-footnote transition-colors hover:bg-components-fill-standard-secondary">
            접기
          </button>
        )}
      </div>
    </div>
  );
}
