import { atom } from "jotai";

// Postpone form
export const postponeDateAtom = atom("");
export const postponeNoteAtom = atom("");

// Absent form
export const absentNoteAtom = atom("");

// Complete form
export const completeNoteAtom = atom("");

// Assign form
export const selectedCourseAtom = atom("");
export const selectedExamAtom = atom("");
export const selectedStudentsAtom = atom<string[]>([]);
export const scheduledDateAtom = atom("");
export const assignSearchQueryAtom = atom("");
