import { atom } from "jotai";
import type { Clinic, Student } from "@/shared/types";

export type { AttendanceRecord, Clinic, Student } from "@/shared/types";

export const allStudentsAtom = atom<Student[]>([]);
export const selectedClinicAtom = atom<Clinic | null>(null);
export const openMenuIdAtom = atom<string | null>(null);
