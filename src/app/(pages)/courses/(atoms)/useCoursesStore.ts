import { atom } from "jotai";
import type { Course } from "@/shared/types";

export type { Course, Student } from "@/shared/types";

export const selectedCourseAtom = atom<Course | null>(null);
export const enrolledSearchQueryAtom = atom<string>("");
export const unenrolledSearchQueryAtom = atom<string>("");
export const showEndedCoursesAtom = atom<boolean>(false);
