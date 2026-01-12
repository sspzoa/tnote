import { atom } from "jotai";

export interface Course {
  id: string;
  name: string;
  created_at: string;
  student_count?: number;
  start_date?: string | null;
  end_date?: string | null;
  days_of_week?: number[] | null;
}

export interface Student {
  id: string;
  phone_number: string;
  name: string;
}

export const coursesAtom = atom<Course[]>([]);
export const allStudentsAtom = atom<Student[]>([]);
export const enrolledStudentsAtom = atom<Student[]>([]);

export const selectedCourseAtom = atom<Course | null>(null);

export const enrolledSearchQueryAtom = atom<string>("");
export const unenrolledSearchQueryAtom = atom<string>("");

export const coursesLoadingAtom = atom<boolean>(true);
export const enrolledStudentsLoadingAtom = atom<boolean>(false);
export const loadingStudentIdAtom = atom<string | null>(null);
