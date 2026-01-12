import { atom } from "jotai";

export interface Student {
  id: string;
  phone_number: string;
  name: string;
  parent_phone_number: string | null;
  school: string | null;
  birth_year: number | null;
  is_favorite: boolean;
  enrolled_at?: string;
  created_at?: string;
}

export interface Course {
  id: string;
  name: string;
}

export const studentsAtom = atom<Student[]>([]);
export const coursesAtom = atom<Course[]>([]);
export const selectedCourseAtom = atom<string>("all");
export const showFavoritesOnlyAtom = atom<boolean>(false);
export const searchQueryAtom = atom<string>("");

export const selectedStudentAtom = atom<Student | null>(null);

export const studentsLoadingAtom = atom<boolean>(true);
