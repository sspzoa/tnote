import { atom } from "jotai";

export interface Retake {
  id: string;
  exam_id: string;
  student_id: string;
  current_scheduled_date: string;
  status: "pending" | "completed" | "absent";
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
  action_type: "postpone" | "absent" | "complete";
  previous_date: string | null;
  new_date: string | null;
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
