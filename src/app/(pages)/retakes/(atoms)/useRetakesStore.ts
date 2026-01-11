import { atom } from "jotai";

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

export interface Retake {
  id: string;
  exam_id: string;
  student_id: string;
  current_scheduled_date: string;
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

export interface History {
  id: string;
  action_type: "postpone" | "absent" | "complete" | "status_change" | "management_status_change" | "note_update";
  previous_date: string | null;
  new_date: string | null;
  previous_status: string | null;
  new_status: string | null;
  previous_management_status: string | null;
  new_management_status: string | null;
  note: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface Exam {
  id: string;
  name: string;
  exam_number: number;
  course: Course;
}

export interface AssignStudent {
  id: string;
  phone_number: string;
  name: string;
  school: string;
}

export const retakesAtom = atom<Retake[]>([]);
export const filterAtom = atom<"all" | "pending" | "completed" | "absent">("all");
export const selectedRetakeAtom = atom<Retake | null>(null);
export const openMenuIdAtom = atom<string | null>(null);
export const searchQueryAtom = atom("");
