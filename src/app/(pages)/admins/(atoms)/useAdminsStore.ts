import { atom } from "jotai";

export interface Admin {
  id: string;
  phone_number: string;
  name: string;
  role: "owner" | "admin";
  created_at: string;
}

export const adminsAtom = atom<Admin[]>([]);
export const openMenuIdAtom = atom<string | null>(null);
