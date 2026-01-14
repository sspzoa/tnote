import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { CalendarEvent } from "@/shared/types";

interface Props {
  event: CalendarEvent;
  onClose: () => void;
}

const getEventColor = (event: CalendarEvent) => {
  if (event.type === "course") return "#3B82F6";
  if (event.type === "retake") return "#EF4444";
  if (event.metadata?.status === "attended") return "#10B981";
  if (event.metadata?.status === "absent") return "#6B7280";
  return "#8B5CF6";
};

const getEventTypeLabel = (type: CalendarEvent["type"]) => {
  switch (type) {
    case "course":
      return "수업";
    case "retake":
      return "재시험";
    case "clinic":
      return "클리닉";
  }
};

const getClinicStatusLabel = (status: string) => {
  switch (status) {
    case "attended":
      return "출석";
    case "absent":
      return "결석";
    default:
      return "예정";
  }
};

const getRetakeStatusLabel = (status: string) => {
  switch (status) {
    case "completed":
      return "완료";
    case "absent":
      return "결석";
    case "postponed":
      return "연기";
    default:
      return "예정";
  }
};

const getClinicStatusStyle = (status: string) => {
  switch (status) {
    case "attended":
      return "bg-solid-translucent-green text-solid-green";
    case "absent":
      return "bg-solid-translucent-red text-solid-red";
    default:
      return "bg-solid-translucent-purple text-solid-purple";
  }
};

const getRetakeStatusStyle = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-solid-translucent-green text-solid-green";
    case "absent":
      return "bg-solid-translucent-red text-solid-red";
    case "postponed":
      return "bg-solid-translucent-yellow text-solid-yellow";
    default:
      return "bg-solid-translucent-blue text-solid-blue";
  }
};

export default function EventDetailModal({ event, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
      onClick={onClose}>
      <div
        className="w-full max-w-md rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
        onClick={(e) => e.stopPropagation()}>
        <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
          <h2 className="font-bold text-content-standard-primary text-heading">일정 상세</h2>
        </div>

        <div className="space-y-spacing-400 p-spacing-600">
          <div>
            <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-label">
              타입
            </label>
            <div className="flex items-center gap-spacing-200">
              <div className="h-4 w-4 rounded-radius-100" style={{ backgroundColor: getEventColor(event) }} />
              <span className="text-body text-content-standard-primary">{getEventTypeLabel(event.type)}</span>
            </div>
          </div>

          <div>
            <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-label">
              제목
            </label>
            <p className="text-body text-content-standard-primary">{event.title}</p>
          </div>

          <div>
            <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-label">
              날짜
            </label>
            <p className="text-body text-content-standard-primary">
              {format(new Date(event.date), "yyyy년 M월 d일 (EEE)", { locale: ko })}
            </p>
          </div>

          {event.type === "clinic" && event.metadata?.status && (
            <div>
              <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-label">
                상태
              </label>
              <span
                className={`inline-block rounded-radius-300 px-spacing-300 py-spacing-100 font-medium text-footnote ${getClinicStatusStyle(event.metadata.status)}`}>
                {getClinicStatusLabel(event.metadata.status)}
              </span>
            </div>
          )}

          {event.type === "retake" && event.metadata?.status && (
            <div>
              <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-label">
                상태
              </label>
              <span
                className={`inline-block rounded-radius-300 px-spacing-300 py-spacing-100 font-medium text-footnote ${getRetakeStatusStyle(event.metadata.status)}`}>
                {getRetakeStatusLabel(event.metadata.status)}
              </span>
            </div>
          )}
        </div>

        <div className="border-line-divider border-t px-spacing-600 py-spacing-500">
          <button
            onClick={onClose}
            className="w-full rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
