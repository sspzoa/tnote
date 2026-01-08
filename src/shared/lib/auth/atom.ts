import { atom } from "jotai";
import type { Session } from "../supabase/auth";

export const userAtom = atom<Session | null>(null);
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
