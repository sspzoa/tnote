import { atom } from "jotai";

export const showPostponeModalAtom = atom(false);
export const showAbsentModalAtom = atom(false);
export const showCompleteModalAtom = atom(false);
export const showHistoryModalAtom = atom(false);
export const showStudentModalAtom = atom(false);
export const showAssignModalAtom = atom(false);
export const showManagementStatusModalAtom = atom(false);

export const selectedStudentIdAtom = atom<string | null>(null);
