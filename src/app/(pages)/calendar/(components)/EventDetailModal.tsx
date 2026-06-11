import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { BookOpen, ClipboardList, type LucideIcon, RefreshCw, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Badge, type BadgeVariant } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { type FeatureTone, toneWell } from "@/shared/components/ui/featureTone";
import { Modal } from "@/shared/components/ui/modal";
import { StatStrip, type StatStripItem } from "@/shared/components/ui/statStrip";
import { cn } from "@/shared/lib/utils/cn";
import type { CalendarEvent } from "@/shared/types";

interface Props {
  event: CalendarEvent;
  onClose: () => void;
}

const getEventTypeLabel = (type: CalendarEvent["type"]) => {
  switch (type) {
    case "course":
      return "수업";
    case "retake":
      return "재시험";
    case "clinic":
      return "클리닉";
    case "assignment":
      return "과제";
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
      return "검사예정";
    case "insufficient":
      return "미흡";
    case "not_submitted":
      return "미제출";
    case "absent":
      return "결석";
    default:
      return "검사예정";
  }
};

const getAssignmentStatusVariant = (status: string): BadgeVariant => {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "insufficient":
    case "not_submitted":
    case "absent":
      return "danger";
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

const getMetadataBoolean = (event: CalendarEvent, key: string): boolean | undefined => {
  const value = event.metadata?.[key];
  return typeof value === "boolean" ? value : undefined;
};

// Type → tone-accented header chrome + the source-feature deep link. The clinic dot color
// previously folded status into the type accent; now the status owns its own promoted Badge,
// so the header well stays a stable per-type identity (matching the design spec's event tones).
const EVENT_TYPE_CONFIG: Record<CalendarEvent["type"], { tone: FeatureTone; icon: LucideIcon; href: string }> = {
  course: { tone: "courses", icon: BookOpen, href: "/courses" },
  retake: { tone: "retakes", icon: RefreshCw, href: "/retakes" },
  clinic: { tone: "clinics", icon: Stethoscope, href: "/clinics" },
  assignment: { tone: "assignments", icon: ClipboardList, href: "/assignments" },
};

export default function EventDetailModal({ event, onClose }: Props) {
  const clinicStatus = event.type === "clinic" ? getMetadataStatus(event) : undefined;
  const retakeStatus = event.type === "retake" ? getMetadataStatus(event) : undefined;
  const assignmentStatus = event.type === "assignment" ? getMetadataStatus(event) : undefined;
  const requiredStudents = event.type === "clinic" ? getMetadataStringArray(event, "requiredStudents") : undefined;
  const clinicName = event.type === "clinic" ? getMetadataString(event, "clinicName") : undefined;
  const clinicStudentName = event.type === "clinic" ? getMetadataString(event, "studentName") : undefined;
  const clinicStudentDisplayLabel =
    event.type === "clinic" ? getMetadataString(event, "studentDisplayLabel") : undefined;
  const didRetakeExam = event.type === "clinic" ? getMetadataBoolean(event, "didRetakeExam") : undefined;
  const didHomeworkCheck = event.type === "clinic" ? getMetadataBoolean(event, "didHomeworkCheck") : undefined;
  const didQa = event.type === "clinic" ? getMetadataBoolean(event, "didQa") : undefined;
  const assignmentName = event.type === "assignment" ? getMetadataString(event, "assignmentName") : undefined;
  const courseName = event.type === "assignment" ? getMetadataString(event, "courseName") : undefined;
  const studentName = event.type === "assignment" ? getMetadataString(event, "studentName") : undefined;
  const clinicActivities =
    event.type === "clinic"
      ? [didRetakeExam && "재시험", didHomeworkCheck && "숙제검사", didQa && "질의응답"].filter(
          (activity): activity is string => Boolean(activity),
        )
      : [];

  const typeConfig = EVENT_TYPE_CONFIG[event.type];
  const TypeIcon = typeConfig.icon;

  // The status Badge that belongs to this event's type, promoted into the header band.
  const statusBadge =
    event.type === "clinic" && clinicStatus ? (
      <Badge variant={getClinicStatusVariant(clinicStatus)} size="sm">
        {getClinicStatusLabel(clinicStatus)}
      </Badge>
    ) : event.type === "retake" && retakeStatus ? (
      <Badge variant={getRetakeStatusVariant(retakeStatus)} size="sm">
        {getRetakeStatusLabel(retakeStatus)}
      </Badge>
    ) : event.type === "assignment" && assignmentStatus ? (
      <Badge variant={getAssignmentStatusVariant(assignmentStatus)} size="sm">
        {getAssignmentStatusLabel(assignmentStatus)}
      </Badge>
    ) : null;

  // Type-specific labeled facts → a single grouped vertical strip (no more flat label/value cloud).
  const facts: StatStripItem[] = [];
  if (event.type === "clinic") {
    if (clinicName) facts.push({ label: "클리닉", value: clinicName });
    if (clinicStudentName) facts.push({ label: "학생", value: clinicStudentDisplayLabel ?? clinicStudentName });
  }
  if (event.type === "assignment") {
    if (courseName) facts.push({ label: "과목", value: courseName });
    if (assignmentName) facts.push({ label: "과제", value: assignmentName });
    if (studentName) facts.push({ label: "학생", value: studentName });
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="일정 상세"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="flex-1">
            닫기
          </Button>
          <Button asChild className="flex-1">
            <Link href={typeConfig.href}>{getEventTypeLabel(event.type)} 보기</Link>
          </Button>
        </>
      }>
      <div className="flex flex-col gap-5">
        {/* Type-tone accent header band — identity well + title + type/status badges + date meta. */}
        <div className="flex items-start gap-3.5 rounded-xl border border-border bg-card p-4 shadow-xs">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-lg [&_svg]:size-5",
              toneWell[typeConfig.tone],
            )}>
            <TypeIcon />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral" size="sm">
                {getEventTypeLabel(event.type)}
              </Badge>
              {statusBadge}
            </div>
            <h3 className="font-semibold text-base text-foreground leading-snug tracking-[-0.01em]">{event.title}</h3>
            <p className="text-muted-foreground text-sm tabular-nums">
              {format(new Date(event.date), "yyyy년 M월 d일 (EEE)", { locale: ko })}
            </p>
          </div>
        </div>

        {/* Grouped type-specific facts. */}
        {facts.length > 0 && <StatStrip items={facts} orientation="vertical" />}

        {/* Clinic activities — semantic chip row. */}
        {event.type === "clinic" && clinicActivities.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-muted-foreground text-xs">진행 내용</span>
            <div className="flex flex-wrap gap-1.5">
              {clinicActivities.map((activity) => (
                <Badge key={activity} variant="info" size="sm">
                  {activity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 필참 학생 — a roster of identity lines, not a flat badge cloud. */}
        {event.type === "clinic" && requiredStudents && requiredStudents.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-muted-foreground text-xs">필참 학생 ({requiredStudents.length}명)</span>
            <div className="grid grid-cols-2 gap-1.5">
              {requiredStudents.map((name) => (
                <div
                  key={name}
                  className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5">
                  <span className="min-w-0 truncate text-foreground text-sm">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
