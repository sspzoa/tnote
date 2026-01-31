export const isTagActive = (startDate: string, endDate: string | null): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  if (today < start) return false;
  if (endDate === null) return true;

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return today <= end;
};

export const DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];

export const RETAKE_STATUS_LABELS: Record<string, string> = {
  pending: "대기중",
  completed: "완료",
  absent: "결석",
};

export const formatDaysOfWeek = (days: number[] | null): string => {
  if (!days || days.length === 0) return "-";
  return days.map((d) => DAY_NAMES[d]).join(", ");
};

export const getActionLabel = (actionType: string) => {
  const labels: Record<string, string> = {
    assign: "할당",
    postpone: "연기",
    absent: "결석",
    complete: "완료",
    status_change: "상태 변경",
    management_status_change: "관리 상태 변경",
    note_update: "메모 수정",
    date_edit: "날짜 수정",
  };
  return labels[actionType] || actionType;
};

export const getActionBadgeStyle = (actionType: string) => {
  if (actionType === "assign") return "bg-solid-translucent-purple text-solid-purple";
  if (actionType === "postpone") return "bg-solid-translucent-blue text-solid-blue";
  if (actionType === "absent") return "bg-solid-translucent-red text-solid-red";
  if (actionType === "complete") return "bg-solid-translucent-green text-solid-green";
  if (actionType === "status_change") return "bg-solid-translucent-purple text-solid-purple";
  if (actionType === "management_status_change") return "bg-solid-translucent-yellow text-solid-yellow";
  if (actionType === "date_edit") return "bg-solid-translucent-blue text-solid-blue";
  if (actionType === "note_update") return "bg-components-fill-standard-secondary text-content-standard-secondary";
  return "bg-components-fill-standard-secondary text-content-standard-secondary";
};

export const getManagementStatusStyle = (status: string) => {
  const isCompleted = status.includes("완료");
  if (isCompleted) {
    return "bg-solid-translucent-green text-core-status-positive";
  }
  return "bg-solid-translucent-red text-core-status-negative";
};
