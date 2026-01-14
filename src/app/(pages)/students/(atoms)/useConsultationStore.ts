import { atom } from "jotai";
import type { ConsultationLog } from "@/shared/types";

export type { ConsultationLog };

export const selectedConsultationAtom = atom<ConsultationLog | null>(null);

export const consultationFormAtom = atom({
  date: new Date().toISOString().split("T")[0],
  title: "",
  content: "",
});
