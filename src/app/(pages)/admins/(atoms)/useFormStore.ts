import { atom } from "jotai";

export const inviteFormAtom = atom({
  name: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
});

export const formErrorAtom = atom("");
