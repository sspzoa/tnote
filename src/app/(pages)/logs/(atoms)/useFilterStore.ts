import { atom } from "jotai";

export interface LogFilterState {
  level: string;
  action: string;
  resource: string;
  startDate: string;
  endDate: string;
  page: number;
}

export const logFilterAtom = atom<LogFilterState>({
  level: "",
  action: "",
  resource: "",
  startDate: "",
  endDate: "",
  page: 0,
});

export const selectedLogAtom = atom<string | null>(null);
