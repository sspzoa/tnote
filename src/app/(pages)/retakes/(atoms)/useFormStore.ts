import { atom } from "jotai";
import { createWorkflowFormAtoms } from "@/shared/lib/workflow";

const {
  postponeDateAtom,
  postponeNoteAtom,
  completeNoteAtom,
  selectedCourseAtom,
  selectedStudentsAtom,
  scheduledDateAtom,
  assignSearchQueryAtom,
  editDateAtom,
} = createWorkflowFormAtoms();

export {
  postponeDateAtom,
  postponeNoteAtom,
  completeNoteAtom,
  selectedCourseAtom,
  selectedStudentsAtom,
  scheduledDateAtom,
  assignSearchQueryAtom,
  editDateAtom,
};

export const absentNoteAtom = atom("");
export const selectedExamAtom = atom("");
