import { atom } from "jotai";
import type { SessionData } from "./session";

export const userAtom = atom<SessionData | null>(null);
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
