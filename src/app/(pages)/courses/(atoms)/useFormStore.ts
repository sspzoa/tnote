import { atom } from "jotai";

export const courseNameAtom = atom("");
export const courseStartDateAtom = atom("");
export const courseEndDateAtom = atom("");
export const courseDaysOfWeekAtom = atom<number[]>([]);
