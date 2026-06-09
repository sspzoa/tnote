import { cn } from "@/shared/lib/utils/cn";
import type { CalendarEvent } from "@/shared/types";

interface Props {
  event: CalendarEvent;
  onClick: () => void;
}

// Token-driven event styling (replaces inline hex) → respects dark mode and theming automatically.
// Static literals so Tailwind's JIT picks them up. course→primary, retake→destructive, clinic→event-clinic,
// assignment→warning; completed→success, absent→neutral.
const NEUTRAL = "border-l-muted-foreground bg-muted text-muted-foreground";

const getEventClass = (event: CalendarEvent): string => {
  switch (event.type) {
    case "course":
      return "border-l-primary bg-primary/10 text-primary";
    case "retake":
      if (event.metadata?.status === "completed") return "border-l-success bg-success/10 text-success";
      if (event.metadata?.status === "absent") return NEUTRAL;
      return "border-l-destructive bg-destructive/10 text-destructive";
    case "clinic":
      if (event.metadata?.status === "attended") return "border-l-success bg-success/10 text-success";
      if (event.metadata?.status === "absent") return NEUTRAL;
      return "border-l-event-clinic bg-event-clinic/10 text-event-clinic";
    case "assignment":
      if (event.metadata?.status === "completed") return "border-l-success bg-success/10 text-success";
      return "border-l-warning bg-warning/10 text-warning";
    default:
      return NEUTRAL;
  }
};

export default function CalendarEventItem({ event, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full truncate rounded-md border-l-[3px] px-2 py-0.5 text-left text-xs transition-transform duration-150 hover:scale-[1.02]",
        getEventClass(event),
      )}>
      {event.title}
    </button>
  );
}
