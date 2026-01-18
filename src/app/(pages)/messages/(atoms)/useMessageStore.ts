import { atom } from "jotai";
import type { RecipientType } from "@/shared/types";

export type MessageTab = "general" | "exam-results" | "retake-notice";

export const activeTabAtom = atom<MessageTab>("general");

export const selectedStudentIdsAtom = atom<Set<string>>(new Set<string>());
export const recipientTypeAtom = atom<RecipientType>("student");
export const messageTextAtom = atom<string>("");
export const searchQueryAtom = atom<string>("");

export const selectedCourseIdAtom = atom<string>("");
export const selectedExamIdAtom = atom<string>("");
export const examMessageTemplateAtom = atom<string>("");

export const retakeStatusFilterAtom = atom<string>("pending");
export const retakeManagementFilterAtom = atom<string>("all");
export const selectedRetakeIdsAtom = atom<Set<string>>(new Set<string>());
export const retakeMessageTemplateAtom = atom<string>("");

export const showHistoryModalAtom = atom<boolean>(false);
