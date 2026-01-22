import { atom } from "jotai";
import type { Student } from "@/shared/types";

export type { Student };

export const selectedCourseAtom = atom<string>("all");
export const searchQueryAtom = atom<string>("");
export const selectedStudentAtom = atom<Student | null>(null);
export const selectedTagIdsAtom = atom<Set<string>>(new Set<string>());
