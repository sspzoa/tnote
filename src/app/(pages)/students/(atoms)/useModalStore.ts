import { atom } from "jotai";
import type { StudentTagAssignment } from "@/shared/types";

export const showEditModalAtom = atom<boolean>(false);
export const showCreateModalAtom = atom<boolean>(false);
export const showConsultationModalAtom = atom<boolean>(false);
export const showAddConsultationModalAtom = atom<boolean>(false);
export const showEditConsultationModalAtom = atom<boolean>(false);
export const showInfoModalAtom = atom<boolean>(false);
export const showTagManageModalAtom = atom<boolean>(false);
export const showAddTagModalAtom = atom<boolean>(false);
export const showEditTagAssignmentModalAtom = atom<boolean>(false);

export const openMenuIdAtom = atom<string | null>(null);

export interface EditTagAssignmentData {
  studentId: string;
  studentName: string;
  assignment: StudentTagAssignment;
}
export const editTagAssignmentDataAtom = atom<EditTagAssignmentData | null>(null);
