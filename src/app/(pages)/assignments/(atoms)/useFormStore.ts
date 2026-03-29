import { atom } from "jotai";

export const postponeDateAtom = atom("");
export const postponeNoteAtom = atom("");

export const completeNoteAtom = atom("");

export const selectedCourseAtom = atom("");
export const selectedAssignmentAtom = atom("");
export const selectedStudentsAtom = atom<string[]>([]);
export const scheduledDateAtom = atom("");
export const assignSearchQueryAtom = atom("");

export const editDateAtom = atom("");
