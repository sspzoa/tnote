// Student types
export interface Student {
  id: string;
  phone_number: string;
  name: string;
  parent_phone_number?: string | null;
  school?: string | null;
  birth_year?: number | null;
  is_favorite?: boolean;
  enrolled_at?: string;
  created_at?: string;
  consultation_count?: number;
}

// Course types
export interface Course {
  id: string;
  name: string;
  created_at?: string;
  student_count?: number;
  start_date?: string | null;
  end_date?: string | null;
  days_of_week?: number[] | null;
}

// Clinic types
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

// Retake types
export type ManagementStatus =
  | "재시 안내 예정"
  | "재시 안내 완료"
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
  course: Course;
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
  exam: {
    id: string;
    name: string;
    exam_number: number;
    course: {
      id: string;
      name: string;
    };
  };
  student: {
    id: string;
    phone_number: string;
    name: string;
    school: string;
  };
}

export interface RetakeHistory {
  id: string;
  action_type:
    | "postpone"
    | "absent"
    | "complete"
    | "status_change"
    | "management_status_change"
    | "note_update"
    | "date_edit";
  previous_date: string | null;
  new_date: string | null;
  previous_status: string | null;
  new_status: string | null;
  previous_management_status: string | null;
  new_management_status: string | null;
  note: string | null;
  created_at: string;
}

// Consultation types
export interface ConsultationLog {
  id: string;
  student_id: string;
  consultation_date: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Admin types
export interface Admin {
  id: string;
  phone_number: string;
  name: string;
  role: "owner" | "admin";
  created_at: string;
}

// Calendar types
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
