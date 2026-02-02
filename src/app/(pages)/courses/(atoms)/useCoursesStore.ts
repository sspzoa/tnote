import { atom } from "jotai";
import type { Course, Student } from "@/shared/types";

export type { Course, Student };

export const allStudentsAtom = atom<Student[]>([]);
export const enrolledStudentsAtom = atom<Student[]>([]);
export const selectedCourseAtom = atom<Course | null>(null);
export const enrolledSearchQueryAtom = atom<string>("");
export const unenrolledSearchQueryAtom = atom<string>("");
export const showEndedCoursesAtom = atom<boolean>(false);
