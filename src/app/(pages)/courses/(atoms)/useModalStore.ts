import { atom } from "jotai";

export const showCreateModalAtom = atom<boolean>(false);
export const showEditModalAtom = atom<boolean>(false);
export const showEnrollModalAtom = atom<boolean>(false);

export const openMenuIdAtom = atom<string | null>(null);
