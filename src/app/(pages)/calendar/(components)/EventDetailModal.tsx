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
  if (event.type === "assignment") {
    return getMetadataStatus(event) === "completed" ? "#10B981" : "#F59E0B";
  }
  const status = getMetadataStatus(event);
  if (status === "attended") return "#10B981";
  if (status === "absent") return "#6B7280";
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
    case "assignment":
      return "재과제";
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

const getAssignmentStatusLabel = (status: string) => {
  switch (status) {
    case "completed":
      return "완료";
    case "pending":
      return "미완료";
    default:
      return "미완료";
  }
};

const getAssignmentStatusVariant = (status: string): BadgeVariant => {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    default:
      return "warning";
  }
};

const getMetadataStatus = (event: CalendarEvent): string | undefined => {
  const status = event.metadata?.status;
  return typeof status === "string" ? status : undefined;
};

const getMetadataString = (event: CalendarEvent, key: string): string | undefined => {
  const value = event.metadata?.[key];
  return typeof value === "string" ? value : undefined;
};

const getMetadataStringArray = (event: CalendarEvent, key: string): string[] | undefined => {
  const value = event.metadata?.[key];
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    return undefined;
  }
  return value;
};

export default function EventDetailModal({ event, onClose }: Props) {
  const clinicStatus = event.type === "clinic" ? getMetadataStatus(event) : undefined;
  const retakeStatus = event.type === "retake" ? getMetadataStatus(event) : undefined;
  const assignmentStatus = event.type === "assignment" ? getMetadataStatus(event) : undefined;
  const requiredStudents = event.type === "clinic" ? getMetadataStringArray(event, "requiredStudents") : undefined;
  const assignmentName = event.type === "assignment" ? getMetadataString(event, "assignmentName") : undefined;
  const courseName = event.type === "assignment" ? getMetadataString(event, "courseName") : undefined;
  const studentName = event.type === "assignment" ? getMetadataString(event, "studentName") : undefined;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="일정 상세"
      size="md"
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

        {event.type === "clinic" && clinicStatus && (
          <div className="flex flex-col gap-spacing-100">
            <label className="block font-semibold text-content-standard-secondary text-label">상태</label>
            <Badge variant={getClinicStatusVariant(clinicStatus)} size="sm" className="w-fit">
              {getClinicStatusLabel(clinicStatus)}
            </Badge>
          </div>
        )}

        {event.type === "clinic" && requiredStudents && (
          <div className="flex flex-col gap-spacing-200">
            <label className="block font-semibold text-content-standard-secondary text-label">
              필참 학생 ({requiredStudents.length}명)
            </label>
            <div className="flex flex-wrap gap-spacing-100">
              {requiredStudents.map((name) => (
                <Badge key={name} variant="info" size="sm">
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {event.type === "retake" && retakeStatus && (
          <div className="flex flex-col gap-spacing-100">
            <label className="block font-semibold text-content-standard-secondary text-label">상태</label>
            <Badge variant={getRetakeStatusVariant(retakeStatus)} size="sm" className="w-fit">
              {getRetakeStatusLabel(retakeStatus)}
            </Badge>
          </div>
        )}

        {event.type === "assignment" && assignmentStatus && (
          <div className="flex flex-col gap-spacing-100">
            <label className="block font-semibold text-content-standard-secondary text-label">상태</label>
            <Badge variant={getAssignmentStatusVariant(assignmentStatus)} size="sm" className="w-fit">
              {getAssignmentStatusLabel(assignmentStatus)}
            </Badge>
          </div>
        )}

        {event.type === "assignment" && courseName && (
          <div className="flex flex-col gap-spacing-100">
            <label className="block font-semibold text-content-standard-secondary text-label">과목</label>
            <p className="text-body text-content-standard-primary">{courseName}</p>
          </div>
        )}

        {event.type === "assignment" && assignmentName && (
          <div className="flex flex-col gap-spacing-100">
            <label className="block font-semibold text-content-standard-secondary text-label">과제</label>
            <p className="text-body text-content-standard-primary">{assignmentName}</p>
          </div>
        )}

        {event.type === "assignment" && studentName && (
          <div className="flex flex-col gap-spacing-100">
            <label className="block font-semibold text-content-standard-secondary text-label">학생</label>
            <p className="text-body text-content-standard-primary">{studentName}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
