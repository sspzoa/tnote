import { atom } from "jotai";

export const editFormAtom = atom({
  name: "",
  phoneNumber: "",
  parentPhoneNumber: "",
  school: "",
  branch: "",
  birthYear: "",
  requiredClinicWeekdays: [] as number[],
});

export const createFormAtom = atom({
  name: "",
  phoneNumber: "",
  parentPhoneNumber: "",
  school: "",
  branch: "",
  birthYear: "",
  requiredClinicWeekdays: [] as number[],
});
