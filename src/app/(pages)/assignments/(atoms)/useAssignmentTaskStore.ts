import { atom } from "jotai";
import type { AssignmentTask } from "@/shared/types";

export type { AssignmentTask };

export interface AssignStudent {
  id: string;
  phone_number: string;
  name: string;
  school: string;
  tags?: import("@/shared/types").StudentTagAssignment[];
}

export const filterAtom = atom<"all" | "pending" | "completed">("all");
export const selectedCourseAtom = atom<string>("all");
export const selectedAssignmentIdAtom = atom<string>("all");
export const selectedManagementStatusAtom = atom<string>("all");
export const selectedTaskAtom = atom<AssignmentTask | null>(null);
export const openMenuIdAtom = atom<string | null>(null);
export const searchQueryAtom = atom("");
export const showCompletedAtom = atom<boolean>(false);
export const selectedDateAtom = atom<string>("all");
export const minIncompleteCountAtom = atom<number>(0);
export const minTotalCountAtom = atom<number>(0);
export const minPostponeCountAtom = atom<number>(0);
export const minAbsentCountAtom = atom<number>(0);
export const minPostponeAbsentCountAtom = atom<number>(0);
