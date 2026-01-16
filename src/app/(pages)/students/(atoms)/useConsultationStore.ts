import { atom } from "jotai";
import type { ConsultationLog } from "@/shared/types";

export type { ConsultationLog };

export const selectedConsultationAtom = atom<ConsultationLog | null>(null);

export const consultationFormAtom = atom({
  title: "",
  content: "",
});
