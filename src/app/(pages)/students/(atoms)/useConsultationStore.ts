import { atom } from "jotai";

export interface ConsultationLog {
  id: string;
  student_id: string;
  consultation_date: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Consultation logs state
export const consultationLogsAtom = atom<ConsultationLog[]>([]);
export const selectedConsultationAtom = atom<ConsultationLog | null>(null);
export const loadingConsultationsAtom = atom<boolean>(false);

// Consultation form state
export const consultationFormAtom = atom({
  date: new Date().toISOString().split("T")[0],
  title: "",
  content: "",
});
