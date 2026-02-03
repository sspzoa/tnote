import { atom } from "jotai";
import type { Exam } from "../(hooks)/useExams";

export const showCreateModalAtom = atom(false);
export const showEditModalAtom = atom(false);
export const showScoreModalAtom = atom(false);

export const selectedExamAtom = atom<Exam | null>(null);
export const scoreExamAtom = atom<Exam | null>(null);

export const examNumberAtom = atom("");
export const examNameAtom = atom("");
export const maxScoreAtom = atom("8");
export const cutlineAtom = atom("4");

export const scoreInputsAtom = atom<Record<string, string>>({});
export const scoreSearchQueryAtom = atom("");
export const existingScoreStudentIdsAtom = atom<string[]>([]);

export const openMenuIdAtom = atom<string | null>(null);
