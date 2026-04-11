import { atom } from "jotai";
import { createWorkflowFilterAtoms } from "@/shared/lib/workflow";
import type { AssignmentTask } from "@/shared/types";

export type { AssignmentTask };

export interface AssignStudent {
  id: string;
  phone_number: string;
  name: string;
  school: string;
  tags?: import("@/shared/types").StudentTagAssignment[];
}

const {
  selectedCourseAtom,
  selectedManagementStatusAtom,
  openMenuIdAtom,
  searchQueryAtom,
  showCompletedAtom,
  selectedDateAtom,
  minIncompleteCountAtom,
  minPostponeCountAtom,
  minAbsentCountAtom,
  minPostponeAbsentCountAtom,
} = createWorkflowFilterAtoms();

export {
  selectedCourseAtom,
  selectedManagementStatusAtom,
  openMenuIdAtom,
  searchQueryAtom,
  showCompletedAtom,
  selectedDateAtom,
  minIncompleteCountAtom,
  minPostponeCountAtom,
  minAbsentCountAtom,
  minPostponeAbsentCountAtom,
};

export type AssignmentTaskFilterValue =
  | "all"
  | "pending"
  | "completed"
  | "insufficient"
  | "not_submitted"
  | "absent";

export const filterAtom = atom<AssignmentTaskFilterValue>("all");
export const selectedAssignmentIdAtom = atom<string>("all");
export const selectedTaskAtom = atom<AssignmentTask | null>(null);
export const minTotalCountAtom = atom<number>(0);
