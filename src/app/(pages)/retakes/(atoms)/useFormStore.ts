import { atom } from "jotai";

export const postponeDateAtom = atom("");
export const postponeNoteAtom = atom("");

export const absentNoteAtom = atom("");

export const completeNoteAtom = atom("");

export const selectedCourseAtom = atom("");
export const selectedExamAtom = atom("");
export const selectedStudentsAtom = atom<string[]>([]);
export const scheduledDateAtom = atom("");
export const assignSearchQueryAtom = atom("");

export const editDateAtom = atom("");
