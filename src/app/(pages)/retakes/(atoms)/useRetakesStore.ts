import { atom } from "jotai";
import type { ManagementStatus, Retake } from "@/shared/types";

export type { Course, Exam, ManagementStatus, Retake, RetakeHistory as History } from "@/shared/types";

export interface AssignStudent {
  id: string;
  phone_number: string;
  name: string;
  school: string;
}

export const retakesAtom = atom<Retake[]>([]);
export const filterAtom = atom<"all" | "pending" | "completed" | "absent">("all");
export const selectedCourseAtom = atom<string>("all");
export const selectedExamAtom = atom<string>("all");
export const selectedManagementStatusAtom = atom<ManagementStatus | "all">("all");
export const selectedRetakeAtom = atom<Retake | null>(null);
export const openMenuIdAtom = atom<string | null>(null);
export const searchQueryAtom = atom("");
export const showCompletedAtom = atom<boolean>(false);
export const selectedDateAtom = atom<string>("all");
export const minIncompleteCountAtom = atom<number>(0);
export const minTotalRetakeCountAtom = atom<number>(0);
export const minPostponeCountAtom = atom<number>(0);
export const minAbsentCountAtom = atom<number>(0);
export const minPostponeAbsentCountAtom = atom<number>(0);
