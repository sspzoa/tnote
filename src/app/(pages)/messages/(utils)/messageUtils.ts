import type { RecipientType } from "@/shared/types";

export const RECIPIENT_OPTIONS: { value: RecipientType; label: string }[] = [
  { value: "student", label: "학생" },
  { value: "parent", label: "학부모" },
  { value: "both", label: "둘 다" },
];

export const getByteLength = (str: string): number => {
  let byteLength = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode <= 0x7f) {
      byteLength += 1;
    } else {
      byteLength += 2;
    }
  }
  return byteLength;
};

export const MAX_SMS_BYTES = 90;
export const MAX_LMS_BYTES = 2000;

export const getMessageType = (byteLength: number): { isLMS: boolean; maxBytes: number } => {
  const isLMS = byteLength > MAX_SMS_BYTES;
  return {
    isLMS,
    maxBytes: isLMS ? MAX_LMS_BYTES : MAX_SMS_BYTES,
  };
};

export const getTodayFormatted = (): string => {
  const today = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${today.getMonth() + 1}/${today.getDate()}(${days[today.getDay()]})`;
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "미정";
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export interface TemplateVariable {
  key: string;
  description: string;
}

export const EXAM_TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: "{오늘날짜}", description: "오늘 날짜" },
  { key: "{이름}", description: "학생 이름" },
  { key: "{수업명}", description: "수업명" },
  { key: "{시험명}", description: "시험명" },
  { key: "{회차}", description: "시험 회차" },
  { key: "{과제검사}", description: "과제검사 결과" },
  { key: "{점수}", description: "점수" },
  { key: "{만점}", description: "만점" },
  { key: "{커트라인}", description: "커트라인" },
  { key: "{석차}", description: "석차" },
  { key: "{전체인원}", description: "전체 인원" },
];

export const RETAKE_TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: "{오늘날짜}", description: "오늘 날짜" },
  { key: "{이름}", description: "학생 이름" },
  { key: "{수업명}", description: "수업명" },
  { key: "{시험명}", description: "시험명" },
  { key: "{회차}", description: "시험 회차" },
  { key: "{예정일}", description: "예정일" },
  { key: "{상태}", description: "상태" },
];

export const GENERAL_TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: "{오늘날짜}", description: "오늘 날짜" },
  { key: "{이름}", description: "학생 이름" },
];
