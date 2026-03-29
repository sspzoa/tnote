import { atom } from "jotai";

export const activeTabAtom = atom<"exams" | "assignments">("exams");
export const showAssignmentCreateModalAtom = atom(false);
export const showAssignmentEditModalAtom = atom(false);
export const selectedAssignmentAtom = atom<{ id: string; name: string } | null>(null);
export const showSubmissionModalAtom = atom(false);
export const submissionAssignmentAtom = atom<{ id: string; name: string } | null>(null);
