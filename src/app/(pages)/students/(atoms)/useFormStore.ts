import { atom } from "jotai";

export const editFormAtom = atom({
  name: "",
  phoneNumber: "",
  parentPhoneNumber: "",
  school: "",
  branch: "",
  birthYear: "",
});

export const createFormAtom = atom({
  name: "",
  phoneNumber: "",
  parentPhoneNumber: "",
  school: "",
  branch: "",
  birthYear: "",
});
