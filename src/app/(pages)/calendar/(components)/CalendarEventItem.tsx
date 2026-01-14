import type { CalendarEvent } from "@/shared/types";

interface Props {
  event: CalendarEvent;
  onClick: () => void;
}

const getEventStyle = (event: CalendarEvent) => {
  switch (event.type) {
    case "course":
      return { color: "#2563EB", backgroundColor: "rgba(59, 130, 246, 0.12)" };
    case "retake":
      if (event.metadata?.status === "completed") {
        return { color: "#059669", backgroundColor: "rgba(16, 185, 129, 0.12)" };
      }
      if (event.metadata?.status === "absent") {
        return { color: "#4B5563", backgroundColor: "rgba(107, 114, 128, 0.12)" };
      }
      return { color: "#DC2626", backgroundColor: "rgba(239, 68, 68, 0.12)" };
    case "clinic":
      if (event.metadata?.status === "attended") {
        return { color: "#059669", backgroundColor: "rgba(16, 185, 129, 0.12)" };
      }
      if (event.metadata?.status === "absent") {
        return { color: "#4B5563", backgroundColor: "rgba(107, 114, 128, 0.12)" };
      }
      return { color: "#7C3AED", backgroundColor: "rgba(139, 92, 246, 0.12)" };
    default:
      return { color: "#6B7280", backgroundColor: "rgba(107, 114, 128, 0.12)" };
  }
};

export default function CalendarEventItem({ event, onClick }: Props) {
  const style = getEventStyle(event);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full truncate rounded-radius-200 px-spacing-150 py-spacing-50 text-left text-footnote transition-transform hover:scale-[1.02]"
      style={{
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderLeft: `2px solid ${style.color}`,
      }}>
      {event.title}
    </button>
  );
}
