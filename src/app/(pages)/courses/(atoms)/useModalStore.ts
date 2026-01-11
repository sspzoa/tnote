import { atom } from "jotai";

// Modal states
export const showCreateModalAtom = atom<boolean>(false);
export const showEditModalAtom = atom<boolean>(false);
export const showEnrollModalAtom = atom<boolean>(false);

// Menu state
export const openMenuIdAtom = atom<string | null>(null);
