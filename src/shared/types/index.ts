export type TagColor =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "brown"
  | "black"
  | "white";

export interface StudentTag {
  id: string;
  workspace: string;
  name: string;
  color: TagColor;
  created_at?: string;
  updated_at?: string;
}

export interface StudentTagAssignment {
  id: string;
  student_id: string;
  tag_id: string;
  start_date: string;
  end_date: string | null;
  created_at?: string;
  tag?: StudentTag;
}

export interface Student {
  id: string;
  phone_number: string;
  name: string;
  parent_phone_number: string | null;
  school: string | null;
  branch: string | null;
  birth_year: number | null;
  enrolled_at?: string;
  created_at?: string;
  consultation_count?: number;
  tags?: StudentTagAssignment[];
}

export interface Course {
  id: string;
  name: string;
  created_at?: string;
  student_count?: number;
  start_date: string | null;
  end_date: string | null;
  days_of_week: number[] | null;
}

export interface Clinic {
  id: string;
  name: string;
  operating_days: number[];
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  attendance_date: string;
  note?: string;
  student: Student;
}

export type ManagementStatus =
  | "재시 안내 예정"
  | "재시 안내 완료"
  | "재시 날짜 확답 완료"
  | "클리닉 1회 불참 연락 필요"
  | "클리닉 1회 불참 연락 완료"
  | "클리닉 2회 불참 연락 필요"
  | "클리닉 2회 불참 연락 완료"
  | "실장 집중 상담 필요"
  | "실장 집중 상담 진행 중"
  | "실장 집중 상담 완료";

export interface Exam {
  id: string;
  name: string;
  exam_number: number;
  max_score?: number;
  cutline?: number;
  course: Pick<Course, "id" | "name">;
}

export interface RetakeStudent {
  id: string;
  phone_number: string;
  name: string;
  school: string;
}

export interface Retake {
  id: string;
  exam_id: string;
  student_id: string;
  current_scheduled_date: string | null;
  status: "pending" | "completed" | "absent";
  management_status: ManagementStatus;
  postpone_count: number;
  absent_count: number;
  note: string | null;
  exam: Pick<Exam, "id" | "name" | "exam_number"> & { course: Pick<Course, "id" | "name"> };
  student: RetakeStudent;
}

export type RetakeActionType =
  | "assign"
  | "postpone"
  | "absent"
  | "complete"
  | "status_change"
  | "management_status_change"
  | "note_update"
  | "date_edit";

export interface RetakeHistory {
  id: string;
  action_type: RetakeActionType;
  previous_date: string | null;
  new_date: string | null;
  previous_status: string | null;
  new_status: string | null;
  previous_management_status: string | null;
  new_management_status: string | null;
  note: string | null;
  created_at: string;
  performed_by: {
    id: string;
    name: string;
  } | null;
}

export interface ConsultationLog {
  id: string;
  student_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ConsultationWithDetails {
  id: string;
  student_id: string;
  title: string;
  content: string;
  created_at: string;
  student: Pick<Student, "id" | "name" | "phone_number" | "school">;
  creator?: {
    id: string;
    name: string;
  } | null;
}

export interface Admin {
  id: string;
  phone_number: string;
  name: string;
  role: "owner" | "admin";
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "course" | "retake" | "clinic";
  start?: Date;
  end?: Date;
  metadata?: {
    status?: string;
  };
}

export type RecipientType = "student" | "parent" | "both";

export interface SendMessageRequest {
  recipientType: RecipientType;
  recipientIds: string[];
  text: string;
  subject?: string;
}

export interface SendMessageResponse {
  success: boolean;
  data?: {
    groupId: string;
    total: number;
    successCount: number;
    failCount: number;
  };
  error?: string;
}

export interface ConsultationTemplate {
  id: string;
  name: string;
  content: string;
  created_at: string;
  created_by: string;
}
