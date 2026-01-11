import { atom } from "jotai";

// Retakes main modals
export const showPostponeModalAtom = atom(false);
export const showAbsentModalAtom = atom(false);
export const showCompleteModalAtom = atom(false);
export const showEditModalAtom = atom(false);
export const showHistoryModalAtom = atom(false);
export const showStudentModalAtom = atom(false);
export const showAssignModalAtom = atom(false);

// Student info modal state
export const selectedStudentIdAtom = atom<string | null>(null);
