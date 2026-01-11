import { atom } from "jotai";

export const clinicNameAtom = atom("");
export const operatingDaysAtom = atom<number[]>([1, 2, 3, 4, 5]);
export const startDateAtom = atom("");
export const endDateAtom = atom("");

export const selectedDateAtom = atom("");
export const selectedStudentIdsAtom = atom<string[]>([]);
export const attendanceSearchQueryAtom = atom("");
