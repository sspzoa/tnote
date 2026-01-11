import { atom } from "jotai";

export interface Clinic {
  id: string;
  name: string;
  operating_days: number[];
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  name: string;
  phone_number: string;
  school?: string;
}

export interface AttendanceRecord {
  id: string;
  attendance_date: string;
  note?: string;
  student: Student;
}

export const clinicsAtom = atom<Clinic[]>([]);
export const allStudentsAtom = atom<Student[]>([]);
export const selectedClinicAtom = atom<Clinic | null>(null);
export const openMenuIdAtom = atom<string | null>(null);
