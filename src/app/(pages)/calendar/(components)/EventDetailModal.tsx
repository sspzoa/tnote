import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Badge, type BadgeVariant } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
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

const getClinicStatusVariant = (status: string): BadgeVariant => {
  switch (status) {
    case "attended":
      return "success";
    case "absent":
      return "danger";
    default:
      return "warning";
  }
};

const getRetakeStatusVariant = (status: string): BadgeVariant => {
  switch (status) {
    case "completed":
      return "success";
    case "absent":
      return "danger";
    case "postponed":
      return "warning";
    default:
      return "warning";
  }
};

export default function EventDetailModal({ event, onClose }: Props) {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="일정 상세"
      footer={
        <Button onClick={onClose} className="w-full">
          닫기
        </Button>
      }>
      <div className="flex flex-col gap-spacing-400">
        <div className="flex flex-col gap-spacing-100">
          <label className="block font-semibold text-content-standard-secondary text-label">타입</label>
          <div className="flex items-center gap-spacing-200">
            <div className="h-4 w-4 rounded-radius-100" style={{ backgroundColor: getEventColor(event) }} />
            <span className="text-body text-content-standard-primary">{getEventTypeLabel(event.type)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-spacing-100">
          <label className="block font-semibold text-content-standard-secondary text-label">제목</label>
          <p className="text-body text-content-standard-primary">{event.title}</p>
        </div>

        <div className="flex flex-col gap-spacing-100">
          <label className="block font-semibold text-content-standard-secondary text-label">날짜</label>
          <p className="text-body text-content-standard-primary">
            {format(new Date(event.date), "yyyy년 M월 d일 (EEE)", { locale: ko })}
          </p>
        </div>

        {event.type === "clinic" && event.metadata?.status && (
          <div className="flex flex-col gap-spacing-100">
            <label className="block font-semibold text-content-standard-secondary text-label">상태</label>
            <Badge variant={getClinicStatusVariant(event.metadata.status)} size="sm" className="w-fit">
              {getClinicStatusLabel(event.metadata.status)}
            </Badge>
          </div>
        )}

        {event.type === "retake" && event.metadata?.status && (
          <div className="flex flex-col gap-spacing-100">
            <label className="block font-semibold text-content-standard-secondary text-label">상태</label>
            <Badge variant={getRetakeStatusVariant(event.metadata.status)} size="sm" className="w-fit">
              {getRetakeStatusLabel(event.metadata.status)}
            </Badge>
          </div>
        )}
      </div>
    </Modal>
  );
}
