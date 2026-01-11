import { atom } from "jotai";

// Edit form state
export const editFormAtom = atom({
  name: "",
  phoneNumber: "",
  parentPhoneNumber: "",
  school: "",
  birthYear: "",
});

// Create form state
export const createFormAtom = atom({
  name: "",
  phoneNumber: "",
  parentPhoneNumber: "",
  school: "",
  birthYear: "",
});
