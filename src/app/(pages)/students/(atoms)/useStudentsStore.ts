import { atom } from "jotai";
import type { Student } from "@/shared/types";

export type { Student };

export const selectedCourseAtom = atom<string>("all");
export const showFavoritesOnlyAtom = atom<boolean>(false);
export const searchQueryAtom = atom<string>("");
export const selectedStudentAtom = atom<Student | null>(null);
