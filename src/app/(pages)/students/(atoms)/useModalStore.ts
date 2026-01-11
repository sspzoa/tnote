import { atom } from "jotai";

// Modal states
export const showEditModalAtom = atom<boolean>(false);
export const showCreateModalAtom = atom<boolean>(false);
export const showConsultationModalAtom = atom<boolean>(false);
export const showAddConsultationModalAtom = atom<boolean>(false);
export const showEditConsultationModalAtom = atom<boolean>(false);

// Menu state
export const openMenuIdAtom = atom<string | null>(null);
