import { z } from "zod";
import { removePhoneHyphens } from "@/shared/lib/utils/phone";

const isPhone = (v: string) => /^01\d{8,9}$/.test(removePhoneHyphens(v));

const requiredPhone = z.string().trim().refine(isPhone, "올바른 전화번호를 입력해주세요.");
const optionalPhone = z
  .string()
  .trim()
  .refine((v) => v === "" || isPhone(v), "올바른 전화번호를 입력해주세요.");

export const createStudentSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해주세요."),
  phoneNumber: requiredPhone,
  parentPhoneNumber: requiredPhone,
  school: z.string().trim().min(1, "학교를 입력해주세요."),
  branch: z.string().trim().min(1, "지점을 입력해주세요."),
  birthYear: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "4자리 연도를 입력해주세요."),
  requiredClinicWeekdays: z.array(z.number()),
});

export const editStudentSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해주세요."),
  phoneNumber: requiredPhone,
  parentPhoneNumber: optionalPhone,
  school: z.string().trim(),
  branch: z.string().trim(),
  birthYear: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}$/.test(v), "4자리 연도를 입력해주세요."),
  requiredClinicWeekdays: z.array(z.number()),
});

export type StudentFormValues = z.infer<typeof createStudentSchema>;

export const emptyStudentForm: StudentFormValues = {
  name: "",
  phoneNumber: "",
  parentPhoneNumber: "",
  school: "",
  branch: "",
  birthYear: "",
  requiredClinicWeekdays: [],
};
