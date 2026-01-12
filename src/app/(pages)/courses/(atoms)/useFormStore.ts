import { atom } from "jotai";

// Course form state
export const courseNameAtom = atom("");
export const courseStartDateAtom = atom("");
export const courseEndDateAtom = atom("");
export const courseDaysOfWeekAtom = atom<number[]>([]);
